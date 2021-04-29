const auth = require('./auth.json');
const axios = require('axios');
const MongoClient = require('mongodb').MongoClient;

const url = 'mongodb://localhost/LoLWinrates';
let matchesToQuery = [];
let pid = '';




//https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/Zkw3ioDdn1ooWvk779ib5AJJy-PELX0I7GWW68TTfRdOOh6hqRW_n20rB5sUz8_pYaULFGlcWL16xw/ids?start=0&count=20
const getMatchLists = (puuid) => {
    axios.get(`https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/${pid}/ids?start=0&count=20&api_key=${auth.key}`,
        {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.85 Safari/537.36",
                "Accept-Language": "en-US,en;q=0.9",
                "Accept-Charset": "application/x-www-form-urlencoded; charset=UTF-8",
                "Origin": "https://developer.riotgames.com",
                /*   "X-Riot-Token": `${auth.key}` */
            }
        }).then((response) => {
            console.log('RESDFAP', response.data) ;
        }).catch((e) => {
            console.error(e);
        })
}

axios.get(`https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/sentientAI?api_key=${auth.key}`,
{
    headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.85 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Charset": "application/x-www-form-urlencoded; charset=UTF-8",
        "Origin": "https://developer.riotgames.com",
        /*   "X-Riot-Token": `${auth.key}` */
    }
}).then((response) => {
    console.log('promise done');
    const { puuid, accountId } = response.data;
    console.log('PUUID: ', puuid);
    console.log('ACC ID: ', accountId);
    pid = puuid;
    const list = getMatchLists(pid);
    console.log(list);
}).catch((e) => {
    console.error(e);
})

/* MongoClient.connect(url, {useUnifiedTopology: true }, async(err, client)=>{
    console.log('Connected');
    const db = client.db('LoLWinrates');
    console.log(db);
    await db.collection('matches').insertOne({
        champion: 5,
    }) 
    client.close();
     db.collection; 
     db.close(); 
}); */
/*
axios.post('https://na1.api.riotgames.com/lol/platform/v3/champion-rotations', 
            { headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36",
                "Accept-Language": "en-US,en;q=0.9",
                "Accept-Charset": "application/x-www-form-urlencoded; charset=UTF-8",
                "Origin": "https://developer.riotgames.com",
                "X-Riot-Token": {apiKey}
                }
    }).then( (response) => {
        console.log('promise done');
        const {data} = response.data;
        for(let champ in data){
            console.log(champ);
            allChamps.push(champ);
        }
    }).catch( (e) => {
        console.error(e);
    })

 */

async function getAllChampNames() {
    const allChamps = [];
    try {
        const prom = axios.get('http://ddragon.leagueoflegends.com/cdn/10.16.1/data/en_US/champion.json',
            {
                params: {
                    ID: 'RGAPI-cbb4716d-90f4-4cb9-b571-98d8b6309c61'
                }
            });
        const response = await prom;
        const { data } = response.data;
        for (let champ in data) {
            /*          console.log(champ); */
            allChamps.push(champ);
        }

        return allChamps;
    } catch (err) { console.error(err) }
}

const allChamps = getAllChampNames();
 /*    console.log(allChamps); */