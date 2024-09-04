
const riot_API = 'RGAPI-26dbb496-2875-4ec2-855e-8b481477e366';


document.addEventListener('DOMContentLoaded', () => {

    function first_upper(target) {
        result = target[0].toUpperCase() + target.substring(1, target.length).toLowerCase()
        console.log(result)
        return result
    }
    
    // --functions--
    function search() {
        if (document.querySelector('#game_name').value == '') {
            alert('입력해주세요')
        } else {
            document.querySelector('#games').innerHTML = ''
            document.querySelector('#main_left').innerHTML = ''
            document.querySelector('#main_rigth').innerHTML = ''

            if (document.querySelector('.selected').textContent == '전체') {
                search_type = ``
            } else if (document.querySelector('.selected').textContent == '일반') {
                search_type = `type=normal`
            } else if (document.querySelector('.selected').textContent == '랭크') {
                search_type = `type=ranked`
            }

            console.log(player_name_tag.value)
            const name_tag_li = player_name_tag.value.split('#')
            console.log(name_tag_li)
            const input_name = name_tag_li[0]
            const input_tag = name_tag_li[1]

            display_player_info(input_name, input_tag, search_type)
        }
    }

    function game_time(gameCreation, gameDuration) {
        const date = new Date()

        let target_days = ((date - gameCreation)/ 86400000)
        console.log(target_days)
        const elapsedTime = date - gameCreation;

        if (elapsedTime < 60000) { // less than 1 minute
            target_days = `${(elapsedTime / 1000).toFixed(0)}초 전`;
        } else if (elapsedTime < 3600000) { // less than 1 hour
            target_days = `${(elapsedTime / 60000).toFixed(0)}분 전`;
        } else if (elapsedTime < 86400000) { // less than 1 day
            target_days = `${(elapsedTime / 3600000).toFixed(0)}시간 전`;
        } else if (elapsedTime < 172800000) { // less than 2 days
            target_days = '하루 전';
        } else if (elapsedTime <= 2592000000) { // less than or equal to 30 days
            target_days = `${(elapsedTime / 86400000).toFixed(0)}일 전`;
        } else if (elapsedTime <= 5184000000) { // less than or equal to 61 days
            target_days = '한달 전';
        } else {
            target_days = '오래 전';
        }

        const game_minutes = Math.floor(gameDuration / 60)
        const game_seconds = (gameDuration % 60)

        return { target_days, game_minutes, game_seconds }
    }

    // puuid_api
    async function puuid_api(main_server, input_name, input_tag) {
        const response = await axios.get(`https://${main_server}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${input_name}/${input_tag}?api_key=${riot_API}`);
        
        console.log(response.data);
        const player_puuid = response.data.puuid;
        const player_name = response.data.gameName;
        const player_tag = `#${response.data.tagLine}`;

        document.querySelector('#player_name').textContent = player_name;
        document.querySelector('#player_tag').textContent = player_tag;

        return { player_puuid, player_name, player_tag };
    }

    // server_api
    async function server_api(main_server, player_puuid) {
        const response = await axios.get(`https://${main_server}.api.riotgames.com/lol/match/v5/matches/by-puuid/${player_puuid}/ids?start=0&count=1&api_key=${riot_API}`);
        
        console.log(response.data)
        const last_game = response.data[0].split('_')
        const server = last_game[0]

        document.querySelector('#player_location').textContent = server
        document.querySelector('#flag').setAttribute('src', `https://flagsapi.com/${server.substring(0, 2)}/flat/64.png`);

        return server
    }

    // summoner_id_api
    async function summoner_id_api(server, player_puuid) {
        const response = await axios.get(`https://${server}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${player_puuid}?api_key=${riot_API}`);

        const player_summoner_id = response.data.id
        const player_account_id = response.data.account_id
        const player_profileIconId = response.data.profileIconId
        const player_level = response.data.summonerLevel

        document.querySelector('#player_icon').setAttribute('src', `https://opgg-static.akamaized.net/meta/images/profile_icons/profileIcon${player_profileIconId}.jpg`);
        document.querySelector('#player_level').textContent = player_level

        return { player_summoner_id, player_account_id, player_profileIconId, player_level }
    }

    // rank_api
    async function rank_api(server, player_summoner_id) {
        const response = await axios.get(`https://${server}.api.riotgames.com/lol/league/v4/entries/by-summoner/${player_summoner_id}?api_key=${riot_API}`)

        console.log(response.data);
        const rank_li = {}

        for (i=0; i<response.data.length; i++) {
            const result = {}
            result['tier'] = response.data[i].tier
            result['rank'] = response.data[i].rank
            result['lp'] = response.data[i].leaguePoints
            result['wins'] = response.data[i].wins ? response.data[i].wins : 0;
            result['losses'] = response.data[i].losses ? response.data[i].losses : 0;
            result['winrate'] = ((100/(Number(result['wins'])+Number(result['losses'])))*Number(result['wins'])).toFixed(0)
            rank_li[response.data[i].queueType] = result
        }
        
        console.log(rank_li)

        // mini_rank
        if (rank_li['RANKED_SOLO_5x5']) {
            solo_rank_text = `${first_upper(rank_li['RANKED_SOLO_5x5']['tier'])} ${rank_li['RANKED_SOLO_5x5']['rank']}`
            console.log(solo_rank_text)
            document.querySelector('#solo_rank_img').setAttribute('src',`https://your.gg/images/emblem/${first_upper(rank_li['RANKED_SOLO_5x5']['tier'])}.png`);
            document.querySelector('#solo_rank').textContent = solo_rank_text
            document.querySelector('#solo_rank_lp').textContent = rank_li['RANKED_SOLO_5x5']['lp']+'LP'
        } else {
            document.querySelector('#solo_rank_img').setAttribute('src', `https://your.gg/images/emblem/Unranked.png`);
            document.querySelector('#solo_rank').textContent = 'Unranked'
            document.querySelector('#solo_rank_lp').textContent = '0LP'
        }

        // main_rank
        if (rank_li['RANKED_SOLO_5x5']) {
            solo_rank_text = `${first_upper(rank_li['RANKED_SOLO_5x5']['tier'])} ${rank_li['RANKED_SOLO_5x5']['rank']}`
            document.querySelector('#main_solo_rank_img').setAttribute('src', `https://your.gg/images/emblem/${first_upper(rank_li['RANKED_SOLO_5x5']['tier'])}.png`);
            document.querySelector('#main_rank_solo').textContent = solo_rank_text
            document.querySelector('#main_lp_solo').textContent = rank_li['RANKED_SOLO_5x5']['lp']+'LP'

            document.querySelector('#main_wins_count_solo').textContent = rank_li['RANKED_SOLO_5x5']['wins']
            document.querySelector('#main_losses_count_solo').textContent = rank_li['RANKED_SOLO_5x5']['losses']
            document.querySelector('#main_winrate_solo').textContent = rank_li['RANKED_SOLO_5x5']['winrate']
        } else {
            document.querySelector('#main_solo_rank_img').setAttribute('src', `https://your.gg/images/emblem/Unranked.png`);
            document.querySelector('#main_rank_solo').textContent = 'Unranked'
            document.querySelector('#main_lp_solo').textContent = '0LP'

            document.querySelector('#main_wins_count_solo').textContent = 0
            document.querySelector('#main_losses_count_solo').textContent = 0
            document.querySelector('#main_winrate_solo').textContent = 0
        }

        if (rank_li['RANKED_FLEX_SR']) {
            flex_rank_text = `${first_upper(rank_li['RANKED_FLEX_SR']['tier'])} ${rank_li['RANKED_FLEX_SR']['rank']}`
            document.querySelector('#main_flex_rank_img').setAttribute('src', `https://your.gg/images/emblem/${first_upper(rank_li['RANKED_FLEX_SR']['tier'])}.png`);
            document.querySelector('#main_rank_flex').textContent = flex_rank_text
            document.querySelector('#main_lp_flex').textContent = rank_li['RANKED_FLEX_SR']['lp']+'LP'

            document.querySelector('#main_wins_count_flex').textContent = rank_li['RANKED_FLEX_SR']['wins']
            document.querySelector('#main_losses_count_flex').textContent = rank_li['RANKED_FLEX_SR']['losses']
            document.querySelector('#main_winrate_flex').textContent = rank_li['RANKED_FLEX_SR']['winrate']
        } else {
            document.querySelector('#main_flex_rank_img').setAttribute('src', `https://your.gg/images/emblem/Unranked.png`);
            document.querySelector('#main_rank_flex').textContent = 'Unranked'
            document.querySelector('#main_lp_flex').textContent = '0LP'

            document.querySelector('#main_wins_count_flex').textContent = 0
            document.querySelector('#main_losses_count_flex').textContent = 0
            document.querySelector('#main_winrate_flex').textContent = 0
        }

        return rank_li
    }

    // mastery_api
    async function mastery_api(player_puuid) {
        const response = await axios.get(`https://kr.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${player_puuid}/top?count=4&api_key=${riot_API}`)
        console.log(response)
        const champion_dict = {266: "Aatrox", 103: "Ahri", 84: "Akali", 166: "Akshan", 12: "Alistar", 32: "Amumu", 34: "Anivia", 1: "Annie", 523: "Aphelios", 22: "Ashe", 136: "AurelionSol", 893: "Aurora", 268: "Azir", 432: "Bard", 200: "Belveth", 53: "Blitzcrank", 63: "Brand", 201: "Braum", 233: "Briar", 51: "Caitlyn", 164: "Camille", 69: "Cassiopeia", 31: "Chogath", 42: "Corki", 122: "Darius", 131: "Diana", 119: "Draven", 36: "DrMundo", 245: "Ekko", 60: "Elise", 28: "Evelynn", 81: "Ezreal", 9: "Fiddlesticks", 114: "Fiora", 105: "Fizz", 3: "Galio", 41: "Gangplank", 86: "Garen", 150: "Gnar", 79: "Gragas", 104: "Graves", 887: "Gwen", 120: "Hecarim", 74: "Heimerdinger", 910: "Hwei", 420: "Illaoi", 39: "Irelia", 427: "Ivern", 40: "Janna", 59: "JarvanIV", 24: "Jax", 126: "Jayce", 202: "Jhin", 222: "Jinx", 145: "Kaisa", 429: "Kalista", 43: "Karma", 30: "Karthus", 38: "Kassadin", 55: "Katarina", 10: "Kayle", 141: "Kayn", 85: "Kennen", 121: "Khazix", 203: "Kindred", 240: "Kled", 96: "KogMaw", 897: "KSante", 7: "Leblanc", 64: "LeeSin", 89: "Leona", 876: "Lillia", 127: "Lissandra", 236: "Lucian", 117: "Lulu", 99: "Lux", 54: "Malphite", 90: "Malzahar", 57: "Maokai", 11: "MasterYi", 902: "Milio", 21: "MissFortune", 62: "MonkeyKing", 82: "Mordekaiser", 25: "Morgana", 950: "Naafiri", 267: "Nami", 75: "Nasus", 111: "Nautilus", 518: "Neeko", 76: "Nidalee", 895: "Nilah", 56: "Nocturne", 20: "Nunu", 2: "Olaf", 61: "Orianna", 516: "Ornn", 80: "Pantheon", 78: "Poppy", 555: "Pyke", 246: "Qiyana", 133: "Quinn", 497: "Rakan", 33: "Rammus", 421: "RekSai", 526: "Rell", 888: "Renata", 58: "Renekton", 107: "Rengar", 92: "Riven", 68: "Rumble", 13: "Ryze", 360: "Samira", 113: "Sejuani", 235: "Senna", 147: "Seraphine", 875: "Sett", 35: "Shaco", 98: "Shen", 102: "Shyvana", 27: "Singed", 14: "Sion", 15: "Sivir", 72: "Skarner", 901: "Smolder", 37: "Sona", 16: "Soraka", 50: "Swain", 517: "Sylas", 134: "Syndra", 223: "TahmKench", 163: "Taliyah", 91: "Talon", 44: "Taric", 17: "Teemo", 412: "Thresh", 18: "Tristana", 48: "Trundle", 23: "Tryndamere", 4: "TwistedFate", 29: "Twitch", 77: "Udyr", 6: "Urgot", 110: "Varus", 67: "Vayne", 45: "Veigar", 161: "Velkoz", 711: "Vex", 254: "Vi", 234: "Viego", 112: "Viktor", 8: "Vladimir", 106: "Volibear", 19: "Warwick", 498: "Xayah", 101: "Xerath", 5: "XinZhao", 157: "Yasuo", 777: "Yone", 83: "Yorick", 350: "Yuumi", 154: "Zac", 238: "Zed", 221: "Zeri", 115: "Ziggs", 26: "Zilean", 142: "Zoe", 143: "Zyra"}
        const champion_dict_ko = {266: "아트록스", 103: "아리", 84: "아칼리", 166: "아크샨", 12: "알리스타", 32: "아무무", 34: "애니비아", 1: "애니", 523: "아펠리오스", 22: "애쉬", 136: "아우렐리온솔", 893: "오로라", 268: "아지르", 432: "바드", 200: "벨베스", 53: "블리츠크랭크", 63: "브랜드", 201: "브라움", 233: "브라이어", 51: "케이틀린", 164: "카밀", 69: "카시오페아", 31: "초가스", 42: "코르키", 122: "다리우스", 131: "다이애나", 119: "드레이븐", 36: "문도 박사", 245: "에코", 60: "엘리스", 28: "이블린", 81: "이즈리얼", 9: "피들스틱", 114: "피오라", 105: "피즈", 3: "갈리오", 41: "갱플랭크", 86: "가렌", 150: "나르", 79: "그라가스", 104: "그레이브즈", 887: "그웬", 120: "헤카림", 74: "하이머딩거", 910: "훼이", 420: "일라오이", 39: "이렐리아", 427: "아이번", 40: "잔나", 59: "자르반 4세", 24: "잭스", 126: "제이스", 202: "진", 222: "징크스", 145: "카이사", 429: "칼리스타", 43: "카르마", 30: "카서스", 38: "카사딘", 55: "카타리나", 10: "케일", 141: "케인", 85: "케넨", 121: "카직스", 203: "킨드레드", 240: "클레드", 96: "코그모", 897: "크산테", 7: "르블랑", 64: "리 신", 89: "레오나", 876: "릴리아", 127: "리산드라", 236: "루시안", 117: "룰루", 99: "럭스", 54: "말파이트", 90: "말자하", 57: "마오카이", 11: "마스터 이", 902: "밀리오", 21: "미스 포츈", 62: "오공", 82: "모데카이저", 25: "모르가나", 950: "나아피리", 267: "나미", 75: "나서스", 111: "노틸러스", 518: "니코", 76: "니달리", 895: "닐라", 56: "녹턴", 20: "누누", 2: "올라프", 61: "오리아나", 516: "오른", 80: "판테온", 78: "뽀삐", 555: "파이크", 246: "키아나", 133: "퀸", 497: "라칸", 33: "람머스", 421: "렉사이", 526: "렐", 888: "레나타 글라스크", 58: "레넥톤", 107: "렝가", 92: "리븐", 68: "럼블", 13: "라이즈", 360: "사미라", 113: "세주아니", 235: "세나", 147: "세라핀", 875: "세트", 35: "샤코", 98: "쉔", 102: "쉬바나", 27: "신지드", 14: "사이온", 15: "시비르", 72: "스카너", 901: "스몰더", 37: "소나", 16: "소라카", 50: "스웨인", 517: "사일러스", 134: "신드라", 223: "탐 켄치", 163: "탈리야", 91: "탈론", 44: "타릭", 17: "티모", 412: "쓰레쉬", 18: "트리스타나", 48: "트런들", 23: "트린다미어", 4: "트위스티드 페이트", 29: "트위치", 77: "우디르", 6: "우르곳", 110: "바루스", 67: "베인", 45: "베이가", 161: "벨코즈", 711: "벡스", 254: "바이", 234: "비에고", 112: "빅토르", 8: "블라디미르", 106: "볼리베어", 19: "워윅", 498: "자야", 101: "제라스", 5: "신 짜오", 157: "야스오", 777: "요네", 83: "요릭", 350: "유미", 154: "자크", 238: "제드", 221: "제리", 115: "직스", 26: "질리언", 142: "조이", 143: "자이라"}

        append_champion_mastery(response.data, champion_dict, champion_dict_ko)
    }

    // match_ids_api
    async function match_ids_api(main_server, player_puuid, search_type) {
        const response = await axios.get(`https://${main_server}.api.riotgames.com/lol/match/v5/matches/by-puuid/${player_puuid}/ids?${search_type}&start=0&count=20&api_key=${riot_API}`)

        console.log(response.data)
        const match_ids = response.data

        return match_ids
    }

    // match_info_api
    async function match_info_api(main_server, match_ids, player_puuid) {
        games_value = {}

        const game_result_dic = {'game_count' : 0, 'win': 0, 'loss': 0 }
        const game_kda_dic = { 'kill': 0, 'death': 0, 'assist': 0 }

        const game_line_dic = {'game_count' : 0, 'TOP': {'win': 0, 'loss': 0}, 'JUNGLE': {'win': 0, 'loss': 0}, 'MIDDLE': {'win': 0, 'loss': 0}, 'BOTTOM': {'win': 0, 'loss': 0}, 'UTILITY': {'win': 0, 'loss': 0}, 'Invalid': {'win': 0, 'loss':0}}

        const game_most_dic = {}

        let frined_dic = {}

        for (let i = 0; i < match_ids.length; i++) {
            const response = await axios.get(`https://${main_server}.api.riotgames.com/lol/match/v5/matches/${match_ids[i]}?api_key=${riot_API}`)
            console.log(`game_${i}`, response.data)
            const game_index = i

            for(let i = 0; i<response.data.info.participants.length; i++) {
                if (response.data.info.participants[i].puuid == player_puuid) {
                    target_player = response.data.info.participants[i]
                }
            }

            for(let i = 0; i<response.data.info.participants.length; i++) {
                if (frined_dic[response.data.info.participants[i].puuid] == undefined) {
                    frined_dic[response.data.info.participants[i].puuid] = {'ally': 0, 'enemy': 0, 'win':0, 'name':(response.data.info.participants[i].riotIdGameName+'#'+response.data.info.participants[i].riotIdTagline)}
                }
                frined_dic[response.data.info.participants[i].puuid][response.data.info.participants[i].teamId == target_player.teamId ? 'ally' : 'enemy'] += 1
                frined_dic[response.data.info.participants[i].puuid]['win'] += ((response.data.info.participants[i].teamId == target_player.teamId) && target_player.win ? 1 : 0)
            }

            game_result_dic['game_count'] += 1;
            game_line_dic['game_count'] += 1;
            target_player.win ? game_result_dic['win'] += 1 : game_result_dic['loss'] += 1

            game_kda_dic['kill'] += (target_player.kills)/match_ids.length
            game_kda_dic['death'] += (target_player.deaths)/match_ids.length
            game_kda_dic['assist'] += (target_player.assists)/match_ids.length

            if (game_most_dic[target_player.championName]) {
                game_most_dic[target_player.championName][target_player.win ? 'win' : 'loss'] += 1
                game_most_dic[target_player.championName]['kill'] += target_player.kills
                game_most_dic[target_player.championName]['death'] += target_player.deaths
                game_most_dic[target_player.championName]['assist'] += target_player.assists
            } else {
                game_most_dic[target_player.championName] = {'win':0, 'loss':0, 'kill':0, 'death':0, 'assist':0, 'name':target_player.championName}
                game_most_dic[target_player.championName][target_player.win ? 'win' : 'loss'] = 1
                game_most_dic[target_player.championName]['kill'] = target_player.kills
                game_most_dic[target_player.championName]['death'] = target_player.deaths
                game_most_dic[target_player.championName]['assist'] = target_player.assists
            }
            game_line_dic[target_player.individualPosition][target_player.win ? 'win' : 'loss'] += 1

            games_data_connector(game_index, target_player, player_puuid, response.data.info)
            console.log(game_result_dic, game_kda_dic, match_ids.length)
        }

        const winrate = ((100/game_result_dic['game_count'])*game_result_dic['win']).toFixed(0)+'%'
        append_winrate_box(game_result_dic, game_kda_dic, winrate)

        append_line_box(game_line_dic)

        let entries = Object.entries(game_most_dic);
        entries.sort((a, b) => (b[1].loss + b[1].win) - (a[1].loss + a[1].win));
        let sortedgame_most_dic = Object.fromEntries(entries)
        let key = Object.keys(sortedgame_most_dic);
        append_most_champion(key, sortedgame_most_dic)

        let frined_dic_entries = Object.entries(frined_dic);
        frined_dic_entries.sort((a, b) => (b[1]['ally'] + b[1]['enemy'])  - (a[1]['ally'] + a[1]['enemy']));
        delete frined_dic_entries[0];
        console.log(frined_dic_entries)
        append_friend_box(frined_dic_entries)
    }

    function games_data_connector(game_index, target_player, player_puuid, response) {
        const game_result = (target_player.win) ? 'win':'loss';
        const game_mode = { 490: '빠른 대전', 450: 'ARAM', 440: '자유 랭크', 420: '솔로 랭크', 1830: '집중 포화'}
        const game_result_text = (target_player.win) ? '승리':'패배';
        const { target_days, game_minutes, game_seconds } = game_time(response.gameCreation, response.gameDuration)

        append_game_div(game_result, game_index);
        append_game_info(game_index, game_mode[response.queueId], game_result_text, target_days, game_minutes, game_seconds)

        const spell_dic = { 1: 'SummonerBoost', 3: 'SummonerExhaust', 4: 'SummonerFlash', 6: 'SummonerHaste', 7: 'SummonerHeal', 11: 'SummonerSmite', 12: 'SummonerTeleport', 14: 'SummonerDot', 21: 'SummonerBarrier', 32: 'SummonerSnowball' };

        append_champion_info(game_index, spell_dic, target_player)

        let max_dps = 0
        const player_dps_dic = {}
        for(let i = 0; i<response.participants.length; i++ ){
            max_dps = response.participants[i].totalDamageDealtToChampions > max_dps ? response.participants[i].totalDamageDealtToChampions : max_dps
            player_dps_dic[response.participants[i].puuid] = response.participants[i].totalDamageDealtToChampions
        }

        if (target_player.teamId == 100) {
            team_kill = 0
            for(let i = 0; i<(response.participants.length > 5 ? 5 : response.participants.length); i++ ) {
                team_kill += response.participants[i].kills
            }
        } else if (target_player.teamId == 200) {
            team_kill = 0
            for(let i = 5; i<response.participants.length; i++ ) {
                team_kill += response.participants[i].kills
            }
        }

        let dps_dic_entries = Object.entries(player_dps_dic);
        dps_dic_entries.sort((a, b) => b[1] - a[1]);
        console.log(dps_dic_entries)

        for(i = 0; i<dps_dic_entries.length; i++) {
            if (dps_dic_entries[i][0] == player_puuid) {
                console.log(i)
                dps_rank = i+1
                break;
            }
        }

        // console.log(dps_rank)

        append_main_game_info(game_index, dps_rank, game_minutes, team_kill, response, target_player)
        if (target_player.doubleKills == 1) {
            document.querySelector(`#multi_kill_${game_index}`).innerHTML = `<p>${'더블 킬'}</p>`
        } else if (target_player.tripleKills == 1) {
            document.querySelector(`#multi_kill_${game_index}`).innerHTML = `<p>${'트리플 킬'}</p>`
        } else if (target_player.quadraKills == 1) {
            document.querySelector(`#multi_kill_${game_index}`).innerHTML = `<p>${'쿼드라 킬'}</p>`
        } else if (target_player.pentaKills == 1) {
            document.querySelector(`#multi_kill_${game_index}`).innerHTML = `<p>${'펜타 킬'}</p>`
        }

        append_player_10(game_index)

        for(let i = 0; i < response.participants.length; i++){
            let player = response.participants[i]
            let player_name = (player.riotIdGameName+'#'+player.riotIdTagline).substring(0, 7)+'...'

            if (response.participants[i].puuid == player_puuid) {
                bold = 'target_bold'
            } else {
                bold = ''
            }

            dps_bar = `style="width:${(response.participants[i].totalDamageDealtToChampions / (max_dps/100)).toFixed(0)}%;"`

            if (i < 5) {
                red_5(game_index, player_name, bold, dps_bar, player)
            } else {
                blue_5(game_index, player_name, bold, dps_bar, player)
            }
        }
    }

    function append_game_div(game_result, game_index) {
        document.querySelector('#games').innerHTML += `
        <div class="game">
            <div class="top">
                <div class="flex ${game_result}_game" id="game_${game_index}">
                </div>
                <div class="advanced_info_btn ${game_result}_info_btn">
                    <p class="material-icons" id="advanced_expand">expand_less</p>
                </div>
            </div>
        </div>
        `
    }
    
    function append_game_info(game_index, game_mode, game_result_text, target_days, game_minutes, game_seconds) {
        document.querySelector(`#game_${game_index}`).innerHTML += `
        <div class="game_info">
            <p id="game_mode">${game_mode}</p>
            <p id="game_date">${target_days}</p>
            <div class="dlvider"></div>
            <p id="game_result">${game_result_text}</p>
            <p id="game_time">${game_minutes}분 ${game_seconds}초</p>
        </div>
        `
    }
    
    function append_champion_info(game_index, spell_dic, target_player) {
        document.querySelector(`#game_${game_index}`).innerHTML += `
        <div class="champion_info">
            <div class="top">
                <div class="champion_icon_level_box">
                    <div class="champion_icon_box">
                        <img src="https://opgg-static.akamaized.net/meta/images/lol/14.14.1/champion/${target_player.championName}.png" alt="" id="champion_icon">
                    </div>
                    <p id="champion_level">${target_player.champLevel}</p>
                </div>
    
                <div class="spell_info">
                    <img src="https://opgg-static.akamaized.net/meta/images/lol/14.14.1/spell/${spell_dic[target_player.summoner1Id]}.png" alt="" id="spell_f" class="spell">
                    <img src="https://opgg-static.akamaized.net/meta/images/lol/14.14.1/spell/${spell_dic[target_player.summoner2Id]}.png" alt="" id="spell_d" class="spell">
                </div>
    
                <div class="rune_info">
                    <div class="rune_background"><img src="https://opgg-static.akamaized.net/meta/images/lol/14.14.1/perk/${target_player.perks.styles[0].selections[0].perk}.png" alt="" id="main_rune" class="rune"></div>
                    <div class="rune_background"><img src="https://opgg-static.akamaized.net/meta/images/lol/14.14.1/perkStyle/${target_player.perks.styles[1].style}.png" alt="" id="sub_rune" class="rune"></div>
                </div>
    
                <div class="kda_info">
                    <p class="kda"><span id="kill_score">${target_player.kills}</span> / <span id="death_score">${target_player.deaths}</span> / <span id="assist_score">${target_player.assists}</span></p>
                    <p class="kda_score"><span id="kda_score">${target_player.challenges.kda.toFixed(1)}</span> KDA</p>
                </div>
            </div>
    
            <div class="bottom">
                <div class="items_info">
                    <div class="item" id="item_0">
                        <img src="https://opgg-static.akamaized.net/meta/images/lol/14.14.1/item/${target_player.item0}.png" id="itme_0" onerror="this.style.display='none'">
                    </div>
                    <div class="item">
                        <img src="https://opgg-static.akamaized.net/meta/images/lol/14.14.1/item/${target_player.item1}.png" id="itme_1" onerror="this.style.display='none'">
                    </div>
                    <div class="item">
                        <img src="https://opgg-static.akamaized.net/meta/images/lol/14.14.1/item/${target_player.item2}.png" id="itme_2" onerror="this.style.display='none'">
                    </div>
                    <div class="item">
                        <img src="https://opgg-static.akamaized.net/meta/images/lol/14.14.1/item/${target_player.item3}.png" id="itme_3" onerror="this.style.display='none'">
                    </div>
                    <div class="item">
                        <img src="https://opgg-static.akamaized.net/meta/images/lol/14.14.1/item/${target_player.item4}.png" id="itme_4" onerror="this.style.display='none'">
                    </div>
                    <div class="item">
                        <img src="https://opgg-static.akamaized.net/meta/images/lol/14.14.1/item/${target_player.item5}.png" id="itme_5" onerror="this.style.display='none'">
                    </div>
                    <div class="item">
                        <img src="https://opgg-static.akamaized.net/meta/images/lol/14.14.1/item/${target_player.item6}.png" id="ward" onerror="this.style.display='none'">
                    </div>
                </div>
            </div>
        </div>
        <div class="verticalline"></div>
        `
    }
    
    function append_main_game_info(game_index, dps_rank, game_minutes, team_kill, response, target_player) {
        document.querySelector(`#game_${game_index}`).innerHTML += `
        <div class="main_game_info">
            <div class="game_score">
                <p><span>딜량</span> ${dps_rank}등</p>
                <p><span>분당</span> ${((target_player.totalMinionsKilled + target_player.totalEnemyJungleMinionsKilled + target_player.totalAllyJungleMinionsKilled)/game_minutes).toFixed(1)} CS</p>
                <p><span>킬관여</span> ${((100/team_kill)*(target_player.kills+target_player.assists)).toFixed(0)} %</p>
            </div>
            <div class="multi_kill" id="multi_kill_${game_index}">
            </div>
        </div>
        `
    }
    
    function append_player_10(game_index) {
        document.querySelector(`#game_${game_index}`).innerHTML += `
        <div class="player_10">
            <div class="blue_team team" id="blue_p5_${game_index}"></div>
            <div class="red_team team" id="red_p5_${game_index}"></div>
        </div>
        `
    }

    function red_5(game_index, player_name, bold, dps_bar, player) {
        document.querySelector(`#blue_p5_${game_index}`).innerHTML += `
        <div class="player">
            <div class="champion_icon_box blue_icon">
                <img src="https://opgg-static.akamaized.net/meta/images/lol/14.14.1/champion/${player.championName}.png" alt="" id="champion_icon">
            </div>
            <div class="player_10_name">
                <p class="player_name ${bold}">${player_name}</p>
                <div class="progress-bar">           
                    <div class="blue_bar" ${dps_bar}></div>
                </div>
            </div>
        </div>
        `
    }

    function blue_5(game_index, player_name, bold, dps_bar, player) {
        document.querySelector(`#red_p5_${game_index}`).innerHTML += `
        <div class="player">
            <div class="player_10_name">
                <p class="player_name ${bold}">${player_name}</p>
                <div class="progress-bar">           
                    <div class="red_bar" ${dps_bar}></div>
                </div>
            </div>
            <div class="champion_icon_box red_icon">
                <img src="https://opgg-static.akamaized.net/meta/images/lol/14.14.1/champion/${player.championName}.png" alt="" id="champion_icon">
            </div>
        </div>
        `
    }

    // win_rate 
    function append_winrate_box(game_result_dic, game_kda_dic, winrate) {
        document.querySelector('#main_rigth').innerHTML += `
        <div class="winrate">
            <div class="rate_box">
                <div class="top">
                    <p class="history">${game_result_dic['game_count']}전 ${game_result_dic['win']}승 ${game_result_dic['loss']}패</p>
                </div>
                <div class="bottom winrate_bottom">
                    <div class="donut" style="background: conic-gradient(#3F8BC9 0% ${winrate}, #828799 ${winrate} 100%);"><span class="center">${winrate}</span></div>
                <div class="kda_history">
                    <p class="kda_rate">${((game_kda_dic['kill']+game_kda_dic['assist'])/game_kda_dic['death'].toFixed(1)).toFixed(2)} KDA</p>
                    <p class="k_d_a_rate">${game_kda_dic['kill'].toFixed(1)} / ${game_kda_dic['death'].toFixed(1)} / ${game_kda_dic['assist'].toFixed(1)}</p>
                </div>
            </div>
        </div>
        `
    }

    function append_most_champion(key, sortedgame_most_dic) {
        document.querySelector('.winrate').innerHTML += `
        <div class="most_champion_box">
            <p>모스트 3 챔피언</p>
            <div class="most_champions">
            </div>
        </div>
        `

        for(let i = 0; i<(sortedgame_most_dic.length < 3 ? sortedgame_most_dic.length:3); i++) {
            game_count = (sortedgame_most_dic[key[i]]['win']+sortedgame_most_dic[key[i]]['loss'])
            kda = (((sortedgame_most_dic[key[i]]['kill']/game_count)+(sortedgame_most_dic[key[i]]['assist']/game_count))/(sortedgame_most_dic[key[i]]['death']/game_count)).toFixed(2)
            winrate = ((100/game_count)*sortedgame_most_dic[key[i]]['win']).toFixed(1)

            if (winrate > 67){
                winrate_css = 'most_blue'
            } else if (winrate < 33) {
                winrate_css = 'most_red'
            } else {
                winrate_css = 'most_white'
            }

            document.querySelector('.most_champions').innerHTML += `
            <div class="most_champion">
                <div class="champion_icon_box">
                    <img src="https://opgg-static.akamaized.net/meta/images/lol/14.14.1/champion/${sortedgame_most_dic[key[i]]['name']}.png" alt="">
                </div>
                <div class="most_info">
                    <p class="most_winrate ${winrate_css}">${winrate}%</p>
                    <p>${sortedgame_most_dic[key[i]]['win']}승 ${sortedgame_most_dic[key[i]]['loss']}패</p>
                    <p>${kda} KDA</p>
                </div>
            </div>
            `
        }
    }

    function append_champion_mastery(response, champion_dict, champion_dict_ko) {
        document.querySelector('#main_left').innerHTML += `
        <div class="champion_mastery_box">
            <p class="header_text">숙련도</p>
            <div class="champions">
            </div>
        </div>
        `

        for(let i = 0; i<response.length; i++) {
            document.querySelector('.champions').innerHTML += `
            <div class="champion">
                <div class="champion_icon_box">
                    <img src="https://opgg-static.akamaized.net/meta/images/lol/14.14.1/champion/${champion_dict[response[i].championId]}.png" alt="">
                </div>
                <img src="https://s-lol-web.op.gg/static/images/mastery/mastery-${ (11 > response[i].championLevel) ? response[i].championLevel : 10 }.png" alt="" id="mastery_icon">
                <p class="mastery_level">${response[i].championLevel}</p>
                <p class="name">${champion_dict_ko[response[i].championId]}</p>
                <div class="dlvider"></div>
                <p class="point">${(response[i].championPoints).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</p>
                <p class="point">포인트</p>
            </div>
            `
        }
    }

    function line_text1(game_line_dic, line) {
        if (game_line_dic[line]['win']+game_line_dic[line]['loss'] == 0) {
            return '0.0'
        } else {
            return ((100/game_line_dic['game_count'])*(game_line_dic[line]['win']+game_line_dic[line]['loss'])).toFixed(1)
        }
    }

    function line_text2(game_line_dic, line) {
        if (game_line_dic[line]['win']+game_line_dic[line]['loss'] == 0) {
            return '0.0'
        } else {
            return ((100/(game_line_dic[line]['win']+game_line_dic[line]['loss']))*game_line_dic[line]['win']).toFixed(1)
        }
    }

    function append_line_box(game_line_dic) {
        game_line_dic['game_count'] -= (game_line_dic['Invalid']['win'] + game_line_dic['Invalid']['loss'])

        document.querySelector('#main_left').innerHTML += `
        <div class="line_box">
            <div class="line_info_first line_info">
                <p>비율</p>
                <p>승률</p>
                <p>게임수</p>
            </div>

            <div class="line_info">
                <img src="https://s-lol-web.op.gg/images/icon/icon-position-top.svg?v=1721451321478" alt="">
                <p>${line_text1(game_line_dic, 'TOP')}%</p>
                <p>${line_text2(game_line_dic, 'TOP')}%</p>
                <p>${game_line_dic['TOP']['win']+game_line_dic['TOP']['loss']}</p>
            </div>

            <div class="line_info">
                <img src="https://s-lol-web.op.gg/images/icon/icon-position-jungle.svg?v=1721451321478" alt="">
                <p>${line_text1(game_line_dic, 'JUNGLE')}%</p>
                <p>${line_text2(game_line_dic, 'JUNGLE')}%</p>
                <p>${game_line_dic['JUNGLE']['win']+game_line_dic['JUNGLE']['loss']}</p>
            </div>

            <div class="line_info">
                <img src="https://s-lol-web.op.gg/images/icon/icon-position-mid.svg?v=1721451321478" alt="">
                <p>${line_text1(game_line_dic, 'MIDDLE')}%</p>
                <p>${line_text2(game_line_dic, 'MIDDLE')}%</p>
                <p>${game_line_dic['MIDDLE']['win']+game_line_dic['MIDDLE']['loss']}</p>
            </div>

            <div class="line_info">
                <img src="https://s-lol-web.op.gg/images/icon/icon-position-adc.svg?v=1721451321478" alt="">
                <p>${line_text1(game_line_dic, 'BOTTOM')}%</p>
                <p>${line_text2(game_line_dic, 'BOTTOM')}%</p>
                <p>${game_line_dic['BOTTOM']['win']+game_line_dic['BOTTOM']['loss']}</p>
            </div>

            <div class="line_info">
                <img src="https://s-lol-web.op.gg/images/icon/icon-position-support.svg?v=1721451321478" alt="">
                <p>${line_text1(game_line_dic, 'UTILITY')}%</p>
                <p>${line_text2(game_line_dic, 'UTILITY')}%</p>
                <p>${game_line_dic['UTILITY']['win']+game_line_dic['UTILITY']['loss']}</p>
            </div>
        </div>
        `
    }

    function append_friend_box(frined_dic_entries) {
        document.querySelector('#main_left').innerHTML += `
        <div class="friend_box">
            <p>최근 20 게임 같이 플레이한 소환사들 (상대팀 포함)</p>
            <div class="friend_info">
                <p class="friend_info_first">소환사</p>
                <p>내팀</p>
                <p>상대팀</p>
                <p>내팀 승률</p>
            </div>
            <div class="friends" id="friends">
            </div>
        </div>
        `

        for(let i = 1; i<frined_dic_entries.length; i++) {
            console.log(frined_dic_entries[i][1]['ally'] + frined_dic_entries[i][1]['enemy'])
            if (frined_dic_entries[i][1]['ally'] + frined_dic_entries[i][1]['enemy'] > 2 && frined_dic_entries[i][1]['ally'] > 1) {

                document.querySelector('#friends').innerHTML += `
                <div class="friend">
                    <p>${frined_dic_entries[i][1]['name']}</p>
                    <p>${frined_dic_entries[i][1]['ally']}</p>
                    <p>${frined_dic_entries[i][1]['enemy']}</p>
                    <p class="${((100/frined_dic_entries[i][1]['ally'])*frined_dic_entries[i][1]['win']).toFixed(0) > 66 ? 'green_font' : ''}">${((100/frined_dic_entries[i][1]['ally'])*frined_dic_entries[i][1]['win']).toFixed(0)}%</p>
                </div>
                `
            }

        }
    }

    function player_10(target_game) {
        const player_10_info = {}
        for(let i = 0; i<(target_game.length); i++ ) {
            const result = {}

            // player_info
            const player_info = {}
            player_info['player_name'] = target_game[i].riotIdGameName
            player_info['player_tag'] = target_game[i].riotIdGameTag
            player_info['player_puuid'] = target_game[i].puuid
            result['player_info'] = player_info

            // game_info
            const game_info = {}
            result['game_result'] = target_game[i].win
            game_info['kills'] = target_game[i].kills
            game_info['deaths'] = target_game[i].deaths
            game_info['assists'] = target_game[i].assists
            
            result['game_info'] = game_info

            // champion 
            const champion = {}
            champion['champion_id'] = target_game[i].championId
            champion['champion_level'] = target_game[i].champLevel
            champion['champion_name'] = target_game[i].championName

            // items
            const items = {}

            // multi_kill
            const multi_kill = {}
            
            console.log(result)
            player_10_info[target_game[i].puuid] = result
        }
    }

    async function display_player_info(input_name, input_tag, search_type) {

        // select에서 서버를 골라 가져오기
        const main_server = server_location.textContent

        // puuid_api
        const { player_puuid, player_name, player_tag } = await puuid_api(main_server, input_name, input_tag);

        // server select
        const server = await server_api(main_server, player_puuid);

        // summoner_id_api
        const { player_summoner_id, player_account_id, player_profileIconId, player_level } = await summoner_id_api(server, player_puuid);
    
        // rank_api
        const rank_li = await rank_api(server, player_summoner_id);

        // match_ids_api
        const match_ids = await match_ids_api(main_server, player_puuid, search_type);

        //mastery
        mastery_api(player_puuid)

        // match_info
        match_info_api(main_server, match_ids, player_puuid)

    }

    // -search_bar-
    const player_name_tag = document.querySelector('#game_name');
    const select_box = document.querySelector('.server_location_select');
    const select_hidden_box = document.querySelector('.server_location_btnbox');
    const server_location = document.querySelector('#server_location');
    const expand = document.querySelector('#expand');
    const search_btn = document.querySelector('#search_btn');

// eventlistener

    // location_select_box
    select_box.addEventListener('click', () => {
        if (select_hidden_box.classList.contains('hidden')) {
            select_hidden_box.classList.remove('hidden');
            expand.textContent = 'expand_more';
        } else {
            select_hidden_box.classList.add('hidden');
            expand.textContent = 'expand_less';
        };
    })

    // location_select_btn
    select_hidden_box.addEventListener('click', (e) => {
        server_location.textContent = e.target.textContent
    });

    // search_btn
    search_btn.addEventListener('click', () => {
        search()
    });


    document.addEventListener('keydown', (e) => {
        if (document.querySelector('#game_name') && e.code == 'Enter') {
            search()
        }
    })

    // game_mode_select_btn
    document.querySelector('.game_mode_select_box').addEventListener('click', (e) => {
        console.log(e.target.classList)

        if (e.target.classList[1] == undefined && e.target.classList[0] == 'game_mode_select') {
            document.querySelector('.selected').classList.remove('selected')
            e.target.classList.add('selected')

            search()
        }
    })

    //전적갱신
    document.querySelector('#reload_btn').addEventListener('click', () => {
        document.querySelector('#game_name').value = document.querySelector('#player_name').textContent + document.querySelector('#player_tag').textContent
        search()
    })

    // input 초기화
    document.querySelector('#game_name').addEventListener('click', () => {
        document.querySelector('#game_name').value = ''
    })

    display_player_info('Blue', 'kr33', '')
});
