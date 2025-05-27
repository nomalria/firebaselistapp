// 아이콘 열람 드롭다운 열기/닫기 및 이미지 표시 기능
(function() {
    // 몬스터 아이콘 데이터 구조
    const monsterIcons = {
        fire: {
            name: "불속성",
            searchText: "불속성",
            icons: [
                { id:"fire1", name:"불프랑", path:"summoners_war_images/fire/1.png", order: 1, searchText:"불프랑"},
                { id:"fire2", name:"불리빙", path:"summoners_war_images/fire/2.png", order: 2, searchText:"불리빙"},
                { id:"fire3", name:"불그림", path:"summoners_war_images/fire/3.png", order: 3, searchText:"불그림"},
                { id:"fire4", name:"불미스틱위치", path:"summoners_war_images/fire/4.png", order: 4, searchText:"불미스틱위치"},
                { id:"fire5", name:"불방랑", path:"summoners_war_images/fire/5.png", order: 5, searchText:"불방랑"},
                { id:"fire6", name:"불마샬", path:"summoners_war_images/fire/6.png", order: 6, searchText:"불마샬"},
                { id:"fire7", name:"불늑인", path:"summoners_war_images/fire/7.png", order: 7, searchText:"불늑인"},
                { id:"fire8", name:"불호울", path:"summoners_war_images/fire/8.png", order: 8, searchText:"불호울"},
                { id:"fire9", name:"불하르퓨", path:"summoners_war_images/fire/9.png", order: 9, searchText:"불하르퓨"},
                { id:"fire10", name:"불하엘", path:"summoners_war_images/fire/10.png", order: 10, searchText:"불하엘"},
                { id:"fire11", name:"불그리폰", path:"summoners_war_images/fire/11.png", order: 11, searchText:"불그리폰"},
                { id:"fire12", name:"불이누", path:"summoners_war_images/fire/12.png", order: 12, searchText:"불이누"},
                { id:"fire13", name:"불워베어", path:"summoners_war_images/fire/13.png", order: 13, searchText:"불워베어"},
                { id:"fire14", name:"불픽시", path:"summoners_war_images/fire/14.png", order: 14, searchText:"불픽시"},
                { id:"fire15", name:"불페어리", path:"summoners_war_images/fire/15.png", order: 15, searchText:"불페어리"},
                { id:"fire16", name:"불호문", path:"summoners_war_images/fire/16.png", order: 16, searchText:"불호문"},
                { id:"fire17", name:"불이노스케", path:"summoners_war_images/fire/17.png", order: 17, searchText:"불이노스케"},
                { id:"fire18", name:"불네즈코", path:"summoners_war_images/fire/18.png", order: 18, searchText:"불네즈코"},
                { id:"fire19", name:"불탄지로", path:"summoners_war_images/fire/19.png", order: 19, searchText:"불탄지로"},
                { id:"fire20", name:"불비틀가디언", path:"summoners_war_images/fire/20.png", order: 20, searchText:"불비틀가디언"},
                { id:"fire21", name:"불사령", path:"summoners_war_images/fire/21.png", order: 21, searchText:"불사령"},
                { id:"fire22", name:"불메구미", path:"summoners_war_images/fire/22.png", order: 22, searchText:"불메구미"},
                { id:"fire23", name:"불이타도리", path:"summoners_war_images/fire/23.png", order: 23, searchText:"불이타도리"},
                { id:"fire24", name:"불고죠", path:"summoners_war_images/fire/24.png", order: 24, searchText:"불고죠"},
                { id:"fire25", name:"불드라칸", path:"summoners_war_images/fire/25.png", order: 25, searchText:"불드라칸"},
                { id:"fire26", name:"불해커", path:"summoners_war_images/fire/26.png", order: 26, searchText:"불해커"},
                { id:"fire27", name:"불트리스", path:"summoners_war_images/fire/27.png", order: 27, searchText:"불트리스"},
                { id:"fire28", name:"불예니퍼", path:"summoners_war_images/fire/28.png", order: 28, searchText:"불예니퍼"},
                { id:"fire29", name:"불게롤트", path:"summoners_war_images/fire/29.png", order: 29, searchText:"불게롤트"},
                { id:"fire30", name:"불쌍천", path:"summoners_war_images/fire/30.png", order: 30, searchText:"불쌍천"},
                { id:"fire31", name:"불깨비", path:"summoners_war_images/fire/31.png", order: 31, searchText:"불깨비"},
                { id:"fire32", name:"불데빌", path:"summoners_war_images/fire/32.png", order: 32, searchText:"불데빌"},
                { id:"fire33", name:"불인드라", path:"summoners_war_images/fire/33.png", order: 33, searchText:"불인드라"},
                { id:"fire34", name:"불카산", path:"summoners_war_images/fire/34.png", order: 34, searchText:"불카산"},
                { id:"fire35", name:"불사전", path:"summoners_war_images/fire/35.png", order: 35, searchText:"불사전"},
                { id:"fire36", name:"불강철", path:"summoners_war_images/fire/36.png", order: 36, searchText:"불강철"},
                { id:"fire37", name:"불인형", path:"summoners_war_images/fire/37.png", order: 37, searchText:"불인형"},
                { id:"fire38", name:"불카롱", path:"summoners_war_images/fire/38.png", order: 38, searchText:"불카롱"},
                { id:"fire39", name:"불푸딩", path:"summoners_war_images/fire/39.png", order: 39, searchText:"불푸딩"},
                { id:"fire40", name:"불배틀", path:"summoners_war_images/fire/40.png", order: 40, searchText:"불배틀"},
                { id:"fire41", name:"불그림자", path:"summoners_war_images/fire/41.png", order: 41, searchText:"불그림자"},
                { id:"fire42", name:"불웨폰", path:"summoners_war_images/fire/42.png", order: 42, searchText:"불웨폰"},
                { id:"fire43", name:"불토템", path:"summoners_war_images/fire/43.png", order: 43, searchText:"불토템"},
                { id:"fire44", name:"불서퍼", path:"summoners_war_images/fire/44.png", order: 44, searchText:"불서퍼"},
                { id:"fire45", name:"불마도", path:"summoners_war_images/fire/45.png", order: 45, searchText:"불마도"},
                { id:"fire46", name:"불음양", path:"summoners_war_images/fire/46.png", order: 46, searchText:"불음양"},
                { id:"fire47", name:"불슬레", path:"summoners_war_images/fire/47.png", order: 47, searchText:"불슬레"},
                { id:"fire48", name:"불쉐도우클로", path:"summoners_war_images/fire/48.png", order: 48, searchText:"불쉐도우클로"},
                { id:"fire49", name:"불스트", path:"summoners_war_images/fire/49.png", order: 49, searchText:"불스트"},
                { id:"fire50", name:"불화백", path:"summoners_war_images/fire/50.png", order: 50, searchText:"불화백"},
                { id:"fire51", name:"불비라", path:"summoners_war_images/fire/51.png", order: 51, searchText:"불비라"},
                { id:"fire52", name:"불데몬", path:"summoners_war_images/fire/52.png", order: 52, searchText:"불데몬"},
                { id:"fire53", name:"불뇌제", path:"summoners_war_images/fire/53.png", order: 53, searchText:"불뇌제"},
                { id:"fire54", name:"불드루", path:"summoners_war_images/fire/54.png", order: 54, searchText:"불드루"},
                { id:"fire55", name:"불팔라", path:"summoners_war_images/fire/55.png", order: 55, searchText:"불팔라"},
                { id:"fire56", name:"불유니", path:"summoners_war_images/fire/56.png", order: 56, searchText:"불유니"},
                { id:"fire57", name:"불웅묘", path:"summoners_war_images/fire/57.png", order: 57, searchText:"불웅묘"},
                { id:"fire58", name:"불요정왕", path:"summoners_war_images/fire/58.png", order: 58, searchText:"불요정왕"},
                { id:"fire59", name:"불사막", path:"summoners_war_images/fire/59.png", order: 59, searchText:"불사막"},
                { id:"fire60", name:"불해왕", path:"summoners_war_images/fire/60.png", order: 60, searchText:"불해왕"},
                { id:"fire61", name:"불이프", path:"summoners_war_images/fire/61.png", order: 61, searchText:"불이프"},
                { id:"fire62", name:"불극지", path:"summoners_war_images/fire/62.png", order: 62, searchText:"불극지"},
                { id:"fire63", name:"불선인", path:"summoners_war_images/fire/63.png", order: 63, searchText:"불선인"},
                { id:"fire64", name:"불헬레", path:"summoners_war_images/fire/64.png", order: 64, searchText:"불헬레"},
                { id:"fire65", name:"불신수", path:"summoners_war_images/fire/65.png", order: 65, searchText:"불신수"},
                { id:"fire66", name:"불아크", path:"summoners_war_images/fire/66.png", order: 66, searchText:"불아크"},
                { id:"fire67", name:"불오공", path:"summoners_war_images/fire/67.png", order: 67, searchText:"불오공"},
                { id:"fire68", name:"불드나", path:"summoners_war_images/fire/68.png", order: 68, searchText:"불드나"},
                { id:"fire69", name:"불오컬", path:"summoners_war_images/fire/69.png", order: 69, searchText:"불오컬"},
                { id:"fire70", name:"불라클", path:"summoners_war_images/fire/70.png", order: 70, searchText:"불라클"},
                { id:"fire71", name:"불키메라", path:"summoners_war_images/fire/71.png", order: 71, searchText:"불키메라"},
                { id:"fire72", name:"불피닉", path:"summoners_war_images/fire/72.png", order: 72, searchText:"불피닉"},
                { id:"fire73", name:"불드래곤", path:"summoners_war_images/fire/73.png", order: 73, searchText:"불드래곤"},
                { id:"fire74", name:"불발키리", path:"summoners_war_images/fire/74.png", order: 74, searchText:"불발키리"},
                { id:"fire75", name:"불젠이츠", path:"summoners_war_images/fire/75.png", order: 75, searchText:"불젠이츠"},
                { id:"fire76", name:"불묘지기", path:"summoners_war_images/fire/76.png", order: 76, searchText:"불묘지기"},
                { id:"fire77", name:"불노바라", path:"summoners_war_images/fire/77.png", order: 77, searchText:"불노바라"},
                { id:"fire78", name:"불사이보그", path:"summoners_war_images/fire/78.png", order: 78, searchText:"불사이보그"},
                { id:"fire79", name:"불시리", path:"summoners_war_images/fire/79.png", order: 79, searchText:"불시리"},
                { id:"fire80", name:"불삽살", path:"summoners_war_images/fire/80.png", order: 80, searchText:"불삽살"},
                { id:"fire81", name:"불아수라", path:"summoners_war_images/fire/81.png", order: 81, searchText:"불아수라"},
                { id:"fire82", name:"불용병", path:"summoners_war_images/fire/82.png", order: 82, searchText:"불용병"},
                { id:"fire83", name:"불초코", path:"summoners_war_images/fire/83.png", order: 83, searchText:"불초코"},
                { id:"fire84", name:"불홍차", path:"summoners_war_images/fire/84.png", order: 84, searchText:"불홍차"},
                { id:"fire85", name:"불꿈냥이", path:"summoners_war_images/fire/85.png", order: 85, searchText:"불꿈냥이"},
                { id:"fire86", name:"불망치", path:"summoners_war_images/fire/86.png", order: 86, searchText:"불망치"},
                { id:"fire87", name:"불로보", path:"summoners_war_images/fire/87.png", order: 87, searchText:"불로보"},
                { id:"fire88", name:"불요괴", path:"summoners_war_images/fire/88.png", order: 88, searchText:"불요괴"},
                { id:"fire89", name:"불춘리", path:"summoners_war_images/fire/89.png", order: 89, searchText:"불춘리"},
                { id:"fire90", name:"불포마", path:"summoners_war_images/fire/90.png", order: 90, searchText:"불포마"},
                { id:"fire91", name:"불거문고", path:"summoners_war_images/fire/91.png", order: 91, searchText:"불거문고"},
                { id:"fire92", name:"불가고일", path:"summoners_war_images/fire/92.png", order: 92, searchText:"불가고일"},
                { id:"fire93", name:"불캐논", path:"summoners_war_images/fire/93.png", order: 93, searchText:"불캐논"},
                { id:"fire94", name:"불스나", path:"summoners_war_images/fire/94.png", order: 94, searchText:"불스나"},
                { id:"fire95", name:"불드라이어드", path:"summoners_war_images/fire/95.png", order: 95, searchText:"불드라이어드"},
                { id:"fire96", name:"불부메랑", path:"summoners_war_images/fire/96.png", order: 96, searchText:"불부메랑"},
                { id:"fire97", name:"불차크람", path:"summoners_war_images/fire/97.png", order: 97, searchText:"불차크람"},
                { id:"fire98", name:"불하프", path:"summoners_war_images/fire/98.png", order: 98, searchText:"불하프"},
                { id:"fire99", name:"불주사위", path:"summoners_war_images/fire/99.png", order: 99, searchText:"불주사위"},
                { id:"fire100", name:"불호박", path:"summoners_war_images/fire/100.png", order: 100, searchText:"불호박"},
                { id:"fire101", name:"불호루스", path:"summoners_war_images/fire/101.png", order: 101, searchText:"불호루스"},
                { id:"fire102", name:"불아누", path:"summoners_war_images/fire/102.png", order: 102, searchText:"불아누"},
                { id:"fire103", name:"불에전", path:"summoners_war_images/fire/103.png", order: 103, searchText:"불에전"},
                { id:"fire104", name:"불네파", path:"summoners_war_images/fire/104.png", order: 104, searchText:"불네파"},
                { id:"fire105", name:"불암살", path:"summoners_war_images/fire/105.png", order: 105, searchText:"불암살"},
                { id:"fire106", name:"불마검", path:"summoners_war_images/fire/106.png", order: 106, searchText:"불마검"},
                { id:"fire107", name:"불머메", path:"summoners_war_images/fire/107.png", order: 107, searchText:"불머메"},
                { id:"fire108", name:"불해적", path:"summoners_war_images/fire/108.png", order: 108, searchText:"불해적"},
                { id:"fire109", name:"불야만", path:"summoners_war_images/fire/109.png", order: 109, searchText:"불야만"},
                { id:"fire110", name:"불무희", path:"summoners_war_images/fire/110.png", order: 110, searchText:"불무희"},
                { id:"fire111", name:"불코볼", path:"summoners_war_images/fire/111.png", order: 111, searchText:"불코볼"},
                { id:"fire112", name:"불브라우니", path:"summoners_war_images/fire/112.png", order: 112, searchText:"불브라우니"},
                { id:"fire113", name:"불쿵푸", path:"summoners_war_images/fire/113.png", order: 113, searchText:"불쿵푸"},
                { id:"fire114", name:"불사무라이", path:"summoners_war_images/fire/114.png", order: 114, searchText:"불사무라이"},
                { id:"fire115", name:"불리치", path:"summoners_war_images/fire/115.png", order: 115, searchText:"불리치"},
                { id:"fire116", name:"불데나", path:"summoners_war_images/fire/116.png", order: 116, searchText:"불데나"},
                { id:"fire117", name:"불나찰", path:"summoners_war_images/fire/117.png", order: 117, searchText:"불나찰"},
                { id:"fire118", name:"불사제", path:"summoners_war_images/fire/118.png", order: 118, searchText:"불사제"},
                { id:"fire119", name:"불뱀파", path:"summoners_war_images/fire/119.png", order: 119, searchText:"불뱀파"},
                { id:"fire120", name:"불팬텀", path:"summoners_war_images/fire/120.png", order: 120, searchText:"불팬텀"},
                { id:"fire121", name:"불피에", path:"summoners_war_images/fire/121.png", order: 121, searchText:"불피에"},
                { id:"fire122", name:"불닌자", path:"summoners_war_images/fire/122.png", order: 122, searchText:"불닌자"},
                { id:"fire123", name:"불조커", path:"summoners_war_images/fire/123.png", order: 123, searchText:"불조커"},
                { id:"fire124", name:"불서큐", path:"summoners_war_images/fire/124.png", order: 124, searchText:"불서큐"},
                { id:"fire125", name:"불실피드", path:"summoners_war_images/fire/125.png", order: 125, searchText:"불실피드"},
                { id:"fire126", name:"불실프", path:"summoners_war_images/fire/126.png", order: 126, searchText:"불실프"},
                { id:"fire127", name:"불운디네", path:"summoners_war_images/fire/127.png", order: 127, searchText:"불운디네"},
                { id:"fire128", name:"불구미", path:"summoners_war_images/fire/128.png", order: 128, searchText:"불구미"},
                { id:"fire129", name:"불광전사", path:"summoners_war_images/fire/129.png", order: 129, searchText:"불광전사"},
                { id:"fire130", name:"불하그", path:"summoners_war_images/fire/130.png", order: 130, searchText:"불하그"},
                { id:"fire131", name:"불엘순", path:"summoners_war_images/fire/131.png", order: 131, searchText:"불엘순"},
                { id:"fire132", name:"불미라", path:"summoners_war_images/fire/132.png", order: 132, searchText:"불미라"},
                { id:"fire133", name:"불무도가", path:"summoners_war_images/fire/133.png", order: 133, searchText:"불무도가"},
                { id:"fire134", name:"불전투상어", path:"summoners_war_images/fire/134.png", order: 134, searchText:"불전투상어"},
                { id:"fire135", name:"불카우", path:"summoners_war_images/fire/135.png", order: 135, searchText:"불카우"},
                { id:"fire136", name:"불매머드", path:"summoners_war_images/fire/136.png", order: 136, searchText:"불매머드"},
                { id:"fire137", name:"불펭귄", path:"summoners_war_images/fire/137.png", order: 137, searchText:"불펭귄"},
                { id:"fire138", name:"불맹수", path:"summoners_war_images/fire/138.png", order: 138, searchText:"불맹수"},
                { id:"fire139", name:"불도술", path:"summoners_war_images/fire/139.png", order: 139, searchText:"불도술"},
                { id:"fire140", name:"불리자드", path:"summoners_war_images/fire/140.png", order: 140, searchText:"불리자드"},
                { id:"fire141", name:"불미노", path:"summoners_war_images/fire/141.png", order: 141, searchText:"불미노"},
                { id:"fire142", name:"불드렁큰", path:"summoners_war_images/fire/142.png", order: 142, searchText:"불드렁큰"},
                { id:"fire143", name:"불임챔", path:"summoners_war_images/fire/143.png", order: 143, searchText:"불임챔"},
                { id:"fire144", name:"불바운티", path:"summoners_war_images/fire/144.png", order: 144, searchText:"불바운티"},
                { id:"fire145", name:"불마궁", path:"summoners_war_images/fire/145.png", order: 145, searchText:"불마궁"},
                { id:"fire146", name:"불아마존", path:"summoners_war_images/fire/146.png", order: 146, searchText:"불아마존"},
                { id:"fire147", name:"불바이킹", path:"summoners_war_images/fire/147.png", order: 147, searchText:"불바이킹"},
                { id:"fire148", name:"불베어맨", path:"summoners_war_images/fire/148.png", order: 148, searchText:"불베어맨"},
                { id:"fire149", name:"불인페", path:"summoners_war_images/fire/149.png", order: 149, searchText:"불인페"},
                { id:"fire150", name:"불골렘", path:"summoners_war_images/fire/150.png", order: 150, searchText:"불골렘"},
                { id:"fire151", name:"불서펀트", path:"summoners_war_images/fire/151.png", order: 151, searchText:"불서펀트"},
                { id:"fire152", name:"불샐러맨더", path:"summoners_war_images/fire/152.png", order: 152, searchText:"불샐러맨더"},
                { id:"fire153", name:"불하피", path:"summoners_war_images/fire/153.png", order: 153, searchText:"불하피"},
                { id:"fire154", name:"불가루다", path:"summoners_war_images/fire/154.png", order: 154, searchText:"불가루다"},
                { id:"fire155", name:"불엘리멘탈", path:"summoners_war_images/fire/155.png", order: 155, searchText:"불엘리멘탈"},
                { id:"fire156", name:"불헬하", path:"summoners_war_images/fire/156.png", order: 156, searchText:"불헬하"},
                { id:"fire157", name:"불예티", path:"summoners_war_images/fire/157.png", order: 157, searchText:"불예티"},
                { id:"fire158", name:"불임프", path:"summoners_war_images/fire/158.png", order: 158, searchText:"불임프"},
                { id:"fire159", name:"불하급엘리멘탈", path:"summoners_war_images/fire/159.png", order: 159, searchText:"불하급엘리멘탈"}
            ]
        },
        water: {
            name: "물속성",
            searchText: "물속성",
            icons: [
                { id:"water1", name:"물프랑", path:"summoners_war_images/water/1.png", order: 1, searchText:"물프랑"},
                { id:"water2", name:"물리빙", path:"summoners_war_images/water/2.png", order: 2, searchText:"물리빙"},
                { id:"water3", name:"물그림", path:"summoners_war_images/water/3.png", order: 3, searchText:"물그림"},
                { id:"water4", name:"물미스틱위치", path:"summoners_war_images/water/4.png", order: 4, searchText:"물미스틱위치"},
                { id:"water5", name:"물방랑", path:"summoners_war_images/water/5.png", order: 5, searchText:"물방랑"},
                { id:"water6", name:"물마샬", path:"summoners_war_images/water/6.png", order: 6, searchText:"물마샬"},
                { id:"water7", name:"물늑인", path:"summoners_war_images/water/7.png", order: 7, searchText:"물늑인"},
                { id:"water8", name:"물호울", path:"summoners_war_images/water/8.png", order: 8, searchText:"물호울"},
                { id:"water9", name:"물하르퓨", path:"summoners_war_images/water/9.png", order: 9, searchText:"물하르퓨"},
                { id:"water10", name:"물하엘", path:"summoners_war_images/water/10.png", order: 10, searchText:"물하엘"},
                { id:"water11", name:"물그리폰", path:"summoners_war_images/water/11.png", order: 11, searchText:"물그리폰"},
                { id:"water12", name:"물이누", path:"summoners_war_images/water/12.png", order: 12, searchText:"물이누"},
                { id:"water13", name:"물워베어", path:"summoners_war_images/water/13.png", order: 13, searchText:"물워베어"},
                { id:"water14", name:"물픽시", path:"summoners_war_images/water/14.png", order: 14, searchText:"물픽시"},
                { id:"water15", name:"물페어리", path:"summoners_war_images/water/15.png", order: 15, searchText:"물페어리"},
                { id:"water16", name:"물호문", path:"summoners_war_images/water/16.png", order: 16, searchText:"물호문"},
                { id:"water17", name:"물이노스케", path:"summoners_war_images/water/17.png", order: 17, searchText:"물이노스케"},
                { id:"water18", name:"물네즈코", path:"summoners_war_images/water/18.png", order: 18, searchText:"물네즈코"},
                { id:"water19", name:"물탄지로", path:"summoners_war_images/water/19.png", order: 19, searchText:"물탄지로"},
                { id:"water20", name:"물비틀가디언", path:"summoners_war_images/water/20.png", order: 20, searchText:"물비틀가디언"},
                { id:"water21", name:"물사령", path:"summoners_war_images/water/21.png", order: 21, searchText:"물사령"},
                { id:"water22", name:"물메구미", path:"summoners_war_images/water/22.png", order: 22, searchText:"물메구미"},
                { id:"water23", name:"물이타도리", path:"summoners_war_images/water/23.png", order: 23, searchText:"물이타도리"},
                { id:"water24", name:"물고죠", path:"summoners_war_images/water/24.png", order: 24, searchText:"물고죠"},
                { id:"water25", name:"물드라칸", path:"summoners_war_images/water/25.png", order: 25, searchText:"물드라칸"},
                { id:"water26", name:"물해커", path:"summoners_war_images/water/26.png", order: 26, searchText:"물해커"},
                { id:"water27", name:"물트리스", path:"summoners_war_images/water/27.png", order: 27, searchText:"물트리스"},
                { id:"water28", name:"물예니퍼", path:"summoners_war_images/water/28.png", order: 28, searchText:"물예니퍼"},
                { id:"water29", name:"물게롤트", path:"summoners_war_images/water/29.png", order: 29, searchText:"물게롤트"},
                { id:"water30", name:"물쌍천", path:"summoners_war_images/water/30.png", order: 30, searchText:"물쌍천"},
                { id:"water31", name:"물깨비", path:"summoners_war_images/water/31.png", order: 31, searchText:"물깨비"},
                { id:"water32", name:"물데빌", path:"summoners_war_images/water/32.png", order: 32, searchText:"물데빌"},
                { id:"water33", name:"물인드라", path:"summoners_war_images/water/33.png", order: 33, searchText:"물인드라"},
                { id:"water34", name:"물카산", path:"summoners_war_images/water/34.png", order: 34, searchText:"물카산"},
                { id:"water35", name:"물사전", path:"summoners_war_images/water/35.png", order: 35, searchText:"물사전"},
                { id:"water36", name:"물강철", path:"summoners_war_images/water/36.png", order: 36, searchText:"물강철"},
                { id:"water37", name:"물인형", path:"summoners_war_images/water/37.png", order: 37, searchText:"물인형"},
                { id:"water38", name:"물카롱", path:"summoners_war_images/water/38.png", order: 38, searchText:"물카롱"},
                { id:"water39", name:"물푸딩", path:"summoners_war_images/water/39.png", order: 39, searchText:"물푸딩"},
                { id:"water40", name:"물배틀", path:"summoners_war_images/water/40.png", order: 40, searchText:"물배틀"},
                { id:"water41", name:"물그림자", path:"summoners_war_images/water/41.png", order: 41, searchText:"물그림자"},
                { id:"water42", name:"물웨폰", path:"summoners_war_images/water/42.png", order: 42, searchText:"물웨폰"},
                { id:"water43", name:"물토템", path:"summoners_war_images/water/43.png", order: 43, searchText:"물토템"},
                { id:"water44", name:"물서퍼", path:"summoners_war_images/water/44.png", order: 44, searchText:"물서퍼"},
                { id:"water45", name:"물마도", path:"summoners_war_images/water/45.png", order: 45, searchText:"물마도"},
                { id:"water46", name:"물음양", path:"summoners_war_images/water/46.png", order: 46, searchText:"물음양"},
                { id:"water47", name:"물슬레", path:"summoners_war_images/water/47.png", order: 47, searchText:"물슬레"},
                { id:"water48", name:"물쉐도우클로", path:"summoners_war_images/water/48.png", order: 48, searchText:"물쉐도우클로"},
                { id:"water49", name:"물스트", path:"summoners_war_images/water/49.png", order: 49, searchText:"물스트"},
                { id:"water50", name:"물화백", path:"summoners_war_images/water/50.png", order: 50, searchText:"물화백"},
                { id:"water51", name:"물비라", path:"summoners_war_images/water/51.png", order: 51, searchText:"물비라"},
                { id:"water52", name:"물데몬", path:"summoners_war_images/water/52.png", order: 52, searchText:"물데몬"},
                { id:"water53", name:"물뇌제", path:"summoners_war_images/water/53.png", order: 53, searchText:"물뇌제"},
                { id:"water54", name:"물드루", path:"summoners_war_images/water/54.png", order: 54, searchText:"물드루"},
                { id:"water55", name:"물팔라", path:"summoners_war_images/water/55.png", order: 55, searchText:"물팔라"},
                { id:"water56", name:"물유니", path:"summoners_war_images/water/56.png", order: 56, searchText:"물유니"},
                { id:"water57", name:"물웅묘", path:"summoners_war_images/water/57.png", order: 57, searchText:"물웅묘"},
                { id:"water58", name:"물요정왕", path:"summoners_war_images/water/58.png", order: 58, searchText:"물요정왕"},
                { id:"water59", name:"물사막", path:"summoners_war_images/water/59.png", order: 59, searchText:"물사막"},
                { id:"water60", name:"물해왕", path:"summoners_war_images/water/60.png", order: 60, searchText:"물해왕"},
                { id:"water61", name:"물이프", path:"summoners_war_images/water/61.png", order: 61, searchText:"물이프"},
                { id:"water62", name:"물극지", path:"summoners_war_images/water/62.png", order: 62, searchText:"물극지"},
                { id:"water63", name:"물선인", path:"summoners_war_images/water/63.png", order: 63, searchText:"물선인"},
                { id:"water64", name:"물헬레", path:"summoners_war_images/water/64.png", order: 64, searchText:"물헬레"},
                { id:"water65", name:"물신수", path:"summoners_war_images/water/65.png", order: 65, searchText:"물신수"},
                { id:"water66", name:"물아크", path:"summoners_war_images/water/66.png", order: 66, searchText:"물아크"},
                { id:"water67", name:"물오공", path:"summoners_war_images/water/67.png", order: 67, searchText:"물오공"},
                { id:"water68", name:"물드나", path:"summoners_war_images/water/68.png", order: 68, searchText:"물드나"},
                { id:"water69", name:"물오컬", path:"summoners_war_images/water/69.png", order: 69, searchText:"물오컬"},
                { id:"water70", name:"물라클", path:"summoners_war_images/water/70.png", order: 70, searchText:"물라클"},
                { id:"water71", name:"물키메라", path:"summoners_war_images/water/71.png", order: 71, searchText:"물키메라"},
                { id:"water72", name:"물피닉", path:"summoners_war_images/water/72.png", order: 72, searchText:"물피닉"},
                { id:"water73", name:"물드래곤", path:"summoners_war_images/water/73.png", order: 73, searchText:"물드래곤"},
                { id:"water74", name:"물발키리", path:"summoners_war_images/water/74.png", order: 74, searchText:"물발키리"},
                { id:"water75", name:"물젠이츠", path:"summoners_war_images/water/75.png", order: 75, searchText:"물젠이츠"},
                { id:"water76", name:"물묘지기", path:"summoners_war_images/water/76.png", order: 76, searchText:"물묘지기"},
                { id:"water77", name:"물노바라", path:"summoners_war_images/water/77.png", order: 77, searchText:"물노바라"},
                { id:"water78", name:"물사이보그", path:"summoners_war_images/water/78.png", order: 78, searchText:"물사이보그"},
                { id:"water79", name:"물시리", path:"summoners_war_images/water/79.png", order: 79, searchText:"물시리"},
                { id:"water80", name:"물삽살", path:"summoners_war_images/water/80.png", order: 80, searchText:"물삽살"},
                { id:"water81", name:"물아수라", path:"summoners_war_images/water/81.png", order: 81, searchText:"물아수라"},
                { id:"water82", name:"물용병", path:"summoners_war_images/water/82.png", order: 82, searchText:"물용병"},
                { id:"water83", name:"물초코", path:"summoners_war_images/water/83.png", order: 83, searchText:"물초코"},
                { id:"water84", name:"물홍차", path:"summoners_war_images/water/84.png", order: 84, searchText:"물홍차"},
                { id:"water85", name:"물꿈냥이", path:"summoners_war_images/water/85.png", order: 85, searchText:"물꿈냥이"},
                { id:"water86", name:"물망치", path:"summoners_war_images/water/86.png", order: 86, searchText:"물망치"},
                { id:"water87", name:"물로보", path:"summoners_war_images/water/87.png", order: 87, searchText:"물로보"},
                { id:"water88", name:"물요괴", path:"summoners_war_images/water/88.png", order: 88, searchText:"물요괴"},
                { id:"water89", name:"물춘리", path:"summoners_war_images/water/89.png", order: 89, searchText:"물춘리"},
                { id:"water90", name:"물포마", path:"summoners_war_images/water/90.png", order: 90, searchText:"물포마"},
                { id:"water91", name:"물거문고", path:"summoners_war_images/water/91.png", order: 91, searchText:"물거문고"},
                { id:"water92", name:"물가고일", path:"summoners_war_images/water/92.png", order: 92, searchText:"물가고일"},
                { id:"water93", name:"물캐논", path:"summoners_war_images/water/93.png", order: 93, searchText:"물캐논"},
                { id:"water94", name:"물스나", path:"summoners_war_images/water/94.png", order: 94, searchText:"물스나"},
                { id:"water95", name:"물드라이어드", path:"summoners_war_images/water/95.png", order: 95, searchText:"물드라이어드"},
                { id:"water96", name:"물부메랑", path:"summoners_war_images/water/96.png", order: 96, searchText:"물부메랑"},
                { id:"water97", name:"물차크람", path:"summoners_war_images/water/97.png", order: 97, searchText:"물차크람"},
                { id:"water98", name:"물하프", path:"summoners_war_images/water/98.png", order: 98, searchText:"물하프"},
                { id:"water99", name:"물주사위", path:"summoners_war_images/water/99.png", order: 99, searchText:"물주사위"},
                { id:"water100", name:"물호박", path:"summoners_war_images/water/100.png", order: 100, searchText:"물호박"},
                { id:"water101", name:"물호루스", path:"summoners_war_images/water/101.png", order: 101, searchText:"물호루스"},
                { id:"water102", name:"물아누", path:"summoners_war_images/water/102.png", order: 102, searchText:"물아누"},
                { id:"water103", name:"물에전", path:"summoners_war_images/water/103.png", order: 103, searchText:"물에전"},
                { id:"water104", name:"물네파", path:"summoners_war_images/water/104.png", order: 104, searchText:"물네파"},
                { id:"water105", name:"물암살", path:"summoners_war_images/water/105.png", order: 105, searchText:"물암살"},
                { id:"water106", name:"물마검", path:"summoners_war_images/water/106.png", order: 106, searchText:"물마검"},
                { id:"water107", name:"물머메", path:"summoners_war_images/water/107.png", order: 107, searchText:"물머메"},
                { id:"water108", name:"물해적", path:"summoners_war_images/water/108.png", order: 108, searchText:"물해적"},
                { id:"water109", name:"물야만", path:"summoners_war_images/water/109.png", order: 109, searchText:"물야만"},
                { id:"water110", name:"물무희", path:"summoners_war_images/water/110.png", order: 110, searchText:"물무희"},
                { id:"water111", name:"물코볼", path:"summoners_war_images/water/111.png", order: 111, searchText:"물코볼"},
                { id:"water112", name:"물브라우니", path:"summoners_war_images/water/112.png", order: 112, searchText:"물브라우니"},
                { id:"water113", name:"물쿵푸", path:"summoners_war_images/water/113.png", order: 113, searchText:"물쿵푸"},
                { id:"water114", name:"물사무라이", path:"summoners_war_images/water/114.png", order: 114, searchText:"물사무라이"},
                { id:"water115", name:"물리치", path:"summoners_war_images/water/115.png", order: 115, searchText:"물리치"},
                { id:"water116", name:"물데나", path:"summoners_war_images/water/116.png", order: 116, searchText:"물데나"},
                { id:"water117", name:"물나찰", path:"summoners_war_images/water/117.png", order: 117, searchText:"물나찰"},
                { id:"water118", name:"물사제", path:"summoners_war_images/water/118.png", order: 118, searchText:"물사제"},
                { id:"water119", name:"물뱀파", path:"summoners_war_images/water/119.png", order: 119, searchText:"물뱀파"},
                { id:"water120", name:"물팬텀", path:"summoners_war_images/water/120.png", order: 120, searchText:"물팬텀"},
                { id:"water121", name:"물피에", path:"summoners_war_images/water/121.png", order: 121, searchText:"물피에"},
                { id:"water122", name:"물닌자", path:"summoners_war_images/water/122.png", order: 122, searchText:"물닌자"},
                { id:"water123", name:"물조커", path:"summoners_war_images/water/123.png", order: 123, searchText:"물조커"},
                { id:"water124", name:"물서큐", path:"summoners_war_images/water/124.png", order: 124, searchText:"물서큐"},
                { id:"water125", name:"물실피드", path:"summoners_war_images/water/125.png", order: 125, searchText:"물실피드"},
                { id:"water126", name:"물실프", path:"summoners_war_images/water/126.png", order: 126, searchText:"물실프"},
                { id:"water127", name:"물운디네", path:"summoners_war_images/water/127.png", order: 127, searchText:"물운디네"},
                { id:"water128", name:"물구미", path:"summoners_war_images/water/128.png", order: 128, searchText:"물구미"},
                { id:"water129", name:"물광전사", path:"summoners_war_images/water/129.png", order: 129, searchText:"물광전사"},
                { id:"water130", name:"물하그", path:"summoners_war_images/water/130.png", order: 130, searchText:"물하그"},
                { id:"water131", name:"물엘순", path:"summoners_war_images/water/131.png", order: 131, searchText:"물엘순"},
                { id:"water132", name:"물미라", path:"summoners_war_images/water/132.png", order: 132, searchText:"물미라"},
                { id:"water133", name:"물무도가", path:"summoners_war_images/water/133.png", order: 133, searchText:"물무도가"},
                { id:"water134", name:"물전투상어", path:"summoners_war_images/water/134.png", order: 134, searchText:"물전투상어"},
                { id:"water135", name:"물카우", path:"summoners_war_images/water/135.png", order: 135, searchText:"물카우"},
                { id:"water136", name:"물매머드", path:"summoners_war_images/water/136.png", order: 136, searchText:"물매머드"},
                { id:"water137", name:"물펭귄", path:"summoners_war_images/water/137.png", order: 137, searchText:"물펭귄"},
                { id:"water138", name:"물맹수", path:"summoners_war_images/water/138.png", order: 138, searchText:"물맹수"},
                { id:"water139", name:"물도술", path:"summoners_war_images/water/139.png", order: 139, searchText:"물도술"},
                { id:"water140", name:"물리자드", path:"summoners_war_images/water/140.png", order: 140, searchText:"물리자드"},
                { id:"water141", name:"물미노", path:"summoners_war_images/water/141.png", order: 141, searchText:"물미노"},
                { id:"water142", name:"물드렁큰", path:"summoners_war_images/water/142.png", order: 142, searchText:"물드렁큰"},
                { id:"water143", name:"물임챔", path:"summoners_war_images/water/143.png", order: 143, searchText:"물임챔"},
                { id:"water144", name:"물바운티", path:"summoners_war_images/water/144.png", order: 144, searchText:"물바운티"},
                { id:"water145", name:"물마궁", path:"summoners_war_images/water/145.png", order: 145, searchText:"물마궁"},
                { id:"water146", name:"물아마존", path:"summoners_war_images/water/146.png", order: 146, searchText:"물아마존"},
                { id:"water147", name:"물바이킹", path:"summoners_war_images/water/147.png", order: 147, searchText:"물바이킹"},
                { id:"water148", name:"물베어맨", path:"summoners_war_images/water/148.png", order: 148, searchText:"물베어맨"},
                { id:"water149", name:"물인페", path:"summoners_war_images/water/149.png", order: 149, searchText:"물인페"},
                { id:"water150", name:"물골렘", path:"summoners_war_images/water/150.png", order: 150, searchText:"물골렘"},
                { id:"water151", name:"물서펀트", path:"summoners_war_images/water/151.png", order: 151, searchText:"물서펀트"},
                { id:"water152", name:"물샐러맨더", path:"summoners_war_images/water/152.png", order: 152, searchText:"물샐러맨더"},
                { id:"water153", name:"물하피", path:"summoners_war_images/water/153.png", order: 153, searchText:"물하피"},
                { id:"water154", name:"물가루다", path:"summoners_war_images/water/154.png", order: 154, searchText:"물가루다"},
                { id:"water155", name:"물엘리멘탈", path:"summoners_war_images/water/155.png", order: 155, searchText:"물엘리멘탈"},
                { id:"water156", name:"물헬하", path:"summoners_war_images/water/156.png", order: 156, searchText:"물헬하"},
                { id:"water157", name:"물예티", path:"summoners_war_images/water/157.png", order: 157, searchText:"물예티"},
                { id:"water158", name:"물임프", path:"summoners_war_images/water/158.png", order: 158, searchText:"물임프"},
                { id:"water159", name:"물하급엘리멘탈", path:"summoners_war_images/water/159.png", order: 159, searchText:"물하급엘리멘탈"}
            ]
        },
        wind: {
            name: "바람속성",
            searchText: "바람속성",
            icons: [
                { id:"wind1", name:"이미지1", path:"summoners_war_images/wind/1.png", order: 1, searchText:"이미지1"},
                { id:"wind2", name:"이미지2", path:"summoners_war_images/wind/2.png", order: 2, searchText:"이미지2"},
                { id:"wind3", name:"이미지3", path:"summoners_war_images/wind/3.png", order: 3, searchText:"이미지3"},
                { id:"wind4", name:"이미지4", path:"summoners_war_images/wind/4.png", order: 4, searchText:"이미지4"},
                { id:"wind5", name:"이미지5", path:"summoners_war_images/wind/5.png", order: 5, searchText:"이미지5"},
                { id:"wind6", name:"이미지6", path:"summoners_war_images/wind/6.png", order: 6, searchText:"이미지6"},
                { id:"wind7", name:"이미지7", path:"summoners_war_images/wind/7.png", order: 7, searchText:"이미지7"},
                { id:"wind8", name:"이미지8", path:"summoners_war_images/wind/8.png", order: 8, searchText:"이미지8"},
                { id:"wind9", name:"이미지9", path:"summoners_war_images/wind/9.png", order: 9, searchText:"이미지9"},
                { id:"wind10", name:"이미지10", path:"summoners_war_images/wind/10.png", order: 10, searchText:"이미지10"},
                { id:"wind11", name:"이미지11", path:"summoners_war_images/wind/11.png", order: 11, searchText:"이미지11"},
                { id:"wind12", name:"이미지12", path:"summoners_war_images/wind/12.png", order: 12, searchText:"이미지12"},
                { id:"wind13", name:"이미지13", path:"summoners_war_images/wind/13.png", order: 13, searchText:"이미지13"},
                { id:"wind14", name:"이미지14", path:"summoners_war_images/wind/14.png", order: 14, searchText:"이미지14"},
                { id:"wind15", name:"이미지15", path:"summoners_war_images/wind/15.png", order: 15, searchText:"이미지15"},
                { id:"wind16", name:"이미지16", path:"summoners_war_images/wind/16.png", order: 16, searchText:"이미지16"},
                { id:"wind17", name:"이미지17", path:"summoners_war_images/wind/17.png", order: 17, searchText:"이미지17"},
                { id:"wind18", name:"이미지18", path:"summoners_war_images/wind/18.png", order: 18, searchText:"이미지18"},
                { id:"wind19", name:"이미지19", path:"summoners_war_images/wind/19.png", order: 19, searchText:"이미지19"},
                { id:"wind20", name:"이미지20", path:"summoners_war_images/wind/20.png", order: 20, searchText:"이미지20"},
                { id:"wind21", name:"이미지21", path:"summoners_war_images/wind/21.png", order: 21, searchText:"이미지21"},
                { id:"wind22", name:"이미지22", path:"summoners_war_images/wind/22.png", order: 22, searchText:"이미지22"},
                { id:"wind23", name:"이미지23", path:"summoners_war_images/wind/23.png", order: 23, searchText:"이미지23"},
                { id:"wind24", name:"이미지24", path:"summoners_war_images/wind/24.png", order: 24, searchText:"이미지24"},
                { id:"wind25", name:"이미지25", path:"summoners_war_images/wind/25.png", order: 25, searchText:"이미지25"},
                { id:"wind26", name:"이미지26", path:"summoners_war_images/wind/26.png", order: 26, searchText:"이미지26"},
                { id:"wind27", name:"이미지27", path:"summoners_war_images/wind/27.png", order: 27, searchText:"이미지27"},
                { id:"wind28", name:"이미지28", path:"summoners_war_images/wind/28.png", order: 28, searchText:"이미지28"},
                { id:"wind29", name:"이미지29", path:"summoners_war_images/wind/29.png", order: 29, searchText:"이미지29"},
                { id:"wind30", name:"이미지30", path:"summoners_war_images/wind/30.png", order: 30, searchText:"이미지30"},
                { id:"wind31", name:"이미지31", path:"summoners_war_images/wind/31.png", order: 31, searchText:"이미지31"},
                { id:"wind32", name:"이미지32", path:"summoners_war_images/wind/32.png", order: 32, searchText:"이미지32"},
                { id:"wind33", name:"이미지33", path:"summoners_war_images/wind/33.png", order: 33, searchText:"이미지33"},
                { id:"wind34", name:"이미지34", path:"summoners_war_images/wind/34.png", order: 34, searchText:"이미지34"},
                { id:"wind35", name:"이미지35", path:"summoners_war_images/wind/35.png", order: 35, searchText:"이미지35"},
                { id:"wind36", name:"이미지36", path:"summoners_war_images/wind/36.png", order: 36, searchText:"이미지36"},
                { id:"wind37", name:"이미지37", path:"summoners_war_images/wind/37.png", order: 37, searchText:"이미지37"},
                { id:"wind38", name:"이미지38", path:"summoners_war_images/wind/38.png", order: 38, searchText:"이미지38"},
                { id:"wind39", name:"이미지39", path:"summoners_war_images/wind/39.png", order: 39, searchText:"이미지39"},
                { id:"wind40", name:"이미지40", path:"summoners_war_images/wind/40.png", order: 40, searchText:"이미지40"},
                { id:"wind41", name:"이미지41", path:"summoners_war_images/wind/41.png", order: 41, searchText:"이미지41"},
                { id:"wind42", name:"이미지42", path:"summoners_war_images/wind/42.png", order: 42, searchText:"이미지42"},
                { id:"wind43", name:"이미지43", path:"summoners_war_images/wind/43.png", order: 43, searchText:"이미지43"},
                { id:"wind44", name:"이미지44", path:"summoners_war_images/wind/44.png", order: 44, searchText:"이미지44"},
                { id:"wind45", name:"이미지45", path:"summoners_war_images/wind/45.png", order: 45, searchText:"이미지45"},
                { id:"wind46", name:"이미지46", path:"summoners_war_images/wind/46.png", order: 46, searchText:"이미지46"},
                { id:"wind47", name:"이미지47", path:"summoners_war_images/wind/47.png", order: 47, searchText:"이미지47"},
                { id:"wind48", name:"이미지48", path:"summoners_war_images/wind/48.png", order: 48, searchText:"이미지48"},
                { id:"wind49", name:"이미지49", path:"summoners_war_images/wind/49.png", order: 49, searchText:"이미지49"},
                { id:"wind50", name:"이미지50", path:"summoners_war_images/wind/50.png", order: 50, searchText:"이미지50"},
                { id:"wind51", name:"이미지51", path:"summoners_war_images/wind/51.png", order: 51, searchText:"이미지51"},
                { id:"wind52", name:"이미지52", path:"summoners_war_images/wind/52.png", order: 52, searchText:"이미지52"},
                { id:"wind53", name:"이미지53", path:"summoners_war_images/wind/53.png", order: 53, searchText:"이미지53"},
                { id:"wind54", name:"이미지54", path:"summoners_war_images/wind/54.png", order: 54, searchText:"이미지54"},
                { id:"wind55", name:"이미지55", path:"summoners_war_images/wind/55.png", order: 55, searchText:"이미지55"},
                { id:"wind56", name:"이미지56", path:"summoners_war_images/wind/56.png", order: 56, searchText:"이미지56"},
                { id:"wind57", name:"이미지57", path:"summoners_war_images/wind/57.png", order: 57, searchText:"이미지57"},
                { id:"wind58", name:"이미지58", path:"summoners_war_images/wind/58.png", order: 58, searchText:"이미지58"},
                { id:"wind59", name:"이미지59", path:"summoners_war_images/wind/59.png", order: 59, searchText:"이미지59"},
                { id:"wind60", name:"이미지60", path:"summoners_war_images/wind/60.png", order: 60, searchText:"이미지60"},
                { id:"wind61", name:"이미지61", path:"summoners_war_images/wind/61.png", order: 61, searchText:"이미지61"},
                { id:"wind62", name:"이미지62", path:"summoners_war_images/wind/62.png", order: 62, searchText:"이미지62"},
                { id:"wind63", name:"이미지63", path:"summoners_war_images/wind/63.png", order: 63, searchText:"이미지63"},
                { id:"wind64", name:"이미지64", path:"summoners_war_images/wind/64.png", order: 64, searchText:"이미지64"},
                { id:"wind65", name:"이미지65", path:"summoners_war_images/wind/65.png", order: 65, searchText:"이미지65"},
                { id:"wind66", name:"이미지66", path:"summoners_war_images/wind/66.png", order: 66, searchText:"이미지66"},
                { id:"wind67", name:"이미지67", path:"summoners_war_images/wind/67.png", order: 67, searchText:"이미지67"},
                { id:"wind68", name:"이미지68", path:"summoners_war_images/wind/68.png", order: 68, searchText:"이미지68"},
                { id:"wind69", name:"이미지69", path:"summoners_war_images/wind/69.png", order: 69, searchText:"이미지69"},
                { id:"wind70", name:"이미지70", path:"summoners_war_images/wind/70.png", order: 70, searchText:"이미지70"},
                { id:"wind71", name:"이미지71", path:"summoners_war_images/wind/71.png", order: 71, searchText:"이미지71"},
                { id:"wind72", name:"이미지72", path:"summoners_war_images/wind/72.png", order: 72, searchText:"이미지72"},
                { id:"wind73", name:"이미지73", path:"summoners_war_images/wind/73.png", order: 73, searchText:"이미지73"},
                { id:"wind74", name:"이미지74", path:"summoners_war_images/wind/74.png", order: 74, searchText:"이미지74"},
                { id:"wind75", name:"이미지75", path:"summoners_war_images/wind/75.png", order: 75, searchText:"이미지75"},
                { id:"wind76", name:"이미지76", path:"summoners_war_images/wind/76.png", order: 76, searchText:"이미지76"},
                { id:"wind77", name:"이미지77", path:"summoners_war_images/wind/77.png", order: 77, searchText:"이미지77"},
                { id:"wind78", name:"이미지78", path:"summoners_war_images/wind/78.png", order: 78, searchText:"이미지78"},
                { id:"wind79", name:"이미지79", path:"summoners_war_images/wind/79.png", order: 79, searchText:"이미지79"},
                { id:"wind80", name:"이미지80", path:"summoners_war_images/wind/80.png", order: 80, searchText:"이미지80"},
                { id:"wind81", name:"이미지81", path:"summoners_war_images/wind/81.png", order: 81, searchText:"이미지81"},
                { id:"wind82", name:"이미지82", path:"summoners_war_images/wind/82.png", order: 82, searchText:"이미지82"},
                { id:"wind83", name:"이미지83", path:"summoners_war_images/wind/83.png", order: 83, searchText:"이미지83"},
                { id:"wind84", name:"이미지84", path:"summoners_war_images/wind/84.png", order: 84, searchText:"이미지84"},
                { id:"wind85", name:"이미지85", path:"summoners_war_images/wind/85.png", order: 85, searchText:"이미지85"},
                { id:"wind86", name:"이미지86", path:"summoners_war_images/wind/86.png", order: 86, searchText:"이미지86"},
                { id:"wind87", name:"이미지87", path:"summoners_war_images/wind/87.png", order: 87, searchText:"이미지87"}, 
                { id:"wind88", name:"이미지88", path:"summoners_war_images/wind/88.png", order: 88, searchText:"이미지88"},
                { id:"wind89", name:"이미지89", path:"summoners_war_images/wind/89.png", order: 89, searchText:"이미지89"},
                { id:"wind90", name:"이미지90", path:"summoners_war_images/wind/90.png", order: 90, searchText:"이미지90"},
                { id:"wind91", name:"이미지91", path:"summoners_war_images/wind/91.png", order: 91, searchText:"이미지91"},
                { id:"wind92", name:"이미지92", path:"summoners_war_images/wind/92.png", order: 92, searchText:"이미지92"},
                { id:"wind93", name:"이미지93", path:"summoners_war_images/wind/93.png", order: 93, searchText:"이미지93"},
                { id:"wind94", name:"이미지94", path:"summoners_war_images/wind/94.png", order: 94, searchText:"이미지94"},
                { id:"wind95", name:"이미지95", path:"summoners_war_images/wind/95.png", order: 95, searchText:"이미지95"},
                { id:"wind96", name:"이미지96", path:"summoners_war_images/wind/96.png", order: 96, searchText:"이미지96"},
                { id:"wind97", name:"이미지97", path:"summoners_war_images/wind/97.png", order: 97, searchText:"이미지97"},
                { id:"wind98", name:"이미지98", path:"summoners_war_images/wind/98.png", order: 98, searchText:"이미지98"},
                { id:"wind99", name:"이미지99", path:"summoners_war_images/wind/99.png", order: 99, searchText:"이미지99"},
                { id:"wind100", name:"이미지100", path:"summoners_war_images/wind/100.png", order: 100, searchText:"이미지100"},
                { id:"wind101", name:"이미지101", path:"summoners_war_images/wind/101.png", order: 101, searchText:"이미지101"},
                { id:"wind102", name:"이미지102", path:"summoners_war_images/wind/102.png", order: 102, searchText:"이미지102"},
                { id:"wind103", name:"이미지103", path:"summoners_war_images/wind/103.png", order: 103, searchText:"이미지103"},
                { id:"wind104", name:"이미지104", path:"summoners_war_images/wind/104.png", order: 104, searchText:"이미지104"},
                { id:"wind105", name:"이미지105", path:"summoners_war_images/wind/105.png", order: 105, searchText:"이미지105"},
                { id:"wind106", name:"이미지106", path:"summoners_war_images/wind/106.png", order: 106, searchText:"이미지106"},
                { id:"wind107", name:"이미지107", path:"summoners_war_images/wind/107.png", order: 107, searchText:"이미지107"},
                { id:"wind108", name:"이미지108", path:"summoners_war_images/wind/108.png", order: 108, searchText:"이미지108"},
                { id:"wind109", name:"이미지109", path:"summoners_war_images/wind/109.png", order: 109, searchText:"이미지109"},
                { id:"wind110", name:"이미지110", path:"summoners_war_images/wind/110.png", order: 110, searchText:"이미지110"},
                { id:"wind111", name:"이미지111", path:"summoners_war_images/wind/111.png", order: 111, searchText:"이미지111"},
                { id:"wind112", name:"이미지112", path:"summoners_war_images/wind/112.png", order: 112, searchText:"이미지112"},
                { id:"wind113", name:"이미지113", path:"summoners_war_images/wind/113.png", order: 113, searchText:"이미지113"},
                { id:"wind114", name:"이미지114", path:"summoners_war_images/wind/114.png", order: 114, searchText:"이미지114"},
                { id:"wind115", name:"이미지115", path:"summoners_war_images/wind/115.png", order: 115, searchText:"이미지115"},
                { id:"wind116", name:"이미지116", path:"summoners_war_images/wind/116.png", order: 116, searchText:"이미지116"},
                { id:"wind117", name:"이미지117", path:"summoners_war_images/wind/117.png", order: 117, searchText:"이미지117"},
                { id:"wind118", name:"이미지118", path:"summoners_war_images/wind/118.png", order: 118, searchText:"이미지118"},
                { id:"wind119", name:"이미지119", path:"summoners_war_images/wind/119.png", order: 119, searchText:"이미지119"},
                { id:"wind120", name:"이미지120", path:"summoners_war_images/wind/120.png", order: 120, searchText:"이미지120"},
                { id:"wind121", name:"이미지121", path:"summoners_war_images/wind/121.png", order: 121, searchText:"이미지121"},
                { id:"wind122", name:"이미지122", path:"summoners_war_images/wind/122.png", order: 122, searchText:"이미지122"},
                { id:"wind123", name:"이미지123", path:"summoners_war_images/wind/123.png", order: 123, searchText:"이미지123"},
                { id:"wind124", name:"이미지124", path:"summoners_war_images/wind/124.png", order: 124, searchText:"이미지124"},
                { id:"wind125", name:"이미지125", path:"summoners_war_images/wind/125.png", order: 125, searchText:"이미지125"},
                { id:"wind126", name:"이미지126", path:"summoners_war_images/wind/126.png", order: 126, searchText:"이미지126"},
                { id:"wind127", name:"이미지127", path:"summoners_war_images/wind/127.png", order: 127, searchText:"이미지127"},
                { id:"wind128", name:"이미지128", path:"summoners_war_images/wind/128.png", order: 128, searchText:"이미지128"},
                { id:"wind129", name:"이미지129", path:"summoners_war_images/wind/129.png", order: 129, searchText:"이미지129"},
                { id:"wind130", name:"이미지130", path:"summoners_war_images/wind/130.png", order: 130, searchText:"이미지130"},
                { id:"wind131", name:"이미지131", path:"summoners_war_images/wind/131.png", order: 131, searchText:"이미지131"},
                { id:"wind132", name:"이미지132", path:"summoners_war_images/wind/132.png", order: 132, searchText:"이미지132"},
                { id:"wind133", name:"이미지133", path:"summoners_war_images/wind/133.png", order: 133, searchText:"이미지133"},
                { id:"wind134", name:"이미지134", path:"summoners_war_images/wind/134.png", order: 134, searchText:"이미지134"},
                { id:"wind135", name:"이미지135", path:"summoners_war_images/wind/135.png", order: 135, searchText:"이미지135"},
                { id:"wind136", name:"이미지136", path:"summoners_war_images/wind/136.png", order: 136, searchText:"이미지136"},
                { id:"wind137", name:"이미지137", path:"summoners_war_images/wind/137.png", order: 137, searchText:"이미지137"},
                { id:"wind138", name:"이미지138", path:"summoners_war_images/wind/138.png", order: 138, searchText:"이미지138"},
                { id:"wind139", name:"이미지139", path:"summoners_war_images/wind/139.png", order: 139, searchText:"이미지139"},
                { id:"wind140", name:"이미지140", path:"summoners_war_images/wind/140.png", order: 140, searchText:"이미지140"},
                { id:"wind141", name:"이미지141", path:"summoners_war_images/wind/141.png", order: 141, searchText:"이미지141"},
                { id:"wind142", name:"이미지142", path:"summoners_war_images/wind/142.png", order: 142, searchText:"이미지142"},
                { id:"wind143", name:"이미지143", path:"summoners_war_images/wind/143.png", order: 143, searchText:"이미지143"},
                { id:"wind144", name:"이미지144", path:"summoners_war_images/wind/144.png", order: 144, searchText:"이미지144"},
                { id:"wind145", name:"이미지145", path:"summoners_war_images/wind/145.png", order: 145, searchText:"이미지145"},
                { id:"wind146", name:"이미지146", path:"summoners_war_images/wind/146.png", order: 146, searchText:"이미지146"},
                { id:"wind147", name:"이미지147", path:"summoners_war_images/wind/147.png", order: 147, searchText:"이미지147"},
                { id:"wind148", name:"이미지148", path:"summoners_war_images/wind/148.png", order: 148, searchText:"이미지148"},
                { id:"wind149", name:"이미지149", path:"summoners_war_images/wind/149.png", order: 149, searchText:"이미지149"},
                { id:"wind150", name:"이미지150", path:"summoners_war_images/wind/150.png", order: 150, searchText:"이미지150"},
                { id:"wind151", name:"이미지151", path:"summoners_war_images/wind/151.png", order: 151, searchText:"이미지151"},
                { id:"wind152", name:"이미지152", path:"summoners_war_images/wind/152.png", order: 152, searchText:"이미지152"},
                { id:"wind153", name:"이미지153", path:"summoners_war_images/wind/153.png", order: 153, searchText:"이미지153"},
                { id:"wind154", name:"이미지154", path:"summoners_war_images/wind/154.png", order: 154, searchText:"이미지154"},
                { id:"wind155", name:"이미지155", path:"summoners_war_images/wind/155.png", order: 155, searchText:"이미지155"},
                { id:"wind156", name:"이미지156", path:"summoners_war_images/wind/156.png", order: 156, searchText:"이미지156"},
                { id:"wind157", name:"이미지157", path:"summoners_war_images/wind/157.png", order: 157, searchText:"이미지157"},
                { id:"wind158", name:"이미지158", path:"summoners_war_images/wind/158.png", order: 158, searchText:"이미지158"},
                { id:"wind159", name:"이미지159", path:"summoners_war_images/wind/159.png", order: 159, searchText:"이미지159"},
                { id:"wind160", name:"이미지160", path:"summoners_war_images/wind/160.png", order: 160, searchText:"이미지160"}
            ]
        },
        light: {
            name: "빛속성",
            searchText: "빛속성",
            icons: [
                { id:"light1", name:"이미지1", path:"summoners_war_images/light/1.png", order: 1, searchText:"이미지1"},
                { id:"light2", name:"이미지2", path:"summoners_war_images/light/2.png", order: 2, searchText:"이미지2"},
                { id:"light3", name:"이미지3", path:"summoners_war_images/light/3.png", order: 3, searchText:"이미지3"},
                { id:"light4", name:"이미지4", path:"summoners_war_images/light/4.png", order: 4, searchText:"이미지4"},
                { id:"light5", name:"이미지5", path:"summoners_war_images/light/5.png", order: 5, searchText:"이미지5"},
                { id:"light6", name:"이미지6", path:"summoners_war_images/light/6.png", order: 6, searchText:"이미지6"},
                { id:"light7", name:"이미지7", path:"summoners_war_images/light/7.png", order: 7, searchText:"이미지7"},
                { id:"light8", name:"이미지8", path:"summoners_war_images/light/8.png", order: 8, searchText:"이미지8"},
                { id:"light9", name:"이미지9", path:"summoners_war_images/light/9.png", order: 9, searchText:"이미지9"},
                { id:"light10", name:"이미지10", path:"summoners_war_images/light/10.png", order: 10, searchText:"이미지10"},
                { id:"light11", name:"이미지11", path:"summoners_war_images/light/11.png", order: 11, searchText:"이미지11"},
                { id:"light12", name:"이미지12", path:"summoners_war_images/light/12.png", order: 12, searchText:"이미지12"},
                { id:"light13", name:"이미지13", path:"summoners_war_images/light/13.png", order: 13, searchText:"이미지13"},
                { id:"light14", name:"이미지14", path:"summoners_war_images/light/14.png", order: 14, searchText:"이미지14"},
                { id:"light15", name:"이미지15", path:"summoners_war_images/light/15.png", order: 15, searchText:"이미지15"},
                { id:"light16", name:"이미지16", path:"summoners_war_images/light/16.png", order: 16, searchText:"이미지16"},
                { id:"light17", name:"이미지17", path:"summoners_war_images/light/17.png", order: 17, searchText:"이미지17"},
                { id:"light18", name:"이미지18", path:"summoners_war_images/light/18.png", order: 18, searchText:"이미지18"},
                { id:"light19", name:"이미지19", path:"summoners_war_images/light/19.png", order: 19, searchText:"이미지19"},
                { id:"light20", name:"이미지20", path:"summoners_war_images/light/20.png", order: 20, searchText:"이미지20"},
                { id:"light21", name:"이미지21", path:"summoners_war_images/light/21.png", order: 21, searchText:"이미지21"},
                { id:"light22", name:"이미지22", path:"summoners_war_images/light/22.png", order: 22, searchText:"이미지22"},
                { id:"light23", name:"이미지23", path:"summoners_war_images/light/23.png", order: 23, searchText:"이미지23"},
                { id:"light24", name:"이미지24", path:"summoners_war_images/light/24.png", order: 24, searchText:"이미지24"},
                { id:"light25", name:"이미지25", path:"summoners_war_images/light/25.png", order: 25, searchText:"이미지25"},
                { id:"light26", name:"이미지26", path:"summoners_war_images/light/26.png", order: 26, searchText:"이미지26"},
                { id:"light27", name:"이미지27", path:"summoners_war_images/light/27.png", order: 27, searchText:"이미지27"},
                { id:"light28", name:"이미지28", path:"summoners_war_images/light/28.png", order: 28, searchText:"이미지28"},
                { id:"light29", name:"이미지29", path:"summoners_war_images/light/29.png", order: 29, searchText:"이미지29"},
                { id:"light30", name:"이미지30", path:"summoners_war_images/light/30.png", order: 30, searchText:"이미지30"},
                { id:"light31", name:"이미지31", path:"summoners_war_images/light/31.png", order: 31, searchText:"이미지31"},
                { id:"light32", name:"이미지32", path:"summoners_war_images/light/32.png", order: 32, searchText:"이미지32"},
                { id:"light33", name:"이미지33", path:"summoners_war_images/light/33.png", order: 33, searchText:"이미지33"},
                { id:"light34", name:"이미지34", path:"summoners_war_images/light/34.png", order: 34, searchText:"이미지34"},
                { id:"light35", name:"이미지35", path:"summoners_war_images/light/35.png", order: 35, searchText:"이미지35"},
                { id:"light36", name:"이미지36", path:"summoners_war_images/light/36.png", order: 36, searchText:"이미지36"},
                { id:"light37", name:"이미지37", path:"summoners_war_images/light/37.png", order: 37, searchText:"이미지37"},
                { id:"light38", name:"이미지38", path:"summoners_war_images/light/38.png", order: 38, searchText:"이미지38"},
                { id:"light39", name:"이미지39", path:"summoners_war_images/light/39.png", order: 39, searchText:"이미지39"},
                { id:"light40", name:"이미지40", path:"summoners_war_images/light/40.png", order: 40, searchText:"이미지40"},
                { id:"light41", name:"이미지41", path:"summoners_war_images/light/41.png", order: 41, searchText:"이미지41"},
                { id:"light42", name:"이미지42", path:"summoners_war_images/light/42.png", order: 42, searchText:"이미지42"},
                { id:"light43", name:"이미지43", path:"summoners_war_images/light/43.png", order: 43, searchText:"이미지43"},
                { id:"light44", name:"이미지44", path:"summoners_war_images/light/44.png", order: 44, searchText:"이미지44"},
                { id:"light45", name:"이미지45", path:"summoners_war_images/light/45.png", order: 45, searchText:"이미지45"},
                { id:"light46", name:"이미지46", path:"summoners_war_images/light/46.png", order: 46, searchText:"이미지46"},
                { id:"light47", name:"이미지47", path:"summoners_war_images/light/47.png", order: 47, searchText:"이미지47"},
                { id:"light48", name:"이미지48", path:"summoners_war_images/light/48.png", order: 48, searchText:"이미지48"},
                { id:"light49", name:"이미지49", path:"summoners_war_images/light/49.png", order: 49, searchText:"이미지49"},
                { id:"light50", name:"이미지50", path:"summoners_war_images/light/50.png", order: 50, searchText:"이미지50"},
                { id:"light51", name:"이미지51", path:"summoners_war_images/light/51.png", order: 51, searchText:"이미지51"},
                { id:"light52", name:"이미지52", path:"summoners_war_images/light/52.png", order: 52, searchText:"이미지52"},
                { id:"light53", name:"이미지53", path:"summoners_war_images/light/53.png", order: 53, searchText:"이미지53"},
                { id:"light54", name:"이미지54", path:"summoners_war_images/light/54.png", order: 54, searchText:"이미지54"},
                { id:"light55", name:"이미지55", path:"summoners_war_images/light/55.png", order: 55, searchText:"이미지55"},
                { id:"light56", name:"이미지56", path:"summoners_war_images/light/56.png", order: 56, searchText:"이미지56"},
                { id:"light57", name:"이미지57", path:"summoners_war_images/light/57.png", order: 57, searchText:"이미지57"},
                { id:"light58", name:"이미지58", path:"summoners_war_images/light/58.png", order: 58, searchText:"이미지58"},
                { id:"light59", name:"이미지59", path:"summoners_war_images/light/59.png", order: 59, searchText:"이미지59"},
                { id:"light60", name:"이미지60", path:"summoners_war_images/light/60.png", order: 60, searchText:"이미지60"},
                { id:"light61", name:"이미지61", path:"summoners_war_images/light/61.png", order: 61, searchText:"이미지61"},
                { id:"light62", name:"이미지62", path:"summoners_war_images/light/62.png", order: 62, searchText:"이미지62"},
                { id:"light63", name:"이미지63", path:"summoners_war_images/light/63.png", order: 63, searchText:"이미지63"},
                { id:"light64", name:"이미지64", path:"summoners_war_images/light/64.png", order: 64, searchText:"이미지64"},
                { id:"light65", name:"이미지65", path:"summoners_war_images/light/65.png", order: 65, searchText:"이미지65"},
                { id:"light66", name:"이미지66", path:"summoners_war_images/light/66.png", order: 66, searchText:"이미지66"},
                { id:"light67", name:"이미지67", path:"summoners_war_images/light/67.png", order: 67, searchText:"이미지67"},
                { id:"light68", name:"이미지68", path:"summoners_war_images/light/68.png", order: 68, searchText:"이미지68"},
                { id:"light69", name:"이미지69", path:"summoners_war_images/light/69.png", order: 69, searchText:"이미지69"},
                { id:"light70", name:"이미지70", path:"summoners_war_images/light/70.png", order: 70, searchText:"이미지70"},
                { id:"light71", name:"이미지71", path:"summoners_war_images/light/71.png", order: 71, searchText:"이미지71"},
                { id:"light72", name:"이미지72", path:"summoners_war_images/light/72.png", order: 72, searchText:"이미지72"},
                { id:"light73", name:"이미지73", path:"summoners_war_images/light/73.png", order: 73, searchText:"이미지73"},
                { id:"light74", name:"이미지74", path:"summoners_war_images/light/74.png", order: 74, searchText:"이미지74"},
                { id:"light75", name:"이미지75", path:"summoners_war_images/light/75.png", order: 75, searchText:"이미지75"},
                { id:"light76", name:"이미지76", path:"summoners_war_images/light/76.png", order: 76, searchText:"이미지76"},
                { id:"light77", name:"이미지77", path:"summoners_war_images/light/77.png", order: 77, searchText:"이미지77"},
                { id:"light78", name:"이미지78", path:"summoners_war_images/light/78.png", order: 78, searchText:"이미지78"},
                { id:"light79", name:"이미지79", path:"summoners_war_images/light/79.png", order: 79, searchText:"이미지79"},
                { id:"light80", name:"이미지80", path:"summoners_war_images/light/80.png", order: 80, searchText:"이미지80"},
                { id:"light81", name:"이미지81", path:"summoners_war_images/light/81.png", order: 81, searchText:"이미지81"},
                { id:"light82", name:"이미지82", path:"summoners_war_images/light/82.png", order: 82, searchText:"이미지82"},
                { id:"light83", name:"이미지83", path:"summoners_war_images/light/83.png", order: 83, searchText:"이미지83"},
                { id:"light84", name:"이미지84", path:"summoners_war_images/light/84.png", order: 84, searchText:"이미지84"},
                { id:"light85", name:"이미지85", path:"summoners_war_images/light/85.png", order: 85, searchText:"이미지85"},
                { id:"light86", name:"이미지86", path:"summoners_war_images/light/86.png", order: 86, searchText:"이미지86"},
                { id:"light87", name:"이미지87", path:"summoners_war_images/light/87.png", order: 87, searchText:"이미지87"},
                { id:"light88", name:"이미지88", path:"summoners_war_images/light/88.png", order: 88, searchText:"이미지88"},
                { id:"light89", name:"이미지89", path:"summoners_war_images/light/89.png", order: 89, searchText:"이미지89"},
                { id:"light90", name:"이미지90", path:"summoners_war_images/light/90.png", order: 90, searchText:"이미지90"},
                { id:"light91", name:"이미지91", path:"summoners_war_images/light/91.png", order: 91, searchText:"이미지91"},
                { id:"light92", name:"이미지92", path:"summoners_war_images/light/92.png", order: 92, searchText:"이미지92"},
                { id:"light93", name:"이미지93", path:"summoners_war_images/light/93.png", order: 93, searchText:"이미지93"},
                { id:"light94", name:"이미지94", path:"summoners_war_images/light/94.png", order: 94, searchText:"이미지94"},
                { id:"light95", name:"이미지95", path:"summoners_war_images/light/95.png", order: 95, searchText:"이미지95"},
                { id:"light96", name:"이미지96", path:"summoners_war_images/light/96.png", order: 96, searchText:"이미지96"},
                { id:"light97", name:"이미지97", path:"summoners_war_images/light/97.png", order: 97, searchText:"이미지97"},
                { id:"light98", name:"이미지98", path:"summoners_war_images/light/98.png", order: 98, searchText:"이미지98"},
                { id:"light99", name:"이미지99", path:"summoners_war_images/light/99.png", order: 99, searchText:"이미지99"},
                { id:"light100", name:"이미지100", path:"summoners_war_images/light/100.png", order: 100, searchText:"이미지100"},
                { id:"light101", name:"이미지101", path:"summoners_war_images/light/101.png", order: 101, searchText:"이미지101"},
                { id:"light102", name:"이미지102", path:"summoners_war_images/light/102.png", order: 102, searchText:"이미지102"},
                { id:"light103", name:"이미지103", path:"summoners_war_images/light/103.png", order: 103, searchText:"이미지103"},
                { id:"light104", name:"이미지104", path:"summoners_war_images/light/104.png", order: 104, searchText:"이미지104"},
                { id:"light105", name:"이미지105", path:"summoners_war_images/light/105.png", order: 105, searchText:"이미지105"},
                { id:"light106", name:"이미지106", path:"summoners_war_images/light/106.png", order: 106, searchText:"이미지106"},
                { id:"light107", name:"이미지107", path:"summoners_war_images/light/107.png", order: 107, searchText:"이미지107"},
                { id:"light108", name:"이미지108", path:"summoners_war_images/light/108.png", order: 108, searchText:"이미지108"},
                { id:"light109", name:"이미지109", path:"summoners_war_images/light/109.png", order: 109, searchText:"이미지109"},
                { id:"light110", name:"이미지110", path:"summoners_war_images/light/110.png", order: 110, searchText:"이미지110"},
                { id:"light111", name:"이미지111", path:"summoners_war_images/light/111.png", order: 111, searchText:"이미지111"},
                { id:"light112", name:"이미지112", path:"summoners_war_images/light/112.png", order: 112, searchText:"이미지112"},
                { id:"light113", name:"이미지113", path:"summoners_war_images/light/113.png", order: 113, searchText:"이미지113"},
                { id:"light114", name:"이미지114", path:"summoners_war_images/light/114.png", order: 114, searchText:"이미지114"},
                { id:"light115", name:"이미지115", path:"summoners_war_images/light/115.png", order: 115, searchText:"이미지115"},
                { id:"light116", name:"이미지116", path:"summoners_war_images/light/116.png", order: 116, searchText:"이미지116"},
                { id:"light117", name:"이미지117", path:"summoners_war_images/light/117.png", order: 117, searchText:"이미지117"},
                { id:"light118", name:"이미지118", path:"summoners_war_images/light/118.png", order: 118, searchText:"이미지118"},
                { id:"light119", name:"이미지119", path:"summoners_war_images/light/119.png", order: 119, searchText:"이미지119"},
                { id:"light120", name:"이미지120", path:"summoners_war_images/light/120.png", order: 120, searchText:"이미지120"},
                { id:"light121", name:"이미지121", path:"summoners_war_images/light/121.png", order: 121, searchText:"이미지121"},
                { id:"light122", name:"이미지122", path:"summoners_war_images/light/122.png", order: 122, searchText:"이미지122"},
                { id:"light123", name:"이미지123", path:"summoners_war_images/light/123.png", order: 123, searchText:"이미지123"},
                { id:"light124", name:"이미지124", path:"summoners_war_images/light/124.png", order: 124, searchText:"이미지124"},
                { id:"light125", name:"이미지125", path:"summoners_war_images/light/125.png", order: 125, searchText:"이미지125"},
                { id:"light126", name:"이미지126", path:"summoners_war_images/light/126.png", order: 126, searchText:"이미지126"},
                { id:"light127", name:"이미지127", path:"summoners_war_images/light/127.png", order: 127, searchText:"이미지127"},
                { id:"light128", name:"이미지128", path:"summoners_war_images/light/128.png", order: 128, searchText:"이미지128"},
                { id:"light129", name:"이미지129", path:"summoners_war_images/light/129.png", order: 129, searchText:"이미지129"},
                { id:"light130", name:"이미지130", path:"summoners_war_images/light/130.png", order: 130, searchText:"이미지130"},
                { id:"light131", name:"이미지131", path:"summoners_war_images/light/131.png", order: 131, searchText:"이미지131"},
                { id:"light132", name:"이미지132", path:"summoners_war_images/light/132.png", order: 132, searchText:"이미지132"},
                { id:"light133", name:"이미지133", path:"summoners_war_images/light/133.png", order: 133, searchText:"이미지133"},
                { id:"light134", name:"이미지134", path:"summoners_war_images/light/134.png", order: 134, searchText:"이미지134"},
                { id:"light135", name:"이미지135", path:"summoners_war_images/light/135.png", order: 135, searchText:"이미지135"},
                { id:"light136", name:"이미지136", path:"summoners_war_images/light/136.png", order: 136, searchText:"이미지136"},
                { id:"light137", name:"이미지137", path:"summoners_war_images/light/137.png", order: 137, searchText:"이미지137"},
                { id:"light138", name:"이미지138", path:"summoners_war_images/light/138.png", order: 138, searchText:"이미지138"},
                { id:"light139", name:"이미지139", path:"summoners_war_images/light/139.png", order: 139, searchText:"이미지139"},
                { id:"light140", name:"이미지140", path:"summoners_war_images/light/140.png", order: 140, searchText:"이미지140"},
                { id:"light141", name:"이미지141", path:"summoners_war_images/light/141.png", order: 141, searchText:"이미지141"},
                { id:"light142", name:"이미지142", path:"summoners_war_images/light/142.png", order: 142, searchText:"이미지142"},
                { id:"light143", name:"이미지143", path:"summoners_war_images/light/143.png", order: 143, searchText:"이미지143"},
                { id:"light144", name:"이미지144", path:"summoners_war_images/light/144.png", order: 144, searchText:"이미지144"},
                { id:"light145", name:"이미지145", path:"summoners_war_images/light/145.png", order: 145, searchText:"이미지145"},
                { id:"light146", name:"이미지146", path:"summoners_war_images/light/146.png", order: 146, searchText:"이미지146"},
                { id:"light147", name:"이미지147", path:"summoners_war_images/light/147.png", order: 147, searchText:"이미지147"},
                { id:"light148", name:"이미지148", path:"summoners_war_images/light/148.png", order: 148, searchText:"이미지148"},
                { id:"light149", name:"이미지149", path:"summoners_war_images/light/149.png", order: 149, searchText:"이미지149"},
                { id:"light150", name:"이미지150", path:"summoners_war_images/light/150.png", order: 150, searchText:"이미지150"},
                { id:"light151", name:"이미지151", path:"summoners_war_images/light/151.png", order: 151, searchText:"이미지151"},
                { id:"light152", name:"이미지152", path:"summoners_war_images/light/152.png", order: 152, searchText:"이미지152"},
                { id:"light153", name:"이미지153", path:"summoners_war_images/light/153.png", order: 153, searchText:"이미지153"},
                { id:"light154", name:"이미지154", path:"summoners_war_images/light/154.png", order: 154, searchText:"이미지154"},
                { id:"light155", name:"이미지155", path:"summoners_war_images/light/155.png", order: 155, searchText:"이미지155"},
                { id:"light156", name:"이미지156", path:"summoners_war_images/light/156.png", order: 156, searchText:"이미지156"},
                { id:"light157", name:"이미지157", path:"summoners_war_images/light/157.png", order: 157, searchText:"이미지157"},
                { id:"light158", name:"이미지158", path:"summoners_war_images/light/158.png", order: 158, searchText:"이미지158"},
                { id:"light159", name:"이미지159", path:"summoners_war_images/light/159.png", order: 159, searchText:"이미지159"},
                { id:"light160", name:"이미지160", path:"summoners_war_images/light/160.png", order: 160, searchText:"이미지160"},
                { id:"light161", name:"이미지161", path:"summoners_war_images/light/161.png", order: 161, searchText:"이미지161"}
            ]
        },
        dark: {
            name: "어둠속성",
            searchText: "어둠속성",
            icons: [
                { id:"dark1", name:"이미지1", path:"summoners_war_images/dark/1.png", order: 1, searchText:"이미지1"},
                { id:"dark2", name:"이미지2", path:"summoners_war_images/dark/2.png", order: 2, searchText:"이미지2"},
                { id:"dark3", name:"이미지3", path:"summoners_war_images/dark/3.png", order: 3, searchText:"이미지3"},
                { id:"dark4", name:"이미지4", path:"summoners_war_images/dark/4.png", order: 4, searchText:"이미지4"},
                { id:"dark5", name:"이미지5", path:"summoners_war_images/dark/5.png", order: 5, searchText:"이미지5"},
                { id:"dark6", name:"이미지6", path:"summoners_war_images/dark/6.png", order: 6, searchText:"이미지6"},
                { id:"dark7", name:"이미지7", path:"summoners_war_images/dark/7.png", order: 7, searchText:"이미지7"},
                { id:"dark8", name:"이미지8", path:"summoners_war_images/dark/8.png", order: 8, searchText:"이미지8"},
                { id:"dark9", name:"이미지9", path:"summoners_war_images/dark/9.png", order: 9, searchText:"이미지9"},
                { id:"dark10", name:"이미지10", path:"summoners_war_images/dark/10.png", order: 10, searchText:"이미지10"},
                { id:"dark11", name:"이미지11", path:"summoners_war_images/dark/11.png", order: 11, searchText:"이미지11"},
                { id:"dark12", name:"이미지12", path:"summoners_war_images/dark/12.png", order: 12, searchText:"이미지12"},
                { id:"dark13", name:"이미지13", path:"summoners_war_images/dark/13.png", order: 13, searchText:"이미지13"},
                { id:"dark14", name:"이미지14", path:"summoners_war_images/dark/14.png", order: 14, searchText:"이미지14"},
                { id:"dark15", name:"이미지15", path:"summoners_war_images/dark/15.png", order: 15, searchText:"이미지15"},
                { id:"dark16", name:"이미지16", path:"summoners_war_images/dark/16.png", order: 16, searchText:"이미지16"},
                { id:"dark17", name:"이미지17", path:"summoners_war_images/dark/17.png", order: 17, searchText:"이미지17"},
                { id:"dark18", name:"이미지18", path:"summoners_war_images/dark/18.png", order: 18, searchText:"이미지18"},
                { id:"dark19", name:"이미지19", path:"summoners_war_images/dark/19.png", order: 19, searchText:"이미지19"},
                { id:"dark20", name:"이미지20", path:"summoners_war_images/dark/20.png", order: 20, searchText:"이미지20"},
                { id:"dark21", name:"이미지21", path:"summoners_war_images/dark/21.png", order: 21, searchText:"이미지21"},
                { id:"dark22", name:"이미지22", path:"summoners_war_images/dark/22.png", order: 22, searchText:"이미지22"},
                { id:"dark23", name:"이미지23", path:"summoners_war_images/dark/23.png", order: 23, searchText:"이미지23"},
                { id:"dark24", name:"이미지24", path:"summoners_war_images/dark/24.png", order: 24, searchText:"이미지24"},
                { id:"dark25", name:"이미지25", path:"summoners_war_images/dark/25.png", order: 25, searchText:"이미지25"},
                { id:"dark26", name:"이미지26", path:"summoners_war_images/dark/26.png", order: 26, searchText:"이미지26"},
                { id:"dark27", name:"이미지27", path:"summoners_war_images/dark/27.png", order: 27, searchText:"이미지27"},
                { id:"dark28", name:"이미지28", path:"summoners_war_images/dark/28.png", order: 28, searchText:"이미지28"},
                { id:"dark29", name:"이미지29", path:"summoners_war_images/dark/29.png", order: 29, searchText:"이미지29"},
                { id:"dark30", name:"이미지30", path:"summoners_war_images/dark/30.png", order: 30, searchText:"이미지30"},
                { id:"dark31", name:"이미지31", path:"summoners_war_images/dark/31.png", order: 31, searchText:"이미지31"},
                { id:"dark32", name:"이미지32", path:"summoners_war_images/dark/32.png", order: 32, searchText:"이미지32"},
                { id:"dark33", name:"이미지33", path:"summoners_war_images/dark/33.png", order: 33, searchText:"이미지33"},
                { id:"dark34", name:"이미지34", path:"summoners_war_images/dark/34.png", order: 34, searchText:"이미지34"},
                { id:"dark35", name:"이미지35", path:"summoners_war_images/dark/35.png", order: 35, searchText:"이미지35"},
                { id:"dark36", name:"이미지36", path:"summoners_war_images/dark/36.png", order: 36, searchText:"이미지36"},
                { id:"dark37", name:"이미지37", path:"summoners_war_images/dark/37.png", order: 37, searchText:"이미지37"},
                { id:"dark38", name:"이미지38", path:"summoners_war_images/dark/38.png", order: 38, searchText:"이미지38"},
                { id:"dark39", name:"이미지39", path:"summoners_war_images/dark/39.png", order: 39, searchText:"이미지39"},
                { id:"dark40", name:"이미지40", path:"summoners_war_images/dark/40.png", order: 40, searchText:"이미지40"},
                { id:"dark41", name:"이미지41", path:"summoners_war_images/dark/41.png", order: 41, searchText:"이미지41"},
                { id:"dark42", name:"이미지42", path:"summoners_war_images/dark/42.png", order: 42, searchText:"이미지42"},
                { id:"dark43", name:"이미지43", path:"summoners_war_images/dark/43.png", order: 43, searchText:"이미지43"},
                { id:"dark44", name:"이미지44", path:"summoners_war_images/dark/44.png", order: 44, searchText:"이미지44"},
                { id:"dark45", name:"이미지45", path:"summoners_war_images/dark/45.png", order: 45, searchText:"이미지45"},
                { id:"dark46", name:"이미지46", path:"summoners_war_images/dark/46.png", order: 46, searchText:"이미지46"},
                { id:"dark47", name:"이미지47", path:"summoners_war_images/dark/47.png", order: 47, searchText:"이미지47"},
                { id:"dark48", name:"이미지48", path:"summoners_war_images/dark/48.png", order: 48, searchText:"이미지48"},
                { id:"dark49", name:"이미지49", path:"summoners_war_images/dark/49.png", order: 49, searchText:"이미지49"},
                { id:"dark50", name:"이미지50", path:"summoners_war_images/dark/50.png", order: 50, searchText:"이미지50"},
                { id:"dark51", name:"이미지51", path:"summoners_war_images/dark/51.png", order: 51, searchText:"이미지51"},
                { id:"dark52", name:"이미지52", path:"summoners_war_images/dark/52.png", order: 52, searchText:"이미지52"},
                { id:"dark53", name:"이미지53", path:"summoners_war_images/dark/53.png", order: 53, searchText:"이미지53"},
                { id:"dark54", name:"이미지54", path:"summoners_war_images/dark/54.png", order: 54, searchText:"이미지54"},
                { id:"dark55", name:"이미지55", path:"summoners_war_images/dark/55.png", order: 55, searchText:"이미지55"},
                { id:"dark56", name:"이미지56", path:"summoners_war_images/dark/56.png", order: 56, searchText:"이미지56"},
                { id:"dark57", name:"이미지57", path:"summoners_war_images/dark/57.png", order: 57, searchText:"이미지57"},
                { id:"dark58", name:"이미지58", path:"summoners_war_images/dark/58.png", order: 58, searchText:"이미지58"},
                { id:"dark59", name:"이미지59", path:"summoners_war_images/dark/59.png", order: 59, searchText:"이미지59"},
                { id:"dark60", name:"이미지60", path:"summoners_war_images/dark/60.png", order: 60, searchText:"이미지60"},
                { id:"dark61", name:"이미지61", path:"summoners_war_images/dark/61.png", order: 61, searchText:"이미지61"},
                { id:"dark62", name:"이미지62", path:"summoners_war_images/dark/62.png", order: 62, searchText:"이미지62"},
                { id:"dark63", name:"이미지63", path:"summoners_war_images/dark/63.png", order: 63, searchText:"이미지63"},
                { id:"dark64", name:"이미지64", path:"summoners_war_images/dark/64.png", order: 64, searchText:"이미지64"},
                { id:"dark65", name:"이미지65", path:"summoners_war_images/dark/65.png", order: 65, searchText:"이미지65"},
                { id:"dark66", name:"이미지66", path:"summoners_war_images/dark/66.png", order: 66, searchText:"이미지66"},
                { id:"dark67", name:"이미지67", path:"summoners_war_images/dark/67.png", order: 67, searchText:"이미지67"},
                { id:"dark68", name:"이미지68", path:"summoners_war_images/dark/68.png", order: 68, searchText:"이미지68"},
                { id:"dark69", name:"이미지69", path:"summoners_war_images/dark/69.png", order: 69, searchText:"이미지69"},
                { id:"dark70", name:"이미지70", path:"summoners_war_images/dark/70.png", order: 70, searchText:"이미지70"},
                { id:"dark71", name:"이미지71", path:"summoners_war_images/dark/71.png", order: 71, searchText:"이미지71"},
                { id:"dark72", name:"이미지72", path:"summoners_war_images/dark/72.png", order: 72, searchText:"이미지72"},
                { id:"dark73", name:"이미지73", path:"summoners_war_images/dark/73.png", order: 73, searchText:"이미지73"},
                { id:"dark74", name:"이미지74", path:"summoners_war_images/dark/74.png", order: 74, searchText:"이미지74"},
                { id:"dark75", name:"이미지75", path:"summoners_war_images/dark/75.png", order: 75, searchText:"이미지75"},
                { id:"dark76", name:"이미지76", path:"summoners_war_images/dark/76.png", order: 76, searchText:"이미지76"},
                { id:"dark77", name:"이미지77", path:"summoners_war_images/dark/77.png", order: 77, searchText:"이미지77"},
                { id:"dark78", name:"이미지78", path:"summoners_war_images/dark/78.png", order: 78, searchText:"이미지78"},
                { id:"dark79", name:"이미지79", path:"summoners_war_images/dark/79.png", order: 79, searchText:"이미지79"},
                { id:"dark80", name:"이미지80", path:"summoners_war_images/dark/80.png", order: 80, searchText:"이미지80"},
                { id:"dark81", name:"이미지81", path:"summoners_war_images/dark/81.png", order: 81, searchText:"이미지81"},
                { id:"dark82", name:"이미지82", path:"summoners_war_images/dark/82.png", order: 82, searchText:"이미지82"},
                { id:"dark83", name:"이미지83", path:"summoners_war_images/dark/83.png", order: 83, searchText:"이미지83"},
                { id:"dark84", name:"이미지84", path:"summoners_war_images/dark/84.png", order: 84, searchText:"이미지84"},
                { id:"dark85", name:"이미지85", path:"summoners_war_images/dark/85.png", order: 85, searchText:"이미지85"},
                { id:"dark86", name:"이미지86", path:"summoners_war_images/dark/86.png", order: 86, searchText:"이미지86"},
                { id:"dark87", name:"이미지87", path:"summoners_war_images/dark/87.png", order: 87, searchText:"이미지87"},
                { id:"dark88", name:"이미지88", path:"summoners_war_images/dark/88.png", order: 88, searchText:"이미지88"},
                { id:"dark89", name:"이미지89", path:"summoners_war_images/dark/89.png", order: 89, searchText:"이미지89"},
                { id:"dark90", name:"이미지90", path:"summoners_war_images/dark/90.png", order: 90, searchText:"이미지90"},
                { id:"dark91", name:"이미지91", path:"summoners_war_images/dark/91.png", order: 91, searchText:"이미지91"},
                { id:"dark92", name:"이미지92", path:"summoners_war_images/dark/92.png", order: 92, searchText:"이미지92"},
                { id:"dark93", name:"이미지93", path:"summoners_war_images/dark/93.png", order: 93, searchText:"이미지93"},
                { id:"dark94", name:"이미지94", path:"summoners_war_images/dark/94.png", order: 94, searchText:"이미지94"},
                { id:"dark95", name:"이미지95", path:"summoners_war_images/dark/95.png", order: 95, searchText:"이미지95"},
                { id:"dark96", name:"이미지96", path:"summoners_war_images/dark/96.png", order: 96, searchText:"이미지96"},
                { id:"dark97", name:"이미지97", path:"summoners_war_images/dark/97.png", order: 97, searchText:"이미지97"},
                { id:"dark98", name:"이미지98", path:"summoners_war_images/dark/98.png", order: 98, searchText:"이미지98"},
                { id:"dark99", name:"이미지99", path:"summoners_war_images/dark/99.png", order: 99, searchText:"이미지99"},
                { id:"dark100", name:"이미지100", path:"summoners_war_images/dark/100.png", order: 100, searchText:"이미지100"},
                { id:"dark101", name:"이미지101", path:"summoners_war_images/dark/101.png", order: 101, searchText:"이미지101"},
                { id:"dark102", name:"이미지102", path:"summoners_war_images/dark/102.png", order: 102, searchText:"이미지102"},
                { id:"dark103", name:"이미지103", path:"summoners_war_images/dark/103.png", order: 103, searchText:"이미지103"},
                { id:"dark104", name:"이미지104", path:"summoners_war_images/dark/104.png", order: 104, searchText:"이미지104"},
                { id:"dark105", name:"이미지105", path:"summoners_war_images/dark/105.png", order: 105, searchText:"이미지105"},
                { id:"dark106", name:"이미지106", path:"summoners_war_images/dark/106.png", order: 106, searchText:"이미지106"},
                { id:"dark107", name:"이미지107", path:"summoners_war_images/dark/107.png", order: 107, searchText:"이미지107"},
                { id:"dark108", name:"이미지108", path:"summoners_war_images/dark/108.png", order: 108, searchText:"이미지108"},
                { id:"dark109", name:"이미지109", path:"summoners_war_images/dark/109.png", order: 109, searchText:"이미지109"},
                { id:"dark110", name:"이미지110", path:"summoners_war_images/dark/110.png", order: 110, searchText:"이미지110"},
                { id:"dark111", name:"이미지111", path:"summoners_war_images/dark/111.png", order: 111, searchText:"이미지111"},
                { id:"dark112", name:"이미지112", path:"summoners_war_images/dark/112.png", order: 112, searchText:"이미지112"},
                { id:"dark113", name:"이미지113", path:"summoners_war_images/dark/113.png", order: 113, searchText:"이미지113"},
                { id:"dark114", name:"이미지114", path:"summoners_war_images/dark/114.png", order: 114, searchText:"이미지114"},
                { id:"dark115", name:"이미지115", path:"summoners_war_images/dark/115.png", order: 115, searchText:"이미지115"},
                { id:"dark116", name:"이미지116", path:"summoners_war_images/dark/116.png", order: 116, searchText:"이미지116"},
                { id:"dark117", name:"이미지117", path:"summoners_war_images/dark/117.png", order: 117, searchText:"이미지117"},
                { id:"dark118", name:"이미지118", path:"summoners_war_images/dark/118.png", order: 118, searchText:"이미지118"},
                { id:"dark119", name:"이미지119", path:"summoners_war_images/dark/119.png", order: 119, searchText:"이미지119"},
                { id:"dark120", name:"이미지120", path:"summoners_war_images/dark/120.png", order: 120, searchText:"이미지120"},
                { id:"dark121", name:"이미지121", path:"summoners_war_images/dark/121.png", order: 121, searchText:"이미지121"},
                { id:"dark122", name:"이미지122", path:"summoners_war_images/dark/122.png", order: 122, searchText:"이미지122"},
                { id:"dark123", name:"이미지123", path:"summoners_war_images/dark/123.png", order: 123, searchText:"이미지123"},
                { id:"dark124", name:"이미지124", path:"summoners_war_images/dark/124.png", order: 124, searchText:"이미지124"},
                { id:"dark125", name:"이미지125", path:"summoners_war_images/dark/125.png", order: 125, searchText:"이미지125"},
                { id:"dark126", name:"이미지126", path:"summoners_war_images/dark/126.png", order: 126, searchText:"이미지126"},
                { id:"dark127", name:"이미지127", path:"summoners_war_images/dark/127.png", order: 127, searchText:"이미지127"},
                { id:"dark128", name:"이미지128", path:"summoners_war_images/dark/128.png", order: 128, searchText:"이미지128"},
                { id:"dark129", name:"이미지129", path:"summoners_war_images/dark/129.png", order: 129, searchText:"이미지129"},
                { id:"dark130", name:"이미지130", path:"summoners_war_images/dark/130.png", order: 130, searchText:"이미지130"},
                { id:"dark131", name:"이미지131", path:"summoners_war_images/dark/131.png", order: 131, searchText:"이미지131"},
                { id:"dark132", name:"이미지132", path:"summoners_war_images/dark/132.png", order: 132, searchText:"이미지132"},
                { id:"dark133", name:"이미지133", path:"summoners_war_images/dark/133.png", order: 133, searchText:"이미지133"},
                { id:"dark134", name:"이미지134", path:"summoners_war_images/dark/134.png", order: 134, searchText:"이미지134"},
                { id:"dark135", name:"이미지135", path:"summoners_war_images/dark/135.png", order: 135, searchText:"이미지135"},
                { id:"dark136", name:"이미지136", path:"summoners_war_images/dark/136.png", order: 136, searchText:"이미지136"},
                { id:"dark137", name:"이미지137", path:"summoners_war_images/dark/137.png", order: 137, searchText:"이미지137"},
                { id:"dark138", name:"이미지138", path:"summoners_war_images/dark/138.png", order: 138, searchText:"이미지138"},
                { id:"dark139", name:"이미지139", path:"summoners_war_images/dark/139.png", order: 139, searchText:"이미지139"},
                { id:"dark140", name:"이미지140", path:"summoners_war_images/dark/140.png", order: 140, searchText:"이미지140"},
                { id:"dark141", name:"이미지141", path:"summoners_war_images/dark/141.png", order: 141, searchText:"이미지141"},
                { id:"dark142", name:"이미지142", path:"summoners_war_images/dark/142.png", order: 142, searchText:"이미지142"},
                { id:"dark143", name:"이미지143", path:"summoners_war_images/dark/143.png", order: 143, searchText:"이미지143"},
                { id:"dark144", name:"이미지144", path:"summoners_war_images/dark/144.png", order: 144, searchText:"이미지144"},
                { id:"dark145", name:"이미지145", path:"summoners_war_images/dark/145.png", order: 145, searchText:"이미지145"},
                { id:"dark146", name:"이미지146", path:"summoners_war_images/dark/146.png", order: 146, searchText:"이미지146"},
                { id:"dark147", name:"이미지147", path:"summoners_war_images/dark/147.png", order: 147, searchText:"이미지147"},
                { id:"dark148", name:"이미지148", path:"summoners_war_images/dark/148.png", order: 148, searchText:"이미지148"},
                { id:"dark149", name:"이미지149", path:"summoners_war_images/dark/149.png", order: 149, searchText:"이미지149"},
                { id:"dark150", name:"이미지150", path:"summoners_war_images/dark/150.png", order: 150, searchText:"이미지150"},
                { id:"dark151", name:"이미지151", path:"summoners_war_images/dark/151.png", order: 151, searchText:"이미지151"},
                { id:"dark152", name:"이미지152", path:"summoners_war_images/dark/152.png", order: 152, searchText:"이미지152"},
                { id:"dark153", name:"이미지153", path:"summoners_war_images/dark/153.png", order: 153, searchText:"이미지153"},
                { id:"dark154", name:"이미지154", path:"summoners_war_images/dark/154.png", order: 154, searchText:"이미지154"},
                { id:"dark155", name:"이미지155", path:"summoners_war_images/dark/155.png", order: 155, searchText:"이미지155"},
                { id:"dark156", name:"이미지156", path:"summoners_war_images/dark/156.png", order: 156, searchText:"이미지156"},
                { id:"dark157", name:"이미지157", path:"summoners_war_images/dark/157.png", order: 157, searchText:"이미지157"},
                { id:"dark158", name:"이미지158", path:"summoners_war_images/dark/158.png", order: 158, searchText:"이미지158"},
                { id:"dark159", name:"이미지159", path:"summoners_war_images/dark/159.png", order: 159, searchText:"이미지159"},
                { id:"dark160", name:"이미지160", path:"summoners_war_images/dark/160.png", order: 160, searchText:"이미지160"}
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