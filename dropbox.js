// 아이콘 열람 드롭다운 열기/닫기 및 이미지 표시 기능
(function() {
    // 몬스터 아이콘 데이터 구조
    const monsterIcons = {
        fire: {
            name: "불속성",
            searchText: "불속성",
            icons: [
                { id:"fire1", name:"불사전", path:"summoners_war_images/fire/1.png", order: 1, searchText:"불사전"},
                { id:"fire2", name:"이미지2", path:"summoners_war_images/fire/2.png", order: 2, searchText:"이미지2"},
                { id:"fire3", name:"이미지3", path:"summoners_war_images/fire/3.png", order: 3, searchText:"이미지3"},
                { id:"fire4", name:"이미지4", path:"summoners_war_images/fire/4.png", order: 4, searchText:"이미지4"},
                { id:"fire5", name:"이미지5", path:"summoners_war_images/fire/5.png", order: 5, searchText:"이미지5"},
                { id:"fire6", name:"이미지6", path:"summoners_war_images/fire/6.png", order: 6, searchText:"이미지6"},
                { id:"fire7", name:"이미지7", path:"summoners_war_images/fire/7.png", order: 7, searchText:"이미지7"},
                { id:"fire8", name:"이미지8", path:"summoners_war_images/fire/8.png", order: 8, searchText:"이미지8"},
                { id:"fire9", name:"이미지9", path:"summoners_war_images/fire/9.png", order: 9, searchText:"이미지9"},
                { id:"fire10", name:"이미지10", path:"summoners_war_images/fire/10.png", order: 10, searchText:"이미지10"},
                { id:"fire11", name:"이미지11", path:"summoners_war_images/fire/11.png", order: 11, searchText:"이미지11"},
                { id:"fire12", name:"이미지12", path:"summoners_war_images/fire/12.png", order: 12, searchText:"이미지12"},
                { id:"fire13", name:"이미지13", path:"summoners_war_images/fire/13.png", order: 13, searchText:"이미지13"},
                { id:"fire14", name:"이미지14", path:"summoners_war_images/fire/14.png", order: 14, searchText:"이미지14"},
                { id:"fire15", name:"이미지15", path:"summoners_war_images/fire/15.png", order: 15, searchText:"이미지15"},
                { id:"fire16", name:"이미지16", path:"summoners_war_images/fire/16.png", order: 16, searchText:"이미지16"},
                { id:"fire17", name:"이미지17", path:"summoners_war_images/fire/17.png", order: 17, searchText:"이미지17"},
                { id:"fire18", name:"이미지18", path:"summoners_war_images/fire/18.png", order: 18, searchText:"이미지18"},
                { id:"fire19", name:"이미지19", path:"summoners_war_images/fire/19.png", order: 19, searchText:"이미지19"},
                { id:"fire20", name:"이미지20", path:"summoners_war_images/fire/20.png", order: 20, searchText:"이미지20"},
                { id:"fire21", name:"이미지21", path:"summoners_war_images/fire/21.png", order: 21, searchText:"이미지21"},
                { id:"fire22", name:"이미지22", path:"summoners_war_images/fire/22.png", order: 22, searchText:"이미지22"},
                { id:"fire23", name:"이미지23", path:"summoners_war_images/fire/23.png", order: 23, searchText:"이미지23"},
                { id:"fire24", name:"이미지24", path:"summoners_war_images/fire/24.png", order: 24, searchText:"이미지24"},
                { id:"fire25", name:"이미지25", path:"summoners_war_images/fire/25.png", order: 25, searchText:"이미지25"},
                { id:"fire26", name:"이미지26", path:"summoners_war_images/fire/26.png", order: 26, searchText:"이미지26"},
                { id:"fire27", name:"이미지27", path:"summoners_war_images/fire/27.png", order: 27, searchText:"이미지27"},
                { id:"fire28", name:"이미지28", path:"summoners_war_images/fire/28.png", order: 28, searchText:"이미지28"},
                { id:"fire29", name:"이미지29", path:"summoners_war_images/fire/29.png", order: 29, searchText:"이미지29"},
                { id:"fire30", name:"이미지30", path:"summoners_war_images/fire/30.png", order: 30, searchText:"이미지30"},
                { id:"fire31", name:"이미지31", path:"summoners_war_images/fire/31.png", order: 31, searchText:"이미지31"},
                { id:"fire32", name:"이미지32", path:"summoners_war_images/fire/32.png", order: 32, searchText:"이미지32"},
                { id:"fire33", name:"이미지33", path:"summoners_war_images/fire/33.png", order: 33, searchText:"이미지33"},
                { id:"fire34", name:"이미지34", path:"summoners_war_images/fire/34.png", order: 34, searchText:"이미지34"},
                { id:"fire35", name:"이미지35", path:"summoners_war_images/fire/35.png", order: 35, searchText:"이미지35"},
                { id:"fire36", name:"이미지36", path:"summoners_war_images/fire/36.png", order: 36, searchText:"이미지36"},
                { id:"fire37", name:"이미지37", path:"summoners_war_images/fire/37.png", order: 37, searchText:"이미지37"},
                { id:"fire38", name:"이미지38", path:"summoners_war_images/fire/38.png", order: 38, searchText:"이미지38"},
                { id:"fire39", name:"이미지39", path:"summoners_war_images/fire/39.png", order: 39, searchText:"이미지39"},
                { id:"fire40", name:"이미지40", path:"summoners_war_images/fire/40.png", order: 40, searchText:"이미지40"},
                { id:"fire41", name:"이미지41", path:"summoners_war_images/fire/41.png", order: 41, searchText:"이미지41"},
                { id:"fire42", name:"이미지42", path:"summoners_war_images/fire/42.png", order: 42, searchText:"이미지42"},
                { id:"fire43", name:"이미지43", path:"summoners_war_images/fire/43.png", order: 43, searchText:"이미지43"},
                { id:"fire44", name:"이미지44", path:"summoners_war_images/fire/44.png", order: 44, searchText:"이미지44"},
                { id:"fire45", name:"이미지45", path:"summoners_war_images/fire/45.png", order: 45, searchText:"이미지45"},
                { id:"fire46", name:"이미지46", path:"summoners_war_images/fire/46.png", order: 46, searchText:"이미지46"},
                { id:"fire47", name:"이미지47", path:"summoners_war_images/fire/47.png", order: 47, searchText:"이미지47"},
                { id:"fire48", name:"이미지48", path:"summoners_war_images/fire/48.png", order: 48, searchText:"이미지48"},
                { id:"fire49", name:"이미지49", path:"summoners_war_images/fire/49.png", order: 49, searchText:"이미지49"},
                { id:"fire50", name:"이미지50", path:"summoners_war_images/fire/50.png", order: 50, searchText:"이미지50"},
                { id:"fire51", name:"이미지51", path:"summoners_war_images/fire/51.png", order: 51, searchText:"이미지51"},
                { id:"fire52", name:"이미지52", path:"summoners_war_images/fire/52.png", order: 52, searchText:"이미지52"},
                { id:"fire53", name:"이미지53", path:"summoners_war_images/fire/53.png", order: 53, searchText:"이미지53"},
                { id:"fire54", name:"이미지54", path:"summoners_war_images/fire/54.png", order: 54, searchText:"이미지54"},
                { id:"fire55", name:"이미지55", path:"summoners_war_images/fire/55.png", order: 55, searchText:"이미지55"},
                { id:"fire56", name:"이미지56", path:"summoners_war_images/fire/56.png", order: 56, searchText:"이미지56"},
                { id:"fire57", name:"이미지57", path:"summoners_war_images/fire/57.png", order: 57, searchText:"이미지57"},
                { id:"fire58", name:"이미지58", path:"summoners_war_images/fire/58.png", order: 58, searchText:"이미지58"},
                { id:"fire59", name:"이미지59", path:"summoners_war_images/fire/59.png", order: 59, searchText:"이미지59"},
                { id:"fire60", name:"이미지60", path:"summoners_war_images/fire/60.png", order: 60, searchText:"이미지60"},
                { id:"fire61", name:"이미지61", path:"summoners_war_images/fire/61.png", order: 61, searchText:"이미지61"},
                { id:"fire62", name:"이미지62", path:"summoners_war_images/fire/62.png", order: 62, searchText:"이미지62"},
                { id:"fire63", name:"이미지63", path:"summoners_war_images/fire/63.png", order: 63, searchText:"이미지63"},
                { id:"fire64", name:"이미지64", path:"summoners_war_images/fire/64.png", order: 64, searchText:"이미지64"},
                { id:"fire65", name:"이미지65", path:"summoners_war_images/fire/65.png", order: 65, searchText:"이미지65"},
                { id:"fire66", name:"이미지66", path:"summoners_war_images/fire/66.png", order: 66, searchText:"이미지66"},
                { id:"fire67", name:"이미지67", path:"summoners_war_images/fire/67.png", order: 67, searchText:"이미지67"},
                { id:"fire68", name:"이미지68", path:"summoners_war_images/fire/68.png", order: 68, searchText:"이미지68"},
                { id:"fire69", name:"이미지69", path:"summoners_war_images/fire/69.png", order: 69, searchText:"이미지69"},
                { id:"fire70", name:"이미지70", path:"summoners_war_images/fire/70.png", order: 70, searchText:"이미지70"},
                { id:"fire71", name:"이미지71", path:"summoners_war_images/fire/71.png", order: 71, searchText:"이미지71"},
                { id:"fire72", name:"이미지72", path:"summoners_war_images/fire/72.png", order: 72, searchText:"이미지72"},
                { id:"fire73", name:"이미지73", path:"summoners_war_images/fire/73.png", order: 73, searchText:"이미지73"},
                { id:"fire74", name:"이미지74", path:"summoners_war_images/fire/74.png", order: 74, searchText:"이미지74"},
                { id:"fire75", name:"이미지75", path:"summoners_war_images/fire/75.png", order: 75, searchText:"이미지75"},
                { id:"fire76", name:"이미지76", path:"summoners_war_images/fire/76.png", order: 76, searchText:"이미지76"},
                { id:"fire77", name:"이미지77", path:"summoners_war_images/fire/77.png", order: 77, searchText:"이미지77"},
                { id:"fire78", name:"이미지78", path:"summoners_war_images/fire/78.png", order: 78, searchText:"이미지78"},
                { id:"fire79", name:"이미지79", path:"summoners_war_images/fire/79.png", order: 79, searchText:"이미지79"},
                { id:"fire80", name:"이미지80", path:"summoners_war_images/fire/80.png", order: 80, searchText:"이미지80"},
                { id:"fire81", name:"이미지81", path:"summoners_war_images/fire/81.png", order: 81, searchText:"이미지81"},
                { id:"fire82", name:"이미지82", path:"summoners_war_images/fire/82.png", order: 82, searchText:"이미지82"},
                { id:"fire83", name:"이미지83", path:"summoners_war_images/fire/83.png", order: 83, searchText:"이미지83"},
                { id:"fire84", name:"이미지84", path:"summoners_war_images/fire/84.png", order: 84, searchText:"이미지84"},
                { id:"fire85", name:"이미지85", path:"summoners_war_images/fire/85.png", order: 85, searchText:"이미지85"},
                { id:"fire86", name:"이미지86", path:"summoners_war_images/fire/86.png", order: 86, searchText:"이미지86"},
                { id:"fire87", name:"이미지87", path:"summoners_war_images/fire/87.png", order: 87, searchText:"이미지87"},
                { id:"fire88", name:"이미지88", path:"summoners_war_images/fire/88.png", order: 88, searchText:"이미지88"},
                { id:"fire89", name:"이미지89", path:"summoners_war_images/fire/89.png", order: 89, searchText:"이미지89"},
                { id:"fire90", name:"이미지90", path:"summoners_war_images/fire/90.png", order: 90, searchText:"이미지90"},
                { id:"fire91", name:"이미지91", path:"summoners_war_images/fire/91.png", order: 91, searchText:"이미지91"},
                { id:"fire92", name:"이미지92", path:"summoners_war_images/fire/92.png", order: 92, searchText:"이미지92"},
                { id:"fire93", name:"이미지93", path:"summoners_war_images/fire/93.png", order: 93, searchText:"이미지93"},
                { id:"fire94", name:"이미지94", path:"summoners_war_images/fire/94.png", order: 94, searchText:"이미지94"},
                { id:"fire95", name:"이미지95", path:"summoners_war_images/fire/95.png", order: 95, searchText:"이미지95"},
                { id:"fire96", name:"이미지96", path:"summoners_war_images/fire/96.png", order: 96, searchText:"이미지96"},
                { id:"fire97", name:"이미지97", path:"summoners_war_images/fire/97.png", order: 97, searchText:"이미지97"},
                { id:"fire98", name:"이미지98", path:"summoners_war_images/fire/98.png", order: 98, searchText:"이미지98"},
                { id:"fire99", name:"이미지99", path:"summoners_war_images/fire/99.png", order: 99, searchText:"이미지99"},
                { id:"fire100", name:"이미지100", path:"summoners_war_images/fire/100.png", order: 100, searchText:"이미지100"},
                { id:"fire101", name:"이미지101", path:"summoners_war_images/fire/101.png", order: 101, searchText:"이미지101"},
                { id:"fire102", name:"이미지102", path:"summoners_war_images/fire/102.png", order: 102, searchText:"이미지102"},
                { id:"fire103", name:"이미지103", path:"summoners_war_images/fire/103.png", order: 103, searchText:"이미지103"},
                { id:"fire104", name:"이미지104", path:"summoners_war_images/fire/104.png", order: 104, searchText:"이미지104"},
                { id:"fire105", name:"이미지105", path:"summoners_war_images/fire/105.png", order: 105, searchText:"이미지105"},
                { id:"fire106", name:"이미지106", path:"summoners_war_images/fire/106.png", order: 106, searchText:"이미지106"},
                { id:"fire107", name:"이미지107", path:"summoners_war_images/fire/107.png", order: 107, searchText:"이미지107"},
                { id:"fire108", name:"이미지108", path:"summoners_war_images/fire/108.png", order: 108, searchText:"이미지108"},
                { id:"fire109", name:"이미지109", path:"summoners_war_images/fire/109.png", order: 109, searchText:"이미지109"},
                { id:"fire110", name:"이미지110", path:"summoners_war_images/fire/110.png", order: 110, searchText:"이미지110"},
                { id:"fire111", name:"이미지111", path:"summoners_war_images/fire/111.png", order: 111, searchText:"이미지111"},
                { id:"fire112", name:"이미지112", path:"summoners_war_images/fire/112.png", order: 112, searchText:"이미지112"},
                { id:"fire113", name:"이미지113", path:"summoners_war_images/fire/113.png", order: 113, searchText:"이미지113"},
                { id:"fire114", name:"이미지114", path:"summoners_war_images/fire/114.png", order: 114, searchText:"이미지114"},
                { id:"fire115", name:"이미지115", path:"summoners_war_images/fire/115.png", order: 115, searchText:"이미지115"},
                { id:"fire116", name:"이미지116", path:"summoners_war_images/fire/116.png", order: 116, searchText:"이미지116"},
                { id:"fire117", name:"이미지117", path:"summoners_war_images/fire/117.png", order: 117, searchText:"이미지117"},
                { id:"fire118", name:"이미지118", path:"summoners_war_images/fire/118.png", order: 118, searchText:"이미지118"},
                { id:"fire119", name:"이미지119", path:"summoners_war_images/fire/119.png", order: 119, searchText:"이미지119"},
                { id:"fire120", name:"이미지120", path:"summoners_war_images/fire/120.png", order: 120, searchText:"이미지120"},
                { id:"fire121", name:"이미지121", path:"summoners_war_images/fire/121.png", order: 121, searchText:"이미지121"},
                { id:"fire122", name:"이미지122", path:"summoners_war_images/fire/122.png", order: 122, searchText:"이미지122"},
                { id:"fire123", name:"이미지123", path:"summoners_war_images/fire/123.png", order: 123, searchText:"이미지123"},
                { id:"fire124", name:"이미지124", path:"summoners_war_images/fire/124.png", order: 124, searchText:"이미지124"},
                { id:"fire125", name:"이미지125", path:"summoners_war_images/fire/125.png", order: 125, searchText:"이미지125"},
                { id:"fire126", name:"이미지126", path:"summoners_war_images/fire/126.png", order: 126, searchText:"이미지126"},
                { id:"fire127", name:"이미지127", path:"summoners_war_images/fire/127.png", order: 127, searchText:"이미지127"},
                { id:"fire128", name:"이미지128", path:"summoners_war_images/fire/128.png", order: 128, searchText:"이미지128"},
                { id:"fire129", name:"이미지129", path:"summoners_war_images/fire/129.png", order: 129, searchText:"이미지129"},
                { id:"fire130", name:"이미지130", path:"summoners_war_images/fire/130.png", order: 130, searchText:"이미지130"},
                { id:"fire131", name:"이미지131", path:"summoners_war_images/fire/131.png", order: 131, searchText:"이미지131"},
                { id:"fire132", name:"이미지132", path:"summoners_war_images/fire/132.png", order: 132, searchText:"이미지132"},
                { id:"fire133", name:"이미지133", path:"summoners_war_images/fire/133.png", order: 133, searchText:"이미지133"},
                { id:"fire134", name:"이미지134", path:"summoners_war_images/fire/134.png", order: 134, searchText:"이미지134"},
                { id:"fire135", name:"이미지135", path:"summoners_war_images/fire/135.png", order: 135, searchText:"이미지135"},
                { id:"fire136", name:"이미지136", path:"summoners_war_images/fire/136.png", order: 136, searchText:"이미지136"},
                { id:"fire137", name:"이미지137", path:"summoners_war_images/fire/137.png", order: 137, searchText:"이미지137"},
                { id:"fire138", name:"이미지138", path:"summoners_war_images/fire/138.png", order: 138, searchText:"이미지138"},
                { id:"fire139", name:"이미지139", path:"summoners_war_images/fire/139.png", order: 139, searchText:"이미지139"},
                { id:"fire140", name:"이미지140", path:"summoners_war_images/fire/140.png", order: 140, searchText:"이미지140"},
                { id:"fire141", name:"이미지141", path:"summoners_war_images/fire/141.png", order: 141, searchText:"이미지141"},
                { id:"fire142", name:"이미지142", path:"summoners_war_images/fire/142.png", order: 142, searchText:"이미지142"},
                { id:"fire143", name:"이미지143", path:"summoners_war_images/fire/143.png", order: 143, searchText:"이미지143"},
                { id:"fire144", name:"이미지144", path:"summoners_war_images/fire/144.png", order: 144, searchText:"이미지144"},
                { id:"fire145", name:"이미지145", path:"summoners_war_images/fire/145.png", order: 145, searchText:"이미지145"},
                { id:"fire146", name:"이미지146", path:"summoners_war_images/fire/146.png", order: 146, searchText:"이미지146"},
                { id:"fire147", name:"이미지147", path:"summoners_war_images/fire/147.png", order: 147, searchText:"이미지147"},
                { id:"fire148", name:"이미지148", path:"summoners_war_images/fire/148.png", order: 148, searchText:"이미지148"},
                { id:"fire149", name:"이미지149", path:"summoners_war_images/fire/149.png", order: 149, searchText:"이미지149"},
                { id:"fire150", name:"이미지150", path:"summoners_war_images/fire/150.png", order: 150, searchText:"이미지150"},
                { id:"fire151", name:"이미지151", path:"summoners_war_images/fire/151.png", order: 151, searchText:"이미지151"},
                { id:"fire152", name:"이미지152", path:"summoners_war_images/fire/152.png", order: 152, searchText:"이미지152"},
                { id:"fire153", name:"이미지153", path:"summoners_war_images/fire/153.png", order: 153, searchText:"이미지153"},
                { id:"fire154", name:"이미지154", path:"summoners_war_images/fire/154.png", order: 154, searchText:"이미지154"},
                { id:"fire155", name:"이미지155", path:"summoners_war_images/fire/155.png", order: 155, searchText:"이미지155"},
                { id:"fire156", name:"이미지156", path:"summoners_war_images/fire/156.png", order: 156, searchText:"이미지156"},
                { id:"fire157", name:"이미지157", path:"summoners_war_images/fire/157.png", order: 157, searchText:"이미지157"},
                { id:"fire158", name:"이미지158", path:"summoners_war_images/fire/158.png", order: 158, searchText:"이미지158"},
                { id:"fire159", name:"이미지159", path:"summoners_war_images/fire/159.png", order: 159, searchText:"이미지159"}
            ]
        },
        water: {
            name: "물속성",
            searchText: "물속성",
            icons: [
                { id:"water1", name:"물팔라", path:"summoners_war_images/water/1.png", order: 1, searchText:"물팔라"},
                { id:"water2", name:"물유니", path:"summoners_war_images/water/2.png", order: 2, searchText:"물유니"},
                { id:"water3", name:"물웅묘", path:"summoners_war_images/water/3.png", order: 3, searchText:"물웅묘"}
            ]
        },
        wind: {
            name: "바람속성",
            searchText: "바람속성",
            icons: [
                { id:"wind1", name:"풍깨비", path:"summoners_war_images/wind/1.png", order: 1, searchText:"풍깨비"},
                { id:"wind2", name:"풍머메", path:"summoners_war_images/wind/2.png", order: 2, searchText:"풍머메"}
            ]
        },
        light: {
            name: "빛속성",
            searchText: "빛속성",
            icons: [
                { id:"light1", name:"빛야만", path:"summoners_war_images/light/1.png", order: 1, searchText:"빛야만"},
                { id:"light2", name:"빛웅묘", path:"summoners_war_images/light/2.png", order: 2, searchText:"빛웅묘"}
            ]
        },
        dark: {
            name: "어둠속성",
            searchText: "어둠속성",
            icons: [
                { id:"dark1", name:"암그림자", path:"summoners_war_images/dark/1.png", order: 1, searchText:"암그림자"},
                { id:"dark2", name:"암마도", path:"summoners_war_images/dark/2.png", order: 2, searchText:"암마도"}
            ]
        }

    };

    // 몬스터 아이콘 생성 함수
    function createMonsterIcons() {
        const mobiconDiv = document.querySelector('.mobicon');
        if (!mobiconDiv) return;

        // 각 속성별로 아이콘 생성
        Object.entries(monsterIcons).forEach(([attr, data]) => {
            // order 기준으로 정렬
            data.icons.sort((a, b) => a.order - b.order);
            
            data.icons.forEach(icon => {
                const img = document.createElement('img');
                img.id = icon.id + 'Icon';
                img.src = icon.path;
                img.alt = icon.name;
                img.setAttribute('data-attr', attr);
                img.setAttribute('data-name', icon.name);
                img.setAttribute('data-search', icon.searchText);
                img.style.width = '36px';
                img.style.height = '36px';
                img.style.cursor = 'pointer';
                
                // 클릭 이벤트 추가
                img.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const searchInput = document.getElementById('searchInput');
                    if (searchInput) {
                        searchInput.value += this.getAttribute('data-search') + ' ';
                        searchInput.focus();
                    }
                });
                
                mobiconDiv.appendChild(img);
            });
        });
    }

    // 속성 아이콘 클릭 이벤트 핸들러 생성 함수
    function createAttributeIconHandlers() {
        const attrIconIds = [
            'fireAttrIcon', 'waterAttrIcon', 'windAttrIcon', 'lightAttrIcon', 'darkAttrIcon'
        ];
        const attrIconLastClick = {};
        const attrIconFilterState = {};
        
        attrIconIds.forEach(attrId => {
            const icon = document.getElementById(attrId);
            if (icon) {
                const attr = attrId.replace('AttrIcon', '');
                const data = monsterIcons[attr];
                
                if (data) {
                    icon.setAttribute('data-search', data.searchText);
                    
                    // 일반 클릭 이벤트
                    icon.addEventListener('click', function(e) {
                        e.stopPropagation();
                        const iconBox = this.closest('.icon-box');
                        if (iconBox) {
                            iconBox.classList.toggle('selected');
                            // 해당 속성의 몬스터 아이콘 필터링
                            const mobiconDiv = document.querySelector('.mobicon');
                            if (mobiconDiv) {
                                const isSelected = iconBox.classList.contains('selected');
                                Array.from(mobiconDiv.children).forEach(img => {
                                    if (img.getAttribute('data-attr') === attr) {
                                        img.style.display = isSelected ? 'none' : '';
                                    }
                                });
                            }
                        }
                    });

                    // alt+클릭 또는 더블클릭 이벤트
                    icon.addEventListener('click', function(e) {
                        const now = Date.now();
                        let isDoubleClick = false;
                        if (attrIconLastClick[attrId] && now - attrIconLastClick[attrId] < 300) {
                            isDoubleClick = true;
                        }
                        attrIconLastClick[attrId] = now;

                        if (e.altKey || isDoubleClick) {
                            // 현재 속성의 필터링 상태 토글
                            attrIconFilterState[attrId] = !attrIconFilterState[attrId];
                            
                            if (attrIconFilterState[attrId]) {
                                // 필터링 적용
                                attrIconIds.forEach(otherId => {
                                    const otherIcon = document.getElementById(otherId);
                                    if (otherIcon) {
                                        const box = otherIcon.closest('.icon-box');
                                        if (box) box.classList.add('selected');
                                    }
                                });
                                // 현재 클릭한 아이콘만 선택 해제
                                const myBox = icon.closest('.icon-box');
                                if (myBox) myBox.classList.remove('selected');
                            } else {
                                // 필터링 해제
                                attrIconIds.forEach(otherId => {
                                    const otherIcon = document.getElementById(otherId);
                                    if (otherIcon) {
                                        const box = otherIcon.closest('.icon-box');
                                        if (box) box.classList.remove('selected');
                                    }
                                });
                            }

                            // mobicon 필터링
                            const mobiconDiv = document.querySelector('.mobicon');
                            if (mobiconDiv) {
                                Array.from(mobiconDiv.children).forEach(img => {
                                    if (attrIconFilterState[attrId]) {
                                        // 필터링 적용 - 현재 속성의 몬스터 아이콘만 보이기
                                        if (img.getAttribute('data-attr') === attr) {
                                            img.style.display = '';
                                        } else {
                                            img.style.display = 'none';
                                        }
                                    } else {
                                        // 필터링 해제 - 모든 아이콘 표시
                                        img.style.display = '';
                                    }
                                });
                            }
                            e.stopPropagation();
                            e.preventDefault();
                        }
                    });
                }
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function() {
        const iconViewBtn = document.getElementById('iconViewBtn');
        const iconViewDropdown = document.getElementById('iconViewDropdown');
        if (iconViewBtn && iconViewDropdown) {
            iconViewBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                if (iconViewDropdown.style.display === 'none' || iconViewDropdown.style.display === '') {
                    iconViewDropdown.innerHTML = `
                        <style>
                            .icon-box {
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                width: 29px;
                                height: 29px;
                                background: #b9f6ca;
                                border-radius: 8px;
                                margin-right: 8px;
                                box-shadow: 0 1px 3px rgba(0,0,0,0.12);
                                border: 2px solid #222c3a;
                                transition: background 0.15s;
                            }
                            .icon-box:last-child { margin-right: 0; }
                            .icon-box.selected {
                                background: #388e3c !important;
                            }
                            .icon-separator {
                                width: 100%;
                                height: 1px;
                                background: #222c3a;
                                margin: 8px 0 6px 0;
                                border: none;
                            }
                            .mobicon {
                                display: flex;
                                flex-wrap: wrap;
                                align-items: center;
                                gap: 8px;
                                padding-left: 2px;
                                padding-top: 4px;
                                min-height: 44px;
                                padding-bottom: 8px;
                                background: rgba(0,255,0,0.05);
                                max-width: calc((36px + 8px) * 14); /* 14개 + gap */
                                width: 100%;
                                max-height: 100%; /* 드롭박스 세로 영역까지 */
                                overflow-y: auto;
                                overflow-x: hidden;
                            }
                            #iconViewDropdown {
                                max-height: 520px;
                                overflow-y: auto;
                            }
                        </style>
                        <div class="filter-buttons" style="display:flex; align-items:flex-start; gap:0; padding-top:2px; padding-left:2px;">
                            <div class="icon-box"><img id="fireAttrIcon" src="summoners_war_images/fireimage.png" alt="불속성" style="width:18px; height:18px; cursor:pointer;"></div>
                            <div class="icon-box"><img id="waterAttrIcon" src="summoners_war_images/waterimage.png" alt="물속성" style="width:18px; height:18px; cursor:pointer;"></div>
                            <div class="icon-box"><img id="windAttrIcon" src="summoners_war_images/windimage.png" alt="바람속성" style="width:18px; height:18px; cursor:pointer;"></div>
                            <div class="icon-box"><img id="lightAttrIcon" src="summoners_war_images/lightimage.png" alt="빛속성" style="width:18px; height:18px; cursor:pointer;"></div>
                            <div class="icon-box"><img id="darkAttrIcon" src="summoners_war_images/darkimage.png" alt="어둠속성" style="width:18px; height:18px; cursor:pointer;"></div>
                            <div class="icon-box" style="background:#b9f6ca; border:2px solid #222c3a; cursor:pointer; width:52px;"><span style="font-size:13px; color:#333;">★1~4성</span></div>
                            <div class="icon-box" style="background:#b9f6ca; border:2px solid #222c3a; cursor:pointer; width:52px;"><span style="font-size:13px; color:#333;">★5성</span></div>
                            <div class="icon-box" style="background:#b9f6ca; border:2px solid #222c3a; cursor:pointer; width:52px;"><span style="font-size:13px; color:#333;">전체</span></div>
                        </div>
                        <div class="icon-separator"></div>
                        <div class="mobicon" style="display:flex; align-items:center; gap:8px; padding-left:2px; padding-top:4px; min-height:44px; padding-bottom:8px; background:rgba(0,255,0,0.05);">
                        </div>
                    `;
                    iconViewDropdown.style.display = 'block';
                    
                    // 몬스터 아이콘 생성
                    createMonsterIcons();
                    // 속성 아이콘 핸들러 생성
                    createAttributeIconHandlers();

                    // 드롭다운 내 버튼 토글 이벤트 위임 (속성 아이콘들은 제외)
                    const iconBoxContainer = iconViewDropdown.querySelector('.filter-buttons');
                    if (iconBoxContainer) {
                        iconBoxContainer.addEventListener('click', function(e) {
                            let target = e.target;
                            // span, img 클릭 시 부모 div로
                            if (target.tagName === 'IMG' || target.tagName === 'SPAN') {
                                target = target.parentElement;
                            }
                            // 속성 아이콘들은 여기서 토글하지 않음
                            if (target.classList.contains('icon-box') && !target.querySelector('#windAttrIcon') && !target.querySelector('#fireAttrIcon') && !target.querySelector('#waterAttrIcon') && !target.querySelector('#lightAttrIcon') && !target.querySelector('#darkAttrIcon')) {
                                target.classList.toggle('selected');
                            }
                        });
                    }

                    // '전체' 버튼 클릭 시 모든 속성 아이콘 선택 해제 + mobicon 모두 보이기
                    const allBtn = Array.from(iconViewDropdown.querySelectorAll('.icon-box span')).find(span => span.textContent === '전체');
                    if (allBtn) {
                        allBtn.parentElement.addEventListener('click', function(e) {
                            const attrIconIds = [
                                'fireAttrIcon', 'waterAttrIcon', 'windAttrIcon', 'lightAttrIcon', 'darkAttrIcon'
                            ];
                            attrIconIds.forEach(attrId => {
                                const icon = document.getElementById(attrId);
                                if (icon) {
                                    const box = icon.closest('.icon-box');
                                    if (box) box.classList.remove('selected');
                                }
                            });
                            // mobicon 모두 보이기
                            const mobiconDiv = document.querySelector('.mobicon');
                            if (mobiconDiv) {
                                Array.from(mobiconDiv.children).forEach(img => {
                                    img.style.display = '';
                                });
                            }
                            // 전체 버튼 자신의 눌림처리(.selected) 50ms 후 해제
                            setTimeout(() => { this.classList.remove('selected'); }, 50);
                        });
                    }
                } else {
                    iconViewDropdown.style.display = 'none';
                }
            });
        }
    });
})(); 