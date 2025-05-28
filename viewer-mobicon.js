// viewer 전용 몬스터 아이콘 기능
(function() {
    // 몬스터 아이콘 데이터 구조 (dropbox.js에서 가져옴)
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
                { id:"fire32", name:"불데빌메이든", path:"summoners_war_images/fire/32.png", order: 32, searchText:"불데빌메이든"},
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
                { id:"water17", name:"물젠이츠", path:"summoners_war_images/water/17.png", order: 17, searchText:"물젠이츠"},
                { id:"water18", name:"물이노스케", path:"summoners_war_images/water/18.png", order: 18, searchText:"물이노스케"},
                { id:"water19", name:"물네즈코", path:"summoners_war_images/water/19.png", order: 19, searchText:"물네즈코"},
                { id:"water20", name:"물비틀가디언", path:"summoners_war_images/water/20.png", order: 20, searchText:"물비틀가디언"},
                { id:"water21", name:"물사령", path:"summoners_war_images/water/21.png", order: 21, searchText:"물사령"},
                { id:"water22", name:"물노바라", path:"summoners_war_images/water/22.png", order: 22, searchText:"물노바라"},
                { id:"water23", name:"물이타도리", path:"summoners_war_images/water/23.png", order: 23, searchText:"물이타도리"},
                { id:"water24", name:"물고죠", path:"summoners_war_images/water/24.png", order: 24, searchText:"물고죠"},
                { id:"water25", name:"물드라칸", path:"summoners_war_images/water/25.png", order: 25, searchText:"물드라칸"},
                { id:"water26", name:"물해커", path:"summoners_war_images/water/26.png", order: 26, searchText:"물해커"},
                { id:"water27", name:"물트리스", path:"summoners_war_images/water/27.png", order: 27, searchText:"물트리스"},
                { id:"water28", name:"물시리", path:"summoners_war_images/water/28.png", order: 28, searchText:"물시리"},
                { id:"water29", name:"물게롤트", path:"summoners_war_images/water/29.png", order: 29, searchText:"물게롤트"},
                { id:"water30", name:"물쌍천", path:"summoners_war_images/water/30.png", order: 30, searchText:"물쌍천"},
                { id:"water31", name:"물깨비", path:"summoners_war_images/water/31.png", order: 31, searchText:"물깨비"},
                { id:"water32", name:"물데빌메이든", path:"summoners_war_images/water/32.png", order: 32, searchText:"물데빌메이든"},
                { id:"water33", name:"물인드라", path:"summoners_war_images/water/33.png", order: 33, searchText:"물인드라"},
                { id:"water34", name:"물용병", path:"summoners_war_images/water/34.png", order: 34, searchText:"물용병"},
                { id:"water35", name:"물강철", path:"summoners_war_images/water/35.png", order: 35, searchText:"물강철"},
                { id:"water36", name:"물인형", path:"summoners_war_images/water/36.png", order: 36, searchText:"물인형"},
                { id:"water37", name:"물카롱", path:"summoners_war_images/water/37.png", order: 37, searchText:"물카롱"},
                { id:"water38", name:"물푸딩", path:"summoners_war_images/water/38.png", order: 38, searchText:"물푸딩"},
                { id:"water39", name:"물배틀", path:"summoners_war_images/water/39.png", order: 39, searchText:"물배틀"},
                { id:"water40", name:"물그림자", path:"summoners_war_images/water/40.png", order: 40, searchText:"물그림자"},
                { id:"water41", name:"물웨폰", path:"summoners_war_images/water/41.png", order: 41, searchText:"물웨폰"},
                { id:"water42", name:"물토템", path:"summoners_war_images/water/42.png", order: 42, searchText:"물토템"},
                { id:"water43", name:"물서퍼", path:"summoners_war_images/water/43.png", order: 43, searchText:"물서퍼"},
                { id:"water44", name:"물마도", path:"summoners_war_images/water/44.png", order: 44, searchText:"물마도"},
                { id:"water45", name:"물음양", path:"summoners_war_images/water/45.png", order: 45, searchText:"물음양"},
                { id:"water46", name:"물음양", path:"summoners_war_images/water/46.png", order: 46, searchText:"물슬레"},
                { id:"water47", name:"물슬레", path:"summoners_war_images/water/47.png", order: 47, searchText:"물스트"},
                { id:"water48", name:"물화백", path:"summoners_war_images/water/48.png", order: 48, searchText:"물화백"},
                { id:"water49", name:"물비라", path:"summoners_war_images/water/49.png", order: 49, searchText:"물비라"},
                { id:"water50", name:"물데몬", path:"summoners_war_images/water/50.png", order: 50, searchText:"물데몬"},
                { id:"water51", name:"물뇌제", path:"summoners_war_images/water/51.png", order: 51, searchText:"물뇌제"},
                { id:"water52", name:"물드루", path:"summoners_war_images/water/52.png", order: 52, searchText:"물드루"},
                { id:"water53", name:"물팔라", path:"summoners_war_images/water/53.png", order: 53, searchText:"믈팔라"},
                { id:"water54", name:"물유니", path:"summoners_war_images/water/54.png", order: 54, searchText:"믈유니"},
                { id:"water55", name:"물웅묘", path:"summoners_war_images/water/55.png", order: 55, searchText:"물웅묘"},
                { id:"water56", name:"물요정왕", path:"summoners_war_images/water/56.png", order: 56, searchText:"물요정왕"},
                { id:"water57", name:"물막", path:"summoners_war_images/water/57.png", order: 57, searchText:"물사막"},
                { id:"water58", name:"물해왕", path:"summoners_war_images/water/58.png", order: 58, searchText:"물해왕"},
                { id:"water59", name:"물이프", path:"summoners_war_images/water/59.png", order: 59, searchText:"물이프"},
                { id:"water60", name:"물극지", path:"summoners_war_images/water/60.png", order: 60, searchText:"물극지"},
                { id:"water61", name:"물선인", path:"summoners_war_images/water/61.png", order: 61, searchText:"물선인"},
                { id:"water62", name:"물헬레", path:"summoners_war_images/water/62.png", order: 62, searchText:"물헬레"},
                { id:"water63", name:"물신수", path:"summoners_war_images/water/63.png", order: 63, searchText:"물신수"},
                { id:"water64", name:"물아크", path:"summoners_war_images/water/64.png", order: 64, searchText:"물아크"},
                { id:"water65", name:"물오공", path:"summoners_war_images/water/65.png", order: 65, searchText:"물오공"},
                { id:"water66", name:"물드나", path:"summoners_war_images/water/66.png", order: 66, searchText:"물드나"},
                { id:"water67", name:"물오컬", path:"summoners_war_images/water/67.png", order: 67, searchText:"물오컬"},
                { id:"water68", name:"물라클", path:"summoners_war_images/water/68.png", order: 68, searchText:"물라클"},
                { id:"water69", name:"물키메라", path:"summoners_war_images/water/69.png", order: 69, searchText:"물키메라"},
                { id:"water70", name:"물피닉", path:"summoners_war_images/water/70.png", order: 70, searchText:"물피닉"},
                { id:"water71", name:"물드래곤", path:"summoners_war_images/water/71.png", order: 71, searchText:"물드래곤"},
                { id:"water72", name:"물발키리", path:"summoners_war_images/water/72.png", order: 72, searchText:"물발키리"},
                { id:"water73", name:"물탄지로", path:"summoners_war_images/water/73.png", order: 73, searchText:"물탄지로"},
                { id:"water74", name:"물묘지기", path:"summoners_war_images/water/74.png", order: 74, searchText:"물묘지기"},
                { id:"water75", name:"물메구미", path:"summoners_war_images/water/75.png", order: 75, searchText:"물메구미"},
                { id:"water76", name:"물사이보그", path:"summoners_war_images/water/76.png", order: 76, searchText:"물사이보그"},
                { id:"water77", name:"물트리스", path:"summoners_war_images/water/77.png", order: 77, searchText:"물트리스"},
                { id:"water78", name:"물삽살", path:"summoners_war_images/water/78.png", order: 78, searchText:"물삽살"},
                { id:"water79", name:"물아수라", path:"summoners_war_images/water/79.png", order: 79, searchText:"물아수라"},
                { id:"water80", name:"물카산", path:"summoners_war_images/water/80.png", order: 80, searchText:"물카산"},
                { id:"water81", name:"물사전", path:"summoners_war_images/water/81.png", order: 81, searchText:"물사전"},
                { id:"water82", name:"물초코", path:"summoners_war_images/water/82.png", order: 82, searchText:"물초코"},
                { id:"water83", name:"물홍차", path:"summoners_war_images/water/83.png", order: 83, searchText:"물홍차"},
                { id:"water84", name:"물꿈냥이", path:"summoners_war_images/water/84.png", order: 84, searchText:"물꿈냥이"},
                { id:"water85", name:"물망치", path:"summoners_war_images/water/85.png", order: 85, searchText:"물망치"},
                { id:"water86", name:"물로보", path:"summoners_war_images/water/86.png", order: 86, searchText:"물로보"},
                { id:"water87", name:"물요괴", path:"summoners_war_images/water/87.png", order: 87, searchText:"물요괴"},
                { id:"water88", name:"물춘리", path:"summoners_war_images/water/88.png", order: 88, searchText:"물춘리"},
                { id:"water89", name:"물포마", path:"summoners_war_images/water/89.png", order: 89, searchText:"물포마"},
                { id:"water90", name:"물거문고", path:"summoners_war_images/water/90.png", order: 90, searchText:"물거문고"},
                { id:"water91", name:"물가고일", path:"summoners_war_images/water/91.png", order: 91, searchText:"물가고일"},
                { id:"water92", name:"물캐논", path:"summoners_war_images/water/92.png", order: 92, searchText:"물캐논"},
                { id:"water93", name:"물스나", path:"summoners_war_images/water/93.png", order: 93, searchText:"물스나"},
                { id:"water94", name:"물드라이어드", path:"summoners_war_images/water/94.png", order: 94, searchText:"물드라이어드"},
                { id:"water95", name:"물부메랑", path:"summoners_war_images/water/95.png", order: 95, searchText:"물부메랑"},
                { id:"water96", name:"물차크람", path:"summoners_war_images/water/96.png", order: 96, searchText:"물차크람"},
                { id:"water97", name:"물하프", path:"summoners_war_images/water/97.png", order: 97, searchText:"물하프"},
                { id:"water98", name:"물주사위", path:"summoners_war_images/water/98.png", order: 98, searchText:"물주사위"},
                { id:"water99", name:"물호박", path:"summoners_war_images/water/99.png", order: 99, searchText:"물호박"},
                { id:"water100", name:"물호루스", path:"summoners_war_images/water/100.png", order: 100, searchText:"물호루스"},
                { id:"water101", name:"물아누", path:"summoners_war_images/water/101.png", order: 101, searchText:"물아누"},
                { id:"water102", name:"물에전", path:"summoners_war_images/water/102.png", order: 102, searchText:"물에전"},
                { id:"water103", name:"물네파", path:"summoners_war_images/water/103.png", order: 103, searchText:"물네파"},
                { id:"water104", name:"물암살", path:"summoners_war_images/water/104.png", order: 104, searchText:"물암살"},
                { id:"water105", name:"물마검", path:"summoners_war_images/water/105.png", order: 105, searchText:"물마검"},
                { id:"water106", name:"물머메", path:"summoners_war_images/water/106.png", order: 106, searchText:"물머메"},
                { id:"water107", name:"물해적", path:"summoners_war_images/water/107.png", order: 107, searchText:"물해적"},
                { id:"water108", name:"물야만", path:"summoners_war_images/water/108.png", order: 108, searchText:"물야만"},
                { id:"water109", name:"물도술", path:"summoners_war_images/water/109.png", order: 109, searchText:"물도술"},
                { id:"water110", name:"물무희", path:"summoners_war_images/water/110.png", order: 110, searchText:"물무희"},
                { id:"water111", name:"물코볼", path:"summoners_war_images/water/111.png", order: 111, searchText:"물코볼"},
                { id:"water112", name:"물브라우니", path:"summoners_war_images/water/112.png", order: 112, searchText:"물브라우니"},
                { id:"water113", name:"물쿵푸", path:"summoners_war_images/water/113.png", order: 113, searchText:"물쿵푸"},
                { id:"water114", name:"물사무라이", path:"summoners_war_images/water/114.png", order: 114, searchText:"물사무라이"},
                { id:"water115", name:"물리치", path:"summoners_war_images/water/115.png", order: 115, searchText:"물리치"},
                { id:"water116", name:"물데나", path:"summoners_war_images/water/116.png", order: 116, searchText:"물데나"},
                { id:"water117", name:"물나찰", path:"summoners_war_images/water/117.png", order: 117, searchText:"물나찰"},
                { id:"water118", name:"물뱀파", path:"summoners_war_images/water/118.png", order: 118, searchText:"물뱀파"},
                { id:"water119", name:"물팬턴", path:"summoners_war_images/water/119.png", order: 119, searchText:"물팬텀"},
                { id:"water120", name:"물피에", path:"summoners_war_images/water/120.png", order: 120, searchText:"물피에"},
                { id:"water121", name:"물닌자", path:"summoners_war_images/water/121.png", order: 121, searchText:"물닌자"},
                { id:"water122", name:"물조커", path:"summoners_war_images/water/122.png", order: 122, searchText:"물조커"},
                { id:"water123", name:"물서큐", path:"summoners_war_images/water/123.png", order: 123, searchText:"물서큐"},
                { id:"water124", name:"물실피드", path:"summoners_war_images/water/124.png", order: 124, searchText:"물실피드"},
                { id:"water125", name:"물실프", path:"summoners_war_images/water/125.png", order: 125, searchText:"물실프"},
                { id:"water126", name:"물운디네", path:"summoners_war_images/water/126.png", order: 126, searchText:"물운디네"},
                { id:"water127", name:"물구미", path:"summoners_war_images/water/127.png", order: 127, searchText:"물구미"},
                { id:"water128", name:"물광전사", path:"summoners_war_images/water/128.png", order: 128, searchText:"물광전사"},
                { id:"water129", name:"물하그", path:"summoners_war_images/water/129.png", order: 129, searchText:"물하그"},
                { id:"water130", name:"물엘순", path:"summoners_war_images/water/130.png", order: 130, searchText:"물엘순"},
                { id:"water131", name:"물미라", path:"summoners_war_images/water/131.png", order: 131, searchText:"물미라"},
                { id:"water132", name:"물무도가", path:"summoners_war_images/water/132.png", order: 132, searchText:"물무도가"},
                { id:"water133", name:"물전투상어", path:"summoners_war_images/water/133.png", order: 133, searchText:"물전투상어"},
                { id:"water134", name:"물카우", path:"summoners_war_images/water/134.png", order: 134, searchText:"물카우"},
                { id:"water135", name:"물매머드", path:"summoners_war_images/water/135.png", order: 135, searchText:"물매머드"},
                { id:"water136", name:"물펭귄", path:"summoners_war_images/water/136.png", order: 136, searchText:"물펭귄"},
                { id:"water137", name:"물맹수", path:"summoners_war_images/water/137.png", order: 137, searchText:"물맹수"},
                { id:"water138", name:"물리자드맨", path:"summoners_war_images/water/138.png", order: 138, searchText:"물리자드맨"},
                { id:"water139", name:"물미노", path:"summoners_war_images/water/139.png", order: 139, searchText:"물미노"},
                { id:"water140", name:"물드렁큰", path:"summoners_war_images/water/140.png", order: 140, searchText:"물드렁큰"},
                { id:"water141", name:"물임챔", path:"summoners_war_images/water/141.png", order: 141, searchText:"물임챔"},
                { id:"water142", name:"물바운티", path:"summoners_war_images/water/142.png", order: 142, searchText:"물바운티"},
                { id:"water143", name:"물마궁", path:"summoners_war_images/water/143.png", order: 143, searchText:"물마궁"},
                { id:"water144", name:"물사제", path:"summoners_war_images/water/144.png", order: 144, searchText:"물사제"},
                { id:"water145", name:"물아마존", path:"summoners_war_images/water/145.png", order: 145, searchText:"물아마존"},
                { id:"water146", name:"물베어맨", path:"summoners_war_images/water/146.png", order: 146, searchText:"물베어맨"},
                { id:"water147", name:"물인페", path:"summoners_war_images/water/147.png", order: 147, searchText:"물인페"},
                { id:"water148", name:"물골렘", path:"summoners_war_images/water/148.png", order: 148, searchText:"물골렘"},
                { id:"water149", name:"물서펀트", path:"summoners_war_images/water/149.png", order: 149, searchText:"물서펀트"},
                { id:"water150", name:"물하피", path:"summoners_war_images/water/150.png", order: 150, searchText:"물하피"},
                { id:"water151", name:"물바이킹", path:"summoners_war_images/water/151.png", order: 151, searchText:"물바이킹"},
                { id:"water152", name:"물샐러맨더", path:"summoners_war_images/water/152.png", order: 152, searchText:"물샐러맨더"},
                { id:"water153", name:"물가루다", path:"summoners_war_images/water/153.png", order: 153, searchText:"물가루다"},
                { id:"water154", name:"물엘리멘탈", path:"summoners_war_images/water/154.png", order: 154, searchText:"물엘리멘탈"},
                { id:"water155", name:"물헬하", path:"summoners_war_images/water/155.png", order: 155, searchText:"물헬하"},
                { id:"water156", name:"물예티", path:"summoners_war_images/water/156.png", order: 156, searchText:"물예티"},
                { id:"water157", name:"물임프", path:"summoners_war_images/water/157.png", order: 157, searchText:"물임프"},
                { id:"water158", name:"물하급엘리멘탈", path:"summoners_war_images/water/158.png", order: 158, searchText:"물하급엘리멘탈"}
            ]
        },
        wind: {
            name: "바람속성",
            searchText: "바람속성",
            icons: [
                { id:"wind1", name:"풍프랑", path:"summoners_war_images/wind/1.png", order: 1, searchText:"풍프랑"},
                { id:"wind2", name:"풍리빙", path:"summoners_war_images/wind/2.png", order: 2, searchText:"풍리빙"},
                { id:"wind3", name:"풍그림", path:"summoners_war_images/wind/3.png", order: 3, searchText:"풍그림"},
                { id:"wind4", name:"풍미스틱위치", path:"summoners_war_images/wind/4.png", order: 4, searchText:"풍미스틱위치"},
                { id:"wind5", name:"풍방랑", path:"summoners_war_images/wind/5.png", order: 5, searchText:"풍방랑"},
                { id:"wind6", name:"풍마샬", path:"summoners_war_images/wind/6.png", order: 6, searchText:"풍마샬"},
                { id:"wind7", name:"풍늑인", path:"summoners_war_images/wind/7.png", order: 7, searchText:"풍늑인"},
                { id:"wind8", name:"풍호울", path:"summoners_war_images/wind/8.png", order: 8, searchText:"풍호울"},
                { id:"wind9", name:"풍하르퓨", path:"summoners_war_images/wind/9.png", order: 9, searchText:"풍하르퓨"},
                { id:"wind10", name:"풍하엘", path:"summoners_war_images/wind/10.png", order: 10, searchText:"풍하엘"},
                { id:"wind11", name:"풍그리폰", path:"summoners_war_images/wind/11.png", order: 11, searchText:"풍그리폰"},
                { id:"wind12", name:"풍이누", path:"summoners_war_images/wind/12.png", order: 12, searchText:"풍이누"},
                { id:"wind13", name:"풍워베어", path:"summoners_war_images/wind/13.png", order: 13, searchText:"풍워베어"},
                { id:"wind14", name:"풍픽시", path:"summoners_war_images/wind/14.png", order: 14, searchText:"풍픽시"},
                { id:"wind15", name:"풍페어리", path:"summoners_war_images/wind/15.png", order: 15, searchText:"풍페어리"},
                { id:"wind16", name:"풍호문", path:"summoners_war_images/wind/16.png", order: 16, searchText:"풍호문"},
                { id:"wind17", name:"풍젠이츠", path:"summoners_war_images/wind/17.png", order: 17, searchText:"풍젠이츠"},
                { id:"wind18", name:"풍탄지로", path:"summoners_war_images/wind/18.png", order: 18, searchText:"풍탄지로"},
                { id:"wind19", name:"풍교메이", path:"summoners_war_images/wind/19.png", order: 19, searchText:"풍교메이"},
                { id:"wind20", name:"풍비틀가디언", path:"summoners_war_images/wind/20.png", order: 20, searchText:"풍비틀가디언"},
                { id:"wind21", name:"풍사령", path:"summoners_war_images/wind/21.png", order: 21, searchText:"풍사령"},
                { id:"wind22", name:"풍노바라", path:"summoners_war_images/wind/22.png", order: 22, searchText:"풍노바라"},
                { id:"wind23", name:"풍메구미", path:"summoners_war_images/wind/23.png", order: 23, searchText:"풍메구미"},
                { id:"wind24", name:"풍고죠", path:"summoners_war_images/wind/24.png", order: 24, searchText:"풍고죠"},
                { id:"wind25", name:"풍드라칸", path:"summoners_war_images/wind/25.png", order: 25, searchText:"풍드라칸"},
                { id:"wind26", name:"풍해커", path:"summoners_war_images/wind/26.png", order: 26, searchText:"풍해커"},
                { id:"wind27", name:"풍시리", path:"summoners_war_images/wind/27.png", order: 27, searchText:"풍시리"},
                { id:"wind28", name:"풍게롤트", path:"summoners_war_images/wind/28.png", order: 28, searchText:"풍게롤트"},
                { id:"wind29", name:"풍쌍천", path:"summoners_war_images/wind/29.png", order: 29, searchText:"풍쌍천"},
                { id:"wind30", name:"풍깨비", path:"summoners_war_images/wind/30.png", order: 30, searchText:"풍깨비"},
                { id:"wind31", name:"풍데빌메이든", path:"summoners_war_images/wind/31.png", order: 31, searchText:"풍데빌메이든"},
                { id:"wind32", name:"풍인드라", path:"summoners_war_images/wind/32.png", order: 32, searchText:"풍인드라"},
                { id:"wind33", name:"풍카산", path:"summoners_war_images/wind/33.png", order: 33, searchText:"풍카산"},
                { id:"wind34", name:"풍사전", path:"summoners_war_images/wind/34.png", order: 34, searchText:"풍사전"},
                { id:"wind35", name:"풍인형", path:"summoners_war_images/wind/35.png", order: 35, searchText:"풍인형"},
                { id:"wind36", name:"풍카롱", path:"summoners_war_images/wind/36.png", order: 36, searchText:"풍카롱"},
                { id:"wind37", name:"풍푸딩", path:"summoners_war_images/wind/37.png", order: 37, searchText:"풍푸딩"},
                { id:"wind38", name:"풍용쿠", path:"summoners_war_images/wind/38.png", order: 38, searchText:"풍용쿠"},
                { id:"wind39", name:"풍배틀", path:"summoners_war_images/wind/39.png", order: 39, searchText:"풍배틀"},
                { id:"wind40", name:"풍그림자", path:"summoners_war_images/wind/40.png", order: 40, searchText:"풍그림자"},
                { id:"wind41", name:"풍웨폰", path:"summoners_war_images/wind/41.png", order: 41, searchText:"풍웨폰"},
                { id:"wind42", name:"풍토템", path:"summoners_war_images/wind/42.png", order: 42, searchText:"풍토템"},
                { id:"wind43", name:"풍서퍼", path:"summoners_war_images/wind/43.png", order: 43, searchText:"풍서퍼"},
                { id:"wind44", name:"풍마도", path:"summoners_war_images/wind/44.png", order: 44, searchText:"풍마도"},
                { id:"wind45", name:"풍음양", path:"summoners_war_images/wind/45.png", order: 45, searchText:"풍음양"},
                { id:"wind46", name:"풍슬레", path:"summoners_war_images/wind/46.png", order: 46, searchText:"풍슬레"},
                { id:"wind47", name:"풍스트", path:"summoners_war_images/wind/47.png", order: 47, searchText:"풍스트"},
                { id:"wind48", name:"풍화백", path:"summoners_war_images/wind/48.png", order: 48, searchText:"풍화백"},
                { id:"wind49", name:"풍비라", path:"summoners_war_images/wind/49.png", order: 49, searchText:"풍비라"},
                { id:"wind50", name:"풍데몬", path:"summoners_war_images/wind/50.png", order: 50, searchText:"풍데몬"},
                { id:"wind51", name:"풍캐논", path:"summoners_war_images/wind/51.png", order: 51, searchText:"풍캐논"},
                { id:"wind52", name:"풍뇌제", path:"summoners_war_images/wind/52.png", order: 52, searchText:"풍뇌제"},
                { id:"wind53", name:"풍드루", path:"summoners_war_images/wind/53.png", order: 53, searchText:"풍드루"},
                { id:"wind54", name:"풍팔라", path:"summoners_war_images/wind/54.png", order: 54, searchText:"풍팔라"},
                { id:"wind55", name:"풍유니", path:"summoners_war_images/wind/55.png", order: 55, searchText:"풍유니"},
                { id:"wind56", name:"풍웅묘", path:"summoners_war_images/wind/56.png", order: 56, searchText:"풍웅묘"},
                { id:"wind57", name:"풍요정왕", path:"summoners_war_images/wind/57.png", order: 57, searchText:"풍요정왕"},
                { id:"wind58", name:"풍사막", path:"summoners_war_images/wind/58.png", order: 58, searchText:"풍사막"},
                { id:"wind59", name:"풍해왕", path:"summoners_war_images/wind/59.png", order: 59, searchText:"풍해왕"},
                { id:"wind60", name:"풍이프", path:"summoners_war_images/wind/60.png", order: 60, searchText:"풍이프"},
                { id:"wind61", name:"풍극지", path:"summoners_war_images/wind/61.png", order: 61, searchText:"풍극지"},
                { id:"wind62", name:"풍선인", path:"summoners_war_images/wind/62.png", order: 62, searchText:"풍선인"},
                { id:"wind63", name:"풍헬레", path:"summoners_war_images/wind/63.png", order: 63, searchText:"풍헬레"},
                { id:"wind64", name:"풍신수", path:"summoners_war_images/wind/64.png", order: 64, searchText:"풍신수"},
                { id:"wind65", name:"풍아크", path:"summoners_war_images/wind/65.png", order: 65, searchText:"풍아크"},
                { id:"wind66", name:"풍오공", path:"summoners_war_images/wind/66.png", order: 66, searchText:"풍오공"},
                { id:"wind67", name:"풍드나", path:"summoners_war_images/wind/67.png", order: 67, searchText:"풍드나"},
                { id:"wind68", name:"풍오컬", path:"summoners_war_images/wind/68.png", order: 68, searchText:"풍오컬"},
                { id:"wind69", name:"풍라클", path:"summoners_war_images/wind/69.png", order: 69, searchText:"풍라클"},
                { id:"wind70", name:"풍키메라", path:"summoners_war_images/wind/70.png", order: 70, searchText:"풍키메라"},
                { id:"wind71", name:"풍피닉", path:"summoners_war_images/wind/71.png", order: 71, searchText:"풍피닉"},
                { id:"wind72", name:"풍드래곤", path:"summoners_war_images/wind/72.png", order: 72, searchText:"풍드래곤"},
                { id:"wind73", name:"풍발키리", path:"summoners_war_images/wind/73.png", order: 73, searchText:"풍발키리"},
                { id:"wind74", name:"풍이노스케", path:"summoners_war_images/wind/74.png", order: 74, searchText:"풍이노스케"},
                { id:"wind75", name:"풍네즈코", path:"summoners_war_images/wind/75.png", order: 75, searchText:"풍네즈코"},
                { id:"wind76", name:"풍묘지기", path:"summoners_war_images/wind/76.png", order: 76, searchText:"풍묘지기"},
                { id:"wind77", name:"풍이타도리", path:"summoners_war_images/wind/77.png", order: 77, searchText:"풍이타도리"},
                { id:"wind78", name:"풍사이보그", path:"summoners_war_images/wind/78.png", order: 78, searchText:"풍사이보그"},
                { id:"wind79", name:"풍트리스", path:"summoners_war_images/wind/79.png", order: 79, searchText:"풍트리스"},
                { id:"wind80", name:"풍예니퍼", path:"summoners_war_images/wind/80.png", order: 80, searchText:"풍예니퍼"},
                { id:"wind81", name:"풍삽살", path:"summoners_war_images/wind/81.png", order: 81, searchText:"풍삽살"},
                { id:"wind82", name:"풍아수라", path:"summoners_war_images/wind/82.png", order: 82, searchText:"풍아수라"},
                { id:"wind83", name:"풍용병", path:"summoners_war_images/wind/83.png", order: 83, searchText:"풍용병"},
                { id:"wind84", name:"풍강철", path:"summoners_war_images/wind/84.png", order: 84, searchText:"풍강철"},
                { id:"wind85", name:"풍초코", path:"summoners_war_images/wind/85.png", order: 85, searchText:"풍초코"},
                { id:"wind86", name:"풍홍차", path:"summoners_war_images/wind/86.png", order: 86, searchText:"풍홍차"},
                { id:"wind87", name:"풍꿈냥이", path:"summoners_war_images/wind/87.png", order: 87, searchText:"풍꿈냥이"},
                { id:"wind88", name:"풍망치", path:"summoners_war_images/wind/88.png", order: 88, searchText:"풍망치"},
                { id:"wind89", name:"풍로보", path:"summoners_war_images/wind/89.png", order: 89, searchText:"풍로보"},
                { id:"wind90", name:"풍요괴", path:"summoners_war_images/wind/90.png", order: 90, searchText:"풍요괴"},
                { id:"wind91", name:"풍춘리", path:"summoners_war_images/wind/91.png", order: 91, searchText:"풍춘리"},
                { id:"wind92", name:"풍포마", path:"summoners_war_images/wind/92.png", order: 92, searchText:"풍포마"},
                { id:"wind93", name:"풍거문고", path:"summoners_war_images/wind/93.png", order: 93, searchText:"풍거문고"},
                { id:"wind94", name:"풍가고일", path:"summoners_war_images/wind/94.png", order: 94, searchText:"풍가고일"},
                { id:"wind95", name:"풍스나", path:"summoners_war_images/wind/95.png", order: 95, searchText:"풍스나"},
                { id:"wind96", name:"풍광전사", path:"summoners_war_images/wind/96.png", order: 96, searchText:"풍광전사"},
                { id:"wind97", name:"풍드라이어드", path:"summoners_war_images/wind/97.png", order: 97, searchText:"풍드라이어드"},
                { id:"wind98", name:"풍부메랑", path:"summoners_war_images/wind/98.png", order: 98, searchText:"풍부메랑"},
                { id:"wind99", name:"풍차크람", path:"summoners_war_images/wind/99.png", order: 99, searchText:"풍차크람"},
                { id:"wind100", name:"풍하프", path:"summoners_war_images/wind/100.png", order: 100, searchText:"풍하프"},
                { id:"wind101", name:"풍주사위", path:"summoners_war_images/wind/101.png", order: 101, searchText:"풍주사위"},
                { id:"wind102", name:"풍하그", path:"summoners_war_images/wind/102.png", order: 102, searchText:"풍하그"},
                { id:"wind103", name:"풍호박", path:"summoners_war_images/wind/103.png", order: 103, searchText:"풍호박"},
                { id:"wind104", name:"풍호루스", path:"summoners_war_images/wind/104.png", order: 104, searchText:"풍호루스"},
                { id:"wind105", name:"풍아누", path:"summoners_war_images/wind/105.png", order: 105, searchText:"풍아누"},
                { id:"wind106", name:"풍에전", path:"summoners_war_images/wind/106.png", order: 106, searchText:"풍에전"},
                { id:"wind107", name:"풍네파", path:"summoners_war_images/wind/107.png", order: 107, searchText:"풍네파"},
                { id:"wind108", name:"풍암살", path:"summoners_war_images/wind/108.png", order: 108, searchText:"풍암살"},
                { id:"wind109", name:"풍마검", path:"summoners_war_images/wind/109.png", order: 109, searchText:"풍마검"},
                { id:"wind110", name:"풍머메", path:"summoners_war_images/wind/110.png", order: 110, searchText:"풍머메"},
                { id:"wind111", name:"풍해적", path:"summoners_war_images/wind/111.png", order: 111, searchText:"풍해적"},
                { id:"wind112", name:"풍야만", path:"summoners_war_images/wind/112.png", order: 112, searchText:"풍야만"},
                { id:"wind113", name:"풍도술", path:"summoners_war_images/wind/113.png", order: 113, searchText:"풍도술"},
                { id:"wind114", name:"풍무희", path:"summoners_war_images/wind/114.png", order: 114, searchText:"풍무희"},
                { id:"wind115", name:"풍코볼", path:"summoners_war_images/wind/115.png", order: 115, searchText:"풍코볼"},
                { id:"wind116", name:"풍브라우니", path:"summoners_war_images/wind/116.png", order: 116, searchText:"풍브라우니"},
                { id:"wind117", name:"풍쿵푸", path:"summoners_war_images/wind/117.png", order: 117, searchText:"풍쿵푸"},
                { id:"wind118", name:"풍사무라이", path:"summoners_war_images/wind/118.png", order: 118, searchText:"풍사무라이"},
                { id:"wind119", name:"풍리치", path:"summoners_war_images/wind/119.png", order: 119, searchText:"풍리치"},
                { id:"wind120", name:"풍데나", path:"summoners_war_images/wind/120.png", order: 120, searchText:"풍데나"},
                { id:"wind121", name:"풍나찰", path:"summoners_war_images/wind/121.png", order: 121, searchText:"풍나찰"},
                { id:"wind122", name:"풍뱀파", path:"summoners_war_images/wind/122.png", order: 122, searchText:"풍뱀파"},
                { id:"wind123", name:"풍팬텀", path:"summoners_war_images/wind/123.png", order: 123, searchText:"풍팬텀"},
                { id:"wind124", name:"풍피에", path:"summoners_war_images/wind/124.png", order: 124, searchText:"풍피에"},
                { id:"wind125", name:"풍닌자", path:"summoners_war_images/wind/125.png", order: 125, searchText:"풍닌자"},
                { id:"wind126", name:"풍조커", path:"summoners_war_images/wind/126.png", order: 126, searchText:"풍조커"},
                { id:"wind127", name:"풍서큐", path:"summoners_war_images/wind/127.png", order: 127, searchText:"풍서큐"},
                { id:"wind128", name:"풍실피드", path:"summoners_war_images/wind/128.png", order: 128, searchText:"풍실피드"},
                { id:"wind129", name:"풍실프", path:"summoners_war_images/wind/129.png", order: 129, searchText:"풍실프"},
                { id:"wind130", name:"풍운디네", path:"summoners_war_images/wind/130.png", order: 130, searchText:"풍운디네"},
                { id:"wind131", name:"풍구미", path:"summoners_war_images/wind/131.png", order: 131, searchText:"풍구미"},
                { id:"wind132", name:"풍엘순", path:"summoners_war_images/wind/132.png", order: 132, searchText:"풍엘순"},
                { id:"wind133", name:"풍미라", path:"summoners_war_images/wind/133.png", order: 133, searchText:"풍미라"},
                { id:"wind134", name:"풍무도가", path:"summoners_war_images/wind/134.png", order: 134, searchText:"풍무도가"},
                { id:"wind135", name:"풍전투상어", path:"summoners_war_images/wind/135.png", order: 135, searchText:"풍전투상어"},
                { id:"wind136", name:"풍카우", path:"summoners_war_images/wind/136.png", order: 136, searchText:"풍카우"},
                { id:"wind137", name:"풍매머드", path:"summoners_war_images/wind/137.png", order: 137, searchText:"풍매머드"},
                { id:"wind138", name:"풍펭귄", path:"summoners_war_images/wind/138.png", order: 138, searchText:"풍펭귄"},
                { id:"wind139", name:"풍맹수", path:"summoners_war_images/wind/139.png", order: 139, searchText:"풍맹수"},
                { id:"wind140", name:"풍리자드맨", path:"summoners_war_images/wind/140.png", order: 140, searchText:"풍리자드맨"},
                { id:"wind141", name:"풍미노", path:"summoners_war_images/wind/141.png", order: 141, searchText:"풍미노"},
                { id:"wind142", name:"풍드렁큰", path:"summoners_war_images/wind/142.png", order: 142, searchText:"풍드렁큰"},
                { id:"wind143", name:"풍임챔", path:"summoners_war_images/wind/143.png", order: 143, searchText:"풍임챔"},
                { id:"wind144", name:"풍바운티", path:"summoners_war_images/wind/144.png", order: 144, searchText:"풍바운티"},
                { id:"wind145", name:"풍마궁", path:"summoners_war_images/wind/145.png", order: 145, searchText:"풍마궁"},
                { id:"wind146", name:"풍사제", path:"summoners_war_images/wind/146.png", order: 146, searchText:"풍사제"},
                { id:"wind147", name:"풍아마존", path:"summoners_war_images/wind/147.png", order: 147, searchText:"풍아마존"},
                { id:"wind148", name:"풍베어맨", path:"summoners_war_images/wind/148.png", order: 148, searchText:"풍베어맨"},
                { id:"wind149", name:"풍인페", path:"summoners_war_images/wind/149.png", order: 149, searchText:"풍인페"},
                { id:"wind150", name:"풍골렘", path:"summoners_war_images/wind/150.png", order: 150, searchText:"풍골렘"},
                { id:"wind151", name:"풍서펀트", path:"summoners_war_images/wind/151.png", order: 151, searchText:"풍서펀트"},
                { id:"wind152", name:"풍하피", path:"summoners_war_images/wind/152.png", order: 152, searchText:"풍하피"},
                { id:"wind153", name:"풍바이킹", path:"summoners_war_images/wind/153.png", order: 153, searchText:"풍바이킹"},
                { id:"wind154", name:"풍샐러맨더", path:"summoners_war_images/wind/154.png", order: 154, searchText:"풍샐러맨더"},
                { id:"wind155", name:"풍가루다", path:"summoners_war_images/wind/155.png", order: 155, searchText:"풍가루다"},
                { id:"wind156", name:"풍엘리멘탈", path:"summoners_war_images/wind/156.png", order: 156, searchText:"풍엘리멘탈"},
                { id:"wind157", name:"풍헬하", path:"summoners_war_images/wind/157.png", order: 157, searchText:"풍헬하"},
                { id:"wind158", name:"풍예티", path:"summoners_war_images/wind/158.png", order: 158, searchText:"풍예티"},
                { id:"wind159", name:"풍임프", path:"summoners_war_images/wind/159.png", order: 159, searchText:"풍임프"},
                { id:"wind160", name:"풍하급엘리멘탈", path:"summoners_war_images/wind/160.png", order: 160, searchText:"풍하급엘리멘탈"}
            ]
        },
        light: {
            name: "빛속성",
            searchText: "빛속성",
            icons: [
                { id:"light1", name:"빛프랑", path:"summoners_war_images/light/1.png", order: 1, searchText:"빛프랑"},
                { id:"light2", name:"빛리빙", path:"summoners_war_images/light/2.png", order: 2, searchText:"빛리빙"},
                { id:"light3", name:"빛리퍼", path:"summoners_war_images/light/3.png", order: 3, searchText:"빛리퍼"},
                { id:"light4", name:"빛미스틱위치", path:"summoners_war_images/light/4.png", order: 4, searchText:"빛미스틱위치"},
                { id:"light5", name:"빛방랑", path:"summoners_war_images/light/5.png", order: 5, searchText:"빛방랑"},
                { id:"light6", name:"빛마샬", path:"summoners_war_images/light/6.png", order: 6, searchText:"빛마샬"},
                { id:"light7", name:"빛늑인", path:"summoners_war_images/light/7.png", order: 7, searchText:"빛늑인"},
                { id:"light8", name:"빛호울", path:"summoners_war_images/light/8.png", order: 8, searchText:"빛호울"},
                { id:"light9", name:"빛하르퓨", path:"summoners_war_images/light/9.png", order: 9, searchText:"빛하르퓨"},
                { id:"light10", name:"빛하엘", path:"summoners_war_images/light/10.png", order: 10, searchText:"빛하엘"},
                { id:"light11", name:"빛그리폰", path:"summoners_war_images/light/11.png", order: 11, searchText:"빛그리폰"},
                { id:"light12", name:"빛이누", path:"summoners_war_images/light/12.png", order: 12, searchText:"빛이누"},
                { id:"light13", name:"빛워베어", path:"summoners_war_images/light/13.png", order: 13, searchText:"빛워베어"},
                { id:"light14", name:"빛픽시", path:"summoners_war_images/light/14.png", order: 14, searchText:"빛픽시"},
                { id:"light15", name:"빛페어리", path:"summoners_war_images/light/15.png", order: 15, searchText:"빛페어리"},
                { id:"light16", name:"빛호문", path:"summoners_war_images/light/16.png", order: 16, searchText:"빛호문"},
                { id:"light17", name:"빛이노스케", path:"summoners_war_images/light/17.png", order: 17, searchText:"빛이노스케"},
                { id:"light18", name:"빛탄지로", path:"summoners_war_images/light/18.png", order: 18, searchText:"빛탄지로"},
                { id:"light19", name:"빛비틀가디언", path:"summoners_war_images/light/19.png", order: 19, searchText:"빛비틀가디언"},
                { id:"light20", name:"빛사령", path:"summoners_war_images/light/20.png", order: 20, searchText:"빛사령"},
                { id:"light21", name:"빛노바라", path:"summoners_war_images/light/21.png", order: 21, searchText:"빛노바라"},
                { id:"light22", name:"빛고죠", path:"summoners_war_images/light/22.png", order: 22, searchText:"빛고죠"},
                { id:"light23", name:"빛드라칸", path:"summoners_war_images/light/23.png", order: 23, searchText:"빛드라칸"},
                { id:"light24", name:"빛해커", path:"summoners_war_images/light/24.png", order: 24, searchText:"빛해커"},
                { id:"light25", name:"빛트리스", path:"summoners_war_images/light/25.png", order: 25, searchText:"빛트리스"},
                { id:"light26", name:"빛시리", path:"summoners_war_images/light/26.png", order: 26, searchText:"빛시리"},
                { id:"light27", name:"빛게롤트", path:"summoners_war_images/light/27.png", order: 27, searchText:"빛게롤트"},
                { id:"light28", name:"빛쌍천", path:"summoners_war_images/light/28.png", order: 28, searchText:"빛쌍천"},
                { id:"light29", name:"빛깨비", path:"summoners_war_images/light/29.png", order: 29, searchText:"빛깨비"},
                { id:"light30", name:"빛데빌메이든", path:"summoners_war_images/light/30.png", order: 30, searchText:"빛데빌메이든"},
                { id:"light31", name:"빛인드라", path:"summoners_war_images/light/31.png", order: 31, searchText:"빛인드라"},
                { id:"light32", name:"빛용병", path:"summoners_war_images/light/32.png", order: 32, searchText:"빛용병"},
                { id:"light33", name:"빛강철", path:"summoners_war_images/light/33.png", order: 33, searchText:"빛강철"},
                { id:"light34", name:"빛듀얼블레이드", path:"summoners_war_images/light/34.png", order: 34, searchText:"빛듀얼블레이드"},
                { id:"light35", name:"빛인형", path:"summoners_war_images/light/35.png", order: 35, searchText:"빛인형"},
                { id:"light36", name:"빛카롱", path:"summoners_war_images/light/36.png", order: 36, searchText:"빛카롱"},
                { id:"light37", name:"빛푸딩", path:"summoners_war_images/light/37.png", order: 37, searchText:"빛푸딩"},
                { id:"light38", name:"빛배틀", path:"summoners_war_images/light/38.png", order: 38, searchText:"빛배틀"},
                { id:"light39", name:"빛그림자", path:"summoners_war_images/light/39.png", order: 39, searchText:"빛그림자"},
                { id:"light40", name:"빛웨폰", path:"summoners_war_images/light/40.png", order: 40, searchText:"빛웨폰"},
                { id:"light41", name:"빛토템", path:"summoners_war_images/light/41.png", order: 41, searchText:"빛토템"},
                { id:"light42", name:"빛서퍼", path:"summoners_war_images/light/42.png", order: 42, searchText:"빛서퍼"},
                { id:"light43", name:"빛마도", path:"summoners_war_images/light/43.png", order: 43, searchText:"빛마도"},
                { id:"light44", name:"빛음양", path:"summoners_war_images/light/44.png", order: 44, searchText:"빛음양"},
                { id:"light45", name:"빛슬레", path:"summoners_war_images/light/45.png", order: 45, searchText:"빛슬레"},
                { id:"light46", name:"빛스트", path:"summoners_war_images/light/46.png", order: 46, searchText:"빛스트"},
                { id:"light47", name:"빛화백", path:"summoners_war_images/light/47.png", order: 47, searchText:"빛화백"},
                { id:"light48", name:"빛비라", path:"summoners_war_images/light/48.png", order: 48, searchText:"빛비라"},
                { id:"light49", name:"빛데몬", path:"summoners_war_images/light/49.png", order: 49, searchText:"빛데몬"},
                { id:"light50", name:"빛뇌제", path:"summoners_war_images/light/50.png", order: 50, searchText:"빛뇌제"},
                { id:"light51", name:"빛드루", path:"summoners_war_images/light/51.png", order: 51, searchText:"빛드루"},
                { id:"light52", name:"빛팔라", path:"summoners_war_images/light/52.png", order: 52, searchText:"빛팔라"},
                { id:"light53", name:"빛유니", path:"summoners_war_images/light/53.png", order: 53, searchText:"빛유니"},
                { id:"light54", name:"빛하프", path:"summoners_war_images/light/54.png", order: 54, searchText:"빛하프"},
                { id:"light55", name:"빛웅묘", path:"summoners_war_images/light/55.png", order: 55, searchText:"빛웅묘"},
                { id:"light56", name:"빛요정왕", path:"summoners_war_images/light/56.png", order: 56, searchText:"빛요정왕"},
                { id:"light57", name:"빛호루스", path:"summoners_war_images/light/57.png", order: 57, searchText:"빛호루스"},
                { id:"light58", name:"빛사막", path:"summoners_war_images/light/58.png", order: 58, searchText:"빛사막"},
                { id:"light59", name:"빛해왕", path:"summoners_war_images/light/59.png", order: 59, searchText:"빛해왕"},
                { id:"light60", name:"빛이프", path:"summoners_war_images/light/60.png", order: 60, searchText:"빛이프"},
                { id:"light61", name:"빛극지", path:"summoners_war_images/light/61.png", order: 61, searchText:"빛극지"},
                { id:"light62", name:"빛선인", path:"summoners_war_images/light/62.png", order: 62, searchText:"빛선인"},
                { id:"light63", name:"빛무희", path:"summoners_war_images/light/63.png", order: 63, searchText:"빛무희"},
                { id:"light64", name:"빛헬레", path:"summoners_war_images/light/64.png", order: 64, searchText:"빛헬레"},
                { id:"light65", name:"빛신수", path:"summoners_war_images/light/65.png", order: 65, searchText:"빛신수"},
                { id:"light66", name:"빛아크", path:"summoners_war_images/light/66.png", order: 66, searchText:"빛아크"},
                { id:"light67", name:"빛오공", path:"summoners_war_images/light/67.png", order: 67, searchText:"빛오공"},
                { id:"light68", name:"빛드나", path:"summoners_war_images/light/68.png", order: 68, searchText:"빛드나"},
                { id:"light69", name:"빛오컬", path:"summoners_war_images/light/69.png", order: 69, searchText:"빛오컬"},
                { id:"light70", name:"빛라클", path:"summoners_war_images/light/70.png", order: 70, searchText:"빛라클"},
                { id:"light71", name:"빛뱀파", path:"summoners_war_images/light/71.png", order: 71, searchText:"빛뱀파"},
                { id:"light72", name:"빛키메라", path:"summoners_war_images/light/72.png", order: 72, searchText:"빛키메라"},
                { id:"light73", name:"빛피닉", path:"summoners_war_images/light/73.png", order: 73, searchText:"빛피닉"},
                { id:"light74", name:"빛드래곤", path:"summoners_war_images/light/74.png", order: 74, searchText:"빛드래곤"},
                { id:"light75", name:"빛발키리", path:"summoners_war_images/light/75.png", order: 75, searchText:"빛발키리"},
                { id:"light76", name:"빛젠이츠", path:"summoners_war_images/light/76.png", order: 76, searchText:"빛젠이츠"},
                { id:"light77", name:"빛네즈코", path:"summoners_war_images/light/77.png", order: 77, searchText:"빛네즈코"},
                { id:"light78", name:"빛묘지기", path:"summoners_war_images/light/78.png", order: 78, searchText:"빛묘지기"},
                { id:"light79", name:"빛메구미", path:"summoners_war_images/light/79.png", order: 79, searchText:"빛메구미"},
                { id:"light80", name:"빛이타도리", path:"summoners_war_images/light/80.png", order: 80, searchText:"빛이타도리"},
                { id:"light81", name:"빛사이보그", path:"summoners_war_images/light/81.png", order: 81, searchText:"빛사이보그"},
                { id:"light82", name:"빛예니퍼", path:"summoners_war_images/light/82.png", order: 82, searchText:"빛예니퍼"},
                { id:"light83", name:"빛삽살", path:"summoners_war_images/light/83.png", order: 83, searchText:"빛삽살"},
                { id:"light84", name:"빛아수라", path:"summoners_war_images/light/84.png", order: 84, searchText:"빛아수라"},
                { id:"light85", name:"빛카산", path:"summoners_war_images/light/85.png", order: 85, searchText:"빛카산"},
                { id:"light86", name:"빛사전", path:"summoners_war_images/light/86.png", order: 86, searchText:"빛사전"},
                { id:"light87", name:"빛초코", path:"summoners_war_images/light/87.png", order: 87, searchText:"빛초코"},
                { id:"light88", name:"빛홍차", path:"summoners_war_images/light/88.png", order: 88, searchText:"빛홍차"},
                { id:"light89", name:"빛꿈냥이", path:"summoners_war_images/light/89.png", order: 89, searchText:"빛꿈냥이"},
                { id:"light90", name:"빛망치", path:"summoners_war_images/light/90.png", order: 90, searchText:"빛망치"},
                { id:"light91", name:"빛로보", path:"summoners_war_images/light/91.png", order: 91, searchText:"빛로보"},
                { id:"light92", name:"빛요괴", path:"summoners_war_images/light/92.png", order: 92, searchText:"빛요괴"},
                { id:"light93", name:"빛춘리", path:"summoners_war_images/light/93.png", order: 93, searchText:"빛춘리"},
                { id:"light94", name:"빛포마", path:"summoners_war_images/light/94.png", order: 94, searchText:"빛포마"},
                { id:"light95", name:"빛거문고", path:"summoners_war_images/light/95.png", order: 95, searchText:"빛거문고"},
                { id:"light96", name:"빛가고일", path:"summoners_war_images/light/96.png", order: 96, searchText:"빛가고일"},
                { id:"light97", name:"빛캐논", path:"summoners_war_images/light/97.png", order: 97, searchText:"빛캐논"},
                { id:"light98", name:"빛스나", path:"summoners_war_images/light/98.png", order: 98, searchText:"빛스나"},
                { id:"light99", name:"빛광전사", path:"summoners_war_images/light/99.png", order: 99, searchText:"빛광전사"},
                { id:"light100", name:"빛드라이어드", path:"summoners_war_images/light/100.png", order: 100, searchText:"빛드라이어드"},
                { id:"light101", name:"빛부메랑", path:"summoners_war_images/light/101.png", order: 101, searchText:"빛부메랑"},
                { id:"light102", name:"빛차크람", path:"summoners_war_images/light/102.png", order: 102, searchText:"빛차크람"},
                { id:"light103", name:"빛주사위", path:"summoners_war_images/light/103.png", order: 103, searchText:"빛주사위"},
                { id:"light104", name:"빛하그", path:"summoners_war_images/light/104.png", order: 104, searchText:"빛하그"},
                { id:"light105", name:"빛호박", path:"summoners_war_images/light/105.png", order: 105, searchText:"빛호박"},
                { id:"light106", name:"빛아누", path:"summoners_war_images/light/106.png", order: 106, searchText:"빛아누"},
                { id:"light107", name:"빛에전", path:"summoners_war_images/light/107.png", order: 107, searchText:"빛에전"},
                { id:"light108", name:"빛네파", path:"summoners_war_images/light/108.png", order: 108, searchText:"빛네파"},
                { id:"light109", name:"빛암살", path:"summoners_war_images/light/109.png", order: 109, searchText:"빛암살"},
                { id:"light110", name:"빛마검", path:"summoners_war_images/light/110.png", order: 110, searchText:"빛마검"},
                { id:"light111", name:"빛머메", path:"summoners_war_images/light/111.png", order: 111, searchText:"빛머메"},
                { id:"light112", name:"빛해적", path:"summoners_war_images/light/112.png", order: 112, searchText:"빛해적"},
                { id:"light113", name:"빛야만", path:"summoners_war_images/light/113.png", order: 113, searchText:"빛야만"},
                { id:"light114", name:"빛도술", path:"summoners_war_images/light/114.png", order: 114, searchText:"빛도술"},
                { id:"light115", name:"빛코볼", path:"summoners_war_images/light/115.png", order: 115, searchText:"빛코볼"},
                { id:"light116", name:"빛브라우니", path:"summoners_war_images/light/116.png", order: 116, searchText:"빛브라우니"},
                { id:"light117", name:"빛쿵푸", path:"summoners_war_images/light/117.png", order: 117, searchText:"빛쿵푸"},
                { id:"light118", name:"빛사무라이", path:"summoners_war_images/light/118.png", order: 118, searchText:"빛사무라이"},
                { id:"light119", name:"빛리치", path:"summoners_war_images/light/119.png", order: 119, searchText:"빛리치"},
                { id:"light120", name:"빛데나", path:"summoners_war_images/light/120.png", order: 120, searchText:"빛데나"},
                { id:"light121", name:"빛나찰", path:"summoners_war_images/light/121.png", order: 121, searchText:"빛나찰"},
                { id:"light122", name:"빛마궁", path:"summoners_war_images/light/122.png", order: 122, searchText:"빛마궁"},
                { id:"light123", name:"빛사제", path:"summoners_war_images/light/123.png", order: 123, searchText:"빛사제"},
                { id:"light124", name:"빛팬텀", path:"summoners_war_images/light/124.png", order: 124, searchText:"빛팬텀"},
                { id:"light125", name:"빛피에", path:"summoners_war_images/light/125.png", order: 125, searchText:"빛피에"},
                { id:"light126", name:"빛닌자", path:"summoners_war_images/light/126.png", order: 126, searchText:"빛닌자"},
                { id:"light127", name:"빛조커", path:"summoners_war_images/light/127.png", order: 127, searchText:"빛조커"},
                { id:"light128", name:"빛서큐", path:"summoners_war_images/light/128.png", order: 128, searchText:"빛서큐"},
                { id:"light129", name:"빛실피드", path:"summoners_war_images/light/129.png", order: 129, searchText:"빛실피드"},
                { id:"light130", name:"빛실프", path:"summoners_war_images/light/130.png", order: 130, searchText:"빛실프"},
                { id:"light131", name:"빛운디네", path:"summoners_war_images/light/131.png", order: 131, searchText:"빛운디네"},
                { id:"light132", name:"빛구미", path:"summoners_war_images/light/132.png", order: 132, searchText:"빛구미"},
                { id:"light133", name:"빛엘순", path:"summoners_war_images/light/133.png", order: 133, searchText:"빛엘순"},
                { id:"light134", name:"빛미라", path:"summoners_war_images/light/134.png", order: 134, searchText:"빛미라"},
                { id:"light135", name:"빛무도가", path:"summoners_war_images/light/135.png", order: 135, searchText:"빛무도가"},
                { id:"light136", name:"빛전투상어", path:"summoners_war_images/light/136.png", order: 136, searchText:"빛전투상어"},
                { id:"light137", name:"빛카우", path:"summoners_war_images/light/137.png", order: 137, searchText:"빛카우"},
                { id:"light138", name:"빛페퀸", path:"summoners_war_images/light/138.png", order: 138, searchText:"빛페퀸"},
                { id:"light139", name:"빛매머드", path:"summoners_war_images/light/139.png", order: 139, searchText:"빛매머드"},
                { id:"light140", name:"빛펭귄", path:"summoners_war_images/light/140.png", order: 140, searchText:"빛펭귄"},
                { id:"light141", name:"빛맹수", path:"summoners_war_images/light/141.png", order: 141, searchText:"빛맹수"},
                { id:"light142", name:"빛리자드맨", path:"summoners_war_images/light/142.png", order: 142, searchText:"빛리자드맨"},
                { id:"light143", name:"빛미노", path:"summoners_war_images/light/143.png", order: 143, searchText:"빛미노"},
                { id:"light144", name:"빛드렁큰", path:"summoners_war_images/light/144.png", order: 144, searchText:"빛드렁큰"},
                { id:"light145", name:"빛정예마법궁사", path:"summoners_war_images/light/145.png", order: 145, searchText:"빛정예마법궁사"},
                { id:"light146", name:"빛임챔", path:"summoners_war_images/light/146.png", order: 146, searchText:"빛임챔"},
                { id:"light147", name:"빛바운티", path:"summoners_war_images/light/147.png", order: 147, searchText:"빛바운티"},
                { id:"light148", name:"빛아마존", path:"summoners_war_images/light/148.png", order: 148, searchText:"빛아마존"},
                { id:"light149", name:"빛베어맨", path:"summoners_war_images/light/149.png", order: 149, searchText:"빛베어맨"},
                { id:"light150", name:"빛인페", path:"summoners_war_images/light/150.png", order: 150, searchText:"빛인페"},
                { id:"light151", name:"빛골렘", path:"summoners_war_images/light/151.png", order: 151, searchText:"빛골렘"},
                { id:"light152", name:"빛서펀트", path:"summoners_war_images/light/152.png", order: 152, searchText:"빛서펀트"},
                { id:"light153", name:"빛가루다", path:"summoners_war_images/light/153.png", order: 153, searchText:"빛가루다"},
                { id:"light154", name:"빛엘리멘탈", path:"summoners_war_images/light/154.png", order: 154, searchText:"빛엘리멘탈"},
                { id:"light155", name:"빛하피", path:"summoners_war_images/light/155.png", order: 155, searchText:"빛하피"},
                { id:"light156", name:"빛바이킹", path:"summoners_war_images/light/156.png", order: 156, searchText:"빛바이킹"},
                { id:"light157", name:"빛샐러맨더", path:"summoners_war_images/light/157.png", order: 157, searchText:"빛샐러맨더"},
                { id:"light158", name:"빛헬하", path:"summoners_war_images/light/158.png", order: 158, searchText:"빛헬하"},
                { id:"light159", name:"빛예티", path:"summoners_war_images/light/159.png", order: 159, searchText:"빛예티"},
                { id:"light160", name:"빛임프", path:"summoners_war_images/light/160.png", order: 160, searchText:"빛임프"},
                { id:"light161", name:"빛하급엘리멘탈", path:"summoners_war_images/light/161.png", order: 161, searchText:"빛하급엘리멘탈"}
            ]
        },
        dark: {
            name: "어둠속성",
            searchText: "어둠속성",
            icons: [
                { id:"dark1", name:"암프랑", path:"summoners_war_images/dark/1.png", order: 1, searchText:"암프랑"},
                { id:"dark2", name:"암리빙", path:"summoners_war_images/dark/2.png", order: 2, searchText:"암리빙"},
                { id:"dark3", name:"암그림", path:"summoners_war_images/dark/3.png", order: 3, searchText:"암그림"},
                { id:"dark4", name:"암미스틱위치", path:"summoners_war_images/dark/4.png", order: 4, searchText:"암미스틱위치"},
                { id:"dark5", name:"암방랑", path:"summoners_war_images/dark/5.png", order: 5, searchText:"암방랑"},
                { id:"dark6", name:"암마샬", path:"summoners_war_images/dark/6.png", order: 6, searchText:"암마샬"},
                { id:"dark7", name:"암늑인", path:"summoners_war_images/dark/7.png", order: 7, searchText:"암늑인"},
                { id:"dark8", name:"암호울", path:"summoners_war_images/dark/8.png", order: 8, searchText:"암호울"},
                { id:"dark9", name:"암하르퓨", path:"summoners_war_images/dark/9.png", order: 9, searchText:"암하르퓨"},
                { id:"dark10", name:"암하엘", path:"summoners_war_images/dark/10.png", order: 10, searchText:"암하엘"},
                { id:"dark11", name:"암그리폰", path:"summoners_war_images/dark/11.png", order: 11, searchText:"암그리폰"},
                { id:"dark12", name:"암이누", path:"summoners_war_images/dark/12.png", order: 12, searchText:"암이누"},
                { id:"dark13", name:"암워베어", path:"summoners_war_images/dark/13.png", order: 13, searchText:"암워베어"},
                { id:"dark14", name:"암픽시", path:"summoners_war_images/dark/14.png", order: 14, searchText:"암픽시"},
                { id:"dark15", name:"암페어리", path:"summoners_war_images/dark/15.png", order: 15, searchText:"암페어리"},
                { id:"dark16", name:"암호문", path:"summoners_war_images/dark/16.png", order: 16, searchText:"암호문"},
                { id:"dark17", name:"암젠이츠", path:"summoners_war_images/dark/17.png", order: 17, searchText:"암젠이츠"},
                { id:"dark18", name:"암네즈코", path:"summoners_war_images/dark/18.png", order: 18, searchText:"암네즈코"},
                { id:"dark19", name:"암비틀가디언", path:"summoners_war_images/dark/19.png", order: 19, searchText:"암비틀가디언"},
                { id:"dark20", name:"암사령", path:"summoners_war_images/dark/20.png", order: 20, searchText:"암사령"},
                { id:"dark21", name:"암메구미", path:"summoners_war_images/dark/21.png", order: 21, searchText:"암메구미"},
                { id:"dark22", name:"암이타도리", path:"summoners_war_images/dark/22.png", order: 22, searchText:"암이타도리"},
                { id:"dark23", name:"암고죠", path:"summoners_war_images/dark/23.png", order: 23, searchText:"암고죠"},
                { id:"dark24", name:"암스쿠나", path:"summoners_war_images/dark/24.png", order: 24, searchText:"암스쿠나"},
                { id:"dark25", name:"암드라칸", path:"summoners_war_images/dark/25.png", order: 25, searchText:"암드라칸"},
                { id:"dark26", name:"암해커", path:"summoners_war_images/dark/26.png", order: 26, searchText:"암해커"},
                { id:"dark27", name:"암트리스", path:"summoners_war_images/dark/27.png", order: 27, searchText:"암트리스"},
                { id:"dark28", name:"암예니퍼", path:"summoners_war_images/dark/28.png", order: 28, searchText:"암예니퍼"},
                { id:"dark29", name:"암게롤트", path:"summoners_war_images/dark/29.png", order: 29, searchText:"암게롤트"},
                { id:"dark30", name:"암쌍천", path:"summoners_war_images/dark/30.png", order: 30, searchText:"암쌍천"},
                { id:"dark31", name:"암깨비", path:"summoners_war_images/dark/31.png", order: 31, searchText:"암깨비"},
                { id:"dark32", name:"암데빌메이든", path:"summoners_war_images/dark/32.png", order: 32, searchText:"암데빌메이든"},
                { id:"dark33", name:"암인드라", path:"summoners_war_images/dark/33.png", order: 33, searchText:"암인드라"},
                { id:"dark34", name:"암용병", path:"summoners_war_images/dark/34.png", order: 34, searchText:"암용병"},
                { id:"dark35", name:"암카산", path:"summoners_war_images/dark/35.png", order: 35, searchText:"암카산"},
                { id:"dark36", name:"암사전", path:"summoners_war_images/dark/36.png", order: 36, searchText:"암사전"},
                { id:"dark37", name:"암인형", path:"summoners_war_images/dark/37.png", order: 37, searchText:"암인형"},
                { id:"dark38", name:"암카롱", path:"summoners_war_images/dark/38.png", order: 38, searchText:"암카롱"},
                { id:"dark39", name:"암푸딩", path:"summoners_war_images/dark/39.png", order: 39, searchText:"암푸딩"},
                { id:"dark40", name:"암배틀", path:"summoners_war_images/dark/40.png", order: 40, searchText:"암배틀"},
                { id:"dark41", name:"암그림자", path:"summoners_war_images/dark/41.png", order: 41, searchText:"암그림자"},
                { id:"dark42", name:"암웨폰", path:"summoners_war_images/dark/42.png", order: 42, searchText:"암웨폰"},
                { id:"dark43", name:"암토템", path:"summoners_war_images/dark/43.png", order: 43, searchText:"암토템"},
                { id:"dark44", name:"암서퍼", path:"summoners_war_images/dark/44.png", order: 44, searchText:"암서퍼"},
                { id:"dark45", name:"암마도", path:"summoners_war_images/dark/45.png", order: 45, searchText:"암마도"},
                { id:"dark46", name:"암요괴", path:"summoners_war_images/dark/46.png", order: 46, searchText:"암요괴"},
                { id:"dark47", name:"암음양", path:"summoners_war_images/dark/47.png", order: 47, searchText:"암음양"},
                { id:"dark48", name:"암슬레", path:"summoners_war_images/dark/48.png", order: 48, searchText:"암슬레"},
                { id:"dark49", name:"암스트", path:"summoners_war_images/dark/49.png", order: 49, searchText:"암스트"},
                { id:"dark50", name:"암화백", path:"summoners_war_images/dark/50.png", order: 50, searchText:"암화백"},
                { id:"dark51", name:"암비라", path:"summoners_war_images/dark/51.png", order: 51, searchText:"암비라"},
                { id:"dark52", name:"암데몬", path:"summoners_war_images/dark/52.png", order: 52, searchText:"암데몬"},
                { id:"dark53", name:"암뱀로", path:"summoners_war_images/dark/53.png", order: 53, searchText:"암뱀로"},
                { id:"dark54", name:"암캐논", path:"summoners_war_images/dark/54.png", order: 54, searchText:"암캐논"},
                { id:"dark55", name:"암뇌제", path:"summoners_war_images/dark/55.png", order: 55, searchText:"암뇌제"},
                { id:"dark56", name:"암드루", path:"summoners_war_images/dark/56.png", order: 56, searchText:"암드루"},
                { id:"dark57", name:"암팔라", path:"summoners_war_images/dark/57.png", order: 57, searchText:"암팔라"},
                { id:"dark58", name:"암유니", path:"summoners_war_images/dark/58.png", order: 58, searchText:"암유니"},
                { id:"dark59", name:"암하프", path:"summoners_war_images/dark/59.png", order: 59, searchText:"암하프"},
                { id:"dark60", name:"암웅묘", path:"summoners_war_images/dark/60.png", order: 60, searchText:"암웅묘"},
                { id:"dark61", name:"암요정왕", path:"summoners_war_images/dark/61.png", order: 61, searchText:"암요정왕"},
                { id:"dark62", name:"암사막", path:"summoners_war_images/dark/62.png", order: 62, searchText:"암사막"},
                { id:"dark63", name:"암아누", path:"summoners_war_images/dark/63.png", order: 63, searchText:"암아누"},
                { id:"dark64", name:"암에전", path:"summoners_war_images/dark/64.png", order: 64, searchText:"암에전"},
                { id:"dark65", name:"암해왕", path:"summoners_war_images/dark/65.png", order: 65, searchText:"암해왕"},
                { id:"dark66", name:"암이프", path:"summoners_war_images/dark/66.png", order: 66, searchText:"암이프"},
                { id:"dark67", name:"암극지", path:"summoners_war_images/dark/67.png", order: 67, searchText:"암극지"},
                { id:"dark68", name:"암선인", path:"summoners_war_images/dark/68.png", order: 68, searchText:"암선인"},
                { id:"dark69", name:"암무희", path:"summoners_war_images/dark/69.png", order: 69, searchText:"암무희"},
                { id:"dark70", name:"암헬레", path:"summoners_war_images/dark/70.png", order: 70, searchText:"암헬레"},
                { id:"dark71", name:"암신수", path:"summoners_war_images/dark/71.png", order: 71, searchText:"암신수"},
                { id:"dark72", name:"암아크", path:"summoners_war_images/dark/72.png", order: 72, searchText:"암아크"},
                { id:"dark73", name:"암오공", path:"summoners_war_images/dark/73.png", order: 73, searchText:"암오공"},
                { id:"dark74", name:"암드나", path:"summoners_war_images/dark/74.png", order: 74, searchText:"암드나"},
                { id:"dark75", name:"암오컬", path:"summoners_war_images/dark/75.png", order: 75, searchText:"암오컬"},
                { id:"dark76", name:"암라클", path:"summoners_war_images/dark/76.png", order: 76, searchText:"암라클"},
                { id:"dark77", name:"암뱀파", path:"summoners_war_images/dark/77.png", order: 77, searchText:"암뱀파"},
                { id:"dark78", name:"암키메라", path:"summoners_war_images/dark/78.png", order: 78, searchText:"암키메라"},
                { id:"dark79", name:"암피닉", path:"summoners_war_images/dark/79.png", order: 79, searchText:"암피닉"},
                { id:"dark80", name:"암드래곤", path:"summoners_war_images/dark/80.png", order: 80, searchText:"암드래곤"},
                { id:"dark81", name:"암발키리", path:"summoners_war_images/dark/81.png", order: 81, searchText:"암발키리"},
                { id:"dark82", name:"암닌자", path:"summoners_war_images/dark/82.png", order: 82, searchText:"암닌자"},
                { id:"dark83", name:"암이노스케", path:"summoners_war_images/dark/83.png", order: 83, searchText:"암이노스케"},
                { id:"dark84", name:"암탄지로", path:"summoners_war_images/dark/84.png", order: 84, searchText:"암탄지로"},
                { id:"dark85", name:"암묘지기", path:"summoners_war_images/dark/85.png", order: 85, searchText:"암묘지기"},
                { id:"dark86", name:"암노바라", path:"summoners_war_images/dark/86.png", order: 86, searchText:"암노바라"},
                { id:"dark87", name:"암사이보그", path:"summoners_war_images/dark/87.png", order: 87, searchText:"암사이보그"},
                { id:"dark88", name:"암시리", path:"summoners_war_images/dark/88.png", order: 88, searchText:"암시리"},
                { id:"dark89", name:"암삽살", path:"summoners_war_images/dark/89.png", order: 89, searchText:"암삽살"},
                { id:"dark90", name:"암아수라", path:"summoners_war_images/dark/90.png", order: 90, searchText:"암아수라"},
                { id:"dark91", name:"암강철", path:"summoners_war_images/dark/91.png", order: 91, searchText:"암강철"},
                { id:"dark92", name:"암초코", path:"summoners_war_images/dark/92.png", order: 92, searchText:"암초코"},
                { id:"dark93", name:"암홍차", path:"summoners_war_images/dark/93.png", order: 93, searchText:"암홍차"},
                { id:"dark94", name:"암꿈냥이", path:"summoners_war_images/dark/94.png", order: 94, searchText:"암꿈냥이"},
                { id:"dark95", name:"암망치", path:"summoners_war_images/dark/95.png", order: 95, searchText:"암망치"},
                { id:"dark96", name:"암로보", path:"summoners_war_images/dark/96.png", order: 96, searchText:"암로보"},
                { id:"dark97", name:"암춘리", path:"summoners_war_images/dark/97.png", order: 97, searchText:"암춘리"},
                { id:"dark98", name:"암포마", path:"summoners_war_images/dark/98.png", order: 98, searchText:"암포마"},
                { id:"dark99", name:"암거문고", path:"summoners_war_images/dark/99.png", order: 99, searchText:"암거문고"},
                { id:"dark100", name:"암가고일", path:"summoners_war_images/dark/100.png", order: 100, searchText:"암가고일"},
                { id:"dark101", name:"암스나", path:"summoners_war_images/dark/101.png", order: 101, searchText:"암스나"},
                { id:"dark102", name:"암광전사", path:"summoners_war_images/dark/102.png", order: 102, searchText:"암광전사"},
                { id:"dark103", name:"암드라이어드", path:"summoners_war_images/dark/103.png", order: 103, searchText:"암드라이어드"},
                { id:"dark104", name:"암부메랑", path:"summoners_war_images/dark/104.png", order: 104, searchText:"암부메랑"},
                { id:"dark105", name:"암차크람", path:"summoners_war_images/dark/105.png", order: 105, searchText:"암차크람"},
                { id:"dark106", name:"암주사위", path:"summoners_war_images/dark/106.png", order: 106, searchText:"암주사위"},
                { id:"dark107", name:"암엘순", path:"summoners_war_images/dark/107.png", order: 107, searchText:"암엘순"},
                { id:"dark108", name:"암호박", path:"summoners_war_images/dark/108.png", order: 108, searchText:"암호박"},
                { id:"dark109", name:"암호루스", path:"summoners_war_images/dark/109.png", order: 109, searchText:"암호루스"},
                { id:"dark110", name:"암네파", path:"summoners_war_images/dark/110.png", order: 110, searchText:"암네파"},
                { id:"dark111", name:"암암살", path:"summoners_war_images/dark/111.png", order: 111, searchText:"암암살"},
                { id:"dark112", name:"암마검", path:"summoners_war_images/dark/112.png", order: 112, searchText:"암마검"},
                { id:"dark113", name:"암머메", path:"summoners_war_images/dark/113.png", order: 113, searchText:"암머메"},
                { id:"dark114", name:"암해적", path:"summoners_war_images/dark/114.png", order: 114, searchText:"암해적"},
                { id:"dark115", name:"암야만", path:"summoners_war_images/dark/115.png", order: 115, searchText:"암야만"},
                { id:"dark116", name:"암코볼", path:"summoners_war_images/dark/116.png", order: 116, searchText:"암코볼"},
                { id:"dark117", name:"암브라우니", path:"summoners_war_images/dark/117.png", order: 117, searchText:"암브라우니"},
                { id:"dark118", name:"암쿵푸", path:"summoners_war_images/dark/118.png", order: 118, searchText:"암쿵푸"},
                { id:"dark119", name:"암사무라이", path:"summoners_war_images/dark/119.png", order: 119, searchText:"암사무라이"},
                { id:"dark120", name:"암리치", path:"summoners_war_images/dark/120.png", order: 120, searchText:"암리치"},
                { id:"dark121", name:"암데나", path:"summoners_war_images/dark/121.png", order: 121, searchText:"암데나"},
                { id:"dark122", name:"암나찰", path:"summoners_war_images/dark/122.png", order: 122, searchText:"암나찰"},
                { id:"dark123", name:"암마궁", path:"summoners_war_images/dark/123.png", order: 123, searchText:"암마궁"},
                { id:"dark124", name:"암팬텀", path:"summoners_war_images/dark/124.png", order: 124, searchText:"암팬텀"},
                { id:"dark125", name:"암피에", path:"summoners_war_images/dark/125.png", order: 125, searchText:"암피에"},
                { id:"dark126", name:"암조커", path:"summoners_war_images/dark/126.png", order: 126, searchText:"암조커"},
                { id:"dark127", name:"암서큐", path:"summoners_war_images/dark/127.png", order: 127, searchText:"암서큐"},
                { id:"dark128", name:"암실피드", path:"summoners_war_images/dark/128.png", order: 128, searchText:"암실피드"},
                { id:"dark129", name:"암실프", path:"summoners_war_images/dark/129.png", order: 129, searchText:"암실프"},
                { id:"dark130", name:"암운디네", path:"summoners_war_images/dark/130.png", order: 130, searchText:"암운디네"},
                { id:"dark131", name:"암구미", path:"summoners_war_images/dark/131.png", order: 131, searchText:"암구미"},
                { id:"dark132", name:"암하그", path:"summoners_war_images/dark/132.png", order: 132, searchText:"암하그"},
                { id:"dark133", name:"암미라", path:"summoners_war_images/dark/133.png", order: 133, searchText:"암미라"},
                { id:"dark134", name:"암무도가", path:"summoners_war_images/dark/134.png", order: 134, searchText:"암무도가"},
                { id:"dark135", name:"암전투상어", path:"summoners_war_images/dark/135.png", order: 135, searchText:"암전투상어"},
                { id:"dark136", name:"암카우", path:"summoners_war_images/dark/136.png", order: 136, searchText:"암카우"},
                { id:"dark137", name:"암매머드", path:"summoners_war_images/dark/137.png", order: 137, searchText:"암매머드"},
                { id:"dark138", name:"암펭귄", path:"summoners_war_images/dark/138.png", order: 138, searchText:"암펭귄"},
                { id:"dark139", name:"암맹수", path:"summoners_war_images/dark/139.png", order: 139, searchText:"암맹수"},
                { id:"dark140", name:"암도술", path:"summoners_war_images/dark/140.png", order: 140, searchText:"암도술"},
                { id:"dark141", name:"암리자드맨", path:"summoners_war_images/dark/141.png", order: 141, searchText:"암리자드맨"},
                { id:"dark142", name:"암미노", path:"summoners_war_images/dark/142.png", order: 142, searchText:"암미노"},
                { id:"dark143", name:"암드렁큰", path:"summoners_war_images/dark/143.png", order: 143, searchText:"암드렁큰"},
                { id:"dark144", name:"암임챔", path:"summoners_war_images/dark/144.png", order: 144, searchText:"암임챔"},
                { id:"dark145", name:"암바운티", path:"summoners_war_images/dark/145.png", order: 145, searchText:"암바운티"},
                { id:"dark146", name:"암사제", path:"summoners_war_images/dark/146.png", order: 146, searchText:"암사제"},
                { id:"dark147", name:"암아마존", path:"summoners_war_images/dark/147.png", order: 147, searchText:"암아마존"},
                { id:"dark148", name:"암바이킹", path:"summoners_war_images/dark/148.png", order: 148, searchText:"암바이킹"},
                { id:"dark149", name:"암베어맨", path:"summoners_war_images/dark/149.png", order: 149, searchText:"암베어맨"},
                { id:"dark150", name:"암인페", path:"summoners_war_images/dark/150.png", order: 150, searchText:"암인페"},
                { id:"dark151", name:"암골렘", path:"summoners_war_images/dark/151.png", order: 151, searchText:"암골렘"},
                { id:"dark152", name:"암서펀트", path:"summoners_war_images/dark/152.png", order: 152, searchText:"암서펀트"},
                { id:"dark153", name:"암엘리멘탈", path:"summoners_war_images/dark/153.png", order: 153, searchText:"암엘리멘탈"},
                { id:"dark154", name:"암헬하", path:"summoners_war_images/dark/154.png", order: 154, searchText:"암헬하"},
                { id:"dark155", name:"암하피", path:"summoners_war_images/dark/155.png", order: 155, searchText:"암하피"},
                { id:"dark156", name:"암예티", path:"summoners_war_images/dark/156.png", order: 156, searchText:"암예티"},
                { id:"dark157", name:"암샐러맨더", path:"summoners_war_images/dark/157.png", order: 157, searchText:"암샐러맨더"},
                { id:"dark158", name:"암가루다", path:"summoners_war_images/dark/158.png", order: 158, searchText:"암가루다"},
                { id:"dark159", name:"암임프", path:"summoners_war_images/dark/159.png", order: 159, searchText:"암임프"},
                { id:"dark160", name:"암하급엘리멘탈", path:"summoners_war_images/dark/160.png", order: 160, searchText:"암하급엘리멘탈"}
            ]
        }

    };

    // 몬스터 아이콘 생성 함수
    function createViewerMonsterIcons() {
        const mobiconDiv = document.querySelector('.mobicon');
        if (!mobiconDiv) return;

        // 각 속성별로 아이콘 생성
        Object.entries(monsterIcons).forEach(([attr, data]) => {
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
                
                // 클릭 이벤트 추가 - viewerSearchInput과 memoSearchInput 모두에 적용
                img.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const viewerSearchInput = document.getElementById('viewerSearchInput');
                    const memoSearchInput = document.getElementById('memoSearchInput');
                    const memoSearchDropdown = document.getElementById('memoSearchDropdown');
                    
                    // 메모 검색 드롭다운이 표시되어 있는 경우
                    if (memoSearchDropdown && memoSearchDropdown.classList.contains('show')) {
                        if (memoSearchInput) {
                            memoSearchInput.value += this.getAttribute('data-search') + ' ';
                            memoSearchInput.focus();
                        }
                    } else {
                        // 목록 검색창이 표시되어 있는 경우
                        if (viewerSearchInput) {
                            viewerSearchInput.value += this.getAttribute('data-search') + ' ';
                            viewerSearchInput.focus();
                        }
                    }
                });
                
                mobiconDiv.appendChild(img);
            });
        });
    }

    // 속성 아이콘 클릭 이벤트 핸들러 생성 함수
    function createViewerAttributeIconHandlers() {
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
                            attrIconFilterState[attrId] = !attrIconFilterState[attrId];
                            
                            if (attrIconFilterState[attrId]) {
                                attrIconIds.forEach(otherId => {
                                    const otherIcon = document.getElementById(otherId);
                                    if (otherIcon) {
                                        const box = otherIcon.closest('.icon-box');
                                        if (box) box.classList.add('selected');
                                    }
                                });
                                const myBox = icon.closest('.icon-box');
                                if (myBox) myBox.classList.remove('selected');
                            } else {
                                attrIconIds.forEach(otherId => {
                                    const otherIcon = document.getElementById(otherId);
                                    if (otherIcon) {
                                        const box = otherIcon.closest('.icon-box');
                                        if (box) box.classList.remove('selected');
                                    }
                                });
                            }

                            const mobiconDiv = document.querySelector('.mobicon');
                            if (mobiconDiv) {
                                Array.from(mobiconDiv.children).forEach(img => {
                                    if (attrIconFilterState[attrId]) {
                                        if (img.getAttribute('data-attr') === attr) {
                                            img.style.display = '';
                                        } else {
                                            img.style.display = 'none';
                                        }
                                    } else {
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

    // DOM이 로드된 후 실행
    document.addEventListener('DOMContentLoaded', function() {
        const moveBtn = document.getElementById('sortAndMoveBtn');
        const mainContainer = document.querySelector('.container');
        if (moveBtn && mainContainer) {
            // 아이콘 열람 버튼을 기존목록 이동 버튼과 같은 button-wrapper 안에 추가
            const iconViewBtn = document.createElement('button');
            iconViewBtn.id = 'iconViewBtn';
            iconViewBtn.className = 'action-btn';
            iconViewBtn.textContent = '아이콘 열람';
            iconViewBtn.style.background = '#eee';
            iconViewBtn.style.color = '#333';
            iconViewBtn.style.border = '1px solid #bbb';
            iconViewBtn.style.flexShrink = '0';
            iconViewBtn.style.position = 'relative';
            // button-wrapper에 flex row 스타일 적용
            const btnWrapper = moveBtn.parentNode;
            btnWrapper.style.display = 'flex';
            btnWrapper.style.flexDirection = 'row';
            btnWrapper.style.gap = '8px';
            btnWrapper.appendChild(iconViewBtn);

            // 드롭다운은 .container 기준으로 절대위치로 추가
            let iconViewDropdown = document.getElementById('iconViewDropdown');
            if (!iconViewDropdown) {
                iconViewDropdown = document.createElement('div');
                iconViewDropdown.id = 'iconViewDropdown';
                iconViewDropdown.style.display = 'none';
                iconViewDropdown.style.position = 'absolute';
                iconViewDropdown.style.left = '10%';
                iconViewDropdown.style.width = '80%';
                iconViewDropdown.style.minWidth = '80%';
                iconViewDropdown.style.maxWidth = '80%';
                iconViewDropdown.style.height = '600px';
                iconViewDropdown.style.background = 'white';
                iconViewDropdown.style.border = '1px solid #bbb';
                iconViewDropdown.style.borderRadius = '8px';
                iconViewDropdown.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)';
                iconViewDropdown.style.padding = '24px 18px';
                iconViewDropdown.style.zIndex = '10001';
                iconViewDropdown.style.textAlign = 'center';
                mainContainer.appendChild(iconViewDropdown);
            }

            iconViewBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                // top 위치를 버튼 아래로 동적으로 맞춤
                const btnRect = iconViewBtn.getBoundingClientRect();
                const containerRect = mainContainer.getBoundingClientRect();
                iconViewDropdown.style.top = (btnRect.bottom - containerRect.top + 8) + 'px';
                if (iconViewDropdown.style.display === 'none' || iconViewDropdown.style.display === '') {
                    iconViewDropdown.innerHTML = `
                        <div style=\"display:flex; align-items:center; justify-content:center; gap:18px; margin-bottom:12px;\">
                            <button id=\"undoLastWordBtn\" class=\"action-btn\" style=\"background:#f5f5f5; color:#d32f2f; border:1px solid #d32f2f;\">검색 단어 지우기</button>
                            <div class=\"icon-boxes\" style=\"margin-bottom:0;\">
                                <div class=\"icon-box\" id=\"fireAttrIcon\"><img src=\"summoners_war_images/fireimage.png\" alt=\"불속성\" style=\"width:25px;height:18px;\"></div>
                                <div class=\"icon-box\" id=\"waterAttrIcon\"><img src=\"summoners_war_images/waterimage.png\" alt=\"물속성\" style=\"width:25px;height:18px;\"></div>
                                <div class=\"icon-box\" id=\"windAttrIcon\"><img src=\"summoners_war_images/windimage.png\" alt=\"바람속성\" style=\"width:25px;height:18px;\"></div>
                                <div class=\"icon-box\" id=\"lightAttrIcon\"><img src=\"summoners_war_images/lightimage.png\" alt=\"빛속성\" style=\"width:25px;height:18px;\"></div>
                                <div class=\"icon-box\" id=\"darkAttrIcon\"><img src=\"summoners_war_images/darkimage.png\" alt=\"어둠속성\" style=\"width:25px;height:18px;\"></div>
                            </div>
                        </div>
                        <div class=\"icon-separator\"></div>
                        <div class=\"mobicon\" style=\"width:100%;\"></div>
                    `;
                    iconViewDropdown.style.display = 'block';
                    createViewerMonsterIcons();
                    createViewerAttributeIconHandlers();
                    // 되돌리기 버튼 기능 추가
                    const undoBtn = iconViewDropdown.querySelector('#undoLastWordBtn');
                    if (undoBtn) {
                        undoBtn.addEventListener('click', function() {
                            const viewerSearchInput = document.getElementById('viewerSearchInput');
                            const memoSearchInput = document.getElementById('memoSearchInput');
                            const memoSearchDropdown = document.getElementById('memoSearchDropdown');
                            let targetInput = null;
                            if (memoSearchDropdown && memoSearchDropdown.classList.contains('show')) {
                                targetInput = memoSearchInput;
                            } else {
                                targetInput = viewerSearchInput;
                            }
                            if (targetInput) {
                                let words = targetInput.value.trim().split(/\s+/);
                                words.pop();
                                let newValue = words.join(' ');
                                if (newValue.length > 0) newValue += ' ';
                                targetInput.value = newValue;
                                targetInput.focus();
                            }
                        });
                    }
                } else {
                    iconViewDropdown.style.display = 'none';
                }
            });
            // 드롭다운 외부 클릭 시 닫기
            document.addEventListener('click', function(e) {
                if (iconViewDropdown.style.display === 'block' && !iconViewDropdown.contains(e.target) && e.target !== iconViewBtn) {
                    iconViewDropdown.style.display = 'none';
                }
            });
        }
    });
})(); 