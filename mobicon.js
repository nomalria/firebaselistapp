// 실험용: 단어별 이미지 경로 매핑
const mobImageMap = {
    '물머메': 'summoners_war_images/water/106.png',
    '풍머메': 'summoners_war_images/wind/110.png',
    '불요괴': 'summoners_war_images/fire/88.png',
};

// 목록 제목에서 특정 단어가 있으면 이미지를 차례대로 반환
function renderMobIconsForList(listTitle, isTemporary = false, force = false) {
    // force가 true면 무조건 아이콘 표시(메모용)
    if (!force && !window.location.pathname.includes('viewer.html')) {
        if (!isTemporary && !isCurrentPageList(listTitle)) {
            return '';
        }
    }
    const words = listTitle.split(' ').filter(Boolean);
    const icons = [];
    
    // 목록의 단어 순서대로 이미지 생성
    words.forEach(word => {
        if (mobImageMap[word]) {
            const imgSrc = mobImageMap[word];
            icons.push(`<img src="${imgSrc}" alt="${word}" title="${word}" class="mob-icon">`);
        }
    });   
    return icons.join(' ');
}
// 현재 페이지의 목록인지 확인하는 함수
function isCurrentPageList(listTitle) {
    const listsContainer = document.getElementById('lists');
    if (!listsContainer) return false;
    const currentPageLists = Array.from(listsContainer.querySelectorAll('.list-title-text'))
        .map(el => el.textContent.trim());
    return currentPageLists.includes(listTitle);
}
// window에 등록
window.renderMobIconsForList = renderMobIconsForList;
