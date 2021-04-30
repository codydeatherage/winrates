const auth = require('./auth.json');
const axios = require('axios');
const MongoClient = require('mongodb').MongoClient;

const url = 'mongodb://localhost/LoLWinrates';
let matchesToQuery = [];
let matchesCounted = [];




//https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/Zkw3ioDdn1ooWvk779ib5AJJy-PELX0I7GWW68TTfRdOOh6hqRW_n20rB5sUz8_pYaULFGlcWL16xw/ids?start=0&count=20
const getMatchLists = async (pid) => {
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
            for (let match of response.data) {
                let id = match.slice(4);
               
                if(!matchesCounted.includes(id)){
                    matchesToQuery.push(id);
                    matchesCounted.push(id);
                }
            }
        }).catch((e) => {
            console.error(e);
        })
        .then(() => {
            console.log('Generated Match List', matchesToQuery);
        })
}

const getPuuidByName = (name) => {
    console.log('Input Name: ', name);
    let pid = '';
    axios.get(`https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${name}?api_key=${auth.key}`,
        {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.85 Safari/537.36",
                "Accept-Language": "en-US,en;q=0.9",
                "Accept-Charset": "application/x-www-form-urlencoded; charset=UTF-8",
                "Origin": "https://developer.riotgames.com",
            }
        }).then(async (response) => {
            const { puuid, accountId } = response.data;
            pid = puuid;
        }).catch((e) => {
            console.error(e);
        })
        .then((response) => {
            const list = getMatchLists(pid);
        })
        .then(()=>{
            console.log("---Player Id's Found---");
            console.log("Generating Match List...");   
        })


}

const getMatchData = async (matchId) => {
    axios.get(`https://na1.api.riotgames.com/lol/match/v4/${matchId}?api_key=${auth.key}`,
        {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.85 Safari/537.36",
                "Accept-Language": "en-US,en;q=0.9",
                "Accept-Charset": "application/x-www-form-urlencoded; charset=UTF-8",
                "Origin": "https://developer.riotgames.com",
            }
        }).then(async (response) => {
            console.log('promise done');
            const { queueId, gameType, teams, participants } = response.data;
            console.log('participants: ', participants);
        }).catch((e) => {
            console.error(e);
        })
        .then(()=> console.log(''))
}

const generateMatchList = async () => {
    let resp = getPuuidByName('sentientAI');
}

generateMatchList();
/* const list = getMatchLists(p);
console.log(list); */


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

async function getAllChampNames() {
    const allChamps = [];
    try {
        const prom = axios.get('http://ddragon.leagueoflegends.com/cdn/10.16.1/data/en_US/champion.json',
            {
                params: {
                    ID: `${auth.key}`
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