const auth = require('./auth.json');
const axios = require('axios');
const MongoClient = require('mongodb').MongoClient;

const url = 'mongodb://localhost/LoLWinrates';
let matchesToQuery = [];
let matchesCounted = [];
const header = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.85 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Charset": "application/x-www-form-urlencoded; charset=UTF-8",
    "Origin": "https://developer.riotgames.com",
};



//https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/Zkw3ioDdn1ooWvk779ib5AJJy-PELX0I7GWW68TTfRdOOh6hqRW_n20rB5sUz8_pYaULFGlcWL16xw/ids?start=0&count=20
const getMatchLists = async (pid) => {
    axios.get(`https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/${pid}/ids?start=0&count=20&api_key=${auth.key}`,
        {
            headers: { header }
        }).then((response) => {
            for (let match of response.data) {
                /*      let id = match.slice(4); */
                if (!matchesCounted.includes(match)) {
                    matchesToQuery.push(match);
                    matchesCounted.push(match);
                }
            }
        }).catch((e) => {
            console.error(e);
        })
        .then(() => {
            console.log('Generated Match List', matchesToQuery);
            return matchesToQuery;
        })
        .then(() => {
            console.log("Updating tracked match ID's...");
            updateMatches();
        })
}

const getPuuidByName = (name) => {
    console.log('Input Name: ', name);
    let pid = '';
    axios.get(`https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${name}?api_key=${auth.key}`,
        {
            headers: { header }
        }).then(async (response) => {
            const { puuid, accountId } = response.data;
            pid = puuid;
        }).catch((e) => {
            console.error(e);
        })
        .then(() => {
            const list = getMatchLists(pid);

        })
        .then(() => {

            console.log("---Player Id's Found---");
            console.log("Generating Match List...");
        })
}

const getMatchData = async (matchId) => {
    axios.get(`https://na1.api.riotgames.com/lol/match/v4/${matchId}?api_key=${auth.key}`,
        {
            headers: { header }
        }).then(async (response) => {
            console.log('promise done');
            const { queueId, gameType, teams, participants } = response.data;
            console.log('participants: ', participants);
        }).catch((e) => {
            console.error(e);
        })
        .then(() => console.log())
}

const generateMatchList = async () => {
    let resp = getPuuidByName('sentientAI');
}

generateMatchList();

const updateMatches = () => {
    MongoClient.connect(url, { useUnifiedTopology: true }, async (err, client) => {
        console.log('Connected to mongodb...');
        const db = client.db('LoLWinrates');
        let checkName = await db.collection('matches').find({"name": "sentientAI"}).count();
        if(!checkName){
            console.log('No document found for summoner name');
        }
        else{
            console.log('SentientAI document found');
        }

/*         await db.collection('matches').updateOne(
            {name: "sentientAI"},
            { $addToSet: {"testArr": "five"} }
        ) */

        checkSet ? console.log('No "matches" field') : console.log('"matches" field found!');

        for (let match of matchesToQuery) {
       const found = await db.collection('matches').find({"name": "sentientAI"}).count();
            if (!found) {
                //console.log('inserted:', match);
                await db.collection('matches').updateOne(
                    {name: "sentientAI"},
                    {$addToSet: {"matches": `${match}`}}
                ); 
            }else{
                //console.log('tossed');
            }
        }

        client.close();
    });
}

/*
MongoClient.connect(url, { useUnifiedTopology: true }, async (err, client) => {
    console.log('Connected to mongodb...');
    const db = client.db('LoLWinrates');
    console.log('creating new');

    await db.collection('matches').insertOne({
        matchId: 'asdfa'
    })

})
 */

/* async function getAllChampNames() {
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
            allChamps.push(champ);
        }

        return allChamps;
    } catch (err) { console.error(err) }
}

const allChamps = getAllChampNames(); */