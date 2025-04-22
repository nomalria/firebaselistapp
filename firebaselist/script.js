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

// 시간 형식 변환 함수 추가
function formatCreatedAt(dateStr) {
    if (!dateStr) return '2025-04-22 09:30';
    // 기존 형식(2025-04-22-09-30)을 새 형식(2025-04-22 09:30)으로 변환
    return dateStr.replace(/-(\d{2})-(\d{2})$/, ' $1:$2');
}

// Firebase에 데이터 저장 (변경된 데이터만 전송)
async function saveToFirebase() {
    try {
        const db = window.db;
        const { doc, setDoc, getDoc } = window.firestore;
        
        if (!db) {
            console.error('Firebase가 초기화되지 않았습니다.');
            return;
        }

        // 현재 Firebase에 저장된 데이터 가져오기
        const mainListsDoc = await getDoc(doc(db, 'lists', 'main'));
        const tempListsDoc = await getDoc(doc(db, 'lists', 'temporary'));
        
        const currentMainLists = mainListsDoc.exists() ? mainListsDoc.data().lists : [];
        const currentTempLists = tempListsDoc.exists() ? tempListsDoc.data().lists : [];

        // 변경된 메인 목록 찾기
        const changedMainLists = lists.filter(list => {
            const currentList = currentMainLists.find(l => l.id === list.id);
            if (!currentList) return true; // 새로 추가된 목록

            // 목록 제목이 변경되었거나 메모가 변경된 경우
            if (currentList.title !== list.title) return true;
            
            // 메모 비교
            if (currentList.memos.length !== list.memos.length) return true;
            return list.memos.some(memo => {
                const currentMemo = currentList.memos.find(m => m.id === memo.id);
                if (!currentMemo) return true; // 새로 추가된 메모
                return currentMemo.text !== memo.text || currentMemo.status !== memo.status;
            });
        });

        // 변경된 임시 목록 찾기
        const changedTempLists = temporaryLists.filter(list => {
            const currentList = currentTempLists.find(l => l.id === list.id);
            if (!currentList) return true; // 새로 추가된 목록

            // 목록 제목이 변경되었거나 메모가 변경된 경우
            if (currentList.title !== list.title) return true;
            
            // 메모 비교
            if (currentList.memos.length !== list.memos.length) return true;
            return list.memos.some(memo => {
                const currentMemo = currentList.memos.find(m => m.id === memo.id);
                if (!currentMemo) return true; // 새로 추가된 메모
                return currentMemo.text !== memo.text || currentMemo.status !== memo.status;
            });
        });

        // 삭제된 목록 찾기
        const deletedMainListIds = currentMainLists
            .filter(list => !lists.some(l => l.id === list.id))
            .map(list => list.id);

        const deletedTempListIds = currentTempLists
            .filter(list => !temporaryLists.some(l => l.id === list.id))
            .map(list => list.id);

        // 변경사항이 있는 경우에만 Firebase 업데이트
        if (changedMainLists.length > 0 || deletedMainListIds.length > 0) {
            await setDoc(doc(db, 'lists', 'main'), {
                lists: lists, // 전체 목록 업데이트 (일관성 유지를 위해)
                updated_at: new Date().toISOString(),
                changed_lists: changedMainLists.map(list => list.id),
                deleted_lists: deletedMainListIds
            });
        }

        if (changedTempLists.length > 0 || deletedTempListIds.length > 0) {
            await setDoc(doc(db, 'lists', 'temporary'), {
                lists: temporaryLists, // 전체 목록 업데이트 (일관성 유지를 위해)
                updated_at: new Date().toISOString(),
                changed_lists: changedTempLists.map(list => list.id),
                deleted_lists: deletedTempListIds
            });
        }

    } catch (error) {
        console.error('Firebase 저장 오류:', error);
        // 오류 발생 시 로컬 스토리지에 저장
        localStorage.setItem('lists', JSON.stringify(lists));
        localStorage.setItem('temporaryLists', JSON.stringify(temporaryLists));
    }
}

// Firebase에서 데이터 로드
async function loadFromFirebase() {
    try {
        const db = window.db;
        const { doc, getDoc } = window.firestore;
        
        if (!db) {
            console.error('Firebase가 초기화되지 않았습니다.');
            return false;
        }

        // 메인 목록 로드
        const mainListsDoc = await getDoc(doc(db, 'lists', 'main'));
        if (mainListsDoc.exists()) {
            lists = mainListsDoc.data().lists;
        }

        // 임시 목록 로드
        const tempListsDoc = await getDoc(doc(db, 'lists', 'temporary'));
        if (tempListsDoc.exists()) {
            temporaryLists = tempListsDoc.data().lists;
        }

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
                    memos: (list.memos || []).map(memo => {
                        if (typeof memo === 'string') {
                            let text = memo;
                            let status = null;
                            if (text.includes('공격성공')) {
                                status = 'success';
                                text = text.replace(/\s*\/?\/?\s*공격성공.*/, '').trim();
                            } else if (text.includes('공격실패')) {
                                status = 'fail';
                                text = text.replace(/\s*\/?\/?\s*공격실패.*/, '').trim();
                            }
                            return { id: Date.now().toString() + Math.random().toString(16).slice(2), text, status };
                        } else if (typeof memo === 'object' && memo !== null) {
                            return { ...memo, status: memo.status !== undefined ? memo.status : null };
                        } else {
                            return null;
                        }
                    }).filter(memo => memo !== null)
                }));
                saveLists(); // 변환된 구조 즉시 저장
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
                    memos: (list.memos || []).map(memo => {
                        if (typeof memo === 'string') {
                            let text = memo;
                            let status = null;
                            if (text.includes('공격성공')) {
                                status = 'success';
                                text = text.replace(/\s*\/?\/?\s*공격성공.*/, '').trim();
                            } else if (text.includes('공격실패')) {
                                status = 'fail';
                                text = text.replace(/\s*\/?\/?\s*공격실패.*/, '').trim();
                            }
                            return { id: Date.now().toString() + Math.random().toString(16).slice(2), text, status };
                        } else if (typeof memo === 'object' && memo !== null) {
                            return { ...memo, status: memo.status !== undefined ? memo.status : null };
                        } else {
                            return null;
                        }
                    }).filter(memo => memo !== null)
                }));
                saveTemporaryLists(); // 변환된 구조 즉시 저장
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
    saveToFirebase();
}

// 임시 방덱 목록 저장 함수 추가
function saveTemporaryLists() {
    localStorage.setItem('temporaryLists', JSON.stringify(temporaryLists));
    // Firebase에도 저장
    saveToFirebase();
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
    const createdAt = now.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    }).replace(/\. /g, '-').replace(/: /, ':').replace(/.$/, '');

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
                    <button class="edit-btn" onclick="startEditList('${list.id}', true)">편집</button>
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
    if (confirm('해당 목록을 삭제하시겠습니까?')) {
        try {
            const db = window.db;
            const { doc, setDoc } = window.firestore;

            // Firebase에서 해당 목록 삭제
            if (db) {
                const collectionName = isTemporary ? 'temporary' : 'main';
                const docRef = doc(db, 'lists', collectionName);
                
                // 해당 목록을 제외한 나머지 목록만 Firebase에 저장
                if (isTemporary) {
                    temporaryLists = temporaryLists.filter(list => list.id.toString() !== listId.toString());
                    await setDoc(docRef, {
                        lists: temporaryLists,
                        updated_at: new Date().toISOString()
                    });
                } else {
                    lists = lists.filter(list => list.id.toString() !== listId.toString());
                    await setDoc(docRef, {
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
    let originalMemoText = memoInput.value.trim();
    let processedMemoText = originalMemoText;
    let initialStatus = null;
    
    if (originalMemoText) {
        const successKeywords = ["공성", "공격성공"];
        const failKeywords = ["공실", "공격실패"];
        let statusSet = false;

        for (const keyword of successKeywords) {
            const endRegex = new RegExp(`(\s*(\/\/)?\s*${keyword})(\s.*)?$`, 'i'); 
            const matchResult = originalMemoText.match(endRegex);
            
            if (matchResult) { 
                initialStatus = 'success';
                processedMemoText = originalMemoText.substring(0, matchResult.index).trim(); 
                statusSet = true;
                break; 
            }
        }

        if (!statusSet) {
            for (const keyword of failKeywords) {
                const endRegex = new RegExp(`(\s*(\/\/)?\s*${keyword})(\s.*)?$`, 'i');
                const matchResult = originalMemoText.match(endRegex);
                
                if (matchResult) {
                    initialStatus = 'fail';
                    processedMemoText = originalMemoText.substring(0, matchResult.index).trim();
                    statusSet = true; 
                    break; 
                }
            }
        }
        
        if (!processedMemoText && initialStatus !== null) {
             return; 
        } else if (!processedMemoText && initialStatus === null) {
            return; 
        }

        const targetLists = isTemporary ? temporaryLists : lists;
        const list = targetLists.find(l => l.id.toString() === listId.toString());
        if (list) {
             if (list.memos.length >= 50) {
                alert('한 방덱에는 최대 50개의 메모만 추가할 수 있습니다.');
                return;
            }
            const newMemo = {
                id: Date.now().toString() + Math.random().toString(16).slice(2),
                text: processedMemoText, 
                status: initialStatus 
            };
            list.memos.push(newMemo);
            
            if (!isTemporary) {
                saveLists();
            } else {
                saveTemporaryLists();
            }

            const memoListContainer = document.querySelector(`#memoSection-${listId} .memo-list`);
            if (memoListContainer) {
                const memoHTML = createMemoItemHTML(newMemo, listId, isTemporary);
                memoListContainer.insertAdjacentHTML('beforeend', memoHTML);
            } else {
                 isTemporary ? renderTemporaryLists() : renderLists();
            }

            const memoCountElement = document.querySelector(`.list-item[data-list-id="${listId}"] .memo-count`);
            if (memoCountElement) {
                memoCountElement.textContent = `${list.memos.length}/50`;
            }
            
            memoInput.value = '';
        }
    }
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
        const dateA = a.createdAt ? new Date(a.createdAt.replace(/-/g, '/').replace(' ', 'T')) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt.replace(/-/g, '/').replace(' ', 'T')) : new Date(0);
        return sortType === 'newest' ? dateB - dateA : dateA - dateB;
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
                    <button class="edit-btn" onclick="startEditList('${list.id}')">편집</button>
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
                    ${(list.memos || []).map(memo => `
                        <div class="memo-container">
                            <div class="memo-item" data-memo-id="${memo.id}">
                                <span class="memo-status-icon ${memo.status || 'unknown'}">
                                    ${memo.status === 'success' ? '✅' : memo.status === 'fail' ? '❌' : ''}
                                </span>
                                <span class="memo-text">${memo.text}</span>
                                <div class="memo-buttons">
                                    <button class="status-btn success-btn ${memo.status === 'success' ? 'active' : ''}" onclick="setMemoStatus('${list.id}', '${memo.id}', 'success', false)" title="성공">✅</button>
                                    <button class="status-btn fail-btn ${memo.status === 'fail' ? 'active' : ''}" onclick="setMemoStatus('${list.id}', '${memo.id}', 'fail', false)" title="실패">❌</button>
                                    <button class="edit-btn" onclick="startEditMemo('${list.id}', '${memo.id}', false)">편집</button>
                                    <button class="delete-btn" onclick="deleteMemo('${list.id}', '${memo.id}', false)">삭제</button>
                                </div>
                            </div>
                            <div class="edit-section" id="editMemoSection-${memo.id}">
                                <div class="input-group">
                                    <input type="text" id="editMemoInput-${memo.id}" placeholder="메모 내용 수정..." onkeypress="if(event.key === 'Enter') saveMemoEdit('${list.id}', '${memo.id}', false)">
                                    <div class="edit-buttons">
                                        <button class="save-btn" onclick="saveMemoEdit('${list.id}', '${memo.id}', false)">저장</button>
                                        <button class="cancel-btn" onclick="cancelMemoEdit('${list.id}', '${memo.id}', false)">취소</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
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
    const targetLists = isTemporary ? temporaryLists : lists;
    const list = targetLists.find(l => l.id.toString() === listId.toString());
    if (!list) {
        return;
    }

    const memo = list.memos.find(m => m.id.toString() === memoId.toString());
    if (!memo) {
        return;
    }

    // 기존에 편집 중인 메모가 있다면 편집 취소
    const editingMemos = document.querySelectorAll('.memo-item.editing');
    editingMemos.forEach(editingMemo => {
        const editingMemoId = editingMemo.dataset.memoId;
        cancelMemoEdit(listId, editingMemoId, isTemporary);
    });

    const memoItem = document.querySelector(`.memo-item[data-memo-id="${memoId}"]`);
    if (memoItem) {
        memoItem.classList.add('editing');
        
        // 편집창 찾기
        const editSection = document.getElementById(`editMemoSection-${memoId}`);

        if (editSection) {
            const input = editSection.querySelector('input');
            if (input) {
                input.value = memo.text;
                editSection.style.display = 'block';
                input.focus();
                input.select();
            }
            editingMemoId = memoId;
        }
    }
}

// 메모 아이템 HTML 생성 함수
function createMemoItemHTML(memo, listId, isTemporary) {
    return `
        <div class="memo-item" data-memo-id="${memo.id}">
            <span class="memo-status-icon ${memo.status || 'unknown'}">
                ${memo.status === 'success' ? '✅' : memo.status === 'fail' ? '❌' : ''}
            </span>
            <span class="memo-text">${memo.text}</span>
            <div class="memo-buttons">
                <button class="status-btn success-btn ${memo.status === 'success' ? 'active' : ''}" onclick="setMemoStatus('${listId}', '${memo.id}', 'success', ${isTemporary})" title="성공">✅</button>
                <button class="status-btn fail-btn ${memo.status === 'fail' ? 'active' : ''}" onclick="setMemoStatus('${listId}', '${memo.id}', 'fail', ${isTemporary})" title="실패">❌</button>
                <button class="edit-btn" onclick="startEditMemo('${listId}', '${memo.id}', ${isTemporary})">편집</button>
                <button class="delete-btn" onclick="deleteMemo('${listId}', '${memo.id}', ${isTemporary})">삭제</button>
            </div>
        </div>
        <div class="edit-section" id="editMemoSection-${memo.id}">
            <div class="input-group">
                <input type="text" id="editMemoInput-${memo.id}" placeholder="메모 내용 수정..." onkeypress="if(event.key === 'Enter') saveMemoEdit('${listId}', '${memo.id}', ${isTemporary})">
                <div class="edit-buttons">
                    <button class="save-btn" onclick="saveMemoEdit('${listId}', '${memo.id}', ${isTemporary})">저장</button>
                    <button class="cancel-btn" onclick="cancelMemoEdit('${listId}', '${memo.id}', ${isTemporary})">취소</button>
                </div>
            </div>
        </div>
    `;
}

// 메모 편집 저장
function saveMemoEdit(listId, memoId, isTemporary = false) {
    const input = document.getElementById(`editMemoInput-${memoId}`);
    if (!input) {
        return;
    }

    const newText = input.value.trim();
    if (!newText) {
        alert('메모 내용을 입력해주세요.');
        return;
    }

    const targetLists = isTemporary ? temporaryLists : lists;
    const list = targetLists.find(l => l.id.toString() === listId.toString());
    if (list) {
        const memo = list.memos.find(m => m.id.toString() === memoId.toString());
        if (memo) {
            memo.text = newText;
            if (!isTemporary) {
                saveLists();
            } else {
                saveTemporaryLists();
            }

            // UI 업데이트
            const memoItem = document.querySelector(`.memo-item[data-memo-id="${memoId}"]`);
            if (memoItem) {
                const memoText = memoItem.querySelector('.memo-text');
                if (memoText) {
                    memoText.textContent = newText;
                }
                memoItem.classList.remove('editing');
            }

            // 편집창 닫기
            const editSection = memoItem.nextElementSibling;
            if (editSection && editSection.classList.contains('edit-section')) {
                editSection.style.display = 'none';
            }
        }
    }
    editingMemoId = null;
}

// 메모 편집 취소
function cancelMemoEdit(listId, memoId, isTemporary = false) {
    const memoItem = document.querySelector(`.memo-item[data-memo-id="${memoId}"]`);
    if (memoItem) {
        memoItem.classList.remove('editing');
        
        // 편집창 닫기
        const editSection = memoItem.nextElementSibling;
        if (editSection && editSection.classList.contains('edit-section')) {
            editSection.style.display = 'none';
        }
    }
    editingMemoId = null;
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
    if (list) {
        const memo = list.memos.find(m => m.id.toString() === memoId.toString());
        if (memo) {
            // 1. 상태 업데이트 (토글 기능 포함)
            const previousStatus = memo.status;
            memo.status = previousStatus === newStatus ? null : newStatus;

            // 2. 데이터 저장 (기존과 동일)
            if (!isTemporary) {
                saveLists();
            } else {
                saveTemporaryLists();
            }

            // 3. UI 즉시 업데이트 (DOM 직접 조작)
            const memoElement = document.querySelector(`.list-item[data-list-id="${listId}"] .memo-item[data-memo-id="${memoId}"]`);
            if (memoElement) {
                // 아이콘 업데이트
                const iconElement = memoElement.querySelector('.memo-status-icon');
                if (iconElement) {
                    iconElement.textContent = memo.status === 'success' ? '✅' : memo.status === 'fail' ? '❌' : '';
                    // 클래스 업데이트 (unknown 클래스는 상태 없을 때)
                    iconElement.className = `memo-status-icon ${memo.status || 'unknown'}`;
                }

                // 성공 버튼 활성/비활성 업데이트
                const successBtn = memoElement.querySelector('.success-btn');
                if (successBtn) {
                    if (memo.status === 'success') {
                        successBtn.classList.add('active');
                    } else {
                        successBtn.classList.remove('active');
                    }
                }

                // 실패 버튼 활성/비활성 업데이트
                const failBtn = memoElement.querySelector('.fail-btn');
                if (failBtn) {
                    if (memo.status === 'fail') {
                        failBtn.classList.add('active');
                    } else {
                        failBtn.classList.remove('active');
                    }
                }
            } else {
                 // 만약 DOM 요소를 못찾으면 전체 렌더링 (안전 장치)
                 console.warn("Memo element not found for direct update, falling back to full render.");
                 isTemporary ? renderTemporaryLists() : renderLists();
            }

            console.log(`Memo ${memoId} status set to ${memo.status}`);
        } else {
            console.error('메모를 찾을 수 없습니다:', memoId);
        }
    } else {
        console.error('방덱을 찾을 수 없습니다:', listId);
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

// 페이지 로드 시 이벤트 리스너 추가
document.addEventListener('DOMContentLoaded', async function() {
    await loadLists();
    addCreatedAtToExistingLists();
    // 초기 데이터 로드
    loadLists();
    
    // 클립보드 토글 버튼 이벤트 리스너 추가
    const toggleClipboardBtn = document.querySelector('.toggle-clipboard-btn');
    const clipboardContent = document.querySelector('.clipboard-content');
    
    if (toggleClipboardBtn && clipboardContent) {
        toggleClipboardBtn.addEventListener('click', function() {
            clipboardContent.classList.toggle('collapsed');
            this.textContent = clipboardContent.classList.contains('collapsed') ? '펼치기' : '접기';
        });
        
        // 초기 상태 설정
        toggleClipboardBtn.textContent = clipboardContent.classList.contains('collapsed') ? '펼치기' : '접기';
    }
    
    // 검색 입력 필드에 이벤트 리스너 추가
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const query = this.value.trim();
            if (query) {
                searchLists(query);
            } else {
                document.getElementById('searchResults').innerHTML = '';
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
                case ' ':
                    e.preventDefault();
                    if (selectedIndex >= 0 && selectedIndex < items.length) {
                        const word = items[selectedIndex].dataset.word;
                        const currentWords = this.value.trim().split(' ');
                        currentWords[currentWords.length - 1] = word;
                        this.value = currentWords.join(' ');
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
    
    // 추가 버튼 이벤트 리스너
    const addListBtn = document.getElementById('addListBtn');
    if (addListBtn) {
        addListBtn.addEventListener('click', addNewList);
    }
    
    // 정렬 버튼 이벤트 리스너
    const sortBtn = document.getElementById('sortBtn');
    if (sortBtn) {
        sortBtn.addEventListener('click', sortAll);
    }

    // 통계 항목 클릭 이벤트 리스너 추가 (필터 변경 시 1페이지로)
    document.querySelectorAll('.stats-section .stat-item').forEach(item => {
        item.addEventListener('click', function() {
            currentFilterType = this.dataset.filterType;
            document.querySelectorAll('.stats-section .stat-item').forEach(el => el.classList.remove('selected'));
            this.classList.add('selected');
            renderLists(1); // 필터 변경 시 1페이지로 이동
        });
    });

    // 초기에 '전체 보기'를 선택된 상태로 설정
    document.getElementById('stat-item-all')?.classList.add('selected');

    // 통계 섹션을 드롭다운으로 변경
    const statsSection = document.querySelector('.stats-section');
    if (statsSection) {
        statsSection.innerHTML = `
            <div class="dropdown">
                <button class="dropdown-btn">표시 기준: 전체보기</button>
                <div class="dropdown-content"></div>
            </div>
        `;

        // 드롭다운 버튼 클릭 이벤트
        const dropdownBtn = document.querySelector('.dropdown-btn');
        const dropdownContent = document.querySelector('.dropdown-content');
        
        if (dropdownBtn && dropdownContent) {
            dropdownBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                dropdownContent.classList.toggle('show');
            });

            // 드롭다운 외부 클릭 시 닫기
            document.addEventListener('click', function(e) {
                if (!dropdownContent.contains(e.target) && !dropdownBtn.contains(e.target)) {
                    dropdownContent.classList.remove('show');
                }
            });
        }
    }

    // 클립보드 데이터 로드
    loadClipboardItems();

    // 모든 메모 입력창에 클립보드 단축키 이벤트 리스너 추가
    function addClipboardShortcutListener(element) {
        if (element) {
            element.addEventListener('keydown', function(event) {
                handleClipboardShortcut(event, this);
            });
        }
    }

    // 기존 메모 입력창에 이벤트 리스너 추가
    document.querySelectorAll('input[id^="newMemoInput-"]').forEach(input => {
        addClipboardShortcutListener(input);
    });

    // 새로 추가되는 메모 입력창 감지 및 이벤트 리스너 추가
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(function(node) {
                if (node.nodeType === 1) { // Element 노드인 경우
                    const inputs = node.querySelectorAll('input[id^="newMemoInput-"]');
                    inputs.forEach(input => addClipboardShortcutListener(input));
                }
            });
        });
    });

    // 전체 문서 변경 감지 설정
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
});

// 클립보드 로드
function loadClipboardItems() {
    try {
        const saved = localStorage.getItem('clipboardItems');
        if (saved) {
            clipboardItems = JSON.parse(saved);
            if (!Array.isArray(clipboardItems) || clipboardItems.length !== MAX_CLIPBOARD_ITEMS) {
                clipboardItems = Array(MAX_CLIPBOARD_ITEMS).fill('');
            }
        }
        renderClipboardItems();
    } catch (error) {
        console.error('클립보드 로드 중 오류:', error);
        clipboardItems = Array(MAX_CLIPBOARD_ITEMS).fill('');
    }
}

// 클립보드 저장
function saveClipboardItems() {
    try {
        localStorage.setItem('clipboardItems', JSON.stringify(clipboardItems));
    } catch (error) {
        console.error('클립보드 저장 중 오류:', error);
    }
}

// 클립보드 아이템 렌더링
function renderClipboardItems() {
    const container = document.querySelector('.clipboard-items');
    if (!container) return;
    
    container.innerHTML = '';
    
    // 기존 클립보드 아이템 렌더링
    clipboardItems.forEach((item, index) => {
        const itemElement = document.createElement('div');
        itemElement.className = 'clipboard-item';
        itemElement.innerHTML = `
            <div class="clipboard-item-header">
                <span class="shortcut">Alt + ${index + 1}</span>
            </div>
            <textarea class="clipboard-text" data-index="${index}" 
                placeholder="클립보드 ${index + 1}번">${item}</textarea>
        `;
        container.appendChild(itemElement);
    });

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