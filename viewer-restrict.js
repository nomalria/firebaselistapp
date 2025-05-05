// viewer.html 전용 기능 제한 스크립트
// 이 파일에 제한 로직을 추가할 예정입니다. 

function hideViewerRestrictedButtons() {
    // 1. 목록 추가 입력창, 추가 버튼, 기존목록 추가 버튼 숨김
    const searchInput = document.getElementById('searchInput');
    const addListBtn = document.getElementById('addListBtn');
    if (searchInput) searchInput.style.display = 'none';
    if (addListBtn) addListBtn.style.display = 'none';
    const addTemporaryBtn = document.getElementById('addTemporaryBtn');
    if (addTemporaryBtn) addTemporaryBtn.style.display = 'none';

    // 2. 메모 추가 입력창 및 버튼 숨김
    document.querySelectorAll('input[id^="newMemoInput-"]').forEach(input => {
        input.style.display = 'none';
    });
    document.querySelectorAll('button[onclick^="addMemo"]').forEach(btn => {
        btn.style.display = 'none';
    });

    // 3. 목록/메모 편집, 삭제 버튼 숨김
    document.querySelectorAll('.edit-btn, .delete-btn').forEach(btn => {
        btn.style.display = 'none';
    });

    // 4. 메모 승/패 조작 버튼(카운터, 상태) 숨김
    document.querySelectorAll('.counter-btn, .status-btn').forEach(btn => {
        btn.style.display = 'none';
    });

    // 5. 클립보드 기능 제한 (입력, 추가, 삭제, 단축키)
    // 클립보드 텍스트 입력 숨김
    document.querySelectorAll('.clipboard-text').forEach(input => {
        input.style.display = 'none';
    });
    // 클립보드 추가/삭제 버튼 숨김
    document.querySelectorAll('.add-clipboard-item, .delete-clipboard-item').forEach(btn => {
        btn.style.display = 'none';
    });
    // 클립보드 단축키 입력 차단
    document.querySelectorAll('.clipboard-text').forEach(input => {
        input.addEventListener('keydown', function(e) {
            e.preventDefault();
        });
    });

    // 클립보드 단축키 안내문구 변경
    const clipboardDesc = document.querySelector('.clipboard-description');
    if (clipboardDesc) {
        clipboardDesc.textContent = '뷰어에서는 클립보드 편집 및 단축키 입력이 제한됩니다.';
    }

    // 6. 로그인 UI 및 인증 로직 숨김/비활성화
    const loginStatus = document.getElementById('loginStatus');
    if (loginStatus) loginStatus.style.display = 'none';
    // 메인 컨테이너 항상 표시
    const mainContainer = document.getElementById('mainContainer');
    if (mainContainer) mainContainer.style.display = '';

    // Firebase 인증 관련 함수 무력화 (handleLoginStatus 등)
    window.handleLoginStatus = function() {};
    if (window.firebase && window.firebase.auth) {
        window.firebase.auth = function() { return { onAuthStateChanged: function(){} } };
    }
}

// toggleMemos 오버라이드: viewer에서는 목록을 열 때 해당 list-item 전체가 화면에 오도록 스크롤
function toggleMemos(listId) {
    const memoSection = document.getElementById(`memoSection-${listId}`);
    if (!memoSection) return;

    const isExpanded = memoSection.classList.contains('expanded');
    document.querySelectorAll('.memo-section.expanded').forEach(section => {
        if (section.id !== `memoSection-${listId}`) {
            section.classList.remove('expanded');
        }
    });
    memoSection.classList.toggle('expanded');

    if (!isExpanded) {
        setTimeout(() => {
            // 해당 목록 전체(list-item)가 화면에 오도록 스크롤
            const listItem = memoSection.closest('.list-item');
            if (listItem) {
                const rect = listItem.getBoundingClientRect();
                const scrollTop = window.scrollY + rect.top - 40; // 약간의 여유
                window.scrollTo({ top: scrollTop, behavior: 'smooth' });
            }
        }, 150);
    }
}

window.addEventListener('DOMContentLoaded', function() {
    // 기존 제한 코드 및 클립보드/로그인 숨김 등...
    hideViewerRestrictedButtons();
    // 클립보드 관련 UI, 로그인 UI 등 숨김/무력화 (생략)
    // ...

    // Firebase/로컬 목록 불러오기 후에도 버튼 숨김 적용
    function afterRenderPatch() {
        setTimeout(hideViewerRestrictedButtons, 0);
    }
    // renderLists, renderTemporaryLists 후처리 패치
    const origRenderLists = window.renderLists;
    if (origRenderLists) {
        window.renderLists = function(...args) {
            origRenderLists.apply(this, args);
            afterRenderPatch();
        };
    }
    const origRenderTemporaryLists = window.renderTemporaryLists;
    if (origRenderTemporaryLists) {
        window.renderTemporaryLists = function(...args) {
            origRenderTemporaryLists.apply(this, args);
            afterRenderPatch();
        };
    }

    // Firebase/로컬 불러오기
    async function loadListsForViewer() {
        let loaded = false;
        try {
            const db = firebase.firestore();
            const mainListsDoc = await db.collection('lists').doc('main').get();
            const tempListsDoc = await db.collection('lists').doc('temporary').get();
            if (mainListsDoc.exists) {
                const data = mainListsDoc.data();
                lists = data.lists || [];
                loaded = true;
            }
            if (tempListsDoc.exists) {
                const data = tempListsDoc.data();
                temporaryLists = data.lists || [];
            }
        } catch (e) {
            loaded = false;
        }
        if (!loaded) {
            const savedLists = localStorage.getItem('lists');
            const savedTempLists = localStorage.getItem('temporaryLists');
            lists = savedLists ? JSON.parse(savedLists) : [];
            temporaryLists = savedTempLists ? JSON.parse(savedTempLists) : [];
        }
        if (typeof renderLists === 'function') renderLists(1);
        if (typeof renderTemporaryLists === 'function') renderTemporaryLists();
        if (typeof updateStats === 'function') updateStats();
        afterRenderPatch();
    }
    loadListsForViewer();

    // JSON 불러오기 버튼 동작: 로그인/권한 체크 없이 동작하도록 별도 구현
    const importBtn = document.getElementById('importJsonBtn');
    const fileInput = document.getElementById('jsonFileInput');
    if (importBtn && fileInput) {
        importBtn.onclick = function() {
            fileInput.value = '';
            fileInput.click();
        };
        fileInput.onchange = function(event) {
            const file = event.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const jsonData = JSON.parse(e.target.result);
                    // 임시목록만 있는 경우 처리
                    if (jsonData.temporaryLists && (!jsonData.lists || jsonData.lists.length === 0)) {
                        temporaryLists = jsonData.temporaryLists;
                        if (typeof renderTemporaryLists === 'function') renderTemporaryLists();
                        localStorage.setItem('temporaryLists', JSON.stringify(temporaryLists));
                        alert('임시목록 데이터가 성공적으로 불러와졌습니다.');
                        afterRenderPatch();
                        return;
                    }
                    if (Array.isArray(jsonData)) {
                        lists = jsonData;
                    } else if (jsonData.lists && Array.isArray(jsonData.lists)) {
                        lists = jsonData.lists;
                    }
                    if (jsonData.temporaryLists && Array.isArray(jsonData.temporaryLists)) {
                        temporaryLists = jsonData.temporaryLists;
                    }
                    if (typeof renderLists === 'function') renderLists(1);
                    if (typeof renderTemporaryLists === 'function') renderTemporaryLists();
                    if (typeof updateStats === 'function') updateStats();
                    localStorage.setItem('lists', JSON.stringify(lists));
                    localStorage.setItem('temporaryLists', JSON.stringify(temporaryLists));
                    alert('JSON 데이터가 성공적으로 불러와졌습니다.');
                    afterRenderPatch();
                } catch (err) {
                    alert('올바른 JSON 파일이 아닙니다.');
                }
            };
            reader.readAsText(file);
        };
    }

    // 검색 기능: 검색어 입력 후 버튼 클릭 또는 엔터 시, 해당 단어 포함 목록을 임시목록으로 이동
    const searchInput = document.getElementById('viewerSearchInput');
    const searchBtn = document.getElementById('viewerSearchBtn');
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
        // 임시목록에 옮기고 기존 목록에서는 제외
        temporaryLists = matched;
        lists = lists.filter(list => !matched.includes(list));
        // 화면 갱신
        if (typeof renderLists === 'function') renderLists(1);
        if (typeof renderTemporaryLists === 'function') renderTemporaryLists();
        if (typeof updateStats === 'function') updateStats();
        // 검색창 비우기
        searchInput.value = '';
    }
    if (searchBtn) searchBtn.onclick = doViewerSearch;
    if (searchInput) searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') doViewerSearch();
    });

    // 임시목록을 기존목록으로 이동시키는 버튼 동작
    const moveBtn = document.getElementById('moveTempToMainBtn');
    if (moveBtn) {
        moveBtn.onclick = function() {
            if (temporaryLists.length === 0) return;
            // 기존 목록에 임시목록을 모두 추가
            lists = lists.concat(temporaryLists);
            temporaryLists = [];
            // 화면 갱신
            if (typeof renderLists === 'function') renderLists(1);
            if (typeof renderTemporaryLists === 'function') renderTemporaryLists();
            if (typeof updateStats === 'function') updateStats();
        };
    }

    // 필터 타입 전역 변수
    let viewerCurrentFilterType = 'all';

    // 카테고리 버튼 필터링 기능 (viewer 전용)
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.onclick = function() {
            const filterType = this.dataset.filterType;
            viewerCurrentFilterType = filterType;
            // 버튼 활성화 상태 업데이트
            document.querySelectorAll('.category-btn').forEach(b => {
                b.classList.toggle('active', b.dataset.filterType === filterType);
            });
            // 화면 갱신
            if (typeof renderLists === 'function') renderLists(1);
        };
    });

    // renderLists 오버라이드: 항상 현재 필터에 맞는 목록만 보여줌
    if (!window._viewerOrigRenderLists && window.renderLists) {
        window._viewerOrigRenderLists = window.renderLists;
        window.renderLists = function(page = 1) {
            let filtered = lists;
            if (viewerCurrentFilterType === '4방덱') {
                filtered = lists.filter(list => list.title.includes('4방덱'));
            } else if (viewerCurrentFilterType === '5방덱') {
                filtered = lists.filter(list => list.title.includes('5방덱'));
            } else if (viewerCurrentFilterType === '기타') {
                filtered = lists.filter(list => !list.title.includes('4방덱') && !list.title.includes('5방덱'));
            }
            const originalLists = lists;
            lists = filtered;
            window._viewerOrigRenderLists.call(this, page);
            lists = originalLists;
            setTimeout(hideViewerRestrictedButtons, 0);
        };
    }

    // 추천단어(자동완성) 기능
    const suggestionsDiv = document.getElementById('viewerSearchSuggestions');
    let suggestionWords = [];
    let selectedSuggestionIndex = -1;

    function updateSuggestions() {
        if (!searchInput) return;
        const value = searchInput.value.trim();
        if (!value) {
            suggestionsDiv.innerHTML = '';
            suggestionWords = [];
            selectedSuggestionIndex = -1;
            return;
        }
        // 마지막 단어만 추출
        const words = value.split(/\s+/);
        const lastWord = words[words.length - 1];
        if (!lastWord) {
            suggestionsDiv.innerHTML = '';
            suggestionWords = [];
            selectedSuggestionIndex = -1;
            return;
        }
        // 기존 목록에서 모든 단어 추출(중복제거)
        const allWords = new Set();
        lists.forEach(list => {
            list.title.split(/\s+/).forEach(w => {
                if (w) allWords.add(w);
            });
        });
        // 입력값과 일치/포함되는 단어만 추천
        const matches = Array.from(allWords).filter(w => w.includes(lastWord) && w !== lastWord);
        suggestionWords = matches;
        selectedSuggestionIndex = matches.length > 0 ? 0 : -1;
        // 추천단어 표시
        suggestionsDiv.innerHTML = matches.map((w, i) => `<div class="suggestion-item${i===selectedSuggestionIndex?' selected':''}" data-index="${i}">${w}</div>`).join('');
    }

    // 검색창 입력 시 추천단어 갱신
    if (searchInput) {
        searchInput.addEventListener('input', updateSuggestions);
        // 방향키, 탭, 스페이스바 등 네비게이션
        searchInput.addEventListener('keydown', function(e) {
            if (!suggestionWords.length) return;
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                selectedSuggestionIndex = (selectedSuggestionIndex + 1) % suggestionWords.length;
                updateSuggestionHighlight();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                selectedSuggestionIndex = (selectedSuggestionIndex - 1 + suggestionWords.length) % suggestionWords.length;
                updateSuggestionHighlight();
            } else if (e.key === 'Tab') {
                e.preventDefault();
                selectedSuggestionIndex = (selectedSuggestionIndex + 1) % suggestionWords.length;
                updateSuggestionHighlight();
            } else if (e.key === ' ') {
                // 스페이스바로 추천단어 대체
                if (selectedSuggestionIndex >= 0) {
                    e.preventDefault();
                    const words = this.value.trim().split(/\s+/);
                    words[words.length - 1] = suggestionWords[selectedSuggestionIndex];
                    this.value = words.join(' ') + ' ';
                    updateSuggestions();
                }
            }
        });
    }
    // 추천단어 마우스 클릭 시 대체
    suggestionsDiv.addEventListener('mousedown', function(e) {
        const item = e.target.closest('.suggestion-item');
        if (item) {
            const idx = parseInt(item.dataset.index);
            if (!isNaN(idx)) {
                const words = searchInput.value.trim().split(/\s+/);
                words[words.length - 1] = suggestionWords[idx];
                searchInput.value = words.join(' ') + ' ';
                updateSuggestions();
                searchInput.focus();
            }
        }
    });
    function updateSuggestionHighlight() {
        Array.from(suggestionsDiv.children).forEach((el, i) => {
            el.classList.toggle('selected', i === selectedSuggestionIndex);
        });
    }

    // 메모 검색 기능
    const memoSearchBtn = document.getElementById('viewerMemoSearchBtn');
    const memoSearchDropdown = document.getElementById('memoSearchDropdown');
    const memoSearchInput = document.getElementById('memoSearchInput');
    const memoSearchSubmitBtn = document.getElementById('memoSearchBtn');
    const memoSearchSuggestions = document.getElementById('memoSearchSuggestions');

    const inputGroup = document.querySelector('.search-section .input-group');

    function toggleMemoSearch() {
        memoSearchDropdown.classList.toggle('show');
        if (memoSearchDropdown.classList.contains('show')) {
            memoSearchInput.focus();
            if (inputGroup) inputGroup.style.visibility = 'hidden';
            if (memoSearchDropdown) memoSearchDropdown.style.visibility = 'visible';
        } else {
            if (inputGroup) inputGroup.style.visibility = 'visible';
        }
    }

    function doMemoSearch() {
        const query = memoSearchInput.value.trim();
        if (!query) return;
        const keywords = query.split(/\s+/).map(w => w.trim()).filter(Boolean);
        if (keywords.length === 0) return;

        const matched = lists.filter(list => {
            return list.memos && list.memos.some(memo => {
                const memoWords = memo.text.split(/\s+/);
                return keywords.every(kw => memoWords.includes(kw));
            });
        });

        temporaryLists = matched;
        lists = lists.filter(list => !matched.includes(list));

        if (typeof renderLists === 'function') renderLists(1);
        if (typeof renderTemporaryLists === 'function') renderTemporaryLists();
        if (typeof updateStats === 'function') updateStats();
        memoSearchInput.value = '';
        memoSearchDropdown.classList.remove('show');
        if (inputGroup) inputGroup.style.visibility = 'visible';
    }

    if (memoSearchBtn) {
        memoSearchBtn.onclick = toggleMemoSearch;
    }

    if (memoSearchSubmitBtn) {
        memoSearchSubmitBtn.onclick = doMemoSearch;
    }

    if (memoSearchInput) {
        memoSearchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') doMemoSearch();
        });
    }

    // 메모 검색 추천단어 기능
    let memoSuggestionWords = [];
    let selectedMemoSuggestionIndex = -1;

    function updateMemoSuggestions() {
        if (!memoSearchInput) return;
        const value = memoSearchInput.value.trim();
        if (!value) {
            memoSearchSuggestions.innerHTML = '';
            memoSuggestionWords = [];
            selectedMemoSuggestionIndex = -1;
            return;
        }

        const words = value.split(/\s+/);
        const lastWord = words[words.length - 1];
        if (!lastWord) {
            memoSearchSuggestions.innerHTML = '';
            memoSuggestionWords = [];
            selectedMemoSuggestionIndex = -1;
            return;
        }

        // 오직 메모 내용에서만 추천단어 추출
        const allWords = new Set();
        lists.forEach(list => {
            if (list.memos) {
                list.memos.forEach(memo => {
                    memo.text.split(/\s+/).forEach(w => {
                        if (w) allWords.add(w);
                    });
                });
            }
        });

        const matches = Array.from(allWords).filter(w => w.includes(lastWord) && w !== lastWord);
        memoSuggestionWords = matches;
        selectedMemoSuggestionIndex = matches.length > 0 ? 0 : -1;
        memoSearchSuggestions.innerHTML = matches.map((w, i) => 
            `<div class="suggestion-item${i===selectedMemoSuggestionIndex?' selected':''}" data-index="${i}">${w}</div>`
        ).join('');
    }

    if (memoSearchInput) {
        memoSearchInput.addEventListener('input', updateMemoSuggestions);
        memoSearchInput.addEventListener('keydown', function(e) {
            if (!memoSuggestionWords.length) return;
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                selectedMemoSuggestionIndex = (selectedMemoSuggestionIndex + 1) % memoSuggestionWords.length;
                updateMemoSuggestionHighlight();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                selectedMemoSuggestionIndex = (selectedMemoSuggestionIndex - 1 + memoSuggestionWords.length) % memoSuggestionWords.length;
                updateMemoSuggestionHighlight();
            } else if (e.key === 'Tab') {
                e.preventDefault();
                selectedMemoSuggestionIndex = (selectedMemoSuggestionIndex + 1) % memoSuggestionWords.length;
                updateMemoSuggestionHighlight();
            } else if (e.key === ' ') {
                if (selectedMemoSuggestionIndex >= 0) {
                    e.preventDefault();
                    const words = this.value.trim().split(/\s+/);
                    words[words.length - 1] = memoSuggestionWords[selectedMemoSuggestionIndex];
                    this.value = words.join(' ') + ' ';
                    updateMemoSuggestions();
                }
            }
        });
    }

    memoSearchSuggestions.addEventListener('mousedown', function(e) {
        const item = e.target.closest('.suggestion-item');
        if (item) {
            const idx = parseInt(item.dataset.index);
            if (!isNaN(idx)) {
                const words = memoSearchInput.value.trim().split(/\s+/);
                words[words.length - 1] = memoSuggestionWords[idx];
                memoSearchInput.value = words.join(' ') + ' ';
                updateMemoSuggestions();
                memoSearchInput.focus();
            }
        }
    });

    function updateMemoSuggestionHighlight() {
        Array.from(memoSearchSuggestions.children).forEach((el, i) => {
            el.classList.toggle('selected', i === selectedMemoSuggestionIndex);
        });
    }

    // 정렬 및 임시목록 이동 버튼 기능
    const sortAndMoveBtn = document.getElementById('sortAndMoveBtn');
    if (sortAndMoveBtn) {
        sortAndMoveBtn.onclick = function() {
            // 1. 목록 및 메모 정렬 (기존 sortBtn 기능)
            if (typeof sortListsAndMemos === 'function') sortListsAndMemos();
            // 2. 임시목록 기존목록으로 이동 (기존 moveTempToMainBtn 기능)
            if (temporaryLists && temporaryLists.length > 0) {
                lists = lists.concat(temporaryLists);
                temporaryLists = [];
            }
            // 3. 화면 갱신
            if (typeof renderLists === 'function') renderLists(1);
            if (typeof renderTemporaryLists === 'function') renderTemporaryLists();
            if (typeof updateStats === 'function') updateStats();
        };
    }
}); 