const riot_API = 'RGAPI-f1205add-558b-4d45-9cf7-b75423b9aabd';

document.addEventListener('DOMContentLoaded', () => {

    function first_upper(target) {
        result = target[0].toUpperCase() + target.substring(1, target.length).toLowerCase()
        console.log(result)
        return result
    }
    
    // --functions--
    function reload() {
        display_player_info()
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
    async function match_ids_api(main_server, player_puuid) {
        const response = await axios.get(`https://${main_server}.api.riotgames.com/lol/match/v5/matches/by-puuid/${player_puuid}/ids?start=0&count=20&api_key=${riot_API}`)
        console.log(response.data)
        const match_ids = response.data

        return match_ids
    }

    // match_info_api
    async function match_info_api(main_server, match_ids) {
        for (let i = 0; i < 20; i++) {
            const response = await axios.get(`https://${main_server}.api.riotgames.com/lol/match/v5/matches/${match_ids[i]}?api_key=${riot_API}`)
            console.log(`game_${i}`, response.data)

            const game_index = i

            // player_10
            player_10(match_ids[i], response.data.participants)

            // game_mode
            if(response.data.info.queueId == 490) { //일반게임
                const game_mode = "빠른 대전"
            }
            else if (response.data.info.queueId == 450) { // 칼바람
                const game_mode = "ARAM"
            }
            else if (response.data.info.queueId == 440) { // 자랭
                const game_mode = "자유 랭크"
            }
            else if (response.data.info.queueId == 420) { // 솔랭
                const game_mode = "솔로 랭크"
            }
            else if (response.data.info.queueId == 1830 ) { // 집중포화
                const game_mode = "집중포화"
            }

            // player_10


            display_game_info(
                game_result, game_mode, game_index,)
        }
    }

    function player_10(match_id, player_10) {
        

        for(let i = 0; i<(player_10.length); i++ ) {
            const player_10 = {} 
            const Blue = {}
            const Red = {}
            

        }
    }



    async function display_player_info() {
        // 입력바에서 name#tag를 받아와 #을 기준으로 분리
        console.log(player_name_tag.value)
        const name_tag_li = player_name_tag.value.split('#')
        console.log(name_tag_li)
        const input_name = name_tag_li[0]
        const input_tag = name_tag_li[1]

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
        const match_ids = await match_ids_api(main_server, player_puuid);

        // match_info
        match_info_api(main_server, match_ids)
    }

    function display_game_info() {
        document.querySelector('.games').innerHTML += `
        <div class="game ${game_result}_game" id="game_0">
            <div class="game_info">
                <p id="game_mode">${game_mode}</p>
                <p id="game_date">12일 전</p>
                <div class="dlvider"></div>
                <p id="game_result">승리</p>
                <p id="game_time">26분 31초</p>
            </div>

            <div class="champion_info">
                <div class="top">
                    <div class="champion_icon_level_box">
                        <div class="champion_icon_box">
                            <img src="https://opgg-static.akamaized.net/meta/images/lol/14.14.1/champion/Teemo.png" alt="" id="champion_icon">
                        </div>
                        <p id="champion_level">18</p>
                    </div>

                    <div class="spell_info">
                        <img src="https://opgg-static.akamaized.net/meta/images/lol/14.14.1/spell/SummonerFlash.png" alt="" id="spell_f" class="spell">
                        <img src="https://opgg-static.akamaized.net/meta/images/lol/14.14.1/spell/SummonerDot.png" alt="" id="spell_d" class="spell">
                    </div>

                    <div class="rune_info">
                        <div class="rune_background"><img src="https://opgg-static.akamaized.net/meta/images/lol/14.14.1/perk/8439.png" alt="" id="main_rune" class="rune"></div>
                        <div class="rune_background"><img src="https://opgg-static.akamaized.net/meta/images/lol/14.14.1/perkStyle/8000.png" alt="" id="sub_rune" class="rune"></div>
                    </div>

                    <div class="kda_info">
                        <p class="kda"><span id="kill_score">10</span> / <span id="death_score">1</span> / <span id="assist_score">0</span></p>
                        <p class="kda_score"><span id="kda_score">10.0</span> KDA</p>
                    </div>
                </div>

                <div class="bottom">
                    <div class="items_info">
                        <div class="item" id="item_0">
                            <img src="https://opgg-static.akamaized.net/meta/images/lol/14.14.1/item/3031.png" alt="" >
                        </div>
                        <div class="item">
                            <img src="" id="itme_1" onerror="this.style.display='none'">
                        </div>
                        <div class="item">
                            <img src="" id="itme_2" onerror="this.style.display='none'">
                        </div>
                        <div class="item">
                            <img src="" id="itme_3" onerror="this.style.display='none'">
                        </div>
                        <div class="item">
                            <img src="" id="itme_4" onerror="this.style.display='none'">
                        </div>
                        <div class="item">
                            <img src="" id="itme_5" onerror="this.style.display='none'">
                        </div>
                        <div class="item">
                            <img src="" id="ward" onerror="this.style.display='none'">
                        </div>
                    </div>
                </div>
            </div>

            <div class="game_info">

            </div>
        </div>`
        
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
            reload()
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
            // 함수와 연결
        }
    })
});