const riot_API = 'RGAPI-2b3aaa53-82c7-4995-9c4d-9f30dd57d041';

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

        return response.data
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
        const result = await match_ids_api(main_server, player_puuid);
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
    })

    // search_btn
    search_btn.addEventListener('click', () => {
        if (player_name_tag.value != '') {
            reload()
        } else {
            console.log('입력해주세요');
        }
    })

});