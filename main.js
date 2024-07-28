const riot_API = 'RGAPI-44b308e2-d046-445b-92ea-80438e6b334d';

document.addEventListener('DOMContentLoaded', () => {

    function first_upper(target) {
        result = target[0].toUpperCase() + target.substring(1, target.length).toLowerCase()
        console.log(result)
        return result
    }
    
    // --functions--
    function search() {
        document.querySelector('.games').innerHTML = ''

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

    function game_time(gameCreation, gameDuration) {
        const date = new Date()

        let target_days = ((date - gameCreation)/ 86400000).toFixed(0)
        console.log(target_days)

        if (target_days == 1) {
            target_days = '하루 전'
        } else if (target_days < 31) {
            target_days = `${target_days}일 전`
        } else if (target_days >= 31) {
            target_days = '오래 전'
        }

        const game_minutes = (gameDuration / 60).toFixed(0)
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

        append_champion_mastery(response.data, champion_dict)
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

        const game_line_dic = { 'game_count' : 0, 't': {'win': 0, 'loss': 0}, 'j': {'win': 0, 'loss': 0}, 'm': {'win': 0, 'loss': 0}, 'a': {'win': 0, 'loss': 0}, 's': {'win': 0, 'loss': 0},}

        for (let i = 0; i < match_ids.length; i++) {
            const response = await axios.get(`https://${main_server}.api.riotgames.com/lol/match/v5/matches/${match_ids[i]}?api_key=${riot_API}`)
            console.log(`game_${i}`, response.data)
            const game_index = i

            for(let i = 0; i<response.data.info.participants.length; i++) {
                if (response.data.info.participants[i].puuid == player_puuid) {
                    target_player = response.data.info.participants[i]
                }
            }

            game_result_dic['game_count'] += 1;
            target_player.win ? game_result_dic['win'] += 1 : game_result_dic['loss'] += 1

            game_kda_dic['kill'] += (target_player.kills)/match_ids.length
            game_kda_dic['death'] += (target_player.deaths)/match_ids.length
            game_kda_dic['assist'] += (target_player.assists)/match_ids.length

            games_data_connector(game_index, target_player, player_puuid, response.data.info)
            console.log(game_result_dic, game_kda_dic, match_ids.length)
            const winrate = ((100/game_result_dic['game_count'])*game_result_dic['win']).toFixed(0)+'%'
            append_winrate_box(game_result_dic, game_kda_dic, winrate)
        }

        // console.log(game_result_dic, game_kda_dic, match_ids.length)
        // const winrate = ((100/game_result_dic['game_count'])*game_result_dic['win']).toFixed(0)+'%'
        // append_winrate_box(game_result_dic, game_kda_dic, winrate)
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


        append_main_game_info(game_index)
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
        let max_dps = 0
        for(let i = 0; i<response.participants.length; i++ ){
            max_dps = response.participants[i].totalDamageDealtToChampions > max_dps ? response.participants[i].totalDamageDealtToChampions : max_dps
            console.log(max_dps)
        }

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
                blue_5(game_index, player_name, bold, dps_bar, player)
            } else {
                red_5(game_index, player_name, bold, dps_bar, player)
            }
        }
    }

    function append_game_div(game_result, game_index) {
        document.querySelector('.games').innerHTML += `
        <div class="game">
            <div class="flex ${game_result}_game" id="game_${game_index}">
            </div>
            <div class="advanced_info_btn ${game_result}_info_btn">
                <p class="material-icons" id="advanced_expand">expand_less</p>
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
    
    function append_main_game_info(game_index) {
        document.querySelector(`#game_${game_index}`).innerHTML += `
        <div class="main_game_info">
            <div class="game_score">
                <p><span>딜량</span> 1등</p>
                <p><span>분당</span> 7.9 CS</p>
                <p><span>킬관여</span> 51%</p>
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

    function blue_5(game_index, player_name, bold, dps_bar, player) {
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

    function red_5(game_index, player_name, bold, dps_bar, player) {
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
        document.querySelector('.winrate_top').innerHTML = `
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
        `
    }

    function append_champion_mastery(response, champion_dict) {
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
                <p class="name">${champion_dict[response[i].championId]}</p>
                <div class="dlvider"></div>
                <p class="point">${(response[i].championPoints).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</p>
                <p class="point">포인트</p>
            </div>
            `
        }
    }

    function append_line_box() {
        document.querySelector('#main_left').innerHTML += `
        <div class="line_box">
            <div class="line_info_first line_info">
                <p>비율</p>
                <p>승률</p>
                <p>게임수</p>
            </div>

            <div class="line_info">
                <img src="https://s-lol-web.op.gg/images/icon/icon-position-top.svg?v=1721451321478" alt="">
                <p>0%</p>
                <p>0%</p>
                <p>0</p>
            </div>

            <div class="line_info">
                <img src="https://s-lol-web.op.gg/images/icon/icon-position-jungle.svg?v=1721451321478" alt="">
                <p>0%</p>
                <p>0%</p>
                <p>0</p>
            </div>

            <div class="line_info">
                <img src="https://s-lol-web.op.gg/images/icon/icon-position-mid.svg?v=1721451321478" alt="">
                <p>0%</p>
                <p>0%</p>
                <p>0</p>
            </div>

            <div class="line_info">
                <img src="https://s-lol-web.op.gg/images/icon/icon-position-adc.svg?v=1721451321478" alt="">
                <p>0%</p>
                <p>0%</p>
                <p>0</p>
            </div>

            <div class="line_info">
                <img src="https://s-lol-web.op.gg/images/icon/icon-position-support.svg?v=1721451321478" alt="">
                <p>0%</p>
                <p>0%</p>
                <p>0</p>
            </div>
        </div>
        `
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
        if (player_name_tag.value != '') {
            search()
        } else {
            console.log('입력해주세요');
        }
    });

    // game_mode_select_btn
    document.querySelector('.game_mode_select_box').addEventListener('click', (e) => {
        console.log(e.target.classList)

        if (e.target.classList[1] == undefined && e.target.classList[0] == 'game_mode_select') {
            document.querySelector('.selected').classList.remove('selected')
            e.target.classList.add('selected')

            search()
        }
    })
});