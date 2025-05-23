const { saveToSheets, loadFromSheets } = require('./sheets-api');

async function testSheets() {
    // 테스트용 데이터
    const testData = {
        lists: [{ id: "1", title: "테스트 목록", memos: [{ id: "m1", text: "테스트 메모" }] }],
        temporaryLists: [{ id: "2", title: "임시 목록", memos: [] }]
    };

    // 저장 테스트
    const saveResult = await saveToSheets(testData);
    console.log('저장 결과:', saveResult);

    // 불러오기 테스트
    const loadResult = await loadFromSheets();
    console.log('불러온 데이터:', loadResult);
}

testSheets();