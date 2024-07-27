const riot_API = 'RGAPI-53399241-4c55-4eb1-9670-eeddf53b04aa';

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

        for (let i = 0; i < 20; i++) {
            const response = await axios.get(`https://${main_server}.api.riotgames.com/lol/match/v5/matches/${match_ids[i]}?api_key=${riot_API}`)
            console.log(`game_${i}`, response.data)
            const game_index = i
            for(let i = 0; i<response.data.info.participants.length; i++) {
                if (response.data.info.participants[i].puuid == player_puuid) {
                    target_player = response.data.info.participants[i]
                }
            }

            data_connector(game_index, target_player, response.data.info)
        }
    }

    function data_connector(game_index, target_player, response) {
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
        for(let i = 0; i < response.participants.length; i++){
            let player = response.participants[i]
            let player_name = (player.riotIdGameName+'#'+player.riotIdTagline).substring(0, 7)+'...'

            if (i < 5) {
                blue_5(game_index, player_name, player)
            } else {
                red_5(game_index, player_name, player)
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

    function blue_5(game_index, player_name, player) {
        document.querySelector(`#blue_p5_${game_index}`).innerHTML += `
        <div class="player">
            <div class="champion_icon_box blue_icon">
                <img src="https://opgg-static.akamaized.net/meta/images/lol/14.14.1/champion/${player.championName}.png" alt="" id="champion_icon">
            </div>
            <p class="player_name">${player_name}</p>
        </div>
        `
    }

    function red_5(game_index, player_name, player) {
        document.querySelector(`#red_p5_${game_index}`).innerHTML += `
        <div class="player">
            <p class="player_name">${player_name}</p>
            <div class="champion_icon_box red_icon">
                <img src="https://opgg-static.akamaized.net/meta/images/lol/14.14.1/champion/${player.championName}.png" alt="" id="champion_icon">
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