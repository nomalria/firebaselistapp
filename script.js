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

// 클립보드 관련 전역 변수 추가
let clipboardItems = [];
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

// Firebase에 데이터 저장
async function saveToFirebase() {
    try {
        const db = window.db;
        
        if (!db) {
            console.error('Firebase가 초기화되지 않았습니다.');
            localStorage.setItem('lists', JSON.stringify(lists));
            localStorage.setItem('temporaryLists', JSON.stringify(temporaryLists));
            return false;
        }

        // 현재 시간을 타임스탬프로 저장
        const currentTime = new Date();
        const timestamp = {
            lastUpdated: currentTime.toISOString()
        };

        // 데이터를 1000개 단위로 분할
        const BATCH_SIZE = 1000;
        const batches = [];
        
        for (let i = 0; i < lists.length; i += BATCH_SIZE) {
            batches.push(lists.slice(i, i + BATCH_SIZE));
        }

        // 메타데이터 저장
        await db.collection('lists').doc('metadata').set({
            totalItems: lists.length,
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

        // 최근 업로드 시간 표시 업데이트
        updateLastUploadTimeDisplay(currentTime);
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

// Firebase에서 데이터 로드
async function loadFromFirebase() {
    try {
        const db = window.db;
        if (!db) {
            console.error('Firebase가 초기화되지 않았습니다.');
            return false;
        }

        // 메타데이터 로드
        const metadataDoc = await db.collection('lists').doc('metadata').get();
        if (!metadataDoc.exists) {
            console.log('메타데이터가 없습니다.');
            return false;
        }

        const metadata = metadataDoc.data();
        const totalBatches = metadata.totalBatches;

        // 모든 배치 데이터 로드
        lists = [];
        for (let i = 1; i <= totalBatches; i++) {
            const batchDoc = await db.collection('lists').doc(`batch_${i}`).get();
            if (batchDoc.exists) {
                const batchData = batchDoc.data();
                lists = lists.concat(batchData.items);
            }
        }

        // 임시 목록 로드
        const tempListsDoc = await db.collection('lists').doc('temporary').get();
        if (tempListsDoc.exists) {
            const data = tempListsDoc.data();
            temporaryLists = data.lists || [];
        }

        // 최근 업로드 시간 표시
        if (metadata.lastUpdated) {
            updateLastUploadTimeDisplay(new Date(metadata.lastUpdated));
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
        console.log('목록 로드 시작...');
        
        // 1. 먼저 로컬 스토리지에서 데이터 로드
        const savedLists = localStorage.getItem('lists');
        const savedTempLists = localStorage.getItem('temporaryLists');
        
        let localDataExists = false;
        
        if (savedLists) {
            lists = JSON.parse(savedLists);
            // author가 없으면 '섬세포분열'로 할당
            lists = lists.map(list => ({
                ...list,
                author: list.author ? list.author : '섬세포분열'
            }));
            console.log(`로컬 스토리지에서 ${lists.length}개의 목록 로드됨`);
            localDataExists = lists.length > 0;
        } else {
            lists = [];
        }
        
        if (savedTempLists) {
            temporaryLists = JSON.parse(savedTempLists);
            // author가 없으면 '섬세포분열'로 할당
            temporaryLists = temporaryLists.map(list => ({
                ...list,
                author: list.author ? list.author : '섬세포분열'
            }));
            console.log(`로컬 스토리지에서 ${temporaryLists.length}개의 임시 목록 로드됨`);
            localDataExists = localDataExists || temporaryLists.length > 0;
        } else {
            temporaryLists = [];
        }
        
        // 모든 메모의 상태 자동 업데이트
        updateAllMemoStatuses();
        
        // 2. 로컬 데이터 존재하면 일단 화면에 표시
        if (localDataExists) {
            renderTemporaryLists();
            renderLists(currentPage);
            updateStats();
        }
        
        // 3. Firebase에서 데이터 로드 시도 (로컬 데이터가 없거나, 더 많은 데이터가 Firebase에 있을 수 있음)
        let firebaseSuccess = false;
        try {
            // 로컬 데이터 백업 (Firebase에서 빈 데이터가 로드되는 경우를 대비)
            const localListsBackup = JSON.parse(JSON.stringify(lists));
            const localTempListsBackup = JSON.parse(JSON.stringify(temporaryLists));
            
            // Firebase에서 데이터 로드 시도
            firebaseSuccess = await loadFromFirebase();
            
            // Firebase에서 데이터를 불러왔는데 로컬 데이터보다 적으면 로컬 데이터 복원
            if (firebaseSuccess) {
                if (localDataExists && lists.length < localListsBackup.length) {
                    console.log('Firebase 데이터가 로컬 데이터보다 적습니다. 로컬 데이터 유지.');
                    lists = localListsBackup;
                    localStorage.setItem('lists', JSON.stringify(lists));
        }
        
                if (localDataExists && temporaryLists.length < localTempListsBackup.length) {
                    console.log('Firebase 임시 데이터가 로컬 데이터보다 적습니다. 로컬 데이터 유지.');
                    temporaryLists = localTempListsBackup;
                    localStorage.setItem('temporaryLists', JSON.stringify(temporaryLists));
                }
            }
        } catch (error) {
            console.error('Firebase 로드 오류:', error);
            // Firebase 오류 시 이미 로컬 데이터로 초기화되어 있으므로 아무것도 안 함
        }
        
        // 클립보드 초기화 (기존 코드 대체)
        initializeClipboard();
        
        // 검색창 이벤트 리스너 설정
        setupSearchInputEvents();
        
        // 최종 목록 렌더링
        renderTemporaryLists();
        renderLists(currentPage);
        updateStats();
        
        // 드롭다운 버튼 이벤트 리스너 설정
        const filterDropdown = document.getElementById('filterDropdown');
        if (filterDropdown) {
            filterDropdown.addEventListener('click', function() {
                const dropdownContent = document.querySelector('.dropdown-content');
                if (dropdownContent) {
                    dropdownContent.classList.toggle('show');
                }
            });
            
            // 드롭다운 외부 클릭 시 닫기
            document.addEventListener('click', function(e) {
                if (!filterDropdown.contains(e.target)) {
                    const dropdownContent = document.querySelector('.dropdown-content');
                    if (dropdownContent && dropdownContent.classList.contains('show')) {
                        dropdownContent.classList.remove('show');
                    }
                }
            });
        }
        
        // 클립보드 렌더링 및 이벤트 리스너 설정
        renderClipboardItems();
        attachClipboardEventListeners();
        
        // 카테고리 버튼에 이벤트 리스너 추가
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const filterType = this.dataset.filterType;
                currentFilterType = filterType;
                
                // 버튼 활성화 상태 업데이트
                document.querySelectorAll('.category-btn').forEach(b => {
                    b.classList.toggle('active', b.dataset.filterType === filterType);
                });
                
                // 목록 다시 렌더링
                renderLists(1);
            });
            
            // 초기 '전체보기' 버튼 활성화
            if (btn.dataset.filterType === 'all') {
                btn.classList.add('active');
            }
        });
        
        // 모든 메모 입력창에 클립보드 단축키 이벤트 리스너 추가
        document.querySelectorAll('[id^="newMemoInput-"]').forEach(input => {
            addClipboardShortcutListener(input);
        });
        
        // 클립보드 토글 버튼 이벤트 리스너 추가
        const toggleClipboardBtn = document.querySelector('.toggle-clipboard-btn');
        if (toggleClipboardBtn) {
            // 기존 이벤트 리스너 제거 후 다시 추가
            toggleClipboardBtn.removeEventListener('click', toggleClipboardContent);
            toggleClipboardBtn.addEventListener('click', toggleClipboardContent);
        }
        
        // 첫 로드 시 기존 데이터 구조 마이그레이션
        migrateExistingData();
        migrateStatusToWinLoss();
        
        // 조건부 토글 설정
        setTimeout(() => {
            // 상태 아이콘 체크
            document.querySelectorAll('.memo-item').forEach(memoElement => {
                checkMemoIcon(memoElement);
            });
            
            // 초기 필터 설정
            updateStats();
            
            // 초기화 상태 표시
            console.log('초기화 완료: 모든 데이터 정상 로드됨');
        }, 500);
        
    } catch (error) {
        console.error('초기화 오류:', error);
        
        // 오류 발생 시 로컬 스토리지에서 마지막으로 다시 시도
        const savedLists = localStorage.getItem('lists');
        const savedTempLists = localStorage.getItem('temporaryLists');
        
        if (savedLists) {
            lists = JSON.parse(savedLists);
            // author가 없으면 '섬세포분열'로 할당
            lists = lists.map(list => ({
                ...list,
                author: list.author ? list.author : '섬세포분열'
            }));
            console.log(`오류 발생, 로컬 스토리지에서 ${lists.length}개의 목록 복구됨`);
        } else {
                lists = [];
            }
        
        if (savedTempLists) {
            temporaryLists = JSON.parse(savedTempLists);
            // author가 없으면 '섬세포분열'로 할당
            temporaryLists = temporaryLists.map(list => ({
                ...list,
                author: list.author ? list.author : '섬세포분열'
            }));
            console.log(`오류 발생, 로컬 스토리지에서 ${temporaryLists.length}개의 임시 목록 복구됨`);
        } else {
                temporaryLists = [];
        }
        
        renderTemporaryLists();
        renderLists(currentPage);
        updateStats();
    }
}

// 방덱 목록 저장
function saveLists() {
    localStorage.setItem('lists', JSON.stringify(lists));
    updateStats();
}

// 임시 방덱 목록 저장 함수 추가
function saveTemporaryLists() {
    localStorage.setItem('temporaryLists', JSON.stringify(temporaryLists));
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

    console.log('추출된 단어들:', Array.from(allWords));

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
    const user = firebase.auth().currentUser;
    if (!user) {
        alert('로그인이 필요합니다.');
        return;
    }
    
    const searchInput = document.getElementById('searchInput');
    const title = searchInput.value.trim();
    
    if (!title) {
        alert('방덱 이름을 입력해주세요.');
        return;
    }
    
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
            // 기존 목록에서 제거하지 않고 복사해서 임시목록에 붙여넣기
            // 깊은 복사로 임시목록에 추가 (comments 등 포함)
            const copiedLists = matchingLists.map(list => JSON.parse(JSON.stringify(list)));
            temporaryLists = [...copiedLists, ...temporaryLists];
            renderTemporaryLists();
            // 기존 목록은 그대로 두므로 saveLists() 불필요
            renderLists();
        } else {
            const newList = {
                id: Date.now().toString(),
                title: title,
                memos: [],
                createdAt: createdAt,
                author: user.email === 'longway7098@gmail.com' ? '섬세포분열' : '외부 사용자'  // 작성자 표시 로직 수정
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
                createdAt: createdAt,
                author: user.email === 'longway7098@gmail.com' ? '섬세포분열' : '외부 사용자'  // 작성자 표시 로직 수정
            };
            temporaryLists.unshift(newList);
            renderTemporaryLists();
        }
    }
    
    searchInput.value = '';
    updateStats();
    saveTemporaryLists();
    saveLists();
    
    // 로컬 스토리지에만 저장
    saveToLocalStorage();
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
            <div class="list-title" onclick="toggleMemos('${list.id}')">
                <span class="list-title-text">${list.title}</span>
                <span class="memo-count">${list.memos.length}/100</span>
                <div class="button-group">
                    <button class="edit-btn" onclick="event.stopPropagation(); startEditList('${list.id}', true)">편집</button>
                    <button class="delete-btn" onclick="event.stopPropagation(); deleteList('${list.id}', true)">삭제</button>
                </div>
            </div>
            <div class="edit-section" id="editSection-${list.id}" style="display: none;">
                <div class="input-group">
                    <input type="text" id="editListInput-${list.id}" placeholder="방덱 제목 수정..." onkeypress="if(event.key === 'Enter') saveListEdit('${list.id}', true)">
                    <div class="edit-buttons">
                        <button class="save-btn" onclick="saveListEdit('${list.id}', true)">저장</button>
                        <button class="cancel-btn" onclick="cancelListEdit('${list.id}', true)">취소</button>
                    </div>
                </div>
            </div>
            <div class="memo-section" id="memoSection-${list.id}" style="display: none;">
                <span class="list-created-at">생성: ${formatCreatedAt(list.createdAt)}</span>
                <span class="list-author">작성자: ${list.author === 'longway7098@gmail.com' || !list.author ? '섬세포분열' : list.author}</span>
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
    const isProtectedAuthor = !list.author || list.author === '섬세포분열' || list.author === 'longway7098@gmail.com';

    if ((!isTemporary && isOldList && !isAdmin) || (isProtectedAuthor && !isAdmin)) {
        alert('이 목록은 관리자만 삭제할 수 있습니다.');
        return;
    }

    if (confirm('해당 목록을 삭제하시겠습니까?')) {
        try {
            // 로컬 데이터 업데이트
            if (isTemporary) {
                temporaryLists = temporaryLists.filter(list => list.id.toString() !== listId.toString());
                renderTemporaryLists();
                saveTemporaryLists();
            } else {
                lists = lists.filter(list => list.id.toString() !== listId.toString());
                
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
    const user = firebase.auth().currentUser;
    if (!user) {
        alert('로그인이 필요합니다.');
        return;
    }
    
    const memoInput = document.getElementById(`newMemoInput-${listId}`);
    const memoText = memoInput.value.trim();
    
    if (!memoText) {
        alert('메모 내용을 입력해주세요.');
        return;
    }
    
    const targetLists = isTemporary ? temporaryLists : lists;
    const list = targetLists.find(l => l.id.toString() === listId.toString());
    
    if (!list) return;

    if (list.memos.length >= 100) {
        alert('한 방덱에는 최대 100개의 메모만 추가할 수 있습니다.');
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
        author: user.email === 'longway7098@gmail.com' ? '섬세포분열' : '외부 사용자'  // 작성자 표시 로직 수정
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
    const user = firebase.auth().currentUser;
    const targetLists = isTemporary ? temporaryLists : lists;
    const list = targetLists.find(l => l.id.toString() === listId.toString());
    if (!list) return;
    const memo = list.memos.find(m => m.id.toString() === memoId.toString());
    const isAdmin = user && user.email === 'longway7098@gmail.com';
    const isProtectedAuthor = !memo.author || memo.author === '섬세포분열' || memo.author === 'longway7098@gmail.com';
    if (isProtectedAuthor && !isAdmin) {
        alert('이 메모는 관리자만 삭제할 수 있습니다.');
        return;
    }
    if (confirm('해당 메모를 삭제하시겠습니까?')) {
        try {
            // 메모만 삭제하고 목록은 유지
            list.memos = list.memos.filter(m => m.id.toString() !== memoId.toString());
            
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
            <div class="list-title" onclick="toggleMemos('${list.id}')">
                <span class="list-title-text">${list.title}</span>
                <span class="memo-count">${list.memos.length}/100</span>
                <div class="button-group">
                    <button class="edit-btn" onclick="event.stopPropagation(); startEditList('${list.id}')">편집</button>
                    <button class="delete-btn" onclick="event.stopPropagation(); deleteList('${list.id}')">삭제</button>
                </div>
            </div>
            <div class="edit-section" id="editSection-${list.id}" style="display: none;">
                <div class="input-group">
                    <input type="text" id="editListInput-${list.id}" placeholder="방덱 제목 수정..." onkeypress="if(event.key === 'Enter') saveListEdit('${list.id}')">
                    <div class="edit-buttons">
                        <button class="save-btn" onclick="saveListEdit('${list.id}')">저장</button>
                        <button class="cancel-btn" onclick="cancelListEdit('${list.id}')">취소</button>
                    </div>
                </div>
            </div>
            <div class="memo-section" id="memoSection-${list.id}" style="display: none;">
                <span class="list-created-at">생성: ${formatCreatedAt(list.createdAt)}</span>
                <span class="list-author">작성자: ${list.author === 'longway7098@gmail.com' ? '섬세포분열' : list.author}</span>
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

    // 4. 페이지네이션 컨트롤 렌더링
    renderPaginationControls(filteredLists.length);
    
    // 5. 클립보드 단축키 이벤트 리스너 추가
    paginatedLists.forEach(list => {
        const memoInput = document.getElementById(`newMemoInput-${list.id}`);
        if (memoInput) {
            addMemoInputListeners(memoInput, list.id, false);
        }
    });
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
    try {
        const listElement = document.querySelector(`[data-list-id="${listId}"]`);
        if (!listElement) {
            console.error('목록 요소를 찾을 수 없습니다:', listId);
            return;
        }

        const isTemporary = listElement.closest('#temporaryLists') !== null;
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
                }
            }

            // 메모 입력창에 포커스
            const memoInput = document.getElementById(`newMemoInput-${listId}`);
            if (memoInput) {
                setTimeout(() => {
                    memoInput.focus();
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
    const user = firebase.auth().currentUser;
    const targetLists = isTemporary ? temporaryLists : lists;
    const list = targetLists.find(l => l.id.toString() === listId.toString());
    if (!list) return;
    const memo = list.memos.find(m => m.id.toString() === memoId.toString());
    if (!memo) return;
    const isAdmin = user && user.email === 'longway7098@gmail.com';
    const isProtectedAuthor = !memo.author || memo.author === '섬세포분열' || memo.author === 'longway7098@gmail.com';
    if (isProtectedAuthor && !isAdmin) {
        alert('이 메모는 관리자만 편집할 수 있습니다.');
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
    // 대상 목록 배열 결정
    const targetLists = isTemporary ? temporaryLists : lists;
    
    // 목록 찾기
    const list = targetLists.find(l => l.id.toString() === listId.toString());
    if (!list) return;

    // 메모 찾기
    const memo = list.memos.find(m => m.id.toString() === memoId.toString());
    if (!memo) return;

    // 승수 또는 패수 업데이트
    if (counterType === 'wins') {
        memo.wins = (typeof memo.wins === 'number' ? memo.wins : 0) + change;
        // 음수가 되지 않도록 처리
        if (memo.wins < 0) memo.wins = 0;
    } else if (counterType === 'losses') {
        memo.losses = (typeof memo.losses === 'number' ? memo.losses : 0) + change;
        // 음수가 되지 않도록 처리
        if (memo.losses < 0) memo.losses = 0;
    }
    
    // 승패 비율에 따라 상태 자동 업데이트
    updateMemoStatusByWinRate(memo);
    
    // 변경 사항 저장
    if (isTemporary) {
        saveTemporaryLists();
    } else {
        saveLists();
    }

    // UI 업데이트
    const memoElement = document.querySelector(`.list-item[data-list-id="${listId}"] .memo-item[data-memo-id="${memoId}"]`);
    if (memoElement) {
        // 승률 계산
        const winRate = (memo.wins + memo.losses) > 0 ? 
            ((memo.wins / (memo.wins + memo.losses)) * 100).toFixed(1) : 0;
        
        // 카운터 텍스트 업데이트
        const counterText = memoElement.querySelector('.counter-text');
        if (counterText) {
            counterText.textContent = `${memo.wins}승 ${memo.losses}패 (${winRate}%)`;
        }

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
            <div class="memo-content">
                <div class="memo-text">${memo.text}</div>
                <div class="memo-stats">
                    <span class="counter-text">${wins}승 ${losses}패 (${winRate}%)</span>
                </div>
                <div class="memo-author">작성자: ${(memo.author === 'longway7098@gmail.com' || !memo.author) ? '섬세포분열' : memo.author}</div>
            </div>
            <div class="memo-actions">
                <div class="memo-status-display">
                    ${statusIcon ? `<span class="status-icon ${statusClass}">${statusIcon}</span>` : ''}
                </div>
                <div class="memo-buttons">
                    <button class="comment-btn" onclick="toggleCommentSection('${listId}', '${memo.id}', ${isTemporary})">${commentButtonText}</button>
                </div>
                <div class="memo-counter">
                    <button class="counter-btn plus-win" onclick="updateCounter('${listId}', '${memo.id}', 'wins', 1, ${isTemporary})">+승</button>
                    <button class="counter-btn minus-win" onclick="updateCounter('${listId}', '${memo.id}', 'wins', -1, ${isTemporary})">-승</button>
                    <button class="counter-btn plus-loss" onclick="updateCounter('${listId}', '${memo.id}', 'losses', 1, ${isTemporary})">+패</button>
                    <button class="counter-btn minus-loss" onclick="updateCounter('${listId}', '${memo.id}', 'losses', -1, ${isTemporary})">-패</button>
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
        const saved = localStorage.getItem('clipboardItems');
        if (saved) {
            clipboardItems = JSON.parse(saved);
            if (!Array.isArray(clipboardItems)) {
                clipboardItems = Array(MAX_CLIPBOARD_ITEMS).fill('');
            }
        } else {
            // 저장된 데이터가 없는 경우 기본값으로 초기화
            clipboardItems = Array(MAX_CLIPBOARD_ITEMS).fill('');
            saveClipboardItems(); // 초기 상태 저장
        }
        renderClipboardItems();
    } catch (error) {
        console.error('클립보드 로드 중 오류:', error);
        clipboardItems = Array(MAX_CLIPBOARD_ITEMS).fill('');
        saveClipboardItems(); // 오류 발생 시에도 초기 상태 저장
    }
}

// 클립보드 렌더링
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
        // 기존 클립보드 이벤트 리스너 제거
        element.removeEventListener('keydown', handleClipboardKeydown);
        
        // 새 이벤트 리스너 추가
        element.addEventListener('keydown', handleClipboardKeydown);
    }
}

// 클립보드 단축키 키다운 핸들러
function handleClipboardKeydown(event) {
            handleClipboardShortcut(event, this);
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
        reader.onload = function(e) {
            try {
                const jsonData = JSON.parse(e.target.result);
                
                // 데이터 처리 전 현재 데이터 백업
                const listsBackup = JSON.stringify(lists);
                const tempListsBackup = JSON.stringify(temporaryLists);
                localStorage.setItem('lists_backup', listsBackup);
                localStorage.setItem('tempLists_backup', tempListsBackup);
                
                // 데이터 처리
                processImportedJson(jsonData);
                
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

// 불러온 JSON 데이터 처리 함수
function processImportedJson(data) {
    let importedCount = 0;
    let updatedCount = 0;
    
    try {
        // 목록 데이터 검증
        if (!Array.isArray(data) && data.lists && Array.isArray(data.lists)) {
            data = data.lists; // 'lists' 키 내의 배열을 사용
        } else if (!Array.isArray(data)) {
            showNotification('유효한 목록 데이터가 없습니다', 'importJsonBtn');
            return;
        }
        
        // 각 목록 처리
        data.forEach(list => {
            if (!list.title) return; // 제목 없는 목록은 건너뜀
            
            // 목록 ID 확인 및 생성
            const listId = list.id || Date.now().toString() + Math.random().toString(16).slice(2);
            
            // 메모 형식 확인 및 정규화
            const memos = Array.isArray(list.memos) ? list.memos.map(memo => {
                return {
                    id: memo.id || Date.now().toString() + Math.random().toString(16).slice(2),
                    text: memo.text || '',
                    status: memo.status || null,
                    wins: typeof memo.wins === 'number' ? memo.wins : 0,
                    losses: typeof memo.losses === 'number' ? memo.losses : 0
                };
            }) : [];
            
            // createdAt 확인
            const createdAt = list.createdAt || new Date().toISOString();
            
            // 새 목록 객체 생성
            const newList = {
                id: listId,
                title: list.title,
                memos: memos,
                createdAt: createdAt
            };
            
            // 기존 목록과 중복 확인
            const existingList = lists.find(l => l.title === list.title);
            if (existingList) {
                // 기존 목록 업데이트 - 새 메모 추가
                let memosAdded = 0;
                memos.forEach(memo => {
                    // 중복 메모 확인 (텍스트 기반)
                    const duplicateMemo = existingList.memos.find(m => m.text === memo.text);
                    if (!duplicateMemo) {
                        existingList.memos.push(memo);
                        memosAdded++;
                    }
                });
                
                if (memosAdded > 0) {
                    updatedCount++;
                }
            } else {
                // 새 목록 추가
                lists.push(newList);
                importedCount++;
            }
        });
        
        // Firebase 저장 전에 먼저 로컬 스토리지에 저장 (주요 변경점)
        localStorage.setItem('lists', JSON.stringify(lists));
        localStorage.setItem('temporaryLists', JSON.stringify(temporaryLists));
        console.log('불러온 데이터가 먼저 로컬 스토리지에 저장됨');
        
        // 목록 다시 렌더링 (Firebase 응답 기다리지 않고 즉시 화면 갱신)
        renderLists(currentPage);
        updateStats();
        
        // 화면에 메시지 표시
        const message = `${importedCount}개 목록 추가, ${updatedCount}개 목록 업데이트 완료`;
        showNotification(message, 'importJsonBtn');
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
    window.sortAll = function() {
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
        saveToFirebase();
        
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
    // 대상 목록 배열 결정
    const targetLists = isTemporary ? temporaryLists : lists;
    
    // 목록 찾기
    const list = targetLists.find(l => l.id.toString() === listId.toString());
    if (!list) return;

    // 메모 찾기
    const memo = list.memos.find(m => m.id.toString() === memoId.toString());
    if (!memo) return;

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
function addTemporaryToLists() {
    if (temporaryLists.length === 0) {
        return;
    }
    
    // 임시 목록을 정규 목록에 추가 (제목 중복 → 덮어쓰기, 제목 다르면 id 중복 검사)
    temporaryLists.forEach(tempList => {
        // 1. 제목 중복 검사
        const existingTitleIndex = lists.findIndex(list => list.title === tempList.title);
        if (existingTitleIndex !== -1) {
            // 제목이 같으면 덮어쓰기
            lists[existingTitleIndex] = { ...tempList };
        } else {
            // 2. 제목이 다르면 id 중복 검사
            const existingIdIndex = lists.findIndex(list => list.id === tempList.id);
            if (existingIdIndex !== -1) {
                // id가 중복되면 새로운 id로 변경
                let newId;
                do {
                    newId = Date.now().toString() + Math.random().toString(16).slice(2);
                } while (lists.some(list => list.id === newId));
                lists.push({ ...tempList, id: newId });
            } else {
                // 제목과 id 모두 다르면 그대로 추가
                lists.push({ ...tempList });
            }
        }
    });
    
    // 임시 목록 초기화
    temporaryLists = [];
    
    // 참고 URL 입력창 초기화
    const referenceUrlInput = document.getElementById('referenceUrlInput');
    if (referenceUrlInput) {
        referenceUrlInput.value = '';
    }
    
    // 변경사항 저장 (Firebase 저장 호출 제거, 로컬스토리지만 저장)
    localStorage.setItem('lists', JSON.stringify(lists));
    localStorage.setItem('temporaryLists', JSON.stringify(temporaryLists));
    
    // UI 업데이트
    renderLists();
    renderTemporaryLists();
    
    // 알림 메시지 표시
    showNotification('기존 목록에 추가되었습니다', 'addTemporaryBtn');
    
    // 통계 업데이트
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
    if (!searchInput) return;
    
    // 모바일 환경 감지
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // 모바일 환경에서의 스페이스바 처리
    if (isMobile) {
        searchInput.addEventListener('input', function(e) {
            const searchResults = document.getElementById('searchResults');
            const items = searchResults.getElementsByClassName('list-item');
            
            if (items.length === 0) return;
            
            // 입력값의 마지막 문자가 스페이스인 경우
            if (this.value.endsWith(' ')) {
                e.preventDefault();
                const word = items[0].dataset.word; // 첫 번째 추천 단어 선택
                if (word) {
                    // 마지막 단어를 추천 단어로 대체
                    const words = this.value.trim().split(' ');
                    words[words.length - 1] = word;
                    this.value = words.join(' ') + ' ';
                    selectedIndex = 0;
                    updateSelectedItem(items);
                }
            }
        });
    }
    
    // 기존 키보드 이벤트 리스너
    searchInput.addEventListener('keydown', function(e) {
        const searchResults = document.getElementById('searchResults');
        const items = searchResults.getElementsByClassName('list-item');
        
        if (items.length === 0) return;
        
        // 위/아래 화살표 키로 추천 단어 이동
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedIndex = (selectedIndex + 1) % items.length;
            updateSelectedItem(items);
        } 
        else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedIndex = (selectedIndex - 1 + items.length) % items.length;
            updateSelectedItem(items);
        }
        // Tab 키로 다음 추천 단어로 이동
        else if (e.key === 'Tab') {
            e.preventDefault();
            if (e.shiftKey) {
                // Shift + Tab: 이전 단어로 이동
                selectedIndex = (selectedIndex - 1 + items.length) % items.length;
            } else {
                // Tab: 다음 단어로 이동
                selectedIndex = (selectedIndex + 1) % items.length;
            }
            updateSelectedItem(items);
        }
        // 엔터 키로 선택한 단어 적용
        else if (e.key === 'Enter' && selectedIndex >= 0) {
            e.preventDefault();
            const word = items[selectedIndex].dataset.word;
            selectWord(word);
        }
        // 스페이스바로 첫 번째 추천 단어 선택
        else if (e.key === ' ' && items.length > 0) {
            const hasText = this.value.trim().length > 0;
            
            if (hasText && selectedIndex >= 0) {
                e.preventDefault();
                const word = items[selectedIndex].dataset.word;
                selectWord(word);
            }
        }
    });
}

// 문서 로드 시 CSS 스타일 추가
document.addEventListener('DOMContentLoaded', function() {
    // 메모 편집 관련 스타일 추가
    const style = document.createElement('style');
    style.textContent = `
        /* 메모 편집 관련 스타일 */
        .memo-item.editing {
            position: relative;
            /* 편집 모드에서 배경색 살짝 변경 */
            background-color: #f8f8f8;
        }
        
        .edit-section {
            background-color: #f0f8ff; /* 연한 파란색 배경 */
            border-radius: 4px;
            padding: 10px;
            margin: 8px 0;
            border: 1px solid #cfe8fc;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            position: relative;
            z-index: 1;
        }
        
        .edit-section textarea {
            width: 100%;
            min-height: 60px;
            padding: 8px 12px;
            border: 2px solid #4CAF50;
            border-radius: 4px;
            font-size: 14px;
            line-height: 1.5;
            resize: vertical;
            font-family: inherit;
            background-color: white;
        }
        
        .edit-section textarea:focus {
            outline: none;
            border-color: #2E7D32;
            box-shadow: 0 0 0 2px rgba(46, 125, 50, 0.2);
        }
        
        .edit-section .input-group {
            margin-bottom: 8px;
        }
        
        .edit-section button {
            padding: 6px 12px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: 500;
            transition: background-color 0.2s;
            margin-left: 8px;
        }
        
        .edit-section button[onclick*="saveMemoEdit"] {
            background-color: #4CAF50;
            color: white;
        }
        
        .edit-section button[onclick*="saveMemoEdit"]:hover {
            background-color: #3d8b40;
        }
        
        .edit-section button[onclick*="cancelMemoEdit"] {
            background-color: #f44336;
            color: white;
        }
        
        .edit-section button[onclick*="cancelMemoEdit"]:hover {
            background-color: #d32f2f;
        }
    `;
    document.head.appendChild(style);
    
    console.log('메모 편집 스타일 로드 완료');
});

// 메모 편집 저장
function saveMemoEdit(listId, memoId, isTemporary = false) {
    const user = firebase.auth().currentUser;
    const targetLists = isTemporary ? temporaryLists : lists;
    const list = targetLists.find(l => l.id.toString() === listId.toString());
    if (!list) return;
    const memo = list.memos.find(m => m.id.toString() === memoId.toString());
    if (!memo) return;
    const isAdmin = user && user.email === 'longway7098@gmail.com';
    const isProtectedAuthor = !memo.author || memo.author === '섬세포분열' || memo.author === 'longway7098@gmail.com';
    if (isProtectedAuthor && !isAdmin) {
        alert('이 메모는 관리자만 편집할 수 있습니다.');
        return;
    }

    try {
        console.log(`메모 편집 저장: listId=${listId}, memoId=${memoId}, isTemporary=${isTemporary}`);
        
        // 입력 필드 찾기
        const inputElement = document.getElementById(`editMemoInput-${memoId}`);
        if (!inputElement) {
            console.error('편집 입력 필드를 찾을 수 없습니다');
            return;
        }
        
        // 새 텍스트 가져오기
        const newText = inputElement.value.trim();
        if (!newText) {
            alert('메모 내용을 입력해주세요');
            inputElement.focus();
            return;
        }
        
        // 데이터에서 메모 찾기
        const targetLists = isTemporary ? temporaryLists : lists;
        const list = targetLists.find(l => l.id.toString() === listId.toString());
        if (!list) {
            console.error('목록을 찾을 수 없습니다:', listId);
            return;
        }
        
        const memo = list.memos.find(m => m.id.toString() === memoId.toString());
        if (!memo) {
            console.error('메모를 찾을 수 없습니다:', memoId);
            return;
        }
        
        // 메모 텍스트 업데이트
        memo.text = newText;

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
            if (!memo.comments) {
                memo.comments = [];
            }
            memo.comments.push(autoComment);
        }
        
        // DOM에서 메모 요소 찾기
        let memoItem = document.querySelector(`.memo-item[data-memo-id="${memoId}"]`);
        if (!memoItem) {
            console.error('메모 항목 DOM 요소를 찾을 수 없습니다:', memoId);
            return;
        }
        
        // 메모 텍스트 요소 찾기
        const memoTextElement = memoItem.querySelector('.memo-text');
        if (memoTextElement) {
            memoTextElement.textContent = newText;
        }
        
        // 편집 섹션 제거 및 원래 요소 표시
        const editSection = memoItem.querySelector('.memo-edit-section');
        if (editSection) {
            editSection.remove();
        }
        
        // 원래 요소 표시
        memoItem.querySelector('.memo-content').style.display = '';
        memoItem.querySelector('.memo-buttons').style.display = '';
        
        // 참고자료 섹션 업데이트
        const commentSection = document.getElementById(`commentSection-${memoId}`);
        if (commentSection) {
            const commentList = commentSection.querySelector('.comment-list');
            if (commentList) {
                commentList.innerHTML = renderComments(memo);
            }
        }

        // 참고자료 버튼 텍스트 업데이트
        const commentBtn = memoItem.querySelector('.comment-btn');
        if (commentBtn) {
            const commentCount = memo.comments ? memo.comments.length : 0;
            commentBtn.textContent = commentCount > 0 ? `참고자료 (${commentCount})` : '참고자료';
        }
        
        // 변경사항 저장
        if (isTemporary) {
            saveTemporaryLists();
        } else {
            saveLists();
        }
        
        console.log('메모 편집 완료');
        
    } catch (error) {
        console.error('메모 편집 저장 중 오류 발생:', error, error.stack);
        alert('메모 편집을 저장하는 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
}

// 메모 편집 취소
function cancelMemoEdit(listId, memoId, isTemporary = false) {
    try {
        console.log(`메모 편집 취소: listId=${listId}, memoId=${memoId}, isTemporary=${isTemporary}`);
        
        // DOM에서 메모 찾기
        let memoItem = document.querySelector(`.memo-item[data-memo-id="${memoId}"]`);
        if (!memoItem) {
            console.error('메모 항목 DOM 요소를 찾을 수 없습니다:', memoId);
            return;
        }
        
        // 편집 섹션 제거
        const editSection = memoItem.querySelector('.memo-edit-section');
        if (editSection) {
            editSection.remove();
        }
        
        // 원래 요소 표시
        memoItem.querySelector('.memo-content').style.display = '';
        memoItem.querySelector('.memo-buttons').style.display = '';
        
        console.log('메모 편집 취소 완료');
        
    } catch (error) {
        console.error('메모 편집 취소 중 오류 발생:', error, error.stack);
    }
}

// 메모 편집 UI 스타일 추가
document.addEventListener('DOMContentLoaded', function() {
    const style = document.createElement('style');
    style.textContent = `
        .memo-edit-section {
            margin-top: 6px;
            margin-bottom: 6px;
            padding: 8px;
            background-color: #f9f9f9;
            border-radius: 6px;
            border: 1px solid #ddd;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
            width: calc(100% + 20px);
            margin-left: -10px;
            margin-right: -10px;
            box-sizing: border-box;
        }
        
        .edit-memo-input {
            width: 100%;
            height: 36px;
            padding: 6px 10px;
            margin-bottom: 6px;
            border: 1px solid #ccc;
            border-radius: 4px;
            font-size: 14px;
            line-height: 1.4;
            font-family: inherit;
            overflow-y: auto;
            resize: none;
            box-shadow: inset 0 1px 2px rgba(0,0,0,0.05);
            white-space: nowrap;
            text-overflow: ellipsis;
        }
        
        .edit-memo-input:focus {
            border-color: #4CAF50;
            outline: none;
            box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
        }
        
        .edit-buttons {
            display: flex;
            justify-content: flex-end;
            gap: 8px;
        }
        
        .save-edit-btn, .cancel-edit-btn {
            padding: 5px 10px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: 500;
            font-size: 13px;
            display: flex;
            align-items: center;
            gap: 4px;
            transition: all 0.2s;
        }
        
        .save-edit-btn {
            background-color: #4CAF50;
            color: white;
        }
        
        .save-edit-btn:hover {
            background-color: #3d8b40;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .cancel-edit-btn {
            background-color: #f44336;
            color: white;
        }
        
        .cancel-edit-btn:hover {
            background-color: #d32f2f;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        @media (max-width: 768px) {
            .memo-edit-section {
                width: calc(100% + 16px);
                margin-left: -8px;
                margin-right: -8px;
                padding: 6px;
            }
            
            .edit-buttons {
                justify-content: space-between;
            }
            
            .save-edit-btn, .cancel-edit-btn {
                flex: 1;
                justify-content: center;
                font-size: 13px;
                padding: 5px 8px;
            }
            
            .edit-memo-input {
                height: 30px;
                padding: 4px 8px;
                font-size: 13px;
            }
        }
    `;
    document.head.appendChild(style);
});

// 메모 목록 렌더링
function renderMemos(listElement, memos, listId, isTemporary = false) {
    try {
        console.log(`메모 렌더링: listId=${listId}, isTemporary=${isTemporary}, memos=`, memos);
        const memosContainer = listElement.querySelector('.memos-container');
        if (!memosContainer) {
            console.error('메모 컨테이너를 찾을 수 없습니다');
            return;
        }
        
        memosContainer.innerHTML = '';
        
        if (!memos || memos.length === 0) {
            memosContainer.innerHTML = '<div class="no-memos">메모가 없습니다.</div>';
            return;
        }
        
        memos.forEach(memo => {
            try {
                const memoItem = document.createElement('div');
                memoItem.className = 'memo-item';
                memoItem.dataset.memoId = memo.id;
                
                // 메모 내용 컨테이너
                const memoContent = document.createElement('div');
                memoContent.className = 'memo-content';
                
                // 메모 텍스트
                const memoText = document.createElement('div');
                memoText.className = 'memo-text';
                memoText.textContent = memo.text;
                memoContent.appendChild(memoText);
                
                // 메모 작성 시간 표시
                if (memo.timestamp) {
                    const memoTime = document.createElement('div');
                    memoTime.className = 'memo-time';
                    memoTime.textContent = formatTimestamp(memo.timestamp);
                    memoContent.appendChild(memoTime);
                }
                
                memoItem.appendChild(memoContent);
                
                // 메모 버튼 컨테이너
                const memoButtons = document.createElement('div');
                memoButtons.className = 'memo-buttons';
                
                // 편집 버튼
                const editButton = document.createElement('button');
                editButton.className = 'edit-memo-btn';
                editButton.innerHTML = '<i class="fas fa-edit"></i>';
                editButton.title = '메모 편집';
                editButton.onclick = () => startEditMemo(listId, memo.id, isTemporary);
                memoButtons.appendChild(editButton);
                
                // 삭제 버튼
                const deleteButton = document.createElement('button');
                deleteButton.className = 'delete-memo-btn';
                deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
                deleteButton.title = '메모 삭제';
                deleteButton.onclick = () => deleteMemo(listId, memo.id, isTemporary);
                memoButtons.appendChild(deleteButton);
                
                memoItem.appendChild(memoButtons);
                
                memosContainer.appendChild(memoItem);
            } catch (error) {
                console.error('메모 항목 렌더링 중 오류 발생:', error, error.stack);
            }
        });
        
    } catch (error) {
        console.error('메모 렌더링 중 오류 발생:', error, error.stack);
    }
}

// 메모를 가나다순으로 정렬하는 함수 추가
function sortMemosByAlphabetical(memos) {
    return [...memos].sort((a, b) => {
        return a.text.localeCompare(b.text, 'ko');
    });
}

// 메모 입력창에 키보드로 승/패 카운터 조작 기능 추가
function addCounterHotkeyListener(memoInput, listId, isTemporary = false) {
    // 중복 등록 방지
    memoInput.removeEventListener('keydown', memoInput._counterHotkeyHandler);
    memoInput._counterHotkeyHandler = function(e) {
        // Alt + ↑ : 승리 +1
        if (e.altKey && !e.shiftKey && e.key === 'ArrowUp') {
            e.preventDefault();
            const targetLists = isTemporary ? temporaryLists : lists;
            const list = targetLists.find(l => l.id.toString() === listId.toString());
            if (list && list.memos.length > 0) {
                const memoId = list.memos[0].id;
                updateCounter(listId, memoId, 'wins', 1, isTemporary);
            }
        }
        // Alt + Shift + ↑ : 승리 -1
        if (e.altKey && e.shiftKey && e.key === 'ArrowUp') {
            e.preventDefault();
            const targetLists = isTemporary ? temporaryLists : lists;
            const list = targetLists.find(l => l.id.toString() === listId.toString());
            if (list && list.memos.length > 0) {
                const memoId = list.memos[0].id;
                updateCounter(listId, memoId, 'wins', -1, isTemporary);
            }
        }
        // Alt + ↓ : 패배 +1
        if (e.altKey && !e.shiftKey && e.key === 'ArrowDown') {
            e.preventDefault();
            const targetLists = isTemporary ? temporaryLists : lists;
            const list = targetLists.find(l => l.id.toString() === listId.toString());
            if (list && list.memos.length > 0) {
                const memoId = list.memos[0].id;
                updateCounter(listId, memoId, 'losses', 1, isTemporary);
            }
        }
        // Alt + Shift + ↓ : 패배 -1
        if (e.altKey && e.shiftKey && e.key === 'ArrowDown') {
            e.preventDefault();
            const targetLists = isTemporary ? temporaryLists : lists;
            const list = targetLists.find(l => l.id.toString() === listId.toString());
            if (list && list.memos.length > 0) {
                const memoId = list.memos[0].id;
                updateCounter(listId, memoId, 'losses', -1, isTemporary);
            }
        }
    };
    memoInput.addEventListener('keydown', memoInput._counterHotkeyHandler);
}

// 클립보드 단축키와 카운터 단축키를 모두 등록하는 함수
function addMemoInputListeners(memoInput, listId, isTemporary = false) {
    addClipboardShortcutListener(memoInput);
    addCounterHotkeyListener(memoInput, listId, isTemporary);

    // 추천 단어 기능
    memoInput.addEventListener('input', function(e) {
        const cursor = this.selectionStart;
        const value = this.value.slice(0, cursor);
        const words = value.split(' ');
        const currentWord = words[words.length - 1];
        if (currentWord && currentWord.length > 0) {
            renderMemoSuggestions(this, currentWord);
        } else {
            removeMemoSuggestionBox();
        }
    });

    memoInput.addEventListener('keydown', function(e) {
        const box = document.getElementById('memoSuggestionBox');
        if (!box || memoSuggestionWords.length === 0) return;
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            memoSuggestionIndex = (memoSuggestionIndex + 1) % memoSuggestionWords.length;
            updateMemoSuggestionBox();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            memoSuggestionIndex = (memoSuggestionIndex - 1 + memoSuggestionWords.length) % memoSuggestionWords.length;
            updateMemoSuggestionBox();
        } else if (e.key === 'Tab') {
            e.preventDefault();
            memoSuggestionIndex = (memoSuggestionIndex + 1) % memoSuggestionWords.length;
            updateMemoSuggestionBox();
        } else if (e.key === ' ' || e.key === 'Spacebar') {
            if (memoSuggestionIndex >= 0) {
                e.preventDefault();
                selectMemoSuggestion(memoSuggestionIndex);
                // 스페이스바 입력 후 추천 단어 목록 초기화
                memoSuggestionWords = [];
                memoSuggestionIndex = -1;
                removeMemoSuggestionBox();
            }
        } else if (e.key === 'Escape') {
            removeMemoSuggestionBox();
        }
    });

    // 입력창 포커스 아웃 시 추천 박스 제거
    memoInput.addEventListener('blur', function() {
        setTimeout(removeMemoSuggestionBox, 100);
    });
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
        if (user) {
            searchInput.style.display = 'block';
            addListBtn.style.display = 'block'; // 관리자 여부와 상관없이 보이게
        } else {
            searchInput.style.display = 'none';
            addListBtn.style.display = 'none';
        }
    }
    
    // 기존목록 추가 버튼 표시/숨김
    if (addTemporaryBtn) {
        addTemporaryBtn.style.display = user ? 'block' : 'none'; // 관리자 여부와 상관없이 보이게
    }

    // Firebase 데이터 삭제 버튼 표시/숨김
    if (deleteFirebaseBtn) {
        deleteFirebaseBtn.style.display = isAdmin ? 'block' : 'none';
    }
    
    // 모든 메모 입력창 숨김
    document.querySelectorAll('input[type="text"][id^="newMemoInput-"]').forEach(input => {
        input.style.display = isAdmin ? 'block' : 'none';
    });
    
    // 모든 메모 추가 버튼 숨김
    document.querySelectorAll('button[onclick^="addMemo"]').forEach(button => {
        button.style.display = isAdmin ? 'block' : 'none';
    });
}

// Firebase Auth 상태 변경 시 UI 업데이트
firebase.auth().onAuthStateChanged((user) => {
    const loginStatus = document.getElementById('loginStatus');
    const lastUploadTimeDisplay = document.getElementById('lastUploadTimeDisplay');
    const mainContainer = document.getElementById('mainContainer');
    const provider = new firebase.auth.GoogleAuthProvider();
    if (user) {
        // 권한 체크: longway7098@gmail.com이 아니면 알림만 띄우고 화면은 숨기지 않음
        if (user.email !== 'longway7098@gmail.com') {
            alert('관리자 권한이 아닙니다. 일부 기능이 제한됩니다.');
        }
        loginStatus.textContent = '로그인하기';
        if (mainContainer) mainContainer.style.display = '';
        if (lastUploadTimeDisplay) lastUploadTimeDisplay.style.display = '';
    } else {
        loginStatus.textContent = '로그인하기';
        if (lastUploadTimeDisplay) lastUploadTimeDisplay.style.display = 'none';
        if (mainContainer) mainContainer.style.display = 'none';
        // 로그인하지 않은 경우 자동으로 로그인 팝업
        firebase.auth().signInWithPopup(provider).catch(() => {});
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

function exportLists() {
    try {
        // 내보낼 데이터 준비
        let exportData;
        
        // 로컬 스토리지와 메모리 모두 확인하여 최신 데이터 사용
        let localLists = [];
        const savedLists = localStorage.getItem('lists');
        if (savedLists) {
            localLists = JSON.parse(savedLists);
        }
        let localTemporaryLists = [];
        const savedTempLists = localStorage.getItem('temporaryLists');
        if (savedTempLists) {
            localTemporaryLists = JSON.parse(savedTempLists);
        }
        // deep copy로 comments까지 모두 포함
        const dataToExport = localLists.length > lists.length ? deepCopyWithComments(localLists) : deepCopyWithComments(lists);
        const tempToExport = localTemporaryLists.length > temporaryLists.length ? deepCopyWithComments(localTemporaryLists) : deepCopyWithComments(temporaryLists);
        exportData = {
            lists: dataToExport,
            temporaryLists: tempToExport,
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
    // ... existing code ...

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
    // 정규 목록
    lists.forEach(list => {
        (list.memos || []).forEach(memo => {
            memo.text.split(' ').forEach(word => {
                if (word.trim()) wordSet.add(word.trim());
            });
        });
    });
    // 임시 목록
    temporaryLists.forEach(list => {
        (list.memos || []).forEach(memo => {
            memo.text.split(' ').forEach(word => {
                if (word.trim()) wordSet.add(word.trim());
            });
        });
    });
    return Array.from(wordSet);
}

// 추천 단어 목록 렌더링
function renderMemoSuggestions(input, currentWord) {
    // 추천 단어 추출
    memoSuggestionWords = getAllMemoWords().filter(word =>
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
    
    // 현재 커서 위치에서 단어 찾기
    const left = value.slice(0, cursor);
    const right = value.slice(cursor);
    const leftWords = left.split(' ');
    const currentWord = leftWords[leftWords.length - 1];
    
    // 추천 단어로 대체하고 공백 추가
    leftWords[leftWords.length - 1] = memoSuggestionList[idx];
    const updatedValue = leftWords.join(' ') + ' ' + right;
    
    // 입력값 업데이트
    input.value = updatedValue;
    
    // 커서 위치를 추천 단어 다음 공백 뒤로 설정
    const newCursor = leftWords.slice(0, -1).join(' ').length + 
                     (leftWords.length > 1 ? 1 : 0) + // 이전 단어들 사이의 공백
                     memoSuggestionList[idx].length + 1; // 추천 단어 길이 + 공백
    
    input.setSelectionRange(newCursor, newCursor);
    
    // 추천 단어 관련 상태 초기화
    memoSuggestionWords = [];
    memoSuggestionIndex = -1;
    removeMemoSuggestionBox();
    input.focus();
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

    // 모바일 환경 감지 후 알림
    function isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    if (isMobile()) {
        alert('크롬으로 해당 주소를 열어주세요');
    }

    // ... existing code ...
});
// ... existing code ...