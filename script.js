// 전역 변수
let lists = [];
let temporaryLists = [];
let currentListId = null;
let currentFilterType = 'all'; // 현재 활성화된 필터 타입 ('all', '4방덱', '5방덱', '기타')
let currentPage = 1; // 현재 페이지 번호 (페이지네이션용)
const itemsPerPage = 20; // 페이지당 항목 수 (페이지네이션용)

// 삭제 확인을 위한 타이머 객체
const deleteTimers = {};

// 현재 선택된 추천문구 인덱스
let selectedIndex = -1;

// 전역 변수 추가
let editingListId = null;
let editingMemoId = null;
let statusTimeoutId = null; // 상태 메시지 타임아웃 ID

// 전역 변수에 정렬 타입 추가
let currentSortType = 'none'; // 'none', 'newest', 'oldest'

// 클립보드 관련 전역 변수 추가
let clipboardItems = [];
const MAX_CLIPBOARD_ITEMS = 9;

// 추천 단어 관련 변수
let suggestions = [];
let currentSuggestionIndex = -1;

// 시간 형식 변환 함수 수정
function formatCreatedAt(dateStr) {
    if (!dateStr) return '2025-04-22 09:30';
    
    // 이미 올바른 형식이면 그대로 반환
    if (dateStr.includes(' ')) return dateStr;
    
    // 하이픈 형식을 공백과 콜론 형식으로 변환
    return dateStr.replace(/-(\d{2})-(\d{2})$/, ' $1:$2');
}

// Firebase에 데이터 저장
async function saveToFirebase() {
    try {
        const db = window.db;
        
        if (!db) {
            console.error('Firebase가 초기화되지 않았습니다.');
            return;
        }

        // 현재 Firebase에 저장된 데이터 가져오기
        const mainListsDoc = await db.collection('lists').doc('main').get();
        const tempListsDoc = await db.collection('lists').doc('temporary').get();
        
        const currentMainLists = mainListsDoc.exists ? mainListsDoc.data().lists : [];
        const currentTempLists = tempListsDoc.exists ? tempListsDoc.data().lists : [];

        // 변경된 메인 목록 찾기
        const changedMainLists = lists.filter(list => {
            const currentList = currentMainLists.find(l => l.id === list.id);
            if (!currentList) return true; // 새로 추가된 목록
            if (currentList.title !== list.title) return true;
            if (currentList.memos.length !== list.memos.length) return true;
            return list.memos.some(memo => {
                const currentMemo = currentList.memos.find(m => m.id === memo.id);
                if (!currentMemo) return true;
                // 승패 데이터도 비교에 포함
                return currentMemo.text !== memo.text || 
                       currentMemo.status !== memo.status ||
                       currentMemo.wins !== memo.wins ||
                       currentMemo.losses !== memo.losses;
            });
        });

        // 변경된 임시 목록 찾기
        const changedTempLists = temporaryLists.filter(list => {
            const currentList = currentTempLists.find(l => l.id === list.id);
            if (!currentList) return true;
            if (currentList.title !== list.title) return true;
            if (currentList.memos.length !== list.memos.length) return true;
            return list.memos.some(memo => {
                const currentMemo = currentList.memos.find(m => m.id === memo.id);
                if (!currentMemo) return true;
                // 승패 데이터도 비교에 포함
                return currentMemo.text !== memo.text || 
                       currentMemo.status !== memo.status ||
                       currentMemo.wins !== memo.wins ||
                       currentMemo.losses !== memo.losses;
            });
        });

        // 삭제된 목록 찾기
        const deletedMainListIds = currentMainLists
            .filter(list => !lists.some(l => l.id === list.id))
            .map(list => list.id);

        const deletedTempListIds = currentTempLists
            .filter(list => !temporaryLists.some(l => l.id === list.id))
            .map(list => list.id);

        // 메인 목록 업데이트
        if (changedMainLists.length > 0 || deletedMainListIds.length > 0) {
            const mainDocRef = db.collection('lists').doc('main');
            await mainDocRef.set({
                lists: lists.map(list => ({
                    ...list,
                    memos: list.memos.map(memo => ({
                        ...memo,
                        wins: typeof memo.wins === 'number' ? memo.wins : 0,
                        losses: typeof memo.losses === 'number' ? memo.losses : 0
                    }))
                })),
                updated_at: new Date().toISOString()
            });
        }

        // 임시 목록 업데이트
        if (changedTempLists.length > 0 || deletedTempListIds.length > 0) {
            const tempDocRef = db.collection('lists').doc('temporary');
            await tempDocRef.set({
                lists: temporaryLists.map(list => ({
                    ...list,
                    memos: list.memos.map(memo => ({
                        ...memo,
                        wins: typeof memo.wins === 'number' ? memo.wins : 0,
                        losses: typeof memo.losses === 'number' ? memo.losses : 0
                    }))
                })),
                updated_at: new Date().toISOString()
            });
        }

        console.log('Firebase 저장 완료');
        return true;

    } catch (error) {
        console.error('Firebase 저장 오류:', error);
        // 오류 발생 시 로컬 스토리지에 저장
        localStorage.setItem('lists', JSON.stringify(lists));
        localStorage.setItem('temporaryLists', JSON.stringify(temporaryLists));
        return false;
    }
}

// Firebase에서 데이터 로드
async function loadFromFirebase() {
    try {
        const db = window.db;
        
        if (!db) {
            console.error('Firebase가 초기화되지 않았습니다.');
            return false;
        }

        // 메인 목록 로드
        const mainListsDoc = await db.collection('lists').doc('main').get();
        if (mainListsDoc.exists) {
            lists = mainListsDoc.data().lists || [];
        } else {
            lists = [];
        }

        // 임시 목록 로드
        const tempListsDoc = await db.collection('lists').doc('temporary').get();
        if (tempListsDoc.exists) {
            temporaryLists = tempListsDoc.data().lists || [];
        } else {
            temporaryLists = [];
        }

        // 데이터 구조 확인 및 수정
        lists = lists.map(list => ({
            ...list,
            id: list.id || Date.now().toString(),
            memos: (list.memos || []).map(memo => ({
                id: memo.id || Date.now().toString() + Math.random().toString(16).slice(2),
                text: memo.text || '',
                status: memo.status || null,
                wins: typeof memo.wins === 'number' ? memo.wins : 0,
                losses: typeof memo.losses === 'number' ? memo.losses : 0
            }))
        }));

        temporaryLists = temporaryLists.map(list => ({
            ...list,
            id: list.id || Date.now().toString(),
            memos: (list.memos || []).map(memo => ({
                id: memo.id || Date.now().toString() + Math.random().toString(16).slice(2),
                text: memo.text || '',
                status: memo.status || null,
                wins: typeof memo.wins === 'number' ? memo.wins : 0,
                losses: typeof memo.losses === 'number' ? memo.losses : 0
            }))
        }));

        return true;
    } catch (error) {
        console.error('Firebase 로드 오류:', error);
        return false;
    }
}

// 방덱 목록 불러오기 (메모 구조 변환 로직 추가)
async function loadLists() {
    try {
        // 먼저 Firebase에서 데이터 로드 시도
        const loadSuccess = await loadFromFirebase();
        
        if (loadSuccess) {
            // Firebase에서 데이터를 성공적으로 불러왔을 때
            lists = lists.map(list => ({
                ...list,
                memos: (list.memos || []).map(memo => ({
                    ...memo,
                    wins: typeof memo.wins === 'number' ? memo.wins : 0,
                    losses: typeof memo.losses === 'number' ? memo.losses : 0
                }))
            }));

            temporaryLists = temporaryLists.map(list => ({
                ...list,
                memos: (list.memos || []).map(memo => ({
                    ...memo,
                    wins: typeof memo.wins === 'number' ? memo.wins : 0,
                    losses: typeof memo.losses === 'number' ? memo.losses : 0
                }))
            }));

            renderLists(1);
            renderTemporaryLists();
            updateStats();
            return;
        }
        
        // Firebase 로드 실패시 로컬 스토리지에서 로드
    const savedLists = localStorage.getItem('lists');
    if (savedLists) {
        try {
            const parsedLists = JSON.parse(savedLists);
            lists = parsedLists.map(list => ({
                ...list,
                    memos: (list.memos || []).map(memo => ({
                        id: memo.id || Date.now().toString() + Math.random().toString(16).slice(2),
                        text: memo.text,
                        status: memo.status || null,
                        wins: typeof memo.wins === 'number' ? memo.wins : 0,
                        losses: typeof memo.losses === 'number' ? memo.losses : 0
                    }))
                }));
        } catch (e) {
            console.error("기존 목록 로딩/파싱 오류:", e);
                localStorage.removeItem('lists');
            lists = [];
        }
    }

    const savedTemporaryLists = localStorage.getItem('temporaryLists');
    if (savedTemporaryLists) {
        try {
            const parsedTempLists = JSON.parse(savedTemporaryLists);
            temporaryLists = parsedTempLists.map(list => ({
                ...list,
                    memos: (list.memos || []).map(memo => ({
                        id: memo.id || Date.now().toString() + Math.random().toString(16).slice(2),
                        text: memo.text,
                        status: memo.status || null,
                        wins: typeof memo.wins === 'number' ? memo.wins : 0,
                        losses: typeof memo.losses === 'number' ? memo.losses : 0
                    }))
                }));
        } catch (e) {
            console.error("임시 목록 로딩/파싱 오류:", e);
            localStorage.removeItem('temporaryLists');
            temporaryLists = [];
        }
    }
        
        // 로컬 스토리지에서 데이터를 불러온 후에도 화면 업데이트
    renderLists(1);
    renderTemporaryLists();
    updateStats();
    } catch (error) {
        console.error('데이터 로드 중 오류 발생:', error);
        alert('데이터를 불러오는 중 오류가 발생했습니다.');
    }
}

// 방덱 목록 저장
function saveLists() {
    localStorage.setItem('lists', JSON.stringify(lists));
    updateStats();
    // Firebase에도 저장
    saveToFirebase().catch(error => {
        console.error('Firebase 저장 실패:', error);
        // Firebase 저장 실패 시에도 로컬 스토리지에는 저장
        localStorage.setItem('lists', JSON.stringify(lists));
    });
}

// 임시 방덱 목록 저장 함수 추가
function saveTemporaryLists() {
    localStorage.setItem('temporaryLists', JSON.stringify(temporaryLists));
    // Firebase에도 저장
    saveToFirebase().catch(error => {
        console.error('Firebase 저장 실패:', error);
        // Firebase 저장 실패 시에도 로컬 스토리지에는 저장
        localStorage.setItem('temporaryLists', JSON.stringify(temporaryLists));
    });
}

// 방덱 검색
function searchLists(query) {
    const searchResults = document.getElementById('searchResults');
    const lists = JSON.parse(localStorage.getItem('lists') || '[]');
    
    if (!query) {
        searchResults.innerHTML = '';
        selectedIndex = -1;
        return;
    }

    console.log('검색어:', query);
    console.log('전체 목록:', lists);

    // 현재 입력된 단어들을 가져옴
    const currentWords = query.split(' ').filter(w => w);
    const lastWord = currentWords[currentWords.length - 1];

    // 모든 방덱의 단어들을 추출
    const allWords = new Set();
    lists.forEach(list => {
        const words = list.title.split(' ');
        words.forEach(word => {
            const trimmedWord = word.trim();
            if (trimmedWord) {
                allWords.add(trimmedWord);
            }
        });
    });

    console.log('추출된 단어들:', Array.from(allWords));

    // 검색어와 일치하는 단어들 찾기 (마지막 단어와 일치하는 것만)
    const matchingWords = Array.from(allWords).filter(word => {
        const matches = word.toLowerCase().includes(lastWord.toLowerCase()) &&
                       !currentWords.includes(word);
        console.log(`단어 "${word}" 검색 결과:`, matches);
        return matches;
    });

    console.log('매칭된 단어들:', matchingWords);

    if (matchingWords.length > 0) {
        searchResults.innerHTML = matchingWords.map((word, index) => `
            <div class="list-item ${index === selectedIndex ? 'selected' : ''}" 
                 data-word="${word}" 
                 data-index="${index}"
                 onclick="selectWord('${word}')">
                <span>${word}</span>
            </div>
        `).join('');
        
        if (selectedIndex === -1 && matchingWords.length > 0) {
            selectedIndex = 0;
            updateSelectedItem(searchResults.getElementsByClassName('list-item'));
        }
    } else {
        searchResults.innerHTML = '';
        selectedIndex = -1;
    }
}

// 단어 선택 시 검색창에 추가
function selectWord(word) {
    const searchInput = document.getElementById('searchInput');
    const currentWords = searchInput.value.trim().split(' ');
    
    // 마지막 단어를 선택한 단어로 대체
    if (currentWords.length > 0) {
        currentWords[currentWords.length - 1] = word;
    } else {
        currentWords.push(word);
    }
    
    searchInput.value = currentWords.join(' ');
    document.getElementById('searchResults').innerHTML = '';
    selectedIndex = -1;
}

// 방덱이 동일한지 확인하는 함수
function isSameList(list1, list2) {
    const words1 = list1.split(' ');
    const words2 = list2.split(' ');
    
    // 첫 번째와 두 번째 단어가 일치하는지 확인
    if (words1[0] !== words2[0] || words1[1] !== words2[1]) {
        return false;
    }
    
    // 나머지 단어들을 정렬하여 비교
    const remainingWords1 = words1.slice(2).sort();
    const remainingWords2 = words2.slice(2).sort();
    
    return remainingWords1.join(' ') === remainingWords2.join(' ');
}

// 방덱 추가
function addNewList() {
    const searchInput = document.getElementById('searchInput');
    const title = searchInput.value.trim();
    
    if (!title) return;
    
    // 현재 시간 정보 생성
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    // 생성 시간을 공백과 콜론 형식으로 저장
    const createdAt = `${year}-${month}-${day} ${hours}:${minutes}`;
    
    // 입력된 단어 개수 확인
    const words = title.split(' ').filter(w => w);
    
    if (words.length <= 3) {
        // 3개 이하의 단어 입력 시
        const matchingLists = lists.filter(list => {
            const listWords = list.title.split(' ').filter(w => w);
            return words.every(word => 
                listWords.some(listWord => 
                    listWord.toLowerCase().includes(word.toLowerCase())
                )
            );
        });
        
        if (matchingLists.length > 0) {
            lists = lists.filter(list => !matchingLists.includes(list));
            temporaryLists = [...matchingLists, ...temporaryLists];
            saveLists();
            renderLists();
            renderTemporaryLists();
        } else {
            const newList = {
                id: Date.now().toString(),
                title: title,
                memos: [],
                createdAt: createdAt
            };
            temporaryLists.unshift(newList);
            renderTemporaryLists();
        }
    } else {
        const existingListIndex = lists.findIndex(list => isSameList(list.title, title));
        const temporaryListIndex = temporaryLists.findIndex(list => isSameList(list.title, title));
        
        if (existingListIndex !== -1) {
            const existingList = lists.splice(existingListIndex, 1)[0];
            temporaryLists.unshift(existingList);
            renderTemporaryLists();
        } else if (temporaryListIndex !== -1) {
            const existingList = temporaryLists.splice(temporaryListIndex, 1)[0];
            temporaryLists.unshift(existingList);
            renderTemporaryLists();
        } else {
            const newList = {
                id: Date.now().toString(),
                title: title,
                memos: [],
                createdAt: createdAt
            };
            temporaryLists.unshift(newList);
            renderTemporaryLists();
        }
    }
    
    searchInput.value = '';
    updateStats();
    saveTemporaryLists();
    saveLists();
}

// 기존 목록에 생성 시간 추가
function addCreatedAtToExistingLists() {
    const defaultCreatedAt = '2025-04-22 09:30';
    
    lists = lists.map(list => ({
        ...list,
        createdAt: list.createdAt ? formatCreatedAt(list.createdAt) : defaultCreatedAt
    }));
    
    temporaryLists = temporaryLists.map(list => ({
        ...list,
        createdAt: list.createdAt ? formatCreatedAt(list.createdAt) : defaultCreatedAt
    }));
    
    saveLists();
    saveTemporaryLists();
}

// 임시 목록 렌더링 (상태 아이콘 및 버튼 추가)
function renderTemporaryLists() {
    const temporaryListsContainer = document.getElementById('temporaryLists');
    temporaryListsContainer.innerHTML = temporaryLists.map(list => `
        <div class="list-item" data-list-id="${list.id}">
            <div class="list-title">
                <span class="list-title-text">${list.title}</span>
                <span class="memo-count">${list.memos.length}/50</span>
                <div class="button-group">
                    <button class="edit-btn" onclick="startEditList('${list.id}', true)">수정</button>
                    <button class="delete-btn" onclick="deleteList('${list.id}', true)">삭제</button>
                </div>
            </div>
            <div class="edit-section" id="editSection-${list.id}">
                <div class="input-group">
                    <input type="text" id="editListInput-${list.id}" placeholder="방덱 제목 수정..." onkeypress="if(event.key === 'Enter') saveListEdit('${list.id}', true)">
                    <div class="edit-buttons">
                        <button class="save-btn" onclick="saveListEdit('${list.id}', true)">저장</button>
                        <button class="cancel-btn" onclick="cancelListEdit('${list.id}', true)">취소</button>
                    </div>
                </div>
            </div>
            <div class="memo-section" id="memoSection-${list.id}">
                <span class="list-created-at">생성: ${formatCreatedAt(list.createdAt)}</span>
                <div class="input-group">
                    <input type="text" id="newMemoInput-${list.id}" placeholder="메모 추가..." onkeypress="if(event.key === 'Enter') addMemo('${list.id}', true)">
                    <button onclick="addMemo('${list.id}', true)">추가</button>
                </div>
                <div class="memo-list">
                    ${(list.memos || []).map(memo => createMemoItemHTML(memo, list.id, true)).join('')}
                </div>
            </div>
        </div>
    `).join('');

    // 임시 목록의 이벤트 리스너 추가
    document.querySelectorAll('#temporaryLists .list-title').forEach(title => {
        title.addEventListener('click', function(e) {
            if (!e.target.closest('.button-group')) {
                const listId = this.closest('.list-item').dataset.listId;
                toggleMemos(listId);
            }
        });
    });
}

// 방덱 삭제
async function deleteList(listId, isTemporary = false) {
    // 로그인 상태 확인
    const user = firebase.auth().currentUser;
    if (!user) {
        alert('목록 삭제는 로그인 후 가능합니다.');
        return;
    }

    const list = isTemporary ? 
        temporaryLists.find(l => l.id.toString() === listId.toString()) :
        lists.find(l => l.id.toString() === listId.toString());

    // 권한 체크
    const isAdmin = user.email === 'longway7098@gmail.com';
    const isOldList = list && list.createdAt === '2025-04-22 09:30';

    if (!isTemporary && isOldList && !isAdmin) {
        alert('이전 목록은 관리자만 삭제할 수 있습니다.');
        return;
    }

    if (confirm('해당 목록을 삭제하시겠습니까?')) {
        try {
            const db = window.db;
            
            // Firebase에서 해당 목록 삭제
            if (db) {
                const collectionName = isTemporary ? 'temporary' : 'main';
                const docRef = db.collection('lists').doc(collectionName);
                
                // 해당 목록을 제외한 나머지 목록만 Firebase에 저장
        if (isTemporary) {
            temporaryLists = temporaryLists.filter(list => list.id.toString() !== listId.toString());
                    await docRef.set({
                        lists: temporaryLists,
                        updated_at: new Date().toISOString()
                    });
                } else {
                    lists = lists.filter(list => list.id.toString() !== listId.toString());
                    await docRef.set({
                        lists: lists,
                        updated_at: new Date().toISOString()
                    });
                }
            }

            // 로컬 데이터 업데이트 및 화면 갱신
            if (isTemporary) {
            renderTemporaryLists();
            saveTemporaryLists();
        } else {
            // 삭제 후 현재 페이지에 아이템이 남아있는지 확인
            const totalItems = lists.filter(list => {
                if (currentFilterType === 'all') return true;
                if (currentFilterType === '4방덱') return list.title.startsWith('4방덱');
                if (currentFilterType === '5방덱') return list.title.startsWith('5방덱');
                if (currentFilterType === '기타') return !list.title.startsWith('4방덱') && !list.title.startsWith('5방덱');
                return true;
            }).length;
                
            const totalPages = Math.ceil(totalItems / itemsPerPage);

            // 현재 페이지가 삭제 후 존재하지 않으면 이전 페이지나 1페이지로 이동
            if (currentPage > totalPages && totalPages > 0) {
                renderLists(totalPages);
            } else if (totalItems === 0) {
                renderLists(1); // 아이템이 없으면 1페이지 (빈 화면)
            } else {
                 renderLists(currentPage); // 현재 페이지 다시 로드
            }
            updateStats();
                saveLists();
            }
        } catch (error) {
            console.error('목록 삭제 중 오류 발생:', error);
            alert('목록 삭제 중 오류가 발생했습니다.');
        }
    }
}

// 메모 추가 (키워드 기반 자동 상태 설정 및 텍스트 제거 - 로그 제거)
function addMemo(listId, isTemporary = false) {
    const memoInput = document.getElementById(`newMemoInput-${listId}`);
    let memoText = memoInput.value.trim();

    if (!memoText) return;

        const targetLists = isTemporary ? temporaryLists : lists;
        const list = targetLists.find(l => l.id.toString() === listId.toString());
    
    if (!list) return;

             if (list.memos.length >= 50) {
                alert('한 방덱에는 최대 50개의 메모만 추가할 수 있습니다.');
                return;
            }

    // 새 메모 객체 생성 (status 제거)
            const newMemo = {
                id: Date.now().toString() + Math.random().toString(16).slice(2),
        text: memoText,
        wins: 0,
        losses: 0
            };

    // 메모 추가
            list.memos.push(newMemo);
            
    // 변경사항 저장
    if (isTemporary) {
                saveTemporaryLists();
    } else {
        saveLists();
            }

    // UI 업데이트
            const memoListContainer = document.querySelector(`#memoSection-${listId} .memo-list`);
            if (memoListContainer) {
        const memoHTML = createMemoItemHTML(newMemo, listId, isTemporary);
        memoListContainer.insertAdjacentHTML('beforeend', memoHTML);
    }

    // 메모 카운트 업데이트
            const memoCountElement = document.querySelector(`.list-item[data-list-id="${listId}"] .memo-count`);
            if (memoCountElement) {
                memoCountElement.textContent = `${list.memos.length}/50`;
            }
            
    // 입력 필드 초기화
            memoInput.value = '';
}

// 메모 삭제
function deleteMemo(listId, memoId, isTemporary = false) {
    if (confirm('해당 메모를 삭제하시겠습니까?')) {
        const targetLists = isTemporary ? temporaryLists : lists;
        const list = targetLists.find(l => l.id.toString() === listId.toString());
        if (list) {
            list.memos = list.memos.filter(memo => memo.id.toString() !== memoId.toString());
            if (!isTemporary) {
                saveLists();
            } else {
                saveTemporaryLists(); // 임시 목록 메모 삭제 후 저장
            }
            isTemporary ? renderTemporaryLists() : renderLists();
        }
    }
}

// 생성 시간으로 목록 정렬하는 함수
function sortListsByCreatedAt(lists, sortType) {
    return [...lists].sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt.replace(' ', 'T')) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt.replace(' ', 'T')) : new Date(0);
        
        if (sortType === 'newest') {
            return dateB - dateA;
        } else if (sortType === 'oldest') {
            return dateA - dateB;
        }
        return 0;
    });
}

// 목록 렌더링 (페이지네이션 적용)
function renderLists(page = 1) {
    currentPage = page;
    const listsContainer = document.getElementById('lists');
    if (!listsContainer) return;

    // 1. 현재 필터 타입에 따라 목록 필터링
    let filteredLists = lists;
    if (currentFilterType === '4방덱') {
        filteredLists = lists.filter(list => list.title.startsWith('4방덱'));
    } else if (currentFilterType === '5방덱') {
        filteredLists = lists.filter(list => list.title.startsWith('5방덱'));
    } else if (currentFilterType === '기타') {
        filteredLists = lists.filter(list => !list.title.startsWith('4방덱') && !list.title.startsWith('5방덱'));
    }

    // 생성 시간 기준 정렬 적용
    if (currentSortType !== 'none') {
        filteredLists = sortListsByCreatedAt(filteredLists, currentSortType);
    }

    // 2. 현재 페이지에 해당하는 목록만 추출
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedLists = filteredLists.slice(startIndex, endIndex);

    // 3. 목록 렌더링
    listsContainer.innerHTML = paginatedLists.map(list => `
        <div class="list-item" data-list-id="${list.id}">
            <div class="list-title">
                <span class="list-title-text">${list.title}</span>
                <span class="memo-count">${list.memos.length}/50</span>
                <div class="button-group">
                    <button class="edit-btn" onclick="startEditList('${list.id}')">수정</button>
                    <button class="delete-btn" onclick="deleteList('${list.id}')">삭제</button>
                </div>
            </div>
            <div class="edit-section" id="editSection-${list.id}">
                <div class="input-group">
                    <input type="text" id="editListInput-${list.id}" placeholder="방덱 제목 수정..." onkeypress="if(event.key === 'Enter') saveListEdit('${list.id}')">
                    <div class="edit-buttons">
                        <button class="save-btn" onclick="saveListEdit('${list.id}')">저장</button>
                        <button class="cancel-btn" onclick="cancelListEdit('${list.id}')">취소</button>
                    </div>
                </div>
            </div>
            <div class="memo-section" id="memoSection-${list.id}">
                <span class="list-created-at">생성: ${formatCreatedAt(list.createdAt)}</span>
                <div class="input-group">
                    <input type="text" id="newMemoInput-${list.id}" placeholder="메모 추가..." onkeypress="if(event.key === 'Enter') addMemo('${list.id}')">
                    <button onclick="addMemo('${list.id}')">추가</button>
                </div>
                <div class="memo-list">
                    ${(list.memos || []).map(memo => createMemoItemHTML(memo, list.id, false)).join('')}
                </div>
            </div>
        </div>
    `).join('');

    // 4. 이벤트 리스너 추가
    document.querySelectorAll('#lists .list-title').forEach(title => {
        title.addEventListener('click', function(e) {
            if (!e.target.closest('.button-group')) {
                const listId = this.closest('.list-item').dataset.listId;
                toggleMemos(listId);
            }
        });
    });

    // 5. 페이지네이션 컨트롤 렌더링
    renderPaginationControls(filteredLists.length);
}

// 페이지네이션 컨트롤 렌더링 함수 (개선된 버전: 처음/끝 페이지 버튼 추가)
function renderPaginationControls(totalItems) {
    const paginationControls = document.getElementById('paginationControls');
    if (!paginationControls) return;

    const totalPages = Math.ceil(totalItems / itemsPerPage);
    paginationControls.innerHTML = ''; // 기존 컨트롤 초기화

    if (totalPages <= 1) return; // 페이지가 1개 이하면 컨트롤 표시 안 함

    // --- 개별 페이지 이동 버튼 영역 --- (상단)
    const individualNav = document.createElement('div');
    individualNav.classList.add('pagination-individual-nav');
    individualNav.style.marginBottom = '10px'; // 그룹 컨트롤과 간격

    const prevPageButton = document.createElement('button');
    prevPageButton.textContent = '이전';
    prevPageButton.disabled = currentPage === 1;
    prevPageButton.addEventListener('click', () => {
        if (currentPage > 1) {
            renderLists(currentPage - 1);
        }
    });
    individualNav.appendChild(prevPageButton);

    const nextPageButton = document.createElement('button');
    nextPageButton.textContent = '다음';
    nextPageButton.disabled = currentPage === totalPages;
    nextPageButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            renderLists(currentPage + 1);
        }
    });
    individualNav.appendChild(nextPageButton);

    paginationControls.appendChild(individualNav);

    // --- 페이지 그룹 이동 및 번호 영역 --- (하단)
    const groupNav = document.createElement('div');
    groupNav.classList.add('pagination-group-nav');

    const pagesPerGroup = 10; // 한 번에 보여줄 페이지 번호 개수
    const currentGroup = Math.ceil(currentPage / pagesPerGroup);
    const startPage = (currentGroup - 1) * pagesPerGroup + 1;
    const endPage = Math.min(startPage + pagesPerGroup - 1, totalPages);

    // 맨 처음(<<) 버튼
    const firstPageButton = document.createElement('button');
    firstPageButton.innerHTML = '&laquo;'; // << 기호
    firstPageButton.title = '처음 페이지로';
    firstPageButton.disabled = currentPage === 1;
    firstPageButton.addEventListener('click', () => {
        if (currentPage !== 1) {
            renderLists(1);
        }
    });
    groupNav.appendChild(firstPageButton);

    // 이전 그룹(<) 버튼
    const prevGroupButton = document.createElement('button');
    prevGroupButton.innerHTML = '&lt;'; // < 기호
    prevGroupButton.title = '이전 페이지 그룹으로';
    prevGroupButton.disabled = currentGroup === 1;
    prevGroupButton.addEventListener('click', () => {
        if (currentGroup > 1) {
            const targetPage = startPage - pagesPerGroup;
            renderLists(targetPage);
        }
    });
    groupNav.appendChild(prevGroupButton);

    // 페이지 번호
    for (let i = startPage; i <= endPage; i++) {
        const pageNumber = document.createElement('a');
        pageNumber.href = '#'; // 실제 이동 방지
        pageNumber.textContent = i;
        pageNumber.classList.add('page-number');
        if (i === currentPage) {
            pageNumber.classList.add('active');
        }
        pageNumber.addEventListener('click', (e) => {
            e.preventDefault();
            renderLists(i);
        });
        groupNav.appendChild(pageNumber);
    }

    // 다음 그룹(>) 버튼
    const nextGroupButton = document.createElement('button');
    nextGroupButton.innerHTML = '&gt;'; // > 기호
    nextGroupButton.title = '다음 페이지 그룹으로';
    nextGroupButton.disabled = endPage >= totalPages;
    nextGroupButton.addEventListener('click', () => {
        if (endPage < totalPages) {
            const targetPage = startPage + pagesPerGroup;
            renderLists(targetPage);
        }
    });
    groupNav.appendChild(nextGroupButton);

    // 맨 마지막(>>) 버튼
    const lastPageButton = document.createElement('button');
    lastPageButton.innerHTML = '&raquo;'; // >> 기호
    lastPageButton.title = '마지막 페이지로';
    lastPageButton.disabled = currentPage === totalPages;
    lastPageButton.addEventListener('click', () => {
        if (currentPage !== totalPages) {
            renderLists(totalPages);
        }
    });
    groupNav.appendChild(lastPageButton);

    paginationControls.appendChild(groupNav);
}

// 방덱 클릭 처리
function handleListClick(listId) {
    // 편집 중인 방덱이나 메모가 있으면 저장
    if (editingListId) {
        saveListEdit(editingListId);
    }
    if (editingMemoId) {
        const list = lists.find(l => l.memos.some(m => m.id === editingMemoId));
        if (list) {
            saveMemoEdit(list.id, editingMemoId);
        }
    }
    
    // 메모 섹션 토글
    toggleMemos(listId);
}

// 메모 섹션 토글
function toggleMemos(listId) {
    const memoSection = document.getElementById(`memoSection-${listId}`);
    if (!memoSection) return;

    const isExpanded = memoSection.classList.contains('expanded');
    
    // 모든 열린 메모 섹션 닫기
    document.querySelectorAll('.memo-section.expanded').forEach(section => {
        if (section.id !== `memoSection-${listId}`) {
            section.classList.remove('expanded');
        }
    });
    
    // 현재 선택된 섹션 토글
    memoSection.classList.toggle('expanded');
    
    // 스크롤 위치 조정 (섹션이 열릴 때만)
    if (!isExpanded) {
        const listItem = memoSection.closest('.list-item');
        if (listItem) {
            setTimeout(() => {
        const listItemRect = listItem.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        
                if (listItemRect.bottom + 300 > viewportHeight) {
            window.scrollTo({
                        top: window.scrollY + (listItemRect.bottom + 300 - viewportHeight),
                behavior: 'smooth'
            });
                }
            }, 300); // 애니메이션 완료 후 스크롤 조정
        }
    }
}

// 통계 업데이트
function updateStats() {
    const stats = {
        '4deck': 0,
        '5deck': 0,
        'other': 0
    };
    
    lists.forEach(list => {
        if (list.title.includes('4방덱')) {
            stats['4deck']++;
        } else if (list.title.includes('5방덱')) {
            stats['5deck']++;
        } else {
            stats['other']++;
        }
    });
    
    // 드롭다운 메뉴 아이템 업데이트
    updateDropdownItems(stats);
}

// 드롭다운 메뉴 아이템 업데이트
function updateDropdownItems(stats) {
    const dropdownContent = document.querySelector('.dropdown-content');
    if (!dropdownContent) return;

    const items = [
        { type: 'all', label: '전체보기', count: stats['4deck'] + stats['5deck'] + stats['other'] },
        { type: '4방덱', label: '4방덱', count: stats['4deck'] },
        { type: '5방덱', label: '5방덱', count: stats['5deck'] },
        { type: '기타', label: '기타', count: stats['other'] },
        { type: 'divider' }, // 구분선 추가
        { type: 'newest', label: '최신순으로 정렬', isSortOption: true },
        { type: 'oldest', label: '과거순으로 정렬', isSortOption: true },
        { type: 'none', label: '정렬 해제', isSortOption: true }
    ];

    dropdownContent.innerHTML = items.map(item => {
        if (item.type === 'divider') {
            return '<div class="dropdown-divider"></div>';
        }
        
        const isSelected = item.isSortOption ? 
            (currentSortType === item.type) : 
            (currentFilterType === item.type);
        
        return `
            <div class="dropdown-item ${isSelected ? 'selected' : ''}" 
                 data-type="${item.type}"
                 data-is-sort="${item.isSortOption || false}">
                <span>${item.label}</span>
                ${item.count !== undefined ? `<span class="count">${item.count}</span>` : ''}
            </div>
        `;
    }).join('');

    // 드롭다운 아이템 클릭 이벤트 추가
    dropdownContent.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', function() {
            const type = this.dataset.type;
            const isSort = this.dataset.isSort === 'true';
            
            if (isSort) {
                // 정렬 옵션 선택
                currentSortType = type;
                // 정렬 옵션만 selected 상태 업데이트
                dropdownContent.querySelectorAll('.dropdown-item[data-is-sort="true"]').forEach(el => 
                    el.classList.toggle('selected', el.dataset.type === type)
                );
            } else {
                // 필터 옵션 선택
                currentFilterType = type;
                // 필터 옵션만 selected 상태 업데이트
                dropdownContent.querySelectorAll('.dropdown-item[data-is-sort="false"]').forEach(el => 
                    el.classList.toggle('selected', el.dataset.type === type)
                );
            }
            
            // 드롭다운 버튼 텍스트 업데이트
            const dropdownBtn = document.querySelector('.dropdown-btn');
            if (dropdownBtn) {
                const filterLabel = items.find(i => i.type === currentFilterType)?.label || '전체보기';
                const sortLabel = currentSortType !== 'none' ? 
                    ` (${items.find(i => i.type === currentSortType)?.label})` : '';
                dropdownBtn.textContent = `표시 기준: ${filterLabel}${sortLabel}`;
            }
            
            // 목록 다시 렌더링
            renderLists(1);
            
            // 드롭다운 닫기
            dropdownContent.classList.remove('show');
        });
    });
}

// 방덱 편집 시작
function startEditList(listId, isTemporary = false) {
    const targetLists = isTemporary ? temporaryLists : lists;
    const list = targetLists.find(l => l.id.toString() === listId.toString());
    if (!list) return;

    const editSection = document.getElementById(`editSection-${listId}`);
    if (!editSection) return;

    const input = document.getElementById(`editListInput-${listId}`);
    if (input) {
        input.value = list.title;
        input.focus();
        input.select();
    }

    editSection.style.display = 'block';
    editingListId = listId;
}

// 방덱 편집 저장
function saveListEdit(listId, isTemporary = false) {
    const input = document.getElementById(`editListInput-${listId}`);
    if (!input) return;

    const newTitle = input.value.trim();
    if (!newTitle) {
        alert('방덱 제목을 입력해주세요.');
        return;
    }

    if (isTemporary) {
        // 기존 목록에서 동일한 방덱이 있는지 확인
        const existingListIndex = lists.findIndex(list => isSameList(list.title, newTitle));
        if (existingListIndex !== -1) {
            // 기존 목록이 있을 경우
            const existingList = lists[existingListIndex];
            const currentList = temporaryLists.find(l => l.id.toString() === listId.toString());
            
            // 현재 임시 목록의 메모들을 기존 목록에 추가
            if (currentList && currentList.memos.length > 0) {
                // 중복되지 않는 메모만 추가
                currentList.memos.forEach(memo => {
                    const isDuplicate = existingList.memos.some(existingMemo => 
                        existingMemo.text === memo.text
                    );
                    if (!isDuplicate) {
                        existingList.memos.push(memo);
                    }
                });
            }
            
            // 임시 목록에서 현재 목록 삭제
            temporaryLists = temporaryLists.filter(list => list.id.toString() !== listId.toString());
            
            // 기존 목록을 임시 목록 맨 위로 이동
            lists.splice(existingListIndex, 1);
            temporaryLists.unshift(existingList);
            
            // 변경사항 저장
            saveLists();
            saveTemporaryLists();
            
            // UI 업데이트
            renderLists();
            renderTemporaryLists();
            return;
        }

        // 기존 목록이 없는 경우 일반적인 제목 수정 진행
        const list = temporaryLists.find(l => l.id.toString() === listId.toString());
    if (list) {
        list.title = newTitle;
            saveTemporaryLists();
            renderTemporaryLists();
        }
        } else {
        const list = lists.find(l => l.id.toString() === listId.toString());
        if (list) {
            list.title = newTitle;
            saveLists();
            renderLists();
        }
    }

    editingListId = null;
    const editSection = document.getElementById(`editSection-${listId}`);
    if (editSection) {
        editSection.style.display = 'none';
    }
}

// 방덱 편집 취소
function cancelListEdit(listId, isTemporary = false) {
    const editSection = document.getElementById(`editSection-${listId}`);
    if (editSection) {
        editSection.style.display = 'none';
    }
    editingListId = null;
}

// 메모 편집 시작
function startEditMemo(listId, memoId, isTemporary = false) {
    const memoItem = document.querySelector(`.memo-item[data-memo-id="${memoId}"]`);
    if (!memoItem) return;

    // 기존에 편집 중인 메모가 있다면 편집 취소
    const editingMemos = document.querySelectorAll('.memo-item.editing');
    editingMemos.forEach(editingMemo => {
        if (editingMemo.dataset.memoId !== memoId) {
            cancelMemoEdit(listId, editingMemo.dataset.memoId, isTemporary);
        }
    });

    const memoText = memoItem.querySelector('.memo-text');
    const editSection = memoItem.querySelector('.edit-section');
    const editInput = memoItem.querySelector('.edit-memo-input');

    if (memoText && editSection && editInput) {
        memoItem.classList.add('editing');
        memoText.style.display = 'none';
    editSection.style.display = 'block';
        editInput.value = memoText.textContent;
        editInput.focus();
        editInput.select();
    }
}

// 메모 편집 저장
function saveMemoEdit(listId, memoId, isTemporary = false) {
    const memoItem = document.querySelector(`.memo-item[data-memo-id="${memoId}"]`);
    if (!memoItem) return;

    const editInput = memoItem.querySelector('.edit-memo-input');
    if (!editInput) return;

    const newText = editInput.value.trim();
    if (!newText) {
        alert('메모 내용을 입력해주세요.');
        return;
    }

    const targetLists = isTemporary ? temporaryLists : lists;
    const list = targetLists.find(l => l.id.toString() === listId.toString());
    if (!list) return;

        const memo = list.memos.find(m => m.id.toString() === memoId.toString());
    if (!memo) return;

    memo.text = newText;

    const memoText = memoItem.querySelector('.memo-text');
    const editSection = memoItem.querySelector('.edit-section');

    if (memoText && editSection) {
        memoText.textContent = newText;
        memoText.style.display = 'block';
        editSection.style.display = 'none';
        memoItem.classList.remove('editing');
    }

    if (isTemporary) {
        saveTemporaryLists();
        } else {
        saveLists();
    }
}

// 메모 편집 취소
function cancelMemoEdit(listId, memoId, isTemporary = false) {
    const memoItem = document.querySelector(`.memo-item[data-memo-id="${memoId}"]`);
    if (!memoItem) return;

    const memoText = memoItem.querySelector('.memo-text');
    const editSection = memoItem.querySelector('.edit-section');

    if (memoText && editSection) {
        memoText.style.display = 'block';
        editSection.style.display = 'none';
        memoItem.classList.remove('editing');
    }
}

// 상태 메시지 업데이트 (버튼 아래에 표시되도록 수정)
// triggerElement: 메시지를 유발한 버튼 요소
function updateActionStatus(triggerElement, message, duration = 3000) {
    const statusElement = document.getElementById('actionStatus');
    if (!statusElement || !triggerElement) return;

    // 기존 타임아웃 제거
    if (statusTimeoutId) {
        clearTimeout(statusTimeoutId);
    }

    // 버튼 위치 계산 (부모 컨테이너 기준)
    const buttonRect = triggerElement.getBoundingClientRect();
    const containerRect = triggerElement.parentElement.getBoundingClientRect();

    const topOffset = buttonRect.bottom - containerRect.top + 5; // 버튼 아래 5px
    const leftOffset = buttonRect.left - containerRect.left + buttonRect.width / 2; // 버튼 가로 중앙

    // 상태 메시지 위치 및 내용 설정
    statusElement.style.top = `${topOffset}px`;
    statusElement.style.left = `${leftOffset}px`;
    statusElement.textContent = message;
    statusElement.style.opacity = 1;
    statusElement.style.display = 'block'; // 보이도록 설정

    // 일정 시간 후 메시지 숨기기
    statusTimeoutId = setTimeout(() => {
        statusElement.style.opacity = 0;
        // 트랜지션 완료 후 display none 처리 (선택 사항)
        setTimeout(() => {
            if (statusElement.style.opacity === '0') { // opacity가 0일 때만 숨김
                 statusElement.style.display = 'none';
            }
        }, 500); // transition 시간과 일치시킴
    }, duration);
}

// 방덱 타입을 반환하는 함수 (4방덱, 5방덱, 기타)
function getDeckType(title) {
    if (title.startsWith('4방덱')) {
        return '4방덱';
    } else if (title.startsWith('5방덱')) {
        return '5방덱';
    } else {
        return '기타';
    }
}

// 임시 목록의 모든 항목을 기존 목록으로 이동 (1페이지로 이동)
function addTemporaryToLists(event) {
    if (temporaryLists.length === 0) {
        updateActionStatus(event.currentTarget, "임시 목록이 비어 있습니다.", 2000);
        return;
    }

    // 임시 목록의 항목들을 기존 목록의 시작 부분에 추가
    lists = [...temporaryLists, ...lists];
    
    // 임시 목록 비우기
    const addedCount = temporaryLists.length; // 추가된 개수 저장 (메시지 변경으로 실제 사용은 안 함)
    temporaryLists = [];
    
    // 변경사항 저장
    saveLists();
    saveTemporaryLists();
    
    // 화면 다시 렌더링
    renderLists(1);
    renderTemporaryLists();
    updateStats(); // 통계 업데이트
    
    // 성공 메시지 표시
    updateActionStatus(event.currentTarget, "기존 목록에 추가됨", 3000);
}

// 목록 및 메모 정렬 함수 (1페이지로 이동)
function sortAll(event) {
    // 기존 목록 정렬
    lists.sort((a, b) => {
        // 먼저 4방덱, 5방덱, 기타 순으로 정렬
        const typeA = getDeckType(a.title);
        const typeB = getDeckType(b.title);
        
        if (typeA !== typeB) {
            const order = { '4방덱': 1, '5방덱': 2, '기타': 3 };
            return order[typeA] - order[typeB];
        }
        
        // 같은 타입 내에서는 이름순 정렬
        return a.title.localeCompare(b.title, 'ko');
    });

    // 기존 목록 내 메모 정렬
    lists.forEach(list => {
        if (list.memos && list.memos.length > 0) {
            list.memos.sort((a, b) => {
                const textA = a.text || '';
                const textB = b.text || '';
                const firstWordA = textA.split(' ')[0];
                const firstWordB = textB.split(' ')[0];
                return firstWordA.localeCompare(firstWordB, 'ko');
            });
        }
    });

    // 임시 목록 정렬
    temporaryLists.sort((a, b) => {
        const typeA = getDeckType(a.title);
        const typeB = getDeckType(b.title);
        if (typeA !== typeB) {
            const order = { '4방덱': 1, '5방덱': 2, '기타': 3 };
            return order[typeA] - order[typeB];
        }
        return a.title.localeCompare(b.title, 'ko');
    });

    // 임시 목록 내 메모 정렬
    temporaryLists.forEach(list => {
         if (list.memos && list.memos.length > 0) {
            list.memos.sort((a, b) => {
                const textA = a.text || '';
                const textB = b.text || '';
                const firstWordA = textA.split(' ')[0];
                const firstWordB = textB.split(' ')[0];
                return firstWordA.localeCompare(firstWordB, 'ko');
            });
        }
    });

    // 변경 사항 저장
    saveLists();
    saveTemporaryLists();
    
    // 화면 다시 렌더링
    renderLists(1);
    
    // 정렬 완료 메시지 표시
    updateActionStatus(event.currentTarget, '모든 목록과 메모가 정렬되었습니다.', 3000);
}

// 선택된 항목 업데이트
function updateSelectedItem(items) {
    Array.from(items).forEach((item, index) => {
        if (index === selectedIndex) {
            item.classList.add('selected');
            item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        } else {
            item.classList.remove('selected');
        }
    });
}

// 메모 상태 설정 함수 (UI 부분 업데이트로 수정)
function setMemoStatus(listId, memoId, newStatus, isTemporary = false) {
    const targetLists = isTemporary ? temporaryLists : lists;
    const list = targetLists.find(l => l.id.toString() === listId.toString());
    if (!list) return;

    const memo = list.memos.find(m => m.id.toString() === memoId.toString());
    if (!memo) return;

    const previousStatus = memo.status;
    
    // 같은 상태를 다시 클릭하면 상태 제거
    if (previousStatus === newStatus) {
        memo.status = null;
        memo.wins = 0;
        memo.losses = 0;
    } else {
        // 새로운 상태 설정 및 승패 초기화
        memo.status = newStatus;
        memo.wins = newStatus === 'success' ? 1 : 0;
        memo.losses = newStatus === 'fail' ? 1 : 0;
    }

    // 변경사항 저장
    if (!isTemporary) {
        saveLists();
    } else {
        saveTemporaryLists();
    }

    // UI 업데이트
    const memoElement = document.querySelector(`.list-item[data-list-id="${listId}"] .memo-item[data-memo-id="${memoId}"]`);
    if (memoElement) {
        // 상태 아이콘 업데이트
        const memoText = memoElement.querySelector('.memo-text');
        if (memoText) {
            const statusIcon = memo.status === 'success' ? '✅' : 
                             memo.status === 'fail' ? '❌' : '';
            memoText.innerHTML = `${statusIcon} ${memo.text}`;
        }

        // 승률 계산 및 표시
        const winRate = (memo.wins + memo.losses) > 0 ? 
            ((memo.wins / (memo.wins + memo.losses)) * 100).toFixed(1) : 0;
        const counterText = memoElement.querySelector('.counter-text');
        if (counterText) {
            counterText.textContent = `${memo.wins}승 ${memo.losses}패 (${winRate}%)`;
        }

        // 상태 버튼 활성화 상태 업데이트
        const successBtn = memoElement.querySelector('.success-btn');
        const failBtn = memoElement.querySelector('.fail-btn');
        if (successBtn) successBtn.classList.toggle('active', memo.status === 'success');
        if (failBtn) failBtn.classList.toggle('active', memo.status === 'fail');
    }
}

// 백틱 키로 열린 메모 섹션 닫기
document.addEventListener('keydown', function(event) {
    // 입력 필드(input, textarea)에 포커스가 있을 때는 작동하지 않음
    const activeElement = document.activeElement;
    if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
        return;
    }

    if (event.key === '`') { // 백틱 키 확인
        console.log('Backtick key pressed');
        // 현재 열려있는 메모 섹션을 찾음
        const expandedMemoSection = document.querySelector('.memo-section.expanded');
        
        if (expandedMemoSection) {
            // 해당 메모 섹션의 부모 list-item에서 listId를 가져옴
            const listItem = expandedMemoSection.closest('.list-item');
            if (listItem) {
                const listId = listItem.dataset.listId;
                console.log(`Closing memo section for list ID: ${listId}`);
                toggleMemos(listId); // 기존 토글 함수를 사용하여 닫음
            }
        }
    }
});

// 메모에서 아이콘 제거하는 함수
function removeStatusIcons() {
    console.log('메모 아이콘 제거 시작...');

    // 메인 목록 처리
    lists = lists.map(list => ({
        ...list,
        memos: list.memos.map(memo => {
            // 승패 데이터 보존
            const wins = typeof memo.wins === 'number' ? memo.wins : 0;
            const losses = typeof memo.losses === 'number' ? memo.losses : 0;
            
            // 텍스트에서 아이콘 제거
            let cleanText = memo.text;
            if (cleanText.startsWith('✅ ')) {
                cleanText = cleanText.substring(2);
            } else if (cleanText.startsWith('❌ ')) {
                cleanText = cleanText.substring(2);
            }
            
            return {
                ...memo,
                text: cleanText,
                wins: wins,
                losses: losses,
                status: null // status 필드 제거
            };
        })
    }));

    // 임시 목록 처리
    temporaryLists = temporaryLists.map(list => ({
        ...list,
        memos: list.memos.map(memo => {
            // 승패 데이터 보존
            const wins = typeof memo.wins === 'number' ? memo.wins : 0;
            const losses = typeof memo.losses === 'number' ? memo.losses : 0;
            
            // 텍스트에서 아이콘 제거
            let cleanText = memo.text;
            if (cleanText.startsWith('✅ ')) {
                cleanText = cleanText.substring(2);
            } else if (cleanText.startsWith('❌ ')) {
                cleanText = cleanText.substring(2);
            }
            
            return {
                ...memo,
                text: cleanText,
                wins: wins,
                losses: losses,
                status: null // status 필드 제거
            };
        })
    }));

    // 변경사항 저장
    saveLists();
    saveTemporaryLists();
    
    // UI 업데이트
    renderLists(currentPage);
    renderTemporaryLists();
    
    console.log('메모 아이콘 제거 완료');
}

// 승패 데이터 복구 함수
async function restoreWinLossData() {
    console.log('승패 데이터 복구 시작...');

    try {
        // Firebase에서 데이터 가져오기
        const db = window.db;
        if (!db) {
            console.error('Firebase가 초기화되지 않았습니다.');
            return;
        }

        // 메인 목록 데이터 가져오기
        const mainListsDoc = await db.collection('lists').doc('main').get();
        if (mainListsDoc.exists) {
            const mainData = mainListsDoc.data();
            if (mainData && mainData.lists) {
                lists = mainData.lists.map(list => ({
                    ...list,
                    memos: list.memos.map(memo => {
                        // 텍스트에서 아이콘 확인
                        let wins = typeof memo.wins === 'number' ? memo.wins : 0;
                        let losses = typeof memo.losses === 'number' ? memo.losses : 0;
                        
                        // 아이콘이 있고 승패 데이터가 0인 경우에만 아이콘 기반으로 설정
                        if (wins === 0 && losses === 0) {
                            if (memo.text.startsWith('✅')) {
                                wins = 1;
                            } else if (memo.text.startsWith('❌')) {
                                losses = 1;
                            }
                        }
                        
                        return {
                            ...memo,
                            wins: wins,
                            losses: losses
                        };
                    })
                }));
            }
        }

        // 임시 목록 데이터 가져오기
        const tempListsDoc = await db.collection('lists').doc('temporary').get();
        if (tempListsDoc.exists) {
            const tempData = tempListsDoc.data();
            if (tempData && tempData.lists) {
                temporaryLists = tempData.lists.map(list => ({
                    ...list,
                    memos: list.memos.map(memo => {
                        // 텍스트에서 아이콘 확인
                        let wins = typeof memo.wins === 'number' ? memo.wins : 0;
                        let losses = typeof memo.losses === 'number' ? memo.losses : 0;
                        
                        // 아이콘이 있고 승패 데이터가 0인 경우에만 아이콘 기반으로 설정
                        if (wins === 0 && losses === 0) {
                            if (memo.text.startsWith('✅')) {
                                wins = 1;
                            } else if (memo.text.startsWith('❌')) {
                                losses = 1;
                            }
                        }
                        
                        return {
                            ...memo,
                            wins: wins,
                            losses: losses
                        };
                    })
                }));
            }
        }

        // 변경사항 저장
        await saveToFirebase();
        
        // UI 업데이트
        renderLists(currentPage);
        renderTemporaryLists();
        
        console.log('승패 데이터 복구 완료');
        alert('승패 데이터가 복구되었습니다.');
        
    } catch (error) {
        console.error('승패 데이터 복구 중 오류:', error);
        alert('승패 데이터 복구 중 오류가 발생했습니다.');
    }
}

// DOMContentLoaded 이벤트 리스너 수정
document.addEventListener('DOMContentLoaded', async function() {
    await loadLists();
    
    // 클립보드 토글 버튼 이벤트 리스너
    const toggleClipboardBtn = document.querySelector('.toggle-clipboard-btn');
    const clipboardContent = document.querySelector('.clipboard-content');
    
    if (toggleClipboardBtn && clipboardContent) {
        toggleClipboardBtn.addEventListener('click', function() {
            clipboardContent.classList.toggle('collapsed');
            this.textContent = clipboardContent.classList.contains('collapsed') ? '펼치기' : '접기';
        });
    }

    // 클립보드 관련 초기화
    loadClipboardItems();
    
    // 검색 입력 필드에 이벤트 리스너 추가
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const query = this.value.trim();
            const words = query.split(' ');
            const lastWord = words[words.length - 1].toLowerCase();

            // 마지막 단어가 있을 때만 추천 단어 표시
            if (lastWord) {
                // 모든 목록의 제목을 단어로 분리하여 배열 생성
                const allWords = Array.from(new Set(
                    lists.concat(temporaryLists)
                        .map(list => list.title.split(' ')) // 각 제목을 단어로 분리
                        .flat() // 2차원 배열을 1차원으로 평탄화
                        .filter(word => word.toLowerCase().includes(lastWord)) // 입력된 단어와 일치하는 것만 필터링
                ));

                // 최대 5개까지 표시
                suggestions = allWords.slice(0, 5);
                showSuggestions(suggestions, words, lastWord);
            } else {
                hideSuggestions();
            }
        });

        // 키보드 이벤트 처리
        searchInput.addEventListener('keydown', function(e) {
            const searchResults = document.getElementById('searchResults');
            const items = searchResults.getElementsByClassName('list-item');
            
            if (items.length === 0) return;
            
            switch(e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    selectedIndex = (selectedIndex + 1) % items.length;
                    updateSelectedItem(items);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    selectedIndex = (selectedIndex - 1 + items.length) % items.length;
                    updateSelectedItem(items);
                    break;
                case 'Tab':
                    e.preventDefault();
                    if (e.shiftKey) {
                        selectedIndex = (selectedIndex - 1 + items.length) % items.length;
                    } else {
                        selectedIndex = (selectedIndex + 1) % items.length;
                    }
                    updateSelectedItem(items);
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (selectedIndex >= 0 && selectedIndex < items.length) {
                        const word = items[selectedIndex].dataset.word;
                        const currentWords = this.value.trim().split(' ');
                        currentWords[currentWords.length - 1] = word;
                        this.value = currentWords.join(' ') + ' ';
                        searchResults.innerHTML = '';
                        selectedIndex = -1;
                    }
                    break;
                case 'Escape':
                    searchResults.innerHTML = '';
                    selectedIndex = -1;
                    break;
            }
        });
    }
    
    // 백업 파일 로드 버튼 이벤트 리스너
    const loadBackupBtn = document.getElementById('loadBackupBtn');
    const backupFileInput = document.getElementById('backupFileInput');
    
    if (loadBackupBtn && backupFileInput) {
        loadBackupBtn.addEventListener('click', () => {
            backupFileInput.click();
        });
        
        backupFileInput.addEventListener('change', async (event) => {
            const file = event.target.files[0];
            if (file) {
                await loadBackupFile(file);
                event.target.value = '';
            }
        });
    }

    // 백업 드롭다운 버튼 이벤트 리스너
    const backupBtn = document.getElementById('backupBtn');
    const dropdownContent = document.querySelector('.backup-dropdown-content');
    
    if (backupBtn && dropdownContent) {
        // 드롭다운 토글
        backupBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            dropdownContent.classList.toggle('show');
        });

        // 다른 곳 클릭시 드롭다운 닫기
        document.addEventListener('click', function(e) {
            if (!dropdownContent.contains(e.target) && !backupBtn.contains(e.target)) {
                dropdownContent.classList.remove('show');
            }
        });
    }
});

// 메모 아이템 HTML 생성 함수
function createMemoItemHTML(memo, listId, isTemporary) {
    const wins = typeof memo.wins === 'number' ? memo.wins : 0;
    const losses = typeof memo.losses === 'number' ? memo.losses : 0;
    const winRate = (wins + losses) > 0 ? ((wins / (wins + losses)) * 100).toFixed(1) : 0;
    const comments = memo.comments || [];
    const commentCount = comments.length;

    return `
        <div class="memo-item" data-memo-id="${memo.id}">
            <div class="memo-content">
                <div class="memo-text">${memo.text}</div>
                <button class="comment-toggle" onclick="toggleComments('${listId}', '${memo.id}', ${isTemporary})">
                    댓글 ${commentCount}개
                </button>
                <div class="comment-section" style="display: none;">
                    <div class="comments-list">
                        ${comments.map(comment => `
                            <div class="comment-item" data-comment-id="${comment.id}">
                                <span class="comment-text">${comment.text}</span>
                                <button class="delete-comment" onclick="deleteComment('${listId}', '${memo.id}', '${comment.id}', ${isTemporary})">×</button>
                            </div>
                        `).join('')}
                    </div>
                    <div class="comment-input-group">
                        <input type="text" class="comment-input" placeholder="댓글을 입력하세요..." 
                               onkeypress="if(event.key === 'Enter') addComment('${listId}', '${memo.id}', this, ${isTemporary})">
                        <button onclick="addComment('${listId}', '${memo.id}', this.previousElementSibling, ${isTemporary})">추가</button>
                    </div>
                </div>
                <div class="edit-section" style="display: none;">
                    <div class="input-group">
                        <input type="text" class="edit-memo-input" value="${memo.text.replace(/"/g, '&quot;')}" 
                               onkeypress="if(event.key === 'Enter') saveMemoEdit('${listId}', '${memo.id}', ${isTemporary})" />
                        <div class="edit-buttons">
                            <button class="save-btn" onclick="saveMemoEdit('${listId}', '${memo.id}', ${isTemporary})">저장</button>
                            <button class="cancel-btn" onclick="cancelMemoEdit('${listId}', '${memo.id}', ${isTemporary})">취소</button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="memo-actions">
                <div class="memo-counter">
                    <span class="counter-text">${wins}승 ${losses}패 (${winRate}%)</span>
                    <div class="counter-buttons">
                        <button class="counter-btn plus-win" onclick="updateCounter('${listId}', '${memo.id}', 'wins', 1, ${isTemporary})">+승</button>
                        <button class="counter-btn minus-win" onclick="updateCounter('${listId}', '${memo.id}', 'wins', -1, ${isTemporary})">-승</button>
                        <button class="counter-btn plus-loss" onclick="updateCounter('${listId}', '${memo.id}', 'losses', 1, ${isTemporary})">+패</button>
                        <button class="counter-btn minus-loss" onclick="updateCounter('${listId}', '${memo.id}', 'losses', -1, ${isTemporary})">-패</button>
                    </div>
                </div>
                <div class="memo-buttons">
                    <button class="edit-btn" onclick="startEditMemo('${listId}', '${memo.id}', ${isTemporary})">수정</button>
                    <button class="delete-btn" onclick="deleteMemo('${listId}', '${memo.id}', ${isTemporary})">삭제</button>
                </div>
            </div>
        </div>
    `;
}

// 댓글 토글 함수
function toggleComments(listId, memoId, isTemporary) {
    const memoItem = document.querySelector(`.memo-item[data-memo-id="${memoId}"]`);
    if (!memoItem) return;

    const commentSection = memoItem.querySelector('.comment-section');
    if (commentSection) {
        const isHidden = commentSection.style.display === 'none';
        commentSection.style.display = isHidden ? 'block' : 'none';
    }
}

// 댓글 추가 함수
function addComment(listId, memoId, inputElement, isTemporary) {
    if (!inputElement) return;
    
    const commentText = inputElement.value.trim();
    if (!commentText) return;

    const targetLists = isTemporary ? temporaryLists : lists;
    const list = targetLists.find(l => l.id.toString() === listId.toString());
    if (!list) return;

    const memo = list.memos.find(m => m.id.toString() === memoId.toString());
    if (!memo) return;

    // 댓글 배열이 없으면 생성
    if (!memo.comments) {
        memo.comments = [];
    }

    // 새 댓글 추가
    const newComment = {
        id: Date.now().toString() + Math.random().toString(16).slice(2),
        text: commentText,
        createdAt: new Date().toISOString()
    };

    memo.comments.push(newComment);

    // UI 업데이트
    const commentsList = inputElement.closest('.comment-section').querySelector('.comments-list');
    if (commentsList) {
        const commentHTML = `
            <div class="comment-item">
                <span class="comment-text">${commentText}</span>
                <button class="delete-comment" onclick="deleteComment('${listId}', '${memoId}', '${newComment.id}', ${isTemporary})">×</button>
            </div>
        `;
        commentsList.insertAdjacentHTML('beforeend', commentHTML);
    }

    // 입력 필드 초기화
    inputElement.value = '';

    // 댓글 수 업데이트
    const commentToggle = inputElement.closest('.memo-content').querySelector('.comment-toggle');
    if (commentToggle) {
        commentToggle.textContent = `댓글 ${memo.comments.length}개`;
    }

    // 변경사항 저장
    if (isTemporary) {
        saveTemporaryLists();
        } else {
        saveLists();
    }
}

// 댓글 삭제 함수
function deleteComment(listId, memoId, commentId, isTemporary) {
    if (!confirm('댓글을 삭제하시겠습니까?')) return;

    const targetLists = isTemporary ? temporaryLists : lists;
    const list = targetLists.find(l => l.id.toString() === listId.toString());
    if (!list) return;

    const memo = list.memos.find(m => m.id.toString() === memoId.toString());
    if (!memo || !memo.comments) return;

    // 댓글 삭제
    const previousLength = memo.comments.length;
    memo.comments = memo.comments.filter(c => c.id.toString() !== commentId.toString());

    // 실제로 삭제되었는지 확인
    if (memo.comments.length < previousLength) {
        // UI 업데이트
        const memoItem = document.querySelector(`.memo-item[data-memo-id="${memoId}"]`);
        if (memoItem) {
            // 댓글 섹션 전체를 다시 렌더링
            const commentSection = memoItem.querySelector('.comment-section');
            if (commentSection) {
                commentSection.innerHTML = `
                    <div class="comments-list">
                        ${memo.comments.map(comment => `
                            <div class="comment-item" data-comment-id="${comment.id}">
                                <span class="comment-text">${comment.text}</span>
                                <button class="delete-comment" onclick="deleteComment('${listId}', '${memoId}', '${comment.id}', ${isTemporary})">×</button>
                            </div>
                        `).join('')}
                    </div>
                    <div class="comment-input-group">
                        <input type="text" class="comment-input" placeholder="댓글을 입력하세요..." 
                               onkeypress="if(event.key === 'Enter') addComment('${listId}', '${memoId}', this, ${isTemporary})">
                        <button onclick="addComment('${listId}', '${memoId}', this.previousElementSibling, ${isTemporary})">추가</button>
                    </div>
                `;
            }

            // 댓글 수 업데이트
            const commentToggle = memoItem.querySelector('.comment-toggle');
            if (commentToggle) {
                commentToggle.textContent = `댓글 ${memo.comments.length}개`;
            }
        }

        // 변경사항 저장
        if (isTemporary) {
            saveTemporaryLists();
        } else {
            saveLists();
        }
    }
}

// 클립보드 관련 함수들
function loadClipboardItems() {
    try {
        const saved = localStorage.getItem('clipboardItems');
        if (saved) {
            clipboardItems = JSON.parse(saved);
        }
        if (!Array.isArray(clipboardItems) || clipboardItems.length === 0) {
            clipboardItems = Array(MAX_CLIPBOARD_ITEMS).fill('');
        }
        renderClipboardItems();
    } catch (error) {
        console.error('클립보드 로드 중 오류:', error);
        clipboardItems = Array(MAX_CLIPBOARD_ITEMS).fill('');
        renderClipboardItems();
    }
}

// 클립보드 아이템 렌더링
function renderClipboardItems() {
    const container = document.querySelector('.clipboard-items');
    if (!container) return;
    
    container.innerHTML = clipboardItems.map((item, index) => `
        <div class="clipboard-item">
            <div class="clipboard-item-header">
                <span class="shortcut">Alt + ${index + 1}</span>
            </div>
            <textarea class="clipboard-text" data-index="${index}" 
                placeholder="클립보드 ${index + 1}번">${item}</textarea>
        </div>
    `).join('');

    // 새 아이템 추가 버튼 (최대 9개까지만)
    if (clipboardItems.length < MAX_CLIPBOARD_ITEMS) {
        const addButton = document.createElement('button');
        addButton.className = 'add-clipboard-item';
        addButton.textContent = '+ 새 클립보드 추가';
        addButton.onclick = addNewClipboardItem;
        container.appendChild(addButton);
    }

    // 이벤트 리스너 추가
    attachClipboardEventListeners();
}

// 클립보드 저장
function saveClipboardItems() {
    try {
        localStorage.setItem('clipboardItems', JSON.stringify(clipboardItems));
    } catch (error) {
        console.error('클립보드 저장 중 오류:', error);
    }
}

// 새 클립보드 아이템 추가
function addNewClipboardItem() {
    if (clipboardItems.length < MAX_CLIPBOARD_ITEMS) {
        clipboardItems.push('');
        saveClipboardItems();
        renderClipboardItems();
        
        // 새로 추가된 항목으로 스크롤
        const container = document.querySelector('.clipboard-items');
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    }
}

// 클립보드 이벤트 리스너 추가
function attachClipboardEventListeners() {
    // 텍스트 영역 변경 이벤트만 유지
    document.querySelectorAll('.clipboard-text').forEach(textarea => {
        textarea.oninput = function() {
            const index = parseInt(this.dataset.index);
            clipboardItems[index] = this.value;
            saveClipboardItems();
        };
    });
}

// 클립보드 단축키 처리 함수
function handleClipboardShortcut(event, inputElement) {
    if (event.altKey && event.key >= '1' && event.key <= '9') {
        event.preventDefault(); // 기본 동작 방지
        const index = parseInt(event.key) - 1;
        if (index < clipboardItems.length && clipboardItems[index]) {
            const start = inputElement.selectionStart;
            const end = inputElement.selectionEnd;
            const text = inputElement.value;
            inputElement.value = text.substring(0, start) + clipboardItems[index] + text.substring(end);
            // 커서 위치 조정
            const newPosition = start + clipboardItems[index].length;
            inputElement.setSelectionRange(newPosition, newPosition);
            inputElement.focus();
        }
    }
}

// 클립보드 단축키 이벤트 리스너 추가
function addClipboardShortcutListener(element) {
    if (element) {
        element.addEventListener('keydown', function(event) {
            handleClipboardShortcut(event, this);
        });
    }
}

// status 관련 스타일 제거
const style = document.createElement('style');
style.textContent = `
    .memo-item {
        background-color: #fff;
        border: 1px solid #ddd;
        border-radius: 4px;
        margin-bottom: 10px;
        padding: 10px;
        position: relative;
    }

    .memo-text {
        margin-bottom: 10px;
        word-break: break-all;
    }

    .memo-counter {
        display: flex;
        align-items: center;
        gap: 5px;
        margin-bottom: 10px;
    }

    .counter-text {
        margin-right: 10px;
        font-size: 0.9em;
        color: #666;
    }

    .counter-btn {
        padding: 2px 5px;
        font-size: 0.8em;
        border: 1px solid #ddd;
        border-radius: 3px;
        background-color: #f8f9fa;
        cursor: pointer;
    }

    .counter-btn:hover {
        background-color: #e9ecef;
    }

    .memo-buttons {
        display: flex;
        gap: 5px;
    }

    .edit-btn, .delete-btn {
        padding: 3px 8px;
        font-size: 0.9em;
        border: 1px solid #ddd;
        border-radius: 3px;
        background-color: #fff;
        cursor: pointer;
    }

    .edit-btn:hover, .delete-btn:hover {
        background-color: #f8f9fa;
    }

    .delete-btn {
        color: #dc3545;
    }
`;
document.head.appendChild(style);

// 백업 파일 로드 및 처리 함수
async function loadBackupFile(file) {
    try {
        const fileContent = await file.text();
        const backupData = JSON.parse(fileContent);
        
        console.log('백업 파일 로드 시작...');
        
        if (!Array.isArray(backupData)) {
            throw new Error('올바르지 않은 백업 파일 형식입니다.');
        }

        // Firebase 초기화 확인
        const db = window.db;
        if (!db) {
            throw new Error('Firebase가 초기화되지 않았습니다.');
        }

        // 백업 데이터의 각 목록을 처리
        backupData.forEach(backupList => {
            // 기존 목록에서 동일한 제목의 목록 찾기
            const existingList = lists.find(list => isSameList(list.title, backupList.title));
            
            if (existingList) {
                // 기존 목록이 있는 경우, 메모 병합
                const updatedMemos = [...existingList.memos]; // 기존 메모 복사
                
                backupList.memos.forEach(backupMemo => {
                    // 동일한 텍스트의 메모가 있는지 확인
                    const existingMemoIndex = updatedMemos.findIndex(memo => 
                        memo.text === backupMemo.text
                    );
                    
                    if (existingMemoIndex === -1) {
                        // 동일한 메모가 없는 경우 새로 추가
                        let wins = 0;
                        let losses = 0;

                        // status 값을 확인하여 wins/losses 설정
                        if (backupMemo.status === 'success' || backupMemo.text.startsWith('✅')) {
                            wins = 1;
                        } else if (backupMemo.status === 'fail' || backupMemo.text.startsWith('❌')) {
                            losses = 1;
                        }
                        
                        // 메모 텍스트에서 아이콘 제거
                        let cleanText = backupMemo.text;
                        if (cleanText.startsWith('✅ ')) {
                            cleanText = cleanText.substring(2);
                        } else if (cleanText.startsWith('❌ ')) {
                            cleanText = cleanText.substring(2);
                        }

                        updatedMemos.push({
                            id: Date.now().toString() + Math.random().toString(16).slice(2),
                            text: cleanText,
                            wins: wins,
                            losses: losses
                        });
            } else {
                        // 기존 메모가 있고 승패가 0인 경우에만 업데이트
                        const existingMemo = updatedMemos[existingMemoIndex];
                        if (existingMemo.wins === 0 && existingMemo.losses === 0) {
                            if (backupMemo.status === 'success' || backupMemo.text.startsWith('✅')) {
                                existingMemo.wins = 1;
                            } else if (backupMemo.status === 'fail' || backupMemo.text.startsWith('❌')) {
                                existingMemo.losses = 1;
                            }
                        }
                    }
                });
                
                // 업데이트된 메모 배열로 교체
                existingList.memos = updatedMemos;
                
    } else {
                // 기존 목록이 없는 경우 새로운 목록으로 추가
                const newList = {
                    id: Date.now().toString() + Math.random().toString(16).slice(2),
                    title: backupList.title,
                    createdAt: backupList.createdAt || formatCreatedAt(new Date().toISOString()),
                    memos: backupList.memos.map(memo => {
                        let wins = 0;
                        let losses = 0;
                        let cleanText = memo.text;

                        // status 값이나 아이콘을 기반으로 wins/losses 설정
                        if (memo.status === 'success' || memo.text.startsWith('✅')) {
                            wins = 1;
                            if (cleanText.startsWith('✅ ')) {
                                cleanText = cleanText.substring(2);
                            }
                        } else if (memo.status === 'fail' || memo.text.startsWith('❌')) {
                            losses = 1;
                            if (cleanText.startsWith('❌ ')) {
                                cleanText = cleanText.substring(2);
                            }
                        }

                        return {
                            id: Date.now().toString() + Math.random().toString(16).slice(2),
                            text: cleanText,
                            wins: wins,
                            losses: losses
                        };
                    })
                };
                lists.push(newList);
            }
        });

        // Firebase에 데이터 저장
        const batch = db.batch();

        // 메인 목록 저장
        const mainDocRef = db.collection('lists').doc('main');
        batch.set(mainDocRef, {
            lists: lists,
            updated_at: new Date().toISOString()
        });

        // 임시 목록 저장
        const tempDocRef = db.collection('lists').doc('temporary');
        batch.set(tempDocRef, {
            lists: temporaryLists,
            updated_at: new Date().toISOString()
        });

        // 배치 작업 실행
        await batch.commit();
        console.log('Firebase에 데이터 저장 완료');

        // 로컬 스토리지에도 저장
        localStorage.setItem('lists', JSON.stringify(lists));
        localStorage.setItem('temporaryLists', JSON.stringify(temporaryLists));
        
        // UI 업데이트
        renderLists(currentPage);
        updateStats();
        
        console.log('백업 파일 로드 완료');
        
        } catch (error) {
        console.error('백업 파일 처리 중 오류:', error);
        
        // 오류 발생 시에도 로컬 스토리지에는 저장
        try {
            localStorage.setItem('lists', JSON.stringify(lists));
            localStorage.setItem('temporaryLists', JSON.stringify(temporaryLists));
        } catch (storageError) {
            console.error('로컬 스토리지 저장 중 오류:', storageError);
        }
    }
}

// 승패 카운터 업데이트 함수
function updateCounter(listId, memoId, type, value, isTemporary = false) {
    const targetLists = isTemporary ? temporaryLists : lists;
    const list = targetLists.find(l => l.id.toString() === listId.toString());
    if (!list) return;

        const memo = list.memos.find(m => m.id.toString() === memoId.toString());
    if (!memo) return;

    // 값이 0 미만이 되지 않도록 체크
    if (type === 'wins') {
        memo.wins = Math.max(0, (memo.wins || 0) + value);
    } else if (type === 'losses') {
        memo.losses = Math.max(0, (memo.losses || 0) + value);
    }

    // UI 업데이트
    const memoItem = document.querySelector(`.memo-item[data-memo-id="${memoId}"]`);
    if (memoItem) {
        const counterText = memoItem.querySelector('.counter-text');
        if (counterText) {
            const winRate = (memo.wins + memo.losses) > 0 ? 
                ((memo.wins / (memo.wins + memo.losses)) * 100).toFixed(1) : 0;
            counterText.textContent = `${memo.wins}승 ${memo.losses}패 (${winRate}%)`;
        }
    }

    // 변경사항 저장
    if (isTemporary) {
        saveTemporaryLists();
                    } else {
        saveLists();
    }
}

// JSON 추출 함수
async function exportToJson() {
    try {
        const doc = await db.collection('lists').doc('main').get();
        if (!doc.exists) {
            alert('추출할 데이터가 없습니다.');
            return;
        }

        const data = doc.data();
        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const filename = `memo_backup_${dateStr}.json`;
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
    } catch (error) {
        console.error('데이터 추출 중 오류 발생:', error);
        alert('데이터 추출 중 오류가 발생했습니다.');
    }
}