const riot_API = 'RGAPI-2b3aaa53-82c7-4995-9c4d-9f30dd57d041';

document.addEventListener('DOMContentLoaded', () => {
    
    // functions
    function reload() {
        display_player_info()
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
        const puuid_api = `https://${main_server}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${input_name}/${input_tag}?api_key=${riot_API}`

        // puuid_api
        await axios.get(puuid_api)
            .then(async function (response) {
                console.log(response.data);
                console.log(response.data.puuid)
                player_puuid = response.data.puuid
                player_name = response.data.gameName
                player_tag = '#'+response.data.tagLine

                post_player_name.innerHTML = player_name
                post_player_tag.textContent = player_tag
        })

        // server select
        const server_api = `https://${main_server}.api.riotgames.com/lol/match/v5/matches/by-puuid/${player_puuid}/ids?start=0&count=1&api_key=${riot_API}`
        
        await axios.get(server_api)
            .then(function (response) {
                const last_game = response.data[0].split('_')
                server = last_game[0]

                post_player_location.textContent = server
        });

        // summoner_id_api
        const summoner_id_api = `https://${server}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${player_puuid}?api_key=${riot_API}`

        await axios.get(summoner_id_api)
            .then(function (response) {
                console.log(response.data);
                player_summoner_id = response.data.id
                player_account_id = response.data.account_id
                player_profileIconId = response.data.profileIconId
                player_level = response.data.summonerLevel

                profile_icon.src = `https://opgg-static.akamaized.net/meta/images/profile_icons/profileIcon${player_profileIconId}.jpg`
                post_player_level.textContent = player_level
            })
        
        // rank_api
        const rank_api = `https://${server}.api.riotgames.com/lol/league/v4/entries/by-summoner/${player_summoner_id}?api_key=${riot_API}`
        
        await axios.get(rank_api)
            .then(function (response) {
                console.log(response.data);
                rank_li = {}

                for (i=0; i<response.data.length; i++) {
                    const result = {}
                    result['tier'] = response.data[i].tier
                    result['rank'] = response.data[i].rank
                    result['lp'] = response.data[i].leaguePoints
                    
                    rank_li[response.data[i].queueType] = result
                }
                console.log(rank_li)

                solo_rank_text = `${rank_li['RANKED_SOLO_5x5']['tier']} ${rank_li['RANKED_SOLO_5x5']['rank']}`
                console.log(solo_rank_text)
                mini_rank_icon.src = `https://your.gg/images/emblem/${rank_li['RANKED_SOLO_5x5']['tier']}.png`
                post_mini_rank.textContent = solo_rank_text
                post_mini_rank_lp.textContent = rank_li['RANKED_SOLO_5x5']['lp']+'LP'
            })
    }   



    // -search_bar-
    const player_name_tag = document.querySelector('#game_name')
    const select_box = document.querySelector('.server_location_select');
    const select_hidden_box = document.querySelector('.server_location_btnbox');
    const server_location = document.querySelector('#server_location');
    const expand = document.querySelector('#expand');
    const search_btn = document.querySelector('#search_btn');

    // -player info-
    const post_player_name = document.querySelector('#player_name')
    const post_player_tag = document.querySelector('#player_tag')
    const profile_icon = document.querySelector('#player_icon')
    const post_player_level = document.querySelector('#player_level')
    const post_player_location = document.querySelector('#player_location')
    const mini_rank_icon = document.querySelector('#solo_rank_img')
    const post_mini_rank = document.querySelector('#solo_rank')
    const post_mini_rank_lp = document.querySelector('#solo_lp')

    // location_select_box
    select_box.addEventListener('click', () => {
        if (select_hidden_box.classList.contains('hidden')) {
            select_hidden_box.classList.remove('hidden');
            expand.textContent = 'expand_more'
        } else {
            select_hidden_box.classList.add('hidden');
            expand.textContent = 'expand_less'
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
            console.log('입력해주세요')
        }
    })
});