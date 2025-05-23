const { google } = require('googleapis');

// Google Sheets API 설정
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const SPREADSHEET_ID = '1U580Tv58dXmY1OLUHyrNhDSxBla554rY-7eu6rreVBM'; // 여기에 스프레드시트 ID를 입력하세요

// Google Sheets API 클라이언트 초기화
async function initializeSheetsAPI() {
    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: 'credentials.json', // 서비스 계정 키 파일
            scopes: SCOPES,
        });

        const sheets = google.sheets({ version: 'v4', auth });
        return sheets;
    } catch (error) {
        console.error('Google Sheets API 초기화 오류:', error);
        throw error;
    }
}

// 데이터 저장 함수
async function saveToSheets(data) {
    try {
        const sheets = await initializeSheetsAPI();
        
        // 메인 목록 저장
        await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: 'MainLists!A1',
            valueInputOption: 'RAW',
            resource: {
                values: [[JSON.stringify(data.lists)]]
            }
        });

        // 임시 목록 저장
        await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: 'TemporaryLists!A1',
            valueInputOption: 'RAW',
            resource: {
                values: [[JSON.stringify(data.temporaryLists)]]
            }
        });

        return true;
    } catch (error) {
        console.error('Google Sheets 저장 오류:', error);
        return false;
    }
}

// 데이터 로드 함수
async function loadFromSheets() {
    try {
        const sheets = await initializeSheetsAPI();
        
        // 메인 목록 로드
        const mainResponse = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: 'MainLists!A1'
        });

        // 임시 목록 로드
        const tempResponse = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: 'TemporaryLists!A1'
        });

        return {
            lists: mainResponse.data.values ? JSON.parse(mainResponse.data.values[0][0]) : [],
            temporaryLists: tempResponse.data.values ? JSON.parse(tempResponse.data.values[0][0]) : []
        };
    } catch (error) {
        console.error('Google Sheets 로드 오류:', error);
        return {
            lists: [],
            temporaryLists: []
        };
    }
}

module.exports = {
    saveToSheets,
    loadFromSheets
}; 