// Firebase 초기화
const firebaseConfig = {
    apiKey: "AIzaSyCzu8BvgrCepm3yqElubr4AKlIVwu_21_k",
    authDomain: "listapps-23091.firebaseapp.com",
    projectId: "listapps-23091",
    storageBucket: "listapps-23091.firebasestorage.app",
    messagingSenderId: "158638855824",
    appId: "1:158638855824:web:5ec8e743771128ee65ea15",
    measurementId: "G-NGSN7YLFXT"
};

// Firebase 앱 초기화 (중복 초기화 방지)
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    console.log('Firebase가 성공적으로 초기화되었습니다.');
} else {
    console.log('Firebase가 이미 초기화되어 있습니다.');
}

const db = firebase.firestore();
const auth = firebase.auth();

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

// 클립보드 관련 전역 변수 추가 (메모용, 목록용)
let clipboardItemsMemo = [];
let clipboardItemsList = [];
const MAX_CLIPBOARD_ITEMS = 9;

// 추천 단어 관련 변수
let suggestions = [];
let currentSuggestionIndex = -1;

// 추천 단어 관련 변수 (메모 입력용)
let memoSuggestionWords = [];
let memoSuggestionIndex = -1;
let memoSuggestionList = [];
let memoSuggestionActiveInput = null;

// 시간 형식 변환 함수 수정
function formatCreatedAt(dateStr) {
    if (!dateStr) return '2025-04-22 09:30';
    
    // 이미 올바른 형식이면 그대로 반환
    if (dateStr.includes(' ')) return dateStr;
    
    // 하이픈 형식을 공백과 콜론 형식으로 변환
    return dateStr.replace(/-(\d{2})-(\d{2})$/, ' $1:$2');
}

// Firebase에 데이터 저장 (IndexedDB 기반)
async function saveToFirebase() {
    try {
        const db = window.db;
        if (!db) {
            console.error('Firebase가 초기화되지 않았습니다.');
            return false;
        }

        // IndexedDB에서 최신 데이터 불러오기
        const indexedLists = await loadFromIndexedDB('lists');
        const indexedTempLists = await loadFromIndexedDB('temporaryLists');

        // 업로드할 목록 개수 콘솔 출력
        console.log(`[Firebase 업로드] 업로드할 목록 개수: ${indexedLists.length}`);

        // 현재 시간을 타임스탬프로 저장
        const currentTime = new Date();
        const timestamp = {
            lastUpdated: currentTime.toISOString()
        };

        // 데이터를 1000개 단위로 분할
        const BATCH_SIZE = 1000;
        const batches = [];
        for (let i = 0; i < indexedLists.length; i += BATCH_SIZE) {
            batches.push(indexedLists.slice(i, i + BATCH_SIZE));
        }

        // 메타데이터 저장
        await db.collection('lists').doc('metadata').set({
            totalItems: indexedLists.length,
            totalBatches: batches.length,
            ...timestamp
        });

        // 각 배치를 개별 문서로 저장
        for (let i = 0; i < batches.length; i++) {
            await db.collection('lists').doc(`batch_${i + 1}`).set({
                items: batches[i],
                batchNumber: i + 1,
                ...timestamp
            });
        }

        // 임시 목록도 별도 문서로 저장
        await db.collection('lists').doc('temporary').set({
            lists: indexedTempLists,
            ...timestamp
        });

        // 최근 업로드 시간 표시 업데이트
        updateLastUploadTimeDisplay(currentTime);

        // 업로드 완료 콘솔 출력
        console.log(`[Firebase 업로드] 업로드 완료! 총 ${indexedLists.length}개의 목록이 업로드되었습니다.`);
        return true;
    } catch (error) {
        console.error('Firebase 저장 오류:', error);
        return false;
    }
}

// 로컬 스토리지에 데이터 저장
function saveToLocalStorage() {
    localStorage.setItem('lists', JSON.stringify(lists));
    localStorage.setItem('temporaryLists', JSON.stringify(temporaryLists));
}

// 최근 업로드 시간 표시 업데이트 함수
function updateLastUploadTimeDisplay(timestamp) {
    const lastUploadTimeDisplay = document.getElementById('lastUploadTimeDisplay');
    if (lastUploadTimeDisplay) {
        const formattedTime = new Date(timestamp).toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
        lastUploadTimeDisplay.textContent = `마지막 업로드: ${formattedTime}`;
        lastUploadTimeDisplay.style.display = 'block';
    }
}

// Firebase에서 데이터 로드 (모든 batch 문서 합치기)
async function loadFromFirebase() {
    try {
        console.log('loadFromFirebase 진입'); // 진단용 로그
        const db = window.db;
        if (!db) {
            console.error('Firebase가 초기화되지 않았습니다.');
            return false;
        }

        // 메타데이터에서 batch 개수 확인
        const metadataDoc = await db.collection('lists').doc('metadata').get();
        let allLists = [];
        if (metadataDoc.exists) {
        const metadata = metadataDoc.data();
            const totalBatches = metadata.totalBatches || 0;
            console.log('metadata 문서 있음, totalBatches:', totalBatches); // 진단용 로그
            // 모든 batch 문서 순회하여 데이터 합치기
        for (let i = 1; i <= totalBatches; i++) {
            const batchDoc = await db.collection('lists').doc(`batch_${i}`).get();
            if (batchDoc.exists) {
                const batchData = batchDoc.data();
                    if (Array.isArray(batchData.items)) {
                        console.log(`batch_${i}의 목록 개수:`, batchData.items.length); // 진단용 콘솔
                        allLists = allLists.concat(batchData.items);
                    } else {
                        console.log(`batch_${i}의 items가 배열이 아님 또는 없음`, batchData.items);
                    }
                } else {
                    console.log(`batch_${i} 문서가 존재하지 않음`);
                }
            }
        } else {
            console.log('metadata 문서가 존재하지 않음');
        }
        console.log('Firebase에서 불러온 전체 목록 개수:', allLists.length); // 진단용 콘솔

        // 임시 목록 불러오기
        const tempListsDoc = await db.collection('lists').doc('temporary').get();
        let tempLists = [];
        if (tempListsDoc.exists) {
            const data = tempListsDoc.data();
            tempLists = data.lists || [];
        }

        // IndexedDB에 저장
        await saveToIndexedDB('lists', allLists);
        await saveToIndexedDB('temporaryLists', tempLists);

        // 메모리 반영
        lists = allLists;
        temporaryLists = tempLists;

        return true;
    } catch (error) {
        console.error('Firebase 로드 오류:', error);
        return false;
    }
}
window.loadFromFirebase = loadFromFirebase;

// 방덱 목록 불러오기 (메모 구조 변환 로직 추가)
async function loadLists() {
    try {
        console.log('목록 로드 시작...');
        
        // 1. Firebase에서 데이터 로드 시도
        let firebaseSuccess = false;
        try {
            firebaseSuccess = await window.loadFromFirebase();
            if (firebaseSuccess) {
                console.log('Firebase에서 데이터 로드 성공');
                console.log('Firebase 데이터를 IndexedDB에 저장 중...');
            }
        } catch (error) {
            console.error('Firebase 로드 오류:', error);
        }
        
        // 2. IndexedDB에서 데이터 로드
        try {
            const indexedLists = await loadFromIndexedDB('lists');
            const indexedTempLists = await loadFromIndexedDB('temporaryLists');
            
            if (indexedLists) {
                lists = indexedLists;
            // author가 없으면 '섬세포분열'로 할당
            lists = lists.map(list => ({
                ...list,
                author: list.author ? list.author : '섬세포분열'
            }));
                // 여기서 정렬
                lists.sort((a, b) => a.title.localeCompare(b.title, 'ko'));
                lists.forEach(list => {
                    if (Array.isArray(list.memos)) {
                        list.memos.sort((a, b) => a.text.localeCompare(b.text, 'ko'));
                    }
                });
                console.log(`IndexedDB에서 ${lists.length}개의 목록 로드됨`);
            }
            
            if (indexedTempLists) {
                temporaryLists = indexedTempLists;
            // author가 없으면 '섬세포분열'로 할당
            temporaryLists = temporaryLists.map(list => ({
                ...list,
                author: list.author ? list.author : '섬세포분열'
            }));
                // 임시목록도 정렬
                temporaryLists.sort((a, b) => a.title.localeCompare(b.title, 'ko'));
                temporaryLists.forEach(list => {
                    if (Array.isArray(list.memos)) {
                        list.memos.sort((a, b) => a.text.localeCompare(b.text, 'ko'));
                    }
                });
                console.log(`IndexedDB에서 ${temporaryLists.length}개의 임시 목록 로드됨`);
            }
        } catch (error) {
            console.error('IndexedDB 로드 오류:', error);
        }
        
        // 3. 모든 메모의 상태 자동 업데이트
        updateAllMemoStatuses();
        
        // 4. 화면에 표시
            renderTemporaryLists();
            renderLists(currentPage);
            updateStats();
        
        // 5. 클립보드 초기화
        initializeClipboard();
        
        // 6. 검색창 이벤트 리스너 설정
        setupSearchInputEvents();
        
        // IndexedDB에서 데이터 로드 후 정렬
        if (lists && Array.isArray(lists)) {
            lists.sort((a, b) => a.title.localeCompare(b.title, 'ko'));
            lists.forEach(list => {
                if (Array.isArray(list.memos)) {
                    list.memos.sort((a, b) => a.text.localeCompare(b.text, 'ko'));
                }
            });
        }
    } catch (error) {
        console.error('초기화 오류:', error);
        
        // 오류 발생 시 IndexedDB에서 다시 시도
        try {
            const indexedLists = await loadFromIndexedDB('lists');
            const indexedTempLists = await loadFromIndexedDB('temporaryLists');
            
            if (indexedLists) {
                lists = indexedLists;
            lists = lists.map(list => ({
                ...list,
                author: list.author ? list.author : '섬세포분열'
            }));
            }
        
            if (indexedTempLists) {
                temporaryLists = indexedTempLists;
            temporaryLists = temporaryLists.map(list => ({
                ...list,
                author: list.author ? list.author : '섬세포분열'
            }));
        }
        
        renderTemporaryLists();
        renderLists(currentPage);
        updateStats();
        } catch (indexedError) {
            console.error('IndexedDB 복구 오류:', indexedError);
        }
    }
}

// 방덱 목록 저장
async function saveLists() {
    try {
        // IndexedDB에만 저장
        await saveToIndexedDB('lists', lists);
        updateStats();
    } catch (error) {
        console.error('목록 저장 오류:', error);
    }
}

// 임시 방덱 목록 저장 함수
async function saveTemporaryLists() {
    try {
    localStorage.setItem('temporaryLists', JSON.stringify(temporaryLists));
    } catch (error) {
        console.error('임시 목록 저장 오류:', error);
    }
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
    // 현재 입력된 단어들을 가져옴
    const currentWords = query.split(' ').filter(w => w);
    const lastWord = currentWords[currentWords.length - 1];

    // 마지막 단어가 없으면 추천 결과 표시하지 않음
    if (!lastWord) {
        searchResults.innerHTML = '';
        selectedIndex = -1;
        return;
    }

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
    // 검색어와 일치하는 단어들 찾기 (마지막 단어와 일치하는 것만)
    const matchingWords = Array.from(allWords).filter(word => {
        const matches = word.toLowerCase().includes(lastWord.toLowerCase()) &&
                       !currentWords.includes(word);
        return matches;
    });

    if (matchingWords.length > 0) {
        // 추천단어가 새로 렌더링될 때 selectedIndex가 범위를 벗어나면 0으로 순환
        if (selectedIndex < 0 || selectedIndex >= matchingWords.length) {
            selectedIndex = 0;
        }
        searchResults.innerHTML = matchingWords.map((word, index) => `
            <div class="list-item ${index === selectedIndex ? 'selected' : ''}" 
                 data-word="${word}" 
                 data-index="${index}"
                 onclick="selectWord('${word}')">
                <span>${word}</span>
            </div>
        `).join('');
        updateSelectedItem(searchResults.getElementsByClassName('list-item'));
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
    
    searchInput.value = currentWords.join(' ') + ' '; // 단어 선택 후 스페이스 추가
    document.getElementById('searchResults').innerHTML = '';
    selectedIndex = -1;
    
    // 커서 위치 조정
    searchInput.focus();
    searchInput.selectionStart = searchInput.selectionEnd = searchInput.value.length;
}

// 선택된 추천 단어 아이템 업데이트
function updateSelectedItem(items) {
    if (!items || items.length === 0) return;
    
    // 모든 아이템의 선택 상태 초기화
    Array.from(items).forEach((item, index) => {
        item.classList.toggle('selected', index === selectedIndex);
    });
}

// 방덱이 동일한지 확인하는 함수
function isSameList(list1, list2) {
    const words1 = list1.split(' ').filter(w => w);
    const words2 = list2.split(' ').filter(w => w);
    
    // 단어 수가 4개가 아니거나 다른 경우
    if (words1.length !== 4 || words2.length !== 4) {
        return false;
    }
    
    // 1, 2번째 단어가 정확히 일치하는지 확인
    if (words1[0] !== words2[0] || words1[1] !== words2[1]) {
        return false;
    }
    
    // 3, 4번째 단어가 순서에 상관없이 일치하는지 확인
    return (
        (words1[2] === words2[2] && words1[3] === words2[3]) ||
        (words1[2] === words2[3] && words1[3] === words2[2])
    );
}

// 방덱 추가
async function addNewList() {
    const user = firebase.auth().currentUser;
    const searchInput = document.getElementById('searchInput');
    const title = searchInput.value.trim();
    if (!title) {
        alert('방덱 이름을 입력해주세요.');
        return;
    }
    const words = title.split(' ').filter(w => w);
    // 단어 개수에 따라 분기
    const allLists = await loadFromIndexedDB('lists');
    if (words.length <= 3) {
        // 3단어 이하: 해당 단어들을 모두 포함하는 목록만 임시목록에 표시
        const results = allLists.filter(list => {
            const listWords = list.title.split(' ').filter(w => w);
            return words.every(w => listWords.includes(w));
        });
        // 기존 항목 제거 후 새로운 검색 결과를 맨 앞에 추가
        const existingIds = new Set(results.map(item => item.id));
        temporaryLists = [
            ...results, // 새로 검색된 항목들 (중복 포함)
            ...temporaryLists.filter(item => !existingIds.has(item.id)) // 기존 항목 중 중복 제외
        ];
            renderTemporaryLists();
        updateStats();
        saveTemporaryLists();
        if (results.length === 0) {
            showNotification('일치하는 목록이 없습니다.', 'addListBtn');
        } else {
            showNotification(`검색 결과: ${results.length}개의 목록을 찾았습니다.`, 'addListBtn');
        }
    } else if (words.length === 4) {
        // 4단어: 해당 단어들을 모두 포함하는 목록이 있으면 임시목록에 표시, 없으면 새 목록 추가
        // 기존 목록과 임시목록에서 검색
        const allSearchableLists = [...allLists, ...temporaryLists];
        const results = allSearchableLists.filter(list => {
            const listWords = list.title.split(' ').filter(w => w);
            // 1,2번째 단어는 정확히 일치하고 3,4번째 단어는 순서 상관없이 일치하는지 확인
            return (
                words.length === 4 &&
                listWords.length === 4 &&
                words[0] === listWords[0] && // 1번째 단어 일치
                words[1] === listWords[1] && // 2번째 단어 일치
                (
                    (words[2] === listWords[2] && words[3] === listWords[3]) || // 3,4번째 단어 순서대로 일치
                    (words[2] === listWords[3] && words[3] === listWords[2])  // 3,4번째 단어 순서 바뀌어서 일치
                )
            );
        });
        
        if (results.length > 0) {
            // 중복 제거 (같은 ID 또는 같은 내용의 목록)
            const uniqueResults = [];
            const seen = new Set();
            
            [...results, ...temporaryLists].forEach(item => {
                const wordsInTitle = item.title.split(' ').filter(w => w).sort().join(' ');
                if (!seen.has(wordsInTitle)) {
                    seen.add(wordsInTitle);
                    uniqueResults.push(item);
                }
            });
            
            // 기존 목록에서 해당 항목 삭제 (lists, IndexedDB)
            const idsToRemove = new Set(results.map(item => item.id));
            lists = lists.filter(item => !idsToRemove.has(item.id));
            await saveToIndexedDB('lists', lists);
            // 임시목록에는 복사본만 남기기
            temporaryLists = [...uniqueResults.map(item => ({ ...item }))];
            renderTemporaryLists();
            renderLists();
            updateStats();
            saveTemporaryLists();
            showNotification(`검색 결과: ${results.length}개의 목록을 찾았습니다.`, 'addListBtn');
        } else {
            // 새 목록 생성
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const createdAt = `${year}-${month}-${day} ${hours}:${minutes}`;
            const newList = {
                id: Date.now().toString(),
                title: title,
                memos: [],
                createdAt: createdAt,
                author: user && user.email === 'longway7098@gmail.com' ? '섬세포분열' : '외부 사용자'
            };
            // 기존 임시목록에 새 목록을 맨 앞에 추가
            temporaryLists = [newList, ...temporaryLists];
            renderTemporaryLists();
            updateStats();
            saveTemporaryLists();
            showNotification('새로운 목록이 임시목록에 추가되었습니다.', 'addListBtn');
        }
    } else {
        showNotification('단어는 4개 이하로 입력해주세요.', 'addListBtn');
    }
    searchInput.value = '';
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
            <div class="list-title" data-list-id="${list.id}" data-istemporary="true">
                <span class="mob-icons">${window.renderMobIconsForList ? window.renderMobIconsForList(list.title, true) : ''}</span>
                <span class="list-title-text">${list.title}</span>
                <span class="memo-count">${list.memos.length}/100</span>
                <div class="button-group">
                    <button class="edit-btn" data-edit-list="${list.id}" data-istemporary="true">편집</button>
                    <button class="delete-btn" data-delete-list="${list.id}" data-istemporary="true">삭제</button>
                </div>
            </div>
            <div class="edit-section" id="editSection-${list.id}" style="display: none;">
                <div class="input-group">
                    <input type="text" id="editListInput-${list.id}" placeholder="방덱 제목 수정...">
                    <div class="edit-buttons">
                        <button class="save-btn" data-save-list-edit="${list.id}" data-istemporary="true">저장</button>
                        <button class="cancel-btn" data-cancel-list-edit="${list.id}" data-istemporary="true">취소</button>
                    </div>
                </div>
            </div>
            <div class="memo-section" id="memoSection-${list.id}" style="display: none;">
                <span class="list-created-at">생성: ${formatCreatedAt(list.createdAt)}</span>
                <span class="list-author">작성자: ${list.author === 'longway7098@gmail.com' || !list.author ? '섬세포분열' : list.author}</span>
                <div class="input-group">
                    <input type="text" id="newMemoInput-${list.id}" placeholder="메모 추가...">
                    <button class="add-memo-btn" data-listid="${list.id}" data-istemporary="true">추가</button>
                </div>
                <div class="memo-list">
                    ${(list.memos || []).map(memo => createMemoItemHTML(memo, list.id, true)).join('')}
                </div>
            </div>
        </div>
    `).join('');

    // 클립보드 단축키 이벤트 리스너 추가
    temporaryLists.forEach(list => {
        const memoInput = document.getElementById(`newMemoInput-${list.id}`);
        if (memoInput) {
            addMemoInputListeners(memoInput, list.id, true);
        }
    });
}

// 방덱 삭제
async function deleteList(listId, isTemporary = false) {
    const list = isTemporary ? 
        temporaryLists.find(l => l.id === listId) : 
        lists.find(l => l.id === listId);
    
    if (!list) return;
    
    if (!checkAuthorPermission(list)) {
        showNotification('해당 목록은 삭제할 수 없습니다.', 'deleteListBtn');
        return;
    }
    
    // 기존 삭제 로직
    if (confirm('정말로 이 목록을 삭제하시겠습니까?')) {
        try {
            // 로컬 데이터 업데이트
            if (isTemporary) {
                temporaryLists = temporaryLists.filter(list => list.id !== listId);
                renderTemporaryLists();
                saveTemporaryLists();
            } else {
                lists = lists.filter(list => list.id !== listId);
                
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

// 메모 추가 (키워드 기반 자동 상태 설정 및 텍스트 제거 - 로그 제거) // 중복 실행 방지 플래그
function addMemo(listId, isTemporary = false) {
    const user = firebase.auth().currentUser;
    const targetLists = isTemporary ? temporaryLists : lists;
    const list = targetLists.find(l => l.id === listId);

    if (list.memos.length >= 100) {
        console.log('메모 개수 초과 (100개 제한)');
        alert('한 방덱에는 최대 100개의 메모만 추가할 수 있습니다.');
        isAddingMemo = false; // 플래그 초기화
        return;
    }

    const memoInput = document.getElementById(`newMemoInput-${listId}`);
    const memoText = memoInput.value.trim();
    
    if (!memoText) {
        console.log('빈 메모 내용 감지 - 메모 추가 중단');
        console.log('memoInput 값:', memoInput ? memoInput.value : 'memoInput이 null');
        console.trace('스택 트레이스');
        alert('메모 내용을 입력해주세요.');
        isAddingMemo = false; // 플래그 초기화
        return;
    }

    // 중복 메모 검사
    const isDuplicate = findDuplicateMemo(list.memos, memoText);
    if (isDuplicate) {
        // 중복된 메모를 맨 위로 이동
        const existingMemoIndex = list.memos.findIndex(memo => isSimilarMemo(memo.text, memoText));
        if (existingMemoIndex > -1) {
            const existingMemo = list.memos.splice(existingMemoIndex, 1)[0];
            list.memos.unshift(existingMemo);
            
            // 변경사항 저장
            if (isTemporary) {
                saveTemporaryLists();
            } else {
                saveLists();
            }
            
            // UI 업데이트 - 전체 메모 목록 다시 렌더링
            updateMemoListUI(listId, list.memos, isTemporary);
            
            // 입력 필드 초기화
            memoInput.value = '';
            
            // 알림 표시
            showNotification(`이미 존재하는 메모입니다. '${existingMemo.text}'를 목록 맨 위로 이동했습니다.`, 'addMemoNotification');
            
            return;
        }
    }

    // 새 메모 객체 생성
    const newMemo = {
        id: Date.now().toString() + Math.random().toString(16).slice(2),
        text: memoText,
        status: null,
        wins: 0,
        losses: 0,
        comments: [],
        author: user && user.email === 'longway7098@gmail.com' ? '섬세포분열' : '외부 사용자'  // 로그인 상태에 따른 작성자 설정
    };

    // 참고URL 확인 및 자동 참고자료 추가
    const referenceUrlInput = document.getElementById('referenceUrlInput');
    if (referenceUrlInput && referenceUrlInput.value.trim()) {
        const referenceUrl = referenceUrlInput.value.trim();
        const autoComment = {
            id: Date.now().toString() + Math.random().toString(16).slice(2),
            text: `참고자료: ${referenceUrl}`,
            isReference: true, // 참고자료 표시를 위한 플래그
            url: referenceUrl, // 원본 URL 저장
            createdAt: new Date().toISOString()
        };
        newMemo.comments.push(autoComment);
    }

    // 메모 추가
    list.memos.unshift(newMemo);  // 맨 앞에 추가

    // 변경사항 저장
    if (isTemporary) {
        saveTemporaryLists();
    } else {
        saveLists();
    }

    // UI 업데이트 - 전체 메모 목록 다시 렌더링
    updateMemoListUI(listId, list.memos, isTemporary);

    // 입력 필드 초기화
    memoInput.value = '';
    
    // 클립보드 단축키 이벤트 리스너 재등록
    addClipboardShortcutListener(memoInput);
    
    // 로컬 스토리지에만 저장
    saveToLocalStorage();
    
    // 메모 추가 완료
    isAddingMemo = false;
}

// 메모 중복 체크 함수
function findDuplicateMemo(memos, newMemoText) {
    return memos.some(memo => isSimilarMemo(memo.text, newMemoText));
}

// 유사한 메모인지 확인하는 함수
function isSimilarMemo(memo1, memo2) {
    // 공백 기준으로 분리
    const words1 = memo1.trim().split(/\s+/);
    const words2 = memo2.trim().split(/\s+/);
    
    // 첫 번째 단어가 다르면 유사하지 않음
    if (words1[0] !== words2[0]) {
        return false;
    }
    
    // 단어 수가 다르면 유사하지 않음
    if (words1.length !== words2.length) {
        return false;
    }
    
    // 첫 번째 단어를 제외한 나머지 단어들을 정렬하여 비교
    const remainingWords1 = words1.slice(1).sort();
    const remainingWords2 = words2.slice(1).sort();
    
    // 정렬된 단어 배열이 일치하는지 확인
    return JSON.stringify(remainingWords1) === JSON.stringify(remainingWords2);
}

// 메모 목록 UI 업데이트 함수
function updateMemoListUI(listId, memos, isTemporary) {
    const memoSection = document.getElementById(`memoSection-${listId}`);
    if (!memoSection) return;
    
    const memoListContainer = memoSection.querySelector('.memo-list');
    if (!memoListContainer) return;
    
    // 메모 목록 비우기
    memoListContainer.innerHTML = '';
    
    // 메모 목록 다시 렌더링
    if (memos.length === 0) {
        memoListContainer.innerHTML = '<div class="no-memos">메모가 없습니다.</div>';
    } else {
        memos.forEach(memo => {
            const memoHTML = createMemoItemHTML(memo, listId, isTemporary);
            memoListContainer.insertAdjacentHTML('beforeend', memoHTML);
        });
    }
    
    // 메모 카운트 업데이트
    const memoCountElement = document.querySelector(`.list-item[data-list-id="${listId}"] .memo-count`);
    if (memoCountElement) {
        memoCountElement.textContent = `${memos.length}/100`;
    }
}

// 메모 삭제
function deleteMemo(listId, memoId, isTemporary = false) {
    const list = isTemporary ? 
        temporaryLists.find(l => l.id === listId) : 
        lists.find(l => l.id === listId);
    
    if (!list) return;
    
    const memo = list.memos.find(m => m.id === memoId);
    if (!memo) return;
    
    if (!checkAuthorPermission(list, memo)) {
        showNotification('해당 메모는 삭제할 수 없습니다.', 'deleteMemoBtn');
        return;
    }
    
    if (confirm('해당 메모를 삭제하시겠습니까?')) {
        try {
            // 메모만 삭제하고 목록은 유지
            list.memos = list.memos.filter(m => m.id !== memoId);
            
            // UI 업데이트
            if (isTemporary) {
                renderTemporaryLists();
                saveTemporaryLists();
            } else {
                renderLists(currentPage);
                saveLists();
            }
            
            // 통계 업데이트
            updateStats();
            
            // 로컬 스토리지에 저장
            saveToLocalStorage();
        } catch (error) {
            console.error('메모 삭제 중 오류 발생:', error);
            alert('메모 삭제 중 오류가 발생했습니다.');
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

// 글자순으로 목록 정렬하는 함수 추가
function sortListsByAlphabetical(lists) {
    return [...lists].sort((a, b) => {
        return a.title.localeCompare(b.title, 'ko');
    });
}

// 알림 메시지 표시 함수
function showNotification(message, elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    // 기존 알림 메시지 제거
    const existingNotification = document.getElementById(`notification-${elementId}`);
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // 버튼 래퍼 요소의 position 확인
    const buttonWrapper = element.closest('.button-wrapper');
    if (buttonWrapper && getComputedStyle(buttonWrapper).position === 'static') {
        buttonWrapper.style.position = 'relative';
    }
    
    // 새 알림 메시지 추가
    const notification = document.createElement('div');
    notification.className = 'notification-message';
    notification.id = `notification-${elementId}`;
    notification.textContent = message;
    
    // 버튼 래퍼에 알림 메시지 추가
    const parent = buttonWrapper || element.parentNode;
    parent.appendChild(notification);
    
    // 3초 후 알림 메시지 제거
    setTimeout(() => {
        notification.remove();
    }, 3000);
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
    // 2. 현재 페이지에 해당하는 목록만 추출
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedLists = filteredLists.slice(startIndex, endIndex);

    // 3. 목록 렌더링
    listsContainer.innerHTML = paginatedLists.map(list => `
        <div class="list-item" data-list-id="${list.id}">
            <div class="list-title" data-list-id="${list.id}" data-istemporary="false">
                <span class="mob-icons">${window.renderMobIconsForList ? window.renderMobIconsForList(list.title, false) : ''}</span>
                <span class="list-title-text">${list.title}</span>
                <span class="memo-count">${list.memos.length}/100</span>
                <div class="button-group">
                    <button class="edit-btn" data-edit-list="${list.id}">편집</button>
                    <button class="delete-btn" data-delete-list="${list.id}">삭제</button>
                </div>
            </div>
            <div class="edit-section" id="editSection-${list.id}" style="display: none;">
                <div class="input-group">
                    <input type="text" id="editListInput-${list.id}" placeholder="방덱 제목 수정...">
                    <div class="edit-buttons">
                        <button class="save-btn" data-save-list-edit="${list.id}">저장</button>
                        <button class="cancel-btn" data-cancel-list-edit="${list.id}">취소</button>
                    </div>
                </div>
            </div>
            <div class="memo-section" id="memoSection-${list.id}" style="display: none;">
                <span class="list-created-at">생성: ${formatCreatedAt(list.createdAt)}</span>
                <span class="list-author">작성자: ${list.author === 'longway7098@gmail.com' ? '섬세포분열' : list.author}</span>
                <div class="input-group">
                    <input type="text" id="newMemoInput-${list.id}" placeholder="메모 추가...">
                    <button class="add-memo-btn" data-listid="${list.id}" data-istemporary="false">추가</button>
                </div>
                <div class="memo-list">
                    ${(list.memos || []).map(memo => createMemoItemHTML(memo, list.id, false)).join('')}
                </div>
            </div>
        </div>
    `).join('');

    // 4. 페이지네이션 컨트롤 렌더링
    renderPaginationControls(filteredLists.length);
    
    // 5. 클립보드 단축키 이벤트 리스너 추가
    paginatedLists.forEach(list => {
        const memoInput = document.getElementById(`newMemoInput-${list.id}`);
        if (memoInput) {
            addMemoInputListeners(memoInput, list.id, false);
        }
    });

    // ... existing code ...
    function updateMobIcons() {
        // 기존 목록(페이지네이션)
        document.querySelectorAll('#lists .list-item').forEach(item => {
            const title = item.querySelector('.list-title-text')?.textContent?.trim();
            const iconSpan = item.querySelector('.mob-icons');
            if (title && iconSpan && window.renderMobIconsForList) {
                iconSpan.innerHTML = window.renderMobIconsForList(title, false);
            }
        });
        // 임시 목록
        document.querySelectorAll('#temporaryLists .list-item').forEach(item => {
            const title = item.querySelector('.list-title-text')?.textContent?.trim();
            const iconSpan = item.querySelector('.mob-icons');
            if (title && iconSpan && window.renderMobIconsForList) {
                iconSpan.innerHTML = window.renderMobIconsForList(title, true);
            }
        });
    }
    // ... existing code ...
    // renderLists 마지막에 추가
    updateMobIcons();
    // ... existing code ...
    // renderTemporaryLists 마지막에 추가
    updateMobIcons();
    // ... existing code ...
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
function toggleMemos(listId, isTemporary = false) {
    try {
        const listElement = document.querySelector(`[data-list-id="${listId}"]`);
        if (!listElement) {
            console.error('목록 요소를 찾을 수 없습니다:', listId);
            return;
        }
        
        // isTemporary 파라미터가 제공되지 않은 경우에만 DOM에서 확인
        if (isTemporary === undefined) {
            isTemporary = listElement.closest('#temporaryLists') !== null;
        }
        const list = isTemporary ? temporaryLists.find(l => l.id === listId) : lists.find(l => l.id === listId);
        
        if (!list) {
            console.error('목록 데이터를 찾을 수 없습니다:', listId);
            return;
        }

        const memoSection = listElement.querySelector('.memo-section');
        if (!memoSection) {
            console.error('메모 섹션을 찾을 수 없습니다:', listId);
            return;
        }

        const isExpanded = memoSection.style.display === 'block';
        
        // 다른 열린 메모 섹션 닫기
        document.querySelectorAll('.memo-section').forEach(section => {
            if (section !== memoSection) {
                section.style.display = 'none';
            }
        });

        // ID 변경 섹션 초기화
        const changeIdSection = document.getElementById('changeIdSection');
        const currentListIdDisplay = document.getElementById('currentListIdDisplay');
        if (changeIdSection) {
            changeIdSection.style.display = 'none';
        }
        if (currentListIdDisplay) {
            currentListIdDisplay.textContent = '';
        }
        
        if (!isExpanded) {
            // 메모를 펼칠 때
            memoSection.style.display = 'block';
            
            // 메모 목록 렌더링
            const memoList = memoSection.querySelector('.memo-list');
            if (memoList) {
                memoList.innerHTML = (list.memos || []).map(memo => createMemoItemHTML(memo, listId, isTemporary)).join('');
            }
            
            // 임시 목록인 경우에만 ID 변경 섹션 표시 및 현재 ID 표시
            if (isTemporary && changeIdSection) {
                changeIdSection.style.display = 'block';
                if (currentListIdDisplay) {
                    currentListIdDisplay.textContent = `현재 목록 ID: ${list.id}`;
                }
                // ID 변경 버튼이 보이도록 스타일 수정
                const changeListIdBtn = document.getElementById('changeListIdBtn');
                if (changeListIdBtn) {
                    changeListIdBtn.style.display = 'inline-block';
                    changeListIdBtn.style.marginTop = '10px';
                    // ID 변경 버튼에 이벤트 리스너 추가
                    changeListIdBtn.onclick = function() {
                        changeListId(listId);
                    };
                }
            }

            // 메모 입력창에 포커스
            const memoInput = document.getElementById(`newMemoInput-${listId}`);
            if (memoInput) {
                setTimeout(() => {
                    memoInput.focus();
                    // Ensure the input is visible in the viewport
                    memoInput.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }, 100);
            }
        } else {
            // 메모를 접을 때
            memoSection.style.display = 'none';
            // ID 변경 섹션도 숨기기
            if (changeIdSection) {
                changeIdSection.style.display = 'none';
            }
            if (currentListIdDisplay) {
                currentListIdDisplay.textContent = '';
            }
        }
    } catch (error) {
        console.error('toggleMemos 함수 실행 중 오류 발생:', error);
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
    
    // 통계 숫자 업데이트
    document.getElementById('stat-4').textContent = stats['4deck'];
    document.getElementById('stat-5').textContent = stats['5deck'];
    document.getElementById('stat-other').textContent = stats['other'];
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
    const list = isTemporary ? 
        temporaryLists.find(l => l.id === listId) : 
        lists.find(l => l.id === listId);
    
    if (!list) return;
    
    if (!checkAuthorPermission(list)) {
        showNotification('해당 목록은 수정할 수 없습니다.', 'editListBtn');
        return;
    }
    
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
    const user = firebase.auth().currentUser;
    const targetLists = isTemporary ? temporaryLists : lists;
    const list = targetLists.find(l => l.id.toString() === listId.toString());
    if (!list) return;
    const isAdmin = user && user.email === 'longway7098@gmail.com';
    const isProtectedAuthor = !list.author || list.author === '섬세포분열' || list.author === 'longway7098@gmail.com';
    if (isProtectedAuthor && !isAdmin) {
        alert('이 목록은 관리자만 편집할 수 있습니다.');
        return;
    }

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
    const list = isTemporary ? 
        temporaryLists.find(l => l.id === listId) : 
        lists.find(l => l.id === listId);
    
    if (!list) return;
    
    const memo = list.memos.find(m => m.id === memoId);
    if (!memo) return;
    
    if (!checkAuthorPermission(list, memo)) {
        showNotification('해당 메모는 수정할 수 없습니다.', 'editMemoBtn');
        return;
    }
    
    try {
        console.log(`메모 편집 시작: listId=${listId}, memoId=${memoId}, isTemporary=${isTemporary}`);
        
        // 현재 편집 중인 다른 메모가 있으면 취소
        const existingEditSection = document.querySelector('.memo-edit-section');
        if (existingEditSection) {
            const currentMemoId = existingEditSection.closest('.memo-item').dataset.memoId;
            cancelMemoEdit(listId, currentMemoId, isTemporary);
        }
        
        // 메모 찾기
        const memoItem = document.querySelector(`.memo-item[data-memo-id="${memoId}"]`);
        if (!memoItem) {
            console.error(`메모 항목을 찾을 수 없음: memoId=${memoId}`);
            alert('편집할 메모를 찾을 수 없습니다.');
            return;
        }
        
        // 메모 텍스트 요소 찾기
        const memoTextElement = memoItem.querySelector('.memo-text');
        if (!memoTextElement) {
            console.error('메모 텍스트 요소를 찾을 수 없음');
            alert('메모 텍스트를 찾을 수 없습니다.');
            return;
        }
        
        // 현재 메모 텍스트 가져오기 및 공백 정리
        let currentText = memoTextElement.textContent;
        // 다중 공백을 단일 공백으로 변환
        currentText = currentText.replace(/\s+/g, ' ').trim();
        
        // 편집 화면 만들기
        const editSection = document.createElement('div');
        editSection.className = 'memo-edit-section';
        
        // 텍스트 입력 영역
        const textInput = document.createElement('textarea');
        textInput.id = `editMemoInput-${memoId}`;
        textInput.className = 'edit-memo-input';
        textInput.value = currentText;
        editSection.appendChild(textInput);
        
        // 엔터 키 이벤트 리스너 추가
        textInput.addEventListener('keydown', function(event) {
            // Shift+Enter는 줄바꿈, Enter만 누르면 저장
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault(); // 기본 동작 방지 (줄바꿈)
                saveMemoEdit(listId, memoId, isTemporary);
            }
        });
        
        // 버튼 컨테이너
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'edit-buttons';
        
        // 저장 버튼
        const saveButton = document.createElement('button');
        saveButton.className = 'save-edit-btn';
        saveButton.innerHTML = '<i class="fas fa-check"></i> 저장';
        saveButton.onclick = () => saveMemoEdit(listId, memoId, isTemporary);
        buttonContainer.appendChild(saveButton);
        
        // 취소 버튼
        const cancelButton = document.createElement('button');
        cancelButton.className = 'cancel-edit-btn';
        cancelButton.innerHTML = '<i class="fas fa-times"></i> 취소';
        cancelButton.onclick = () => cancelMemoEdit(listId, memoId, isTemporary);
        buttonContainer.appendChild(cancelButton);
        
        editSection.appendChild(buttonContainer);
        
        // 편집 섹션 삽입
        memoItem.querySelector('.memo-content').style.display = 'none';
        memoItem.querySelector('.memo-buttons').style.display = 'none';
        memoItem.appendChild(editSection);
        
        // 텍스트 입력 영역에 포커스
        textInput.focus();
        
    } catch (error) {
        console.error('메모 편집 시작 중 오류 발생:', error, error.stack);
        alert('메모 편집을 시작하는 중 오류가 발생했습니다.');
    }
}

// 승패 비율에 따라 메모 상태를 자동으로 설정하는 함수
function updateMemoStatusByWinRate(memo) {
    // 승패가 없는 경우 상태 없음
    if (memo.wins === 0 && memo.losses === 0) {
        memo.status = null;
        return;
    }

    const total = memo.wins + memo.losses;
    const winRate = (memo.wins / total) * 100;
    
    // 승률이 51% 이상이면 성공 상태로 설정
    if (winRate >= 51) {
        memo.status = 'success';
    }
    // 패배율이 51% 이상이면 실패 상태로 설정
    else if ((memo.losses / total) * 100 >= 51) {
        memo.status = 'fail';
    }
    // 그 외의 경우(50:50)는 상태 없음
    else {
        memo.status = null;
    }
}

// 메모의 승패 카운터 업데이트 함수
function updateCounter(listId, memoId, counterType, change, isTemporary = false) {
    const targetLists = isTemporary ? temporaryLists : lists;
    const list = targetLists.find(l => l.id === listId);
    
    if (!list) return;
    
    const memo = list.memos.find(m => m.id === memoId);
    if (!memo) return;
    
    // 현재 로그인한 사용자 확인
    const user = firebase.auth().currentUser;
    
    // 관리자 계정이 아닌 경우, "섬세포분열"이 작성한 메모는 승패 조작 불가
    if (!user || user.email !== 'longway7098@gmail.com') {
        if (list.author === '섬세포분열' && memo.author !== '외부 사용자') {
            showNotification('해당 메모의 카운터는 변경할 수 없습니다.', 'counterBtn');
            return;
        }
    }
    
    // 승수 또는 패수 업데이트
    if (counterType === 'win') {
        // 승수가 0이고 감소하려는 경우 무시
        if (memo.wins === 0 && change < 0) {
            return;
        }
        memo.wins = (memo.wins || 0) + change;
    } else if (counterType === 'loss') {
        // 패수가 0이고 감소하려는 경우 무시
        if (memo.losses === 0 && change < 0) {
            return;
        }
        memo.losses = (memo.losses || 0) + change;
    }
    
    // 승률 업데이트
    updateMemoStatusByWinRate(memo);
    
    // UI 업데이트
    updateMemoListUI(listId, list.memos, isTemporary);
    
    // 데이터 저장
    if (isTemporary) {
        saveTemporaryLists();
    } else {
        saveLists();
    }
}

// 메모 아이템 HTML 생성 함수
function createMemoItemHTML(memo, listId, isTemporary) {
    const wins = typeof memo.wins === 'number' ? memo.wins : 0;
    const losses = typeof memo.losses === 'number' ? memo.losses : 0;
    const winRate = (wins + losses) > 0 ? ((wins / (wins + losses)) * 100).toFixed(1) : 0;
    
    // 상태 아이콘 결정 및 클래스 추가
    const statusIcon = memo.status === 'success' ? '✅' : 
                      memo.status === 'fail' ? '❌' : '';
    
    // 상태 아이콘에 대한 CSS 클래스 결정
    const statusClass = memo.status === 'success' ? 'status-success' : 
                       memo.status === 'fail' ? 'status-fail' : '';
    
    // 참고자료 수를 표시하기 위한 변수
    const commentCount = memo.comments ? memo.comments.length : 0;
    const commentButtonText = commentCount > 0 ? `참고자료 (${commentCount})` : '참고자료';

    return `
        <div class="memo-item" data-memo-id="${memo.id}">
            <div class="memo-table">
                <div class="memo-row">
                    <div class="memo-cell memo-title">${memo.text}</div>
                    <div class="memo-cell memo-stats">
                        <span class="counter-text">${wins}승 ${losses}패 (${winRate}%)</span>
                    </div>
                </div>
                <div class="memo-row">
                    <div class="memo-cell memo-icons">
                        <span class="mob-icons memo-mob-icons">${window.renderMobIconsForList ? window.renderMobIconsForList(memo.text, isTemporary, true) : ''}</span>
                    </div>
                    <div class="memo-cell memo-author">작성자: ${(memo.author === 'longway7098@gmail.com' || !memo.author) ? '섬세포분열' : memo.author}</div>
                </div>
            </div>
            <div class="memo-actions">
                <div class="memo-status-display">
                    ${statusIcon ? `<span class="status-icon ${statusClass}">${statusIcon}</span>` : ''}
                </div>
                <div class="memo-buttons">
                    <button class="add-reference-btn" onclick="addReferenceFromUrl('${listId}', '${memo.id}', ${isTemporary})">자료추가</button>
                    <button class="comment-btn" onclick="toggleCommentSection('${listId}', '${memo.id}', ${isTemporary})">${commentButtonText}</button>
                </div>
                <div class="memo-counter">
                    <button class="counter-btn plus-win" onclick="updateCounter('${listId}', '${memo.id}', 'win', 1, ${isTemporary})">+승</button>
                    <button class="counter-btn minus-win" onclick="updateCounter('${listId}', '${memo.id}', 'win', -1, ${isTemporary})">-승</button>
                    <button class="counter-btn plus-loss" onclick="updateCounter('${listId}', '${memo.id}', 'loss', 1, ${isTemporary})">+패</button>
                    <button class="counter-btn minus-loss" onclick="updateCounter('${listId}', '${memo.id}', 'loss', -1, ${isTemporary})">-패</button>
                </div>
                <div class="memo-status-buttons">
                    <button class="status-btn success-btn ${memo.status === 'success' ? 'active' : ''}" 
                        onclick="setMemoStatus('${listId}', '${memo.id}', 'success', ${isTemporary})">✅</button>
                    <button class="status-btn fail-btn ${memo.status === 'fail' ? 'active' : ''}" 
                        onclick="setMemoStatus('${listId}', '${memo.id}', 'fail', ${isTemporary})">❌</button>
                </div>
                <div class="memo-buttons">
                    <button class="edit-btn" onclick="startEditMemo('${listId}', '${memo.id}', ${isTemporary})">수정</button>
                    <button class="delete-btn" onclick="deleteMemo('${listId}', '${memo.id}', ${isTemporary})">삭제</button>
                </div>
            </div>
            <div class="comment-section" id="commentSection-${memo.id}" style="display: none;">
                <div class="comment-list">
                    ${renderComments(memo)}
                </div>
                <div class="comment-input-group">
                    <input type="text" id="commentInput-${memo.id}" placeholder="참고자료를 입력하세요..." onkeypress="if(event.key === 'Enter') addComment('${listId}', '${memo.id}', ${isTemporary})">
                    <button onclick="addComment('${listId}', '${memo.id}', ${isTemporary})">등록</button>
                </div>
            </div>
        </div>
    `;
}

// 참고자료 목록 렌더링 함수
function renderComments(memo) {
    if (!memo.comments || memo.comments.length === 0) {
        return '<div class="no-comments">참고자료가 없습니다.</div>';
    }
    
    return memo.comments.map(comment => {
        let commentText = comment.text;
        // 참고자료 인 경우 클릭 가능한 링크로 변환
        if ((comment.isReference && comment.url) ||
            (!comment.isReference && typeof comment.text === 'string' && /^(https?:\/\/[^\s]+)$/.test(comment.text.trim()))) {
            const urlPart = comment.url || comment.text.trim();
            commentText = `참고자료: <a href="${urlPart}" target="_blank" class="reference-link">${urlPart}</a>`;
        }
        return `
            <div class="comment-item" data-comment-id="${comment.id}">
                <div class="comment-text">${commentText}</div>
                <div class="comment-date">${formatCommentDate(comment.createdAt)}</div>
                <button class="delete-comment-btn" onclick="deleteComment('${memo.id}', '${comment.id}')">삭제</button>
            </div>
        `;
    }).join('');
}

// 참고자료 날짜 포맷팅 함수
function formatCommentDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    
    // 날짜 차이 계산 (밀리초)
    const diff = now - date;
    
    // 1시간 이내
    if (diff < 60 * 60 * 1000) {
        const minutes = Math.floor(diff / (60 * 1000));
        return `${minutes}분 전`;
    }
    
    // 오늘 이내
    if (diff < 24 * 60 * 60 * 1000) {
        const hours = Math.floor(diff / (60 * 60 * 1000));
        return `${hours}시간 전`;
    }
    
    // 1주일 이내
    if (diff < 7 * 24 * 60 * 60 * 1000) {
        const days = Math.floor(diff / (24 * 60 * 60 * 1000));
        return `${days}일 전`;
    }
    
    // 그 외의 경우는 년-월-일 형식으로 표시
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
}

// 참고자료 섹션 토글 함수
function toggleCommentSection(listId, memoId, isTemporary = false) {
    const commentSection = document.getElementById(`commentSection-${memoId}`);
    if (!commentSection) return;
    
    const isVisible = commentSection.style.display !== 'none';
    
    // 현재 열린 참고자료 섹션들 닫기
    document.querySelectorAll('.comment-section').forEach(section => {
        if (section.id !== `commentSection-${memoId}`) {
            section.style.display = 'none';
        }
    });
    
    // 현재 선택된 참고자료 섹션 토글
    commentSection.style.display = isVisible ? 'none' : 'block';
    
    // 참고자료 섹션이 열릴 때 입력창에 포커스
    if (!isVisible) {
        const commentInput = document.getElementById(`commentInput-${memoId}`);
        if (commentInput) {
            setTimeout(() => {
                commentInput.focus();
            }, 100);
        }
    }
}

// 참고자료 추가 함수
function addComment(listId, memoId, isTemporary = false) {
    const commentInput = document.getElementById(`commentInput-${memoId}`);
    if (!commentInput) return;
    
    const commentText = commentInput.value.trim();
    if (!commentText) return;
    
    // 대상 목록 배열 결정
    const targetLists = isTemporary ? temporaryLists : lists;
    
    // 목록 찾기
    const list = targetLists.find(l => l.id.toString() === listId.toString());
    if (!list) return;
    
    // 메모 찾기
    const memo = list.memos.find(m => m.id.toString() === memoId.toString());
    if (!memo) return;
    
    // 참고자료 배열이 없으면 생성
    if (!memo.comments) {
        memo.comments = [];
    }
    
    // 새 참고자료 객체 생성
    const newComment = {
        id: Date.now().toString() + Math.random().toString(16).slice(2),
        text: commentText,
        createdAt: new Date().toISOString()
    };
    
    // 참고자료 추가
    memo.comments.push(newComment);
    
    // 변경 사항 저장
    if (isTemporary) {
        saveTemporaryLists();
    } else {
        saveLists();
    }
    
    // UI 업데이트
    const commentList = document.querySelector(`#commentSection-${memoId} .comment-list`);
    if (commentList) {
        // 참고자료가 없다는 메시지 제거
        const noComments = commentList.querySelector('.no-comments');
        if (noComments) {
            noComments.remove();
        }
        
        // 새 참고자료 추가
        const commentHTML = `
            <div class="comment-item" data-comment-id="${newComment.id}">
                <div class="comment-text">${newComment.text}</div>
                <div class="comment-date">방금 전</div>
                <button class="delete-comment-btn" onclick="deleteComment('${memoId}', '${newComment.id}')">삭제</button>
            </div>
        `;
        commentList.insertAdjacentHTML('beforeend', commentHTML);
    }
    
    // 입력 필드 초기화
    commentInput.value = '';
    
    // 참고자료 버튼 텍스트 업데이트
    const commentBtn = document.querySelector(`.memo-item[data-memo-id="${memoId}"] .comment-btn`);
    if (commentBtn) {
        const commentCount = memo.comments.length;
        commentBtn.textContent = `참고자료 (${commentCount})`;
    }
}

// 참고자료 삭제 함수
function deleteComment(memoId, commentId) {
    // 현재 보이는 모든 목록(임시 목록 포함)에서 해당 메모 찾기
    let memo = null;
    let isTemporary = false;
    let parentList = null;
    
    // 일반 목록에서 먼저 찾기
    for (const list of lists) {
        memo = list.memos.find(m => m.id.toString() === memoId.toString());
        if (memo) {
            parentList = list;
            break;
        }
    }
    
    // 일반 목록에서 찾지 못했다면 임시 목록에서 찾기
    if (!memo) {
        for (const list of temporaryLists) {
            memo = list.memos.find(m => m.id.toString() === memoId.toString());
            if (memo) {
                parentList = list;
                isTemporary = true;
                break;
            }
        }
    }
    
    if (!memo || !parentList || !memo.comments) return;
    
    // 참고자료 삭제
    const commentIndex = memo.comments.findIndex(c => c.id.toString() === commentId.toString());
    if (commentIndex === -1) return;
    
    memo.comments.splice(commentIndex, 1);
    
    // 변경 사항 저장
    if (isTemporary) {
        saveTemporaryLists();
    } else {
        saveLists();
    }
    
    // UI 업데이트
    const commentItem = document.querySelector(`.comment-item[data-comment-id="${commentId}"]`);
    if (commentItem) {
        commentItem.remove();
        
        // 참고자료가 없으면 메시지 표시
        const commentList = document.querySelector(`#commentSection-${memoId} .comment-list`);
        if (commentList && memo.comments.length === 0) {
            commentList.innerHTML = '<div class="no-comments">참고자료가 없습니다.</div>';
        }
    }
    
    //  참고자료 버튼 텍스트 업데이트
    const commentBtn = document.querySelector(`.memo-item[data-memo-id="${memoId}"] .comment-btn`);
    if (commentBtn) {
        const commentCount = memo.comments.length;
        commentBtn.textContent = commentCount > 0 ? `참고자료 (${commentCount})` : '참고자료';
    }
}

// 클립보드 관련 함수들
function loadClipboardItems() {
    try {
        const savedMemo = localStorage.getItem('clipboardItemsMemo');
        const savedList = localStorage.getItem('clipboardItemsList');
        clipboardItemsMemo = savedMemo ? JSON.parse(savedMemo) : Array(MAX_CLIPBOARD_ITEMS).fill('');
        clipboardItemsList = savedList ? JSON.parse(savedList) : Array(MAX_CLIPBOARD_ITEMS).fill('');
        renderClipboardItems();
    } catch (error) {
        clipboardItemsMemo = Array(MAX_CLIPBOARD_ITEMS).fill('');
        clipboardItemsList = Array(MAX_CLIPBOARD_ITEMS).fill('');
        saveClipboardItems();
    }
}

// 클립보드 렌더링
function renderClipboardItems() {
    const container = document.querySelector('.clipboard-items');
    if (!container) return;
    container.innerHTML = '';
    // 상단 라벨
    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.gap = '12px';
    header.style.marginBottom = '8px';
    header.innerHTML = '<span style="flex:1;text-align:center;font-weight:bold;">메모용</span><span style="flex:1;text-align:center;font-weight:bold;">목록용</span>';
    container.appendChild(header);
    // 각 클립보드 줄
    for (let i = 0; i < MAX_CLIPBOARD_ITEMS; i++) {
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.alignItems = 'center';
        row.style.gap = '8px';
        row.style.marginBottom = '4px';
        // 단축키 안내
        const shortcut = document.createElement('span');
        shortcut.textContent = `Alt + ${i + 1}`;
        shortcut.style.width = '60px';
        shortcut.style.fontSize = '12px';
        shortcut.style.color = '#888';
        row.appendChild(shortcut);
        // 메모용 입력창
        const memoInput = document.createElement('input');
        memoInput.type = 'text';
        memoInput.value = clipboardItemsMemo[i] || '';
        memoInput.placeholder = `메모용 ${i + 1}`;
        memoInput.style.flex = '1';
        memoInput.className = 'clipboard-memo-input';
        memoInput.dataset.index = i;
        memoInput.addEventListener('input', function() {
            clipboardItemsMemo[i] = this.value;
            saveClipboardItems();
        });
        row.appendChild(memoInput);
        // 목록용 입력창
        const listInput = document.createElement('input');
        listInput.type = 'text';
        listInput.value = clipboardItemsList[i] || '';
        listInput.placeholder = `목록용 ${i + 1}`;
        listInput.style.flex = '1';
        listInput.className = 'clipboard-list-input';
        listInput.dataset.index = i;
        listInput.addEventListener('input', function() {
            clipboardItemsList[i] = this.value;
            saveClipboardItems();
        });
        row.appendChild(listInput);
        container.appendChild(row);
    }
}

// 클립보드 저장
function saveClipboardItems() {
    localStorage.setItem('clipboardItemsMemo', JSON.stringify(clipboardItemsMemo));
    localStorage.setItem('clipboardItemsList', JSON.stringify(clipboardItemsList));
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
        // 기존 클립보드 이벤트 리스너 제거
        element.removeEventListener('keydown', handleClipboardKeydown);
        
        // 새 이벤트 리스너 추가
        element.addEventListener('keydown', handleClipboardKeydown);
    }
}

// 클립보드 단축키 키다운 핸들러
function handleClipboardKeydown(event) {
}

// JSON 불러오기 함수
function importJsonFile() {
    try {
        const fileInput = document.getElementById('jsonFileInput');
        fileInput.click();
    } catch (error) {
        console.error('파일 선택 오류:', error);
        showNotification('파일 선택 오류', 'importJsonBtn');
    }
}

// JSON 파일 처리 함수
function handleJsonFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
        const reader = new FileReader();
        reader.onload = async function(e) {
            try {
                const jsonData = JSON.parse(e.target.result);
                // 데이터 처리 전 현재 데이터 백업
                // (백업은 필요시 유지)
                // 데이터 처리
                await processImportedJson(jsonData);
                // 파일 데이터 자체도 백업
                localStorage.setItem('last_imported_json', e.target.result);
            } catch (error) {
                showNotification('올바른 JSON 형식이 아닙니다', 'importJsonBtn');
                console.error('JSON 파싱 오류:', error);
            }
        };
        reader.readAsText(file);
        event.target.value = ''; // 입력 필드 초기화
    } catch (error) {
        console.error('파일 읽기 오류:', error);
        showNotification('파일 읽기 오류', 'importJsonBtn');
    }
}

// 불러온 JSON 데이터 처리 함수 (IndexedDB에 저장)
async function processImportedJson(data) {
    try {
        // 목록 데이터 검증
        let listsToImport = [];
        let tempListsToImport = [];
        if (Array.isArray(data)) {
            listsToImport = data;
        } else if (data.lists && Array.isArray(data.lists)) {
            listsToImport = data.lists;
            if (data.temporaryLists && Array.isArray(data.temporaryLists)) {
                tempListsToImport = data.temporaryLists;
            }
        } else {
            showNotification('유효한 목록 데이터가 없습니다', 'importJsonBtn');
            return;
        }
        // IndexedDB에 저장
        await saveToIndexedDB('lists', listsToImport);
        await saveToIndexedDB('temporaryLists', tempListsToImport);
        // 메모리 반영
        lists = listsToImport;
        temporaryLists = tempListsToImport;
        // UI 갱신
        renderLists(currentPage);
        renderTemporaryLists();
        updateStats();
        showNotification('JSON 데이터가 성공적으로 불러와졌습니다.', 'importJsonBtn');
    } catch (error) {
        console.error('데이터 처리 오류:', error);
        showNotification('데이터 처리 중 오류 발생', 'importJsonBtn');
    }
}

// 함수를 전역 스코프에 등록하여 HTML에서 직접 호출 가능하도록 함
window.updateCounter = updateCounter;

// 함수를 전역 스코프에 등록
window.setMemoStatus = setMemoStatus;

// 전역으로 필요한 함수들 추가 등록
window.startEditMemo = startEditMemo;
window.deleteMemo = deleteMemo;

// 파일 끝에 추가 - 모든 필요한 함수들을 전역 스코프에 등록 
// (HTML의 onclick 속성에서 직접 호출하기 위함)
(function registerGlobalFunctions() {
    // 기존에 등록한 함수들
    window.updateCounter = updateCounter;
    window.setMemoStatus = setMemoStatus;
    window.startEditMemo = startEditMemo;
    window.deleteMemo = deleteMemo;
    
    // 추가로 필요한 함수들
    window.addMemo = addMemo;
    window.saveListEdit = saveListEdit;
    window.cancelListEdit = cancelListEdit;
    window.saveMemoEdit = saveMemoEdit;
    window.cancelMemoEdit = cancelMemoEdit;
    window.startEditList = startEditList;
    window.toggleMemos = toggleMemos;
    
    // 새로 추가한 함수들
    window.updateMemoStatusByWinRate = updateMemoStatusByWinRate;
    window.updateAllMemoStatuses = updateAllMemoStatuses;
    window.migrateExistingData = migrateExistingData;
    window.migrateStatusToWinLoss = migrateStatusToWinLoss;
    window.addTemporaryToLists = addTemporaryToLists;
    window.checkMemoIcon = checkMemoIcon;
    
    // 추천 단어 관련 함수들
    window.selectWord = selectWord;
    window.updateSelectedItem = updateSelectedItem;
    window.setupSearchInputEvents = setupSearchInputEvents;
    
    // 정렬 함수
    window.sortAll = async function() {
        // 목록을 가나다순으로 정렬
        lists = sortListsByAlphabetical(lists);
        
        // 각 목록의 메모들을 가나다순으로 정렬
        lists.forEach(list => {
            if (list.memos && list.memos.length > 0) {
                list.memos = sortMemosByAlphabetical(list.memos);
            }
        });
        
        // 임시 목록도 동일하게 정렬
        temporaryLists = sortListsByAlphabetical(temporaryLists);
        temporaryLists.forEach(list => {
            if (list.memos && list.memos.length > 0) {
                list.memos = sortMemosByAlphabetical(list.memos);
            }
        });
        
        // 변경사항 저장
        saveLists();
        saveTemporaryLists();
        
        // 관리자 계정일 때만 Firebase에 업로드
        const user = firebase.auth().currentUser;
        if (user && user.email === 'longway7098@gmail.com') {
            await saveToFirebase();
        }
        
        // UI 업데이트
        renderLists();
        renderTemporaryLists();
        
        showNotification('목록과 메모가 가나다순으로 정렬되었습니다', 'sortBtn');
    };
    
    console.log('모든 함수들이 전역 스코프에 등록되었습니다.');
})();

// 방덱 불러오기 시 모든 메모의 상태 업데이트
function updateAllMemoStatuses() {
    // 일반 목록의 모든 메모 상태 업데이트
    lists.forEach(list => {
        if (list.memos && list.memos.length > 0) {
            list.memos.forEach(memo => {
                updateMemoStatusByWinRate(memo);
            });
        }
    });
    
    // 임시 목록의 모든 메모 상태 업데이트
    temporaryLists.forEach(list => {
        if (list.memos && list.memos.length > 0) {
            list.memos.forEach(memo => {
                updateMemoStatusByWinRate(memo);
            });
        }
    });
    
    // 저장
    saveLists();
    saveTemporaryLists();
}

// 클립보드 토글 함수
function toggleClipboardContent() {
    const clipboardContent = document.querySelector('.clipboard-content');
    if (clipboardContent) {
        clipboardContent.classList.toggle('collapsed');
        
        // 토글 버튼 텍스트 업데이트
        const toggleBtn = document.querySelector('.toggle-clipboard-btn');
        if (toggleBtn) {
            toggleBtn.textContent = clipboardContent.classList.contains('collapsed') ? '펼치기' : '접기';
        }
    }
}

// setMemoStatus 함수 추가
function setMemoStatus(listId, memoId, status, isTemporary = false) {
    const list = isTemporary ? 
        temporaryLists.find(l => l.id === listId) : 
        lists.find(l => l.id === listId);
    
    if (!list) return;
    
    const memo = list.memos.find(m => m.id === memoId);
    if (!memo) return;
    
    if (!checkAuthorPermission(list, memo)) {
        showNotification('해당당 메모의 상태는 변경할 수 없습니다.', 'statusBtn');
        return;
    }
    
    // 현재 상태와 동일하면 상태 제거, 다르면 설정
    memo.status = memo.status === status ? null : status;
    
    // 변경 사항 저장
    if (isTemporary) {
        saveTemporaryLists();
    } else {
        saveLists();
    }

    // UI 업데이트
    const memoElement = document.querySelector(`.list-item[data-list-id="${listId}"] .memo-item[data-memo-id="${memoId}"]`);
    if (memoElement) {
        // 상태 아이콘 업데이트
        const statusDisplay = memoElement.querySelector('.memo-status-display');
        if (statusDisplay) {
            const statusIcon = memo.status === 'success' ? '✅' : 
                             memo.status === 'fail' ? '❌' : '';
            
            if (statusIcon) {
                // CSS 클래스를 포함하여 상태 아이콘 업데이트
                const statusClass = memo.status === 'success' ? 'status-success' : 
                                   memo.status === 'fail' ? 'status-fail' : '';
                statusDisplay.innerHTML = `<span class="status-icon ${statusClass}">${statusIcon}</span>`;
            } else {
                statusDisplay.innerHTML = '';
            }
        }
        
        // 상태 버튼 활성화 상태 업데이트
        const successBtn = memoElement.querySelector('.success-btn');
        const failBtn = memoElement.querySelector('.fail-btn');
        
        if (successBtn) {
            successBtn.classList.toggle('active', memo.status === 'success');
        }
        
        if (failBtn) {
            failBtn.classList.toggle('active', memo.status === 'fail');
        }
    }
}

// 메모 편집 취소 함수 추가
function cancelMemoEdit(listId, memoId, isTemporary = false) {
    try {
        console.log(`메모 편집 취소: listId=${listId}, memoId=${memoId}, isTemporary=${isTemporary}`);
        
        // DOM에서 메모 찾기
        const memoItem = document.querySelector(`.memo-item[data-memo-id="${memoId}"]`);
        if (!memoItem) {
            console.error('메모 항목 DOM 요소를 찾을 수 없습니다:', memoId);
            editingMemoId = null;
            return;
        }
        
        // 1. 메모 내용 다시 표시
        const memoContent = memoItem.querySelector('.memo-content');
        if (memoContent) {
            memoContent.style.display = '';
        }
        
        // 2. 편집 섹션 제거
        const editSection = memoItem.querySelector('.memo-edit-section');
        if (editSection) {
            editSection.remove();
        }
        
        // 3. 편집 모드 클래스 제거
        memoItem.classList.remove('editing');
        
        // 전역 편집 상태 초기화
        editingMemoId = null;
        console.log('메모 편집 취소 완료');
        
    } catch (error) {
        console.error('메모 편집 취소 중 오류 발생:', error);
    }
}

// 기존 데이터 마이그레이션 함수 추가
function migrateExistingData() {
    // 생성 시간이 없는 목록에 시간 추가
    lists.forEach(list => {
        if (!list.createdAt) {
            list.createdAt = new Date().toISOString();
        }
    });
    
    temporaryLists.forEach(list => {
        if (!list.createdAt) {
            list.createdAt = new Date().toISOString();
        }
    });
    
    saveLists();
    saveTemporaryLists();
}

// 상태를 승패 정보로 마이그레이션하는 함수 추가
function migrateStatusToWinLoss() {
    let migrationCount = 0;
    
    // 모든 메모를 순회하며 승패 정보가 없는 경우 상태에 따라 기본값 설정
    lists.forEach(list => {
        list.memos.forEach(memo => {
            if (!memo.hasOwnProperty('wins') || !memo.hasOwnProperty('losses')) {
                if (memo.status === 'success') {
                    memo.wins = 1;
                    memo.losses = 0;
                } else if (memo.status === 'fail') {
                    memo.wins = 0;
                    memo.losses = 1;
                } else {
                    memo.wins = 0;
                    memo.losses = 0;
                }
                migrationCount++;
            }
        });
    });
    
    temporaryLists.forEach(list => {
        list.memos.forEach(memo => {
            if (!memo.hasOwnProperty('wins') || !memo.hasOwnProperty('losses')) {
                if (memo.status === 'success') {
                    memo.wins = 1;
                    memo.losses = 0;
                } else if (memo.status === 'fail') {
                    memo.wins = 0;
                    memo.losses = 1;
                } else {
                    memo.wins = 0;
                    memo.losses = 0;
                }
                migrationCount++;
            }
        });
    });
    
    if (migrationCount > 0) {
        console.log(`${migrationCount}개의 메모에 승패 정보 마이그레이션 완료`);
        saveLists();
        saveTemporaryLists();
    }
}

// 임시 목록을 정규 목록으로 추가하는 함수
async function addTemporaryToLists() {
    if (temporaryLists.length === 0) {
        return;
    }
    
    // 임시 목록을 기존 목록에 추가 (제목 중복 → 덮어쓰기, id 중복 검사)
    temporaryLists.forEach(tempList => {
        const existingTitleIndex = lists.findIndex(list => list.title === tempList.title);
        if (existingTitleIndex !== -1) {
            lists[existingTitleIndex] = { ...tempList };
        } else {
            const existingIdIndex = lists.findIndex(list => list.id === tempList.id);
            if (existingIdIndex !== -1) {
                let newId;
                do {
                    newId = Date.now().toString() + Math.random().toString(16).slice(2);
                } while (lists.some(list => list.id === newId));
                lists.push({ ...tempList, id: newId });
            } else {
                lists.push({ ...tempList });
            }
        }
    });

    // IndexedDB에 저장
    await saveToIndexedDB('lists', lists);
    
    // 임시 목록 초기화 및 로컬스토리지에서 삭제
    temporaryLists = [];
    saveTemporaryLists();
    
    // 참고 URL 입력창 초기화
    const referenceUrlInput = document.getElementById('referenceUrlInput');
    if (referenceUrlInput) {
        referenceUrlInput.value = '';
    }
    
    // UI 업데이트
    renderLists();
    renderTemporaryLists();
    showNotification('기존 목록에 추가되었습니다', 'addTemporaryBtn');
    updateStats();
}

// 메모 아이콘 확인 함수
function checkMemoIcon(memoElement) {
    if (!memoElement) return;
    
    const memoId = memoElement.dataset.memoId;
    const listId = memoElement.closest('.list-item').dataset.listId;
    const isTemporary = memoElement.closest('.temporary-section') !== null;
    
    const targetLists = isTemporary ? temporaryLists : lists;
    const list = targetLists.find(l => l.id.toString() === listId.toString());
    if (!list) return;
    
    const memo = list.memos.find(m => m.id.toString() === memoId.toString());
    if (!memo) return;
    
    // 상태 아이콘 업데이트
    const statusDisplay = memoElement.querySelector('.memo-status-display');
    if (statusDisplay) {
        const statusIcon = memo.status === 'success' ? '✅' : 
                         memo.status === 'fail' ? '❌' : '';
        
        if (statusIcon) {
            // CSS 클래스를 포함하여 상태 아이콘 업데이트
            const statusClass = memo.status === 'success' ? 'status-success' : 
                              memo.status === 'fail' ? 'status-fail' : '';
            statusDisplay.innerHTML = `<span class="status-icon ${statusClass}">${statusIcon}</span>`;
        } else {
            statusDisplay.innerHTML = '';
        }
    }
}

// 페이지 로드 시 클립보드 초기화 함수
function initializeClipboard() {
    // 클립보드 컨텐츠 초기 상태를 펼친 상태로 설정
    const clipboardContent = document.querySelector('.clipboard-content');
    if (clipboardContent) {
        clipboardContent.classList.remove('collapsed');
        
        // 토글 버튼 텍스트 설정
        const toggleBtn = document.querySelector('.toggle-clipboard-btn');
        if (toggleBtn) {
            toggleBtn.textContent = '접기';
        }
    }
    
    // 클립보드 아이템 로드
    loadClipboardItems();
    
    // 클립보드 토글 버튼 이벤트 리스너 추가
    const toggleClipboardBtn = document.querySelector('.toggle-clipboard-btn');
    if (toggleClipboardBtn) {
        // 기존 이벤트 리스너 제거 후 다시 추가
        toggleClipboardBtn.removeEventListener('click', toggleClipboardContent);
        toggleClipboardBtn.addEventListener('click', toggleClipboardContent);
    }
}

// 페이지 로드 시 이벤트 리스너를 등록하는 함수 (DOMContentLoaded에서 호출될 예정)
function setupSearchInputEvents() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('addListBtn');
    
    if (searchInput && searchBtn) {
        searchBtn.addEventListener('click', async () => {
            const query = searchInput.value.trim();
            if (query) {
                await searchLists(query);
            }
        });

        // 목록 검색용 추천 단어 이벤트
        searchInput.addEventListener('input', function(e) {
            const cursor = this.selectionStart;
            const value = this.value.slice(0, cursor);
            const words = value.split(' ');
            const currentWord = words[words.length - 1];
            if (currentWord && currentWord.length > 0) {
                renderListSuggestions(this, currentWord);
            } else {
                removeSuggestionBox();
            }
        });

        // 추천단어 키보드 네비게이션
        searchInput.addEventListener('keydown', function(e) {
            const box = document.getElementById('suggestionBox');
            if (!box || !box.children.length) return;

            if (e.key === 'ArrowDown' || e.key === 'Tab') {
                e.preventDefault();
                const items = box.querySelectorAll('.suggestion-item');
                const currentIndex = Array.from(items).findIndex(item => item.classList.contains('selected'));
                const nextIndex = (currentIndex + 1) % items.length;
                
                items.forEach(item => item.classList.remove('selected'));
                items[nextIndex].classList.add('selected');
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                const items = box.querySelectorAll('.suggestion-item');
                const currentIndex = Array.from(items).findIndex(item => item.classList.contains('selected'));
                const prevIndex = (currentIndex - 1 + items.length) % items.length;
                
                items.forEach(item => item.classList.remove('selected'));
                items[prevIndex].classList.add('selected');
            } else if (e.key === ' ') {
                e.preventDefault();
                const selectedItem = box.querySelector('.suggestion-item.selected');
                if (selectedItem) {
                    const selectedWord = selectedItem.textContent.trim();
                    const words = this.value.split(' ');
                    words[words.length - 1] = selectedWord;
                    this.value = words.join(' ') + ' ';
                    removeSuggestionBox();
                }
            }
        });

        // 포커스 아웃 시 추천단어 박스 제거
        searchInput.addEventListener('blur', function() {
            setTimeout(removeSuggestionBox, 100);
        });
    }
}

function updateMemoSuggestionBox() {
    const box = document.getElementById('memoSuggestionBox');
    if (!box) return;
    box.querySelectorAll('.memo-suggestion-item').forEach((item, idx) => {
        if (idx === memoSuggestionIndex) {
            item.classList.add('selected');
            item.style.background = '#e6f0fa';
        } else {
            item.classList.remove('selected');
            item.style.background = '';
        }
    });
}

// 권한 체크 함수 추가
function checkAdminPermission(user) {
    return user && user.email === 'longway7098@gmail.com';
}

// UI 업데이트 함수 추가
function updateUIForUser(user) {
    const isAdmin = checkAdminPermission(user);
    const searchInput = document.getElementById('searchInput');
    const addListBtn = document.getElementById('addListBtn');
    const addTemporaryBtn = document.getElementById('addTemporaryBtn');
    const deleteFirebaseBtn = document.getElementById('deleteFirebaseBtn');
    
    // 검색 입력창과 추가 버튼 표시/숨김
    if (searchInput && addListBtn) {
        searchInput.style.display = 'block';
        addListBtn.style.display = 'block';
    }
    
    // 기존목록 추가 버튼 표시/숨김
    if (addTemporaryBtn) {
        addTemporaryBtn.style.display = 'block';
    }

    // Firebase 데이터 삭제 버튼 표시/숨김 (관리자만)
    if (deleteFirebaseBtn) {
        deleteFirebaseBtn.style.display = isAdmin ? 'block' : 'none';
    }
    
    // 모든 메모 입력창 표시
    document.querySelectorAll('input[type="text"][id^="newMemoInput-"]').forEach(input => {
        input.style.display = 'block';
    });
    
    // 모든 메모 추가 버튼 표시
    document.querySelectorAll('button[onclick^="addMemo"]').forEach(button => {
        button.style.display = 'block';
    });
}

// Firebase Auth 상태 변경 시 UI 업데이트
firebase.auth().onAuthStateChanged((user) => {
    const loginStatus = document.getElementById('loginStatus');
    const lastUploadTimeDisplay = document.getElementById('lastUploadTimeDisplay');
    const mainContainer = document.getElementById('mainContainer');
    
    if (user) {
        // 관리자 계정일 경우에만 이메일 표시
        if (user.email === 'longway7098@gmail.com') {
            loginStatus.textContent = user.email;
        } else {
            loginStatus.textContent = '일반 사용자';
        }
        if (mainContainer) mainContainer.style.display = '';
        if (lastUploadTimeDisplay) lastUploadTimeDisplay.style.display = '';
    } else {
        loginStatus.textContent = '일반 사용자';
        if (mainContainer) mainContainer.style.display = '';
        if (lastUploadTimeDisplay) lastUploadTimeDisplay.style.display = 'none';
    }
    updateUIForUser(user);
});

// 메모와 참고자료까지 모두 포함하여 deep copy
function deepCopyWithComments(arr) {
    return arr.map(list => ({
        ...list,
        memos: (list.memos || []).map(memo => ({
            ...memo,
            comments: memo.comments ? memo.comments.map(comment => ({ ...comment })) : []
        }))
    }));
}

async function exportLists() {
    try {
        // IndexedDB에서 데이터 불러오기
        const indexedLists = await loadFromIndexedDB('lists');
        const indexedTempLists = await loadFromIndexedDB('temporaryLists');
        // deep copy로 comments까지 모두 포함
        const listsToExport = deepCopyWithComments(indexedLists);
        const tempListsToExport = deepCopyWithComments(indexedTempLists);
        const exportData = {
            lists: listsToExport,
            temporaryLists: tempListsToExport,
            exportDate: new Date().toISOString(),
            version: '1.2'
        };
        const jsonString = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `방덱목록_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showNotification('내보내기 완료!', 'exportJsonBtn');
    } catch (error) {
        console.error('JSON 내보내기 오류:', error);
        showNotification('내보내기 실패', 'exportJsonBtn');
    }
}

// 랜덤 ID 생성 함수
function generateRandomId() {
    return Date.now().toString() + Math.random().toString(36).substring(2, 9);
}

// ID 변경 함수
async function changeListId(listId) {
    try {
        // 현재 메모 섹션이 열린 목록 찾기
        const listElement = document.querySelector(`[data-list-id="${listId}"] .memo-section[style*="display: block"]`);
        if (!listElement) {
            console.error('열린 메모 섹션을 찾을 수 없습니다.');
            return;
        }

        // 임시 목록에서 해당 목록 찾기
        const list = temporaryLists.find(l => l.id === listId);
        if (!list) {
            console.error('임시 목록을 찾을 수 없습니다.');
            return;
        }

        // 새로운 랜덤 ID 생성 (중복 확인)
        let newId;
        do {
            newId = generateRandomId();
        } while (
            temporaryLists.some(l => l.id === newId) || 
            lists.some(l => l.id === newId)
        );

        // 목록의 ID 변경
        list.id = newId;

        // UI 업데이트
        const oldListElement = document.querySelector(`[data-list-id="${listId}"]`);
        if (oldListElement) {
            // 새 ID로 데이터 속성 업데이트
            oldListElement.setAttribute('data-list-id', newId);

            // 관련된 모든 요소의 ID와 이벤트 핸들러 업데이트
            const elementsToUpdate = {
                'editSection': 'editSection-',
                'editListInput': 'editListInput-',
                'memoSection': 'memoSection-',
                'newMemoInput': 'newMemoInput-'
            };

            for (const [key, prefix] of Object.entries(elementsToUpdate)) {
                const element = oldListElement.querySelector(`#${prefix}${listId}`);
                if (element) {
                    element.id = `${prefix}${newId}`;
                }
            }

            // 버튼들의 onclick 이벤트 업데이트
            const editBtn = oldListElement.querySelector('.edit-btn');
            if (editBtn) {
                editBtn.setAttribute('onclick', `event.stopPropagation(); startEditList('${newId}', true)`);
            }

            const deleteBtn = oldListElement.querySelector('.delete-btn');
            if (deleteBtn) {
                deleteBtn.setAttribute('onclick', `event.stopPropagation(); deleteList('${newId}', true)`);
            }

            const addMemoBtn = oldListElement.querySelector('.input-group button');
            if (addMemoBtn) {
                addMemoBtn.setAttribute('onclick', `addMemo('${newId}', true)`);
            }

            const memoInput = oldListElement.querySelector(`#newMemoInput-${newId}`);
            if (memoInput) {
                memoInput.setAttribute('onkeypress', `if(event.key === 'Enter') addMemo('${newId}', true)`);
            }

            // 목록 제목 클릭 이벤트 업데이트
            const titleElement = oldListElement.querySelector('.list-title');
            if (titleElement) {
                titleElement.setAttribute('onclick', `toggleMemos('${newId}')`);
            }
        }

        // 성공 메시지 표시
        showNotification('목록 ID가 성공적으로 변경되었습니다.', 'changeIdSection');

        // 변경된 ID를 표시
        const currentListIdDisplay = document.getElementById('currentListIdDisplay');
        if (currentListIdDisplay) {
            currentListIdDisplay.textContent = `현재 목록 ID: ${newId}`;
        }
    } catch (error) {
        console.error('ID 변경 중 오류 발생:', error);
        showNotification('ID 변경 중 오류가 발생했습니다.', 'changeIdSection');
    }
}

// 이벤트 리스너 등록 (DOMContentLoaded 이벤트 내부에 추가)
document.addEventListener('DOMContentLoaded', function() {
    // 이벤트 위임을 사용한 동적 이벤트 처리
    document.addEventListener('click', function(e) {
        // 메모 추가 버튼 클릭 이벤트 처리
        if (e.target.classList.contains('add-memo-btn')) {
            const listId = e.target.getAttribute('data-listid');
            const isTemporary = e.target.getAttribute('data-istemporary') === 'true';
            const inputId = `newMemoInput-${listId}`;
            const memoInput = document.getElementById(inputId);
            
            if (memoInput && memoInput.value.trim() !== '') {
                addMemo(listId, isTemporary);
            } else {
                showNotification('메모내용을 입력해주세요.', inputId);
            }
        }
        
        // 방덱 편집 버튼 클릭 이벤트 처리
        if (e.target.classList.contains('edit-btn') && e.target.hasAttribute('data-edit-list')) {
            e.stopPropagation();
            const listId = e.target.getAttribute('data-edit-list');
            const isTemporary = e.target.getAttribute('data-istemporary') === 'true';
            startEditList(listId, isTemporary);
        }
        
        // 방덱 삭제 버튼 클릭 이벤트 처리
        if (e.target.classList.contains('delete-btn') && e.target.hasAttribute('data-delete-list')) {
            e.stopPropagation();
            const listId = e.target.getAttribute('data-delete-list');
            const isTemporary = e.target.getAttribute('data-istemporary') === 'true';
            if (confirm('정말로 이 방덱을 삭제하시겠습니까?')) {
                deleteList(listId, isTemporary);
            }
        }
        
        // 방덱 편집 저장 버튼 클릭 이벤트 처리
        if (e.target.classList.contains('save-btn') && e.target.hasAttribute('data-save-list-edit')) {
            const listId = e.target.getAttribute('data-save-list-edit');
            const isTemporary = e.target.getAttribute('data-istemporary') === 'true';
            saveListEdit(listId, isTemporary);
        }
        
        // 방덱 편집 취소 버튼 클릭 이벤트 처리
        if (e.target.classList.contains('cancel-btn') && e.target.hasAttribute('data-cancel-list-edit')) {
            const listId = e.target.getAttribute('data-cancel-list-edit');
            const isTemporary = e.target.getAttribute('data-istemporary') === 'true';
            cancelListEdit(listId, isTemporary);
        }
        
        // 방덱 제목 클릭 시 메모 토글 처리
        if (e.target.closest('.list-title')) {
            const listTitle = e.target.closest('.list-title');
            const listId = listTitle.getAttribute('data-list-id');
            const isTemporary = listTitle.getAttribute('data-istemporary') === 'true';
            toggleMemos(listId, isTemporary);
        }
    });

    // 방덱 편집 입력창에서 엔터 키 처리
    document.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && e.target.matches('input[type="text"][id^="editListInput-"]')) {
            const listId = e.target.id.replace('editListInput-', '');
            const isTemporary = e.target.closest('.temporary-list') !== null;
            saveListEdit(listId, isTemporary);
        }
    });

    // ID 변경 버튼 이벤트 리스너
    const changeListIdBtn = document.getElementById('changeListIdBtn');
    if (changeListIdBtn) {
        changeListIdBtn.addEventListener('click', function() {
            // 현재 열린 메모 섹션을 가진 목록 찾기
            const openMemoSection = document.querySelector('.memo-section[style*="display: block"]');
            if (openMemoSection) {
                const listElement = openMemoSection.closest('.list-item');
                if (listElement) {
                    const listId = listElement.getAttribute('data-list-id');
                    if (listId) {
                        changeListId(listId);
                    }
                }
            } else {
                showNotification('ID를 변경할 목록을 먼저 선택해주세요.', 'changeIdSection');
            }
        });
    }
});

// DOMContentLoaded 이벤트에 스타일 추가
document.addEventListener('DOMContentLoaded', function() {
    // ... existing code ...

    // ID 변경 섹션 스타일 추가
    const style = document.createElement('style');
    style.textContent = `
        #changeIdSection {
            text-align: center;
            padding: 10px;
            margin-top: 10px;
            background-color: #f8f9fa;
            border-radius: 5px;
        }

        #changeListIdBtn {
            background-color: #6c757d;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            transition: background-color 0.2s;
        }

        #changeListIdBtn:hover {
            background-color: #5a6268;
        }

        #changeListIdBtn:active {
            background-color: #545b62;
        }
    `;
    document.head.appendChild(style);

    // ... existing code ...
});

// 모든 메모에서 단어 추출
function getAllMemoWords() {
    const wordSet = new Set();
    // 정규 목록의 제목에서 단어 추출
    lists.forEach(list => {
        list.title.split(' ').forEach(word => {
                if (word.trim()) wordSet.add(word.trim());
            });
        });
    // 임시 목록의 제목에서도 단어 추출 (선택적으로 포함)
    temporaryLists.forEach(list => {
        list.title.split(' ').forEach(word => {
                if (word.trim()) wordSet.add(word.trim());
        });
    });
    return Array.from(wordSet);
}

// 추천 단어 목록 렌더링
function renderMemoSuggestions(input, currentWord) {
    // 입력값이 비어있으면 추천단어 표시하지 않음
    if (!currentWord || currentWord.trim() === '') {
        removeMemoSuggestionBox();
        return;
    }
    // 추천 단어 추출 (메모 내용 기반)
    memoSuggestionWords = getAllMemoContentWords().filter(word =>
        word.toLowerCase().startsWith(currentWord.toLowerCase()) && word !== currentWord
    );
    memoSuggestionList = memoSuggestionWords;
    memoSuggestionIndex = memoSuggestionWords.length > 0 ? 0 : -1;
    memoSuggestionActiveInput = input;

    // 기존 추천 목록 제거
    let suggestionBox = document.getElementById('memoSuggestionBox');
    if (suggestionBox) suggestionBox.remove();

    if (memoSuggestionWords.length === 0) return;

    // 추천 목록 박스 생성
    suggestionBox = document.createElement('div');
    suggestionBox.id = 'memoSuggestionBox';
    suggestionBox.style.position = 'absolute';
    suggestionBox.style.background = '#fff';
    suggestionBox.style.border = '1px solid #ccc';
    suggestionBox.style.borderRadius = '6px';
    suggestionBox.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
    suggestionBox.style.zIndex = 10001;
    suggestionBox.style.fontSize = '14px';
    suggestionBox.style.minWidth = input.offsetWidth + 'px';
    suggestionBox.style.maxHeight = '180px';
    suggestionBox.style.overflowY = 'auto';
    suggestionBox.style.left = input.getBoundingClientRect().left + window.scrollX + 'px';
    suggestionBox.style.top = input.getBoundingClientRect().bottom + window.scrollY + 2 + 'px';

    suggestionBox.innerHTML = memoSuggestionWords.map((word, idx) =>
        `<div class="memo-suggestion-item${idx === memoSuggestionIndex ? ' selected' : ''}" data-idx="${idx}" style="padding:6px 12px; cursor:pointer;${idx === memoSuggestionIndex ? 'background:#e6f0fa;' : ''}">${word}</div>`
    ).join('');

    document.body.appendChild(suggestionBox);

    // 마우스 클릭으로 선택
    suggestionBox.querySelectorAll('.memo-suggestion-item').forEach(item => {
        item.addEventListener('mousedown', function(e) {
            e.preventDefault();
            selectMemoSuggestion(parseInt(this.dataset.idx));
        });
    });
}

// 추천 단어 선택 시 입력창 단어 대체
function selectMemoSuggestion(idx) {
    if (!memoSuggestionActiveInput) return;
    const input = memoSuggestionActiveInput;
    
    const value = input.value;
    const cursor = input.selectionStart;
    
    // 현재 커서 위치에서 왼쪽으로 이동하며 공백을 만날 때까지의 단어 찾기
    let currentWordStart = cursor;
    while (currentWordStart > 0 && value[currentWordStart - 1] !== ' ') {
        currentWordStart--;
    }
    
    const previousInput = value.slice(0, currentWordStart);
    const currentWord = value.slice(currentWordStart, cursor);
    const remainingInput = value.slice(cursor);

    // 새 값 구성
    const selectedWord = memoSuggestionList[idx];
    const newValue = previousInput + selectedWord + ' ' + remainingInput;

    // IME 조합 상태를 강제 종료하고 값 설정
    input.blur();  // 조합 종료 유도
    input.value = newValue;
    input.setSelectionRange(
        previousInput.length + selectedWord.length + 1,
        previousInput.length + selectedWord.length + 1
    );
    input.focus(); // 다시 포커스 줘서 커서 복원

    // 추천어 관련 상태 초기화
    memoSuggestionWords = [];
    memoSuggestionIndex = [];
    memoSuggestionList = [];
    memoSuggestionActiveInput = null;
    removeMemoSuggestionBox();

    // 필요 시 input 이벤트만 트리거 (keydown 등은 생략)
    const inputEvent = new InputEvent('input', {
        inputType: 'insertText',
        data: ' ',
        bubbles: true,  // 필요에 따라 true로 설정
        cancelable: true
    });
    input.dispatchEvent(inputEvent);
}


function removeMemoSuggestionBox() {
    const box = document.getElementById('memoSuggestionBox');
    if (box) box.remove();
    memoSuggestionWords = [];
    memoSuggestionIndex = -1;
    memoSuggestionList = [];
    memoSuggestionActiveInput = null;
}

document.addEventListener('DOMContentLoaded', function() {
    // ... existing code ...

    // firebase데이터 삭제 버튼 이벤트 리스너 추가
    const deleteBtn = document.getElementById('deleteFirebaseBtn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', async function() {
            const input = prompt('정말로 Firebase 데이터를 삭제하시려면 숫자 3578을 입력하세요.\n이 작업은 되돌릴 수 없습니다!');
            if (input === '3578') {
                try {
                    // 메타데이터 로드
                    const metadataDoc = await db.collection('lists').doc('metadata').get();
                    if (metadataDoc.exists) {
                        const metadata = metadataDoc.data();
                        const totalBatches = metadata.totalBatches;

                        // 모든 배치 데이터 삭제
                        for (let i = 1; i <= totalBatches; i++) {
                            await db.collection('lists').doc(`batch_${i}`).delete();
                        }
                    }

                    // 메타데이터와 임시 목록 삭제
                    await db.collection('lists').doc('metadata').delete();
                    await db.collection('lists').doc('temporary').delete();
                    
                    showNotification('Firebase 데이터가 완전히 삭제되었습니다.', 'deleteFirebaseBtn');
                } catch (error) {
                    showNotification('삭제 실패: ' + error.message, 'deleteFirebaseBtn');
                }
            } else if (input !== null) {
                showNotification('잘못된 숫자입니다. 삭제가 취소되었습니다.', 'deleteFirebaseBtn');
            }
        });
    }
});

// ... existing code ...
document.addEventListener('DOMContentLoaded', function() {
    // ... existing code ...
});
// ... existing code ...

// 작성자 권한 체크 함수 추가
function checkAuthorPermission(list, memo = null) {
    // 현재 로그인한 사용자 확인
    const user = firebase.auth().currentUser;
    
    // 관리자 계정인 경우 바로 true 반환
    if (user && user.email === 'longway7098@gmail.com') {
        return true;
    }
    
    // 목록이 "섬세포분열"이 작성한 경우
    if (list.author === '섬세포분열') {
        // 메모가 있는 경우
        if (memo) {
            // 메모가 "외부 사용자"가 작성한 경우에만 수정/삭제 가능
            if (memo.author === '외부 사용자') {
                return true;
            }
            // 그 외의 경우는 수정/삭제 불가
            showNotification('해당 메모는 수정/삭제할 수 없습니다.', 'editMemoBtn');
            return false;
        }
        // 목록 자체는 수정/삭제 불가
        showNotification('해당 목록은 수정/삭제할 수 없습니다.', 'editListBtn');
        return false;
    }
    
    // 목록이 "외부 사용자"가 작성한 경우
    if (list.author === '외부 사용자') {
        // 메모가 있는 경우
        if (memo) {
            // 메모가 "외부 사용자"가 작성한 경우에만 수정/삭제 가능
            if (memo.author === '외부 사용자') {
                return true;
            }
            // 그 외의 경우는 수정/삭제 불가
            showNotification('해당 메모는 수정/삭제할 수 없습니다.', 'editMemoBtn');
            return false;
        }
        // 목록 자체는 수정/삭제 가능
        return true;
    }
    
    // 그 외의 경우는 수정/삭제 불가
    return false;
}

// IndexedDB 초기화
const dbName = 'listAppDB';
const dbVersion = 1;

function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, dbVersion);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            
            // 저장소 생성 - 자동 증가 키 사용
            if (!db.objectStoreNames.contains('lists')) {
                db.createObjectStore('lists', { keyPath: 'id', autoIncrement: true });
            }
            if (!db.objectStoreNames.contains('temporaryLists')) {
                db.createObjectStore('temporaryLists', { keyPath: 'id', autoIncrement: true });
            }
        };
    });
}

// IndexedDB에 데이터 저장
async function saveToIndexedDB(storeName, data) {
    try {
        const db = await initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            
            // 기존 데이터 삭제
            store.clear();
            
            // 데이터가 배열인 경우 각 항목을 개별적으로 저장
            if (Array.isArray(data)) {
                const promises = data.map(item => {
                    return new Promise((resolveItem, rejectItem) => {
                        // 각 항목에 고유 ID 추가
                        const itemWithId = {
                            ...item,
                            id: item.id || Date.now().toString() + Math.random().toString(16).slice(2)
                        };
                        const request = store.add(itemWithId);
                        request.onsuccess = () => resolveItem();
                        request.onerror = () => rejectItem(request.error);
                    });
                });
                
                Promise.all(promises)
                    .then(() => resolve())
                    .catch(error => reject(error));
            } else {
                reject(new Error('데이터는 배열이어야 합니다.'));
            }
        });
    } catch (error) {
        console.error('IndexedDB 저장 오류:', error);
        throw error;
    }
}

// IndexedDB에서 데이터 로드
async function loadFromIndexedDB(storeName) {
    try {
        const db = await initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();
            
            request.onsuccess = () => {
                const result = request.result;
                resolve(result || []);
            };
            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.error('IndexedDB 로드 오류:', error);
        throw error;
    }
}
// 메모 편집 저장 함수 추가
function saveMemoEdit(listId, memoId, isTemporary = false) {
    try {
        const memoItem = document.querySelector(`.memo-item[data-memo-id="${memoId}"]`);
        if (!memoItem) {
            console.error('메모 항목을 찾을 수 없습니다:', memoId);
            return;
        }

        const textInput = memoItem.querySelector('.edit-memo-input');
        if (!textInput) {
            console.error('편집 입력 필드를 찾을 수 없습니다:', memoId);
            return;
        }

        const newText = textInput.value.trim();
        if (!newText) {
            alert('메모 내용을 입력해주세요.');
            return;
        }

        const targetLists = isTemporary ? temporaryLists : lists;
        const list = targetLists.find(l => l.id === listId);
        if (!list) {
            console.error('목록을 찾을 수 없습니다:', listId);
            return;
        }

        const memo = list.memos.find(m => m.id === memoId);
        if (!memo) {
            console.error('메모를 찾을 수 없습니다:', memoId);
            return;
        }

        if (!checkAuthorPermission(list, memo)) {
            showNotification('해당 메모는 수정할 수 없습니다.', 'editMemoBtn');
            return;
        }

        memo.text = newText;

        // 변경사항 저장
        if (isTemporary) {
            saveTemporaryLists();
        } else {
            saveLists();
        }

        // UI 업데이트
        const memoContent = memoItem.querySelector('.memo-content');
        if (memoContent) {
            memoContent.style.display = '';
        }

        const editSection = memoItem.querySelector('.memo-edit-section');
        if (editSection) {
            editSection.remove();
        }

        // 메모 목록 다시 렌더링
        updateMemoListUI(listId, list.memos, isTemporary);

        // 편집 상태 초기화
        editingMemoId = null;

    } catch (error) {
        console.error('메모 편집 저장 중 오류 발생:', error);
        alert('메모 저장 중 오류가 발생했습니다.');
    }
}

// 메모 입력 이벤트 리스너 추가 함수
function addMemoInputListeners(memoInput, listId, isTemporary) {
    if (!memoInput) return;

    // 기존 이벤트 리스너 제거 (중복 방지)
    const newInput = memoInput.cloneNode(true);
    memoInput.parentNode.replaceChild(newInput, memoInput);
    
    // 메모 입력용 추천 단어 이벤트
    newInput.addEventListener('input', function(e) {
        const cursor = this.selectionStart;
        const value = this.value.slice(0, cursor);
        const words = value.split(' ');
        const currentWord = words[words.length - 1];
        if (currentWord && currentWord.length > 0) {
            renderMemoContentSuggestions(this, currentWord);
        } else {
            removeMemoSuggestionBox();
        }
    });

    // 추천단어 키보드 네비게이션 및 선택
    newInput.addEventListener('keydown', function(e) {
        const box = document.getElementById('memoSuggestionBox');
        if (!box) return;
        const items = box.querySelectorAll('.memo-suggestion-item');
        if (items.length === 0) return;
        let selectedIndex = Array.from(items).findIndex(item => item.classList.contains('selected'));
        if (e.key === 'ArrowDown' || e.key === 'Tab') {
            e.preventDefault();
            selectedIndex = (selectedIndex + 1) % items.length;
            items.forEach((item, idx) => {
                item.classList.toggle('selected', idx === selectedIndex);
                item.style.backgroundColor = idx === selectedIndex ? '#f0f0f0' : '';
            });
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedIndex = (selectedIndex - 1 + items.length) % items.length;
            items.forEach((item, idx) => {
                item.classList.toggle('selected', idx === selectedIndex);
                item.style.backgroundColor = idx === selectedIndex ? '#f0f0f0' : '';
            });
        } else if (e.key === ' ' || e.key === 'Spacebar' || e.key === 'Enter') {
            if (selectedIndex >= 0) {
                e.preventDefault();
                selectMemoSuggestion(selectedIndex);
            }
        }
    });

    // 키다운 이벤트 리스너
    newInput.addEventListener('keydown', function(event) {
        // Alt + ↑ 키 조합 처리 (승리 횟수 증가)
        if (event.altKey && !event.shiftKey && event.key === 'ArrowUp') {
            event.preventDefault();
            event.stopPropagation();
            
            // 현재 목록의 메모 목록 가져오기
            const targetList = isTemporary 
                ? temporaryLists.find(list => list.id === listId)
                : lists.find(list => list.id === listId);
                
            if (targetList && targetList.memos && targetList.memos.length > 0) {
                // 첫 번째 메모의 승리 횟수 증가
                const firstMemoId = targetList.memos[0].id;
                updateCounter(listId, firstMemoId, 'win', 1, isTemporary);
                
                // 성공 메시지 표시
                showNotification('첫 번째 메모의 승리 횟수가 증가했습니다.', newInput.id);
            }
            return;
        }
        
        // Alt + ↓ 키 조합 처리 (패배 횟수 증가)
        if (event.altKey && !event.shiftKey && event.key === 'ArrowDown') {
            event.preventDefault();
            event.stopPropagation();
            
            // 현재 목록의 메모 목록 가져오기
            const targetList = isTemporary 
                ? temporaryLists.find(list => list.id === listId)
                : lists.find(list => list.id === listId);
                
            if (targetList && targetList.memos && targetList.memos.length > 0) {
                // 첫 번째 메모의 패배 횟수 증가
                const firstMemo = targetList.memos[0];
                updateCounter(listId, firstMemo.id, 'loss', 1, isTemporary);
                showNotification('첫 번째 메모의 패배 횟수가 증가했습니다.', newInput.id);
            }
            return;
        }

        // Alt + Shift + ↑ 키 조합 처리 (승리 횟수 감소)
        if (event.altKey && event.shiftKey && event.key === 'ArrowUp') {
            event.preventDefault();
            event.stopPropagation();
            
            // 현재 목록의 메모 목록 가져오기
            const targetList = isTemporary 
                ? temporaryLists.find(list => list.id === listId)
                : lists.find(list => list.id === listId);
                
            if (targetList && targetList.memos && targetList.memos.length > 0) {
                // 첫 번째 메모의 승리 횟수 감소
                const firstMemoId = targetList.memos[0].id;
                updateCounter(listId, firstMemoId, 'win', -1, isTemporary);
                
                // 성공 메시지 표시
                showNotification('첫 번째 메모의 승리 횟수가 감소했습니다.', newInput.id);
            }
            return;
        }
        
        // Alt + Shift + ↓ 키 조합 처리 (패배 횟수 감소)
        if (event.altKey && event.shiftKey && event.key === 'ArrowDown') {
            event.preventDefault();
            event.stopPropagation();
            
            // 현재 목록의 메모 목록 가져오기
            const targetList = isTemporary 
                ? temporaryLists.find(list => list.id === listId)
                : lists.find(list => list.id === listId);
                
            if (targetList && targetList.memos && targetList.memos.length > 0) {
                // 첫 번째 메모의 패배 횟수 감소
                const firstMemo = targetList.memos[0];
                updateCounter(listId, firstMemo.id, 'loss', -1, isTemporary);
                showNotification('첫 번째 메모의 패배 횟수가 감소했습니다.', newInput.id);
            }
            return;
        }
        
        // 클립보드 단축키 처리
        handleClipboardShortcut(event, this);
    });

    // 엔터 키 이벤트
    newInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            event.stopPropagation(); // 이벤트 버블링 방지
            addMemo(listId, isTemporary);
        }
    });
    
    // 클립보드 단축키 리스너 추가
    addClipboardShortcutListener(newInput);
    
    // 포커스 이벤트 추가
    newInput.addEventListener('focus', function() {
        this.select();
    });
    
    // 즉시 포커스 주기
    setTimeout(() => {
        newInput.focus();
    }, 0);
    
    return newInput; // 새로운 요소 반환
}

// 메모 정렬 함수 추가
function sortMemosByAlphabetical(memos) {
    return [...memos].sort((a, b) => a.text.localeCompare(b.text, 'ko'));
}

// 목록 검색용 추천 단어 추출 함수
function getAllListWords() {
    const wordSet = new Set();
    lists.forEach(list => {
        list.title.split(' ').forEach(word => {
            if (word.trim()) wordSet.add(word.trim());
        });
    });
    temporaryLists.forEach(list => {
        list.title.split(' ').forEach(word => {
            if (word.trim()) wordSet.add(word.trim());
        });
    });
    return Array.from(wordSet);
}

// 메모 입력용 추천 단어 추출 함수
function getAllMemoContentWords() {
    const words = new Set();
    [...lists, ...temporaryLists].forEach(list => {
        if (list.memos) {
            list.memos.forEach(memo => {
                if (memo.text) {
                    const memoWords = memo.text.split(/\s+/).filter(word => word.length > 0);
                    memoWords.forEach(word => words.add(word));
                }
            });
        }
    });
    return Array.from(words);
}

// 목록 검색용 추천 단어 표시 함수
function renderListSuggestions(input, currentWord) {
    if (!currentWord || currentWord.trim() === '') {
        removeSuggestionBox();
        return;
    }

    const suggestionWords = getAllListWords().filter(word =>
        word.toLowerCase().startsWith(currentWord.toLowerCase()) && word !== currentWord
    );

    if (suggestionWords.length === 0) {
        removeSuggestionBox();
        return;
    }

    let suggestionBox = document.getElementById('suggestionBox');
    if (suggestionBox) suggestionBox.remove();

    suggestionBox = document.createElement('div');
    suggestionBox.id = 'suggestionBox';
    suggestionBox.style.position = 'absolute';
    suggestionBox.style.background = '#fff';
    suggestionBox.style.border = '1px solid #ccc';
    suggestionBox.style.borderRadius = '6px';
    suggestionBox.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
    suggestionBox.style.zIndex = '1000';
    suggestionBox.style.minWidth = input.offsetWidth + 'px';
    suggestionBox.style.maxHeight = '200px';
    suggestionBox.style.overflowY = 'auto';
    suggestionBox.style.left = input.getBoundingClientRect().left + 'px';
    suggestionBox.style.top = (input.getBoundingClientRect().bottom + window.scrollY) + 'px';

    suggestionBox.innerHTML = suggestionWords.map((word, index) => `
        <div class="suggestion-item${index === 0 ? ' selected' : ''}" 
             data-index="${index}" 
             style="padding: 8px 12px; cursor: pointer; ${index === 0 ? 'background-color: #f0f0f0;' : ''}">
            ${word}
        </div>
    `).join('');

    document.body.appendChild(suggestionBox);

    // 마우스 클릭 이벤트
    suggestionBox.addEventListener('mousedown', function(e) {
        const item = e.target.closest('.suggestion-item');
        if (item) {
            const index = parseInt(item.dataset.index);
            selectListSuggestion(index);
        }
    });
}

// 메모 입력용 추천 단어 표시 함수
function renderMemoContentSuggestions(input, currentWord) {
    if (!currentWord || currentWord.length === 0) {
        removeMemoSuggestionBox();
        return;
    }

    const words = getAllMemoContentWords();
    const suggestions = words.filter(word => 
        word.toLowerCase().includes(currentWord.toLowerCase())
    ).slice(0, 5);

    if (suggestions.length === 0) {
        removeMemoSuggestionBox();
        return;
    }

    let box = document.getElementById('memoSuggestionBox');
    if (!box) {
        box = document.createElement('div');
        box.id = 'memoSuggestionBox';
        box.style.position = 'absolute';
        box.style.zIndex = '1000';
        box.style.backgroundColor = 'white';
        box.style.border = '1px solid #ccc';
        box.style.borderRadius = '4px';
        box.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
        box.style.maxHeight = '200px';
        box.style.overflowY = 'auto';
        document.body.appendChild(box);
    }

    box.innerHTML = '';
    suggestions.forEach((word, index) => {
        const item = document.createElement('div');
        item.className = 'memo-suggestion-item' + (index === 0 ? ' selected' : '');
        item.textContent = word;
        item.style.padding = '8px 12px';
        item.style.cursor = 'pointer';
        item.style.borderBottom = index < suggestions.length - 1 ? '1px solid #eee' : 'none';
        if (index === 0) item.style.backgroundColor = '#f0f0f0';
        item.addEventListener('mouseover', () => {
            box.querySelectorAll('.memo-suggestion-item').forEach(el => {
                el.classList.remove('selected');
                el.style.backgroundColor = '';
            });
            item.classList.add('selected');
            item.style.backgroundColor = '#f0f0f0';
        });
        item.addEventListener('mouseout', () => {
            item.classList.remove('selected');
            item.style.backgroundColor = '';
        });
        item.addEventListener('mousedown', () => {
            selectMemoSuggestion(index);
        });
        box.appendChild(item);
    });
    const inputRect = input.getBoundingClientRect();
    box.style.top = `${inputRect.bottom + window.scrollY}px`;
    box.style.left = `${inputRect.left + window.scrollX}px`;
    box.style.width = `${inputRect.width}px`;
}

// 목록 검색용 추천 단어 선택 함수
function selectListSuggestion(index) {
    const suggestionBox = document.getElementById('suggestionBox');
    if (!suggestionBox) return;

    const items = suggestionBox.querySelectorAll('.suggestion-item');
    if (index >= 0 && index < items.length) {
        const selectedWord = items[index].textContent.trim();
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            const words = searchInput.value.split(' ').filter(word => word.trim() !== '');
            words[words.length - 1] = selectedWord;
            searchInput.value = words.join(' ') + ' ';
            searchInput.focus();
            searchInput.setSelectionRange(searchInput.value.length, searchInput.value.length);
        }
    }
    removeSuggestionBox();
}

// 메모 입력용 추천 단어 선택 함수
function selectMemoSuggestion(index) {
    const suggestionBox = document.getElementById('memoSuggestionBox');
    if (!suggestionBox) return;

    const items = suggestionBox.querySelectorAll('.memo-suggestion-item');
    if (index >= 0 && index < items.length) {
        const selectedWord = items[index].textContent.trim();
        const memoInput = document.activeElement;
        if (memoInput && memoInput.tagName === 'INPUT') {
            const value = memoInput.value;
            const cursor = memoInput.selectionStart;
            let currentWordStart = cursor;
            while (currentWordStart > 0 && value[currentWordStart - 1] !== ' ') {
                currentWordStart--;
            }
            const previousInput = value.slice(0, currentWordStart);
            const remainingInput = value.slice(cursor);
            memoInput.value = previousInput + selectedWord + ' ' + remainingInput;
            memoInput.focus();
            memoInput.setSelectionRange(previousInput.length + selectedWord.length + 1, previousInput.length + selectedWord.length + 1);
        }
    }
    removeMemoSuggestionBox();
}

// 목록 검색용 추천 단어 박스 제거
function removeSuggestionBox() {
    const box = document.getElementById('suggestionBox');
    if (box) box.remove();
}

// 메모 입력용 추천 단어 박스 제거
function removeMemoSuggestionBox() {
    const box = document.getElementById('memoSuggestionBox');
    if (box) {
        box.remove();
    }
}

// ... existing code ...

// setupSearchInputEvents 함수 수정
function setupSearchInputEvents() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('addListBtn');
    
    if (searchInput && searchBtn) {
        searchBtn.addEventListener('click', async () => {
            const query = searchInput.value.trim();
            if (query) {
                await searchLists(query);
            }
        });

        // 목록 검색용 추천 단어 이벤트
        searchInput.addEventListener('input', function(e) {
            const cursor = this.selectionStart;
            const value = this.value.slice(0, cursor);
            const words = value.split(' ');
            const currentWord = words[words.length - 1];
            if (currentWord && currentWord.length > 0) {
                renderListSuggestions(this, currentWord);
            } else {
                removeSuggestionBox();
            }
        });

        // 추천단어 키보드 네비게이션
        searchInput.addEventListener('keydown', function(e) {
            const box = document.getElementById('suggestionBox');
            if (!box || !box.children.length) return;

            if (e.key === 'ArrowDown' || e.key === 'Tab') {
                e.preventDefault();
                const items = box.querySelectorAll('.suggestion-item');
                const currentIndex = Array.from(items).findIndex(item => item.classList.contains('selected'));
                const nextIndex = (currentIndex + 1) % items.length;
                
                items.forEach(item => item.classList.remove('selected'));
                items[nextIndex].classList.add('selected');
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                const items = box.querySelectorAll('.suggestion-item');
                const currentIndex = Array.from(items).findIndex(item => item.classList.contains('selected'));
                const prevIndex = (currentIndex - 1 + items.length) % items.length;
                
                items.forEach(item => item.classList.remove('selected'));
                items[prevIndex].classList.add('selected');
            } else if (e.key === ' ') {
                e.preventDefault();
                const selectedItem = box.querySelector('.suggestion-item.selected');
                if (selectedItem) {
                    const selectedWord = selectedItem.textContent.trim();
                    const words = this.value.split(' ');
                    words[words.length - 1] = selectedWord;
                    this.value = words.join(' ') + ' ';
                    removeSuggestionBox();
                }
            }
        });

        // 포커스 아웃 시 추천단어 박스 제거
        searchInput.addEventListener('blur', function() {
            setTimeout(removeSuggestionBox, 100);
        });
    }
}

function selectListSuggestion(index) {
    const suggestionBox = document.getElementById('suggestionBox');
    if (!suggestionBox) return;

    const items = suggestionBox.querySelectorAll('.suggestion-item');
    if (index >= 0 && index < items.length) {
        const selectedWord = items[index].textContent.trim();
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            const words = searchInput.value.split(' ').filter(word => word.trim() !== '');
            words[words.length - 1] = selectedWord;
            searchInput.value = words.join(' ') + ' ';
            searchInput.focus();
            searchInput.setSelectionRange(searchInput.value.length, searchInput.value.length);
        }
    }
    removeSuggestionBox();
}

// ... existing code ...

// ... existing code ...
function doViewerSearch() {
    if (!searchInput) return;
    const query = searchInput.value.trim();
    if (!query) return;
    const keywords = query.split(/\s+/).map(w => w.trim()).filter(Boolean);
    if (keywords.length === 0) return;
    // 모든 키워드를 포함하는 목록만 추출
    const matched = lists.filter(list => {
        const titleWords = list.title.split(/\s+/);
        return keywords.every(kw => titleWords.includes(kw));
    });
    // 임시목록에 복사하고 기존 목록에서는 삭제
    temporaryLists = matched.map(list => ({ ...list })); // 깊은 복사
    lists = lists.filter(list => !matched.includes(list));
    // 화면 갱신
    if (typeof renderLists === 'function') renderLists(1);
    if (typeof renderTemporaryLists === 'function') renderTemporaryLists();
    if (typeof updateStats === 'function') updateStats();
    // 검색창 비우기
    searchInput.value = '';
}
// ... existing code ...

// 참고자료 추가 함수
function addReferenceFromUrl(listId, memoId, isTemporary) {
    const referenceUrlInput = document.getElementById('referenceUrlInput');
    if (!referenceUrlInput || !referenceUrlInput.value.trim()) {
        showNotification('참고 URL을 입력해주세요.', 'addReferenceBtn');
        return;
    }

    const referenceUrl = referenceUrlInput.value.trim();
    const targetLists = isTemporary ? temporaryLists : lists;
    const list = targetLists.find(l => l.id === listId);
    if (!list) return;

    const memo = list.memos.find(m => m.id === memoId);
    if (!memo) return;

    const autoComment = {
        id: Date.now().toString() + Math.random().toString(16).slice(2),
        text: `참고자료: ${referenceUrl}`,
        isReference: true,
        url: referenceUrl,
        createdAt: new Date().toISOString()
    };

    memo.comments.push(autoComment);

    // 변경사항 저장
    if (isTemporary) {
        saveTemporaryLists();
    } else {
        saveLists();
    }

    // UI 업데이트
    updateMemoListUI(listId, list.memos, isTemporary);
    showNotification('참고자료가 추가되었습니다.', 'addReferenceBtn');
}

// ... existing code ...
// ====== 전역 단축키: Alt+/ → 검색창, Alt+. → 임시목록 맨 위 메모입력 ======
document.addEventListener('keydown', function(e) {
    // Alt + / : 검색창 포커스
    if (e.key === '/' && e.altKey && !e.ctrlKey && !e.metaKey) {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            e.preventDefault();
            searchInput.focus();
            searchInput.select();
        }
    }
    // Alt + . : 임시목록 맨 위 메모입력창 포커스
    if (e.key === '.' && e.altKey && !e.ctrlKey && !e.metaKey) {
        const tempList = temporaryLists && temporaryLists[0];
        if (!tempList) {
            showNotification('임시목록이 없습니다.', 'addListBtn');
            return;
        }
        // 메모섹션 열기
        const memoSection = document.getElementById(`memoSection-${tempList.id}`);
        if (memoSection && memoSection.style.display !== 'block') {
            memoSection.style.display = 'block';
        }
        // 메모 입력창 포커스
        const memoInput = document.getElementById(`newMemoInput-${tempList.id}`);
        if (memoInput) {
            e.preventDefault();
            memoInput.focus();
            memoInput.select();
            memoInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
});
// ... existing code ...

// ... existing code ...
// Alt+숫자 단축키 입력 확장 (메모/목록 입력창 모두 지원)
document.addEventListener('keydown', function(event) {
    // Alt + Backspace로 입력창 초기화
    if (event.altKey && event.key === 'Backspace') {
        const active = document.activeElement;
        // 메모 입력창
        if (active && active.id && active.id.startsWith('newMemoInput-')) {
            event.preventDefault();
            active.value = '';
            active.focus();
        }
        // 목록 검색창
        else if (active && active.id === 'searchInput') {
            event.preventDefault();
            active.value = '';
            active.focus();
        }
        return;
    }

    // 기존 Alt + 숫자 단축키 기능
    if (event.altKey && event.key >= '1' && event.key <= '9') {
        const idx = parseInt(event.key) - 1;
        const active = document.activeElement;
        // 메모 입력창
        if (active && active.id && active.id.startsWith('newMemoInput-')) {
            event.preventDefault();
            const value = clipboardItemsMemo[idx] || '';
            if (value) {
                const start = active.selectionStart;
                const end = active.selectionEnd;
                active.value = active.value.substring(0, start) + value + active.value.substring(end);
                const newPos = start + value.length;
                active.setSelectionRange(newPos, newPos);
                active.focus();
            }
        }
        // 목록 검색창
        else if (active && active.id === 'searchInput') {
            event.preventDefault();
            const value = clipboardItemsList[idx] || '';
            if (value) {
                const start = active.selectionStart;
                const end = active.selectionEnd;
                active.value = active.value.substring(0, start) + value + active.value.substring(end);
                const newPos = start + value.length;
                active.setSelectionRange(newPos, newPos);
                active.focus();
            }
        }
    }
});
// ... existing code ...