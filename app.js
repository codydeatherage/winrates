const auth = require('./auth.json');
const axios = require('axios');
const MongoClient = require('mongodb').MongoClient;
const cursor = require('mongodb').Cursor;
const cron = require('node-cron');
const champs = require('champion.json');
const matchQuery = require('./MatchIDQuery');
/* const { endianness } = require('node:os'); */

const dbUrl = 'mongodb://localhost/LoLWinrates';
let matchesToQuery = [];
const header = { //Request header for Riot API
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.85 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Charset": "application/x-www-form-urlencoded; charset=UTF-8",
    "Origin": "https://developer.riotgames.com",
};

let query = new matchQuery(0, 9, header, dbUrl);
query.getChallengerData();

const getMatchData = async (matchId) => {
    axios.get(`https://americas.api.riotgames.com/lol/match/v5/matches/${matchId}?api_key=${auth.key}`,
        {
            headers: { header }
        }).then(async (response) => {
            console.log('promise done');
            const { participants } = await response.data.metadata;
            console.log('participants: ', participants);
            return participants;
        }).catch((e) => {
            console.error(`!! Code ${e.response.status} --> ${e.response.statusText} !!`);
        })
        .then(() => console.log())
}

let date = new Date();
console.log(`JOB started ${date.getMonth()}/${date.getDate()}/${date.getFullYear()}--- ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`);

/* cron.schedule('0 * * * *', ()=>{
    getPuuidByName('sentientAI')
   // generateMatchList(); 
    let date2 = new Date();
    console.log(`Request sent at ${date2.getMonth()}/${date2.getDate()}/${date2.getFullYear()}--- ${date2.getHours()}:${date2.getMinutes()}:${date2.getSeconds()}`);
}) */

const updateMatches = () => {
    MongoClient.connect(url, { useUnifiedTopology: true }, async (err, client) => {
        console.log('Connected to mongodb...');
        const db = client.db('LoLWinrates');
        let checkName = await db.collection('matches').find({ "name": "sentientAI" }).count();
        if (!checkName) {
            console.log('No document found for summoner name');
        }
        else {
            console.log('SentientAI document found');
        }

        for (let match of matchesToQuery) {
            await db.collection('matches').updateOne(
                { name: "sentientAI" },
                { $addToSet: { "matches": `${match}` } }
            );
        }

        client.close();
    });
}

const testMatches = [];
const getMatchIdsFromDb = async () => {
    MongoClient.connect(url, { useUnifiedTopology: true }, async (err, client) => {
        console.log('Connected to mongodb...');
        const db = client.db('LoLWinrates');
        console.log('list');

        let arr = await db.collection('matches').find({ "name": "sentientAI" }).toArray();
        console.log(arr[0].matches);
        for (let match of arr[0].matches) {
            testMatches.push(match);
        }
        console.log('first match: ', await getMatchData(arr[0].matches[0]));
        console.log('testMatches', testMatches);
        client.close();
        return arr[0].matches;
    });
}

const getAllMatchData = async () => {
    const matchList = await getMatchIdsFromDb().then(async () => {
        // for(let match of matchList){
        let match = testMatches[0];
        const data = getMatchData(match);
        console.log('data', await data);
        //}
    })
    console.log('Calculating winrate...');
    /* console.log(await matchList); */
    /*   for(let match of matchList){
          const data = getMatchData(match);
          console.log('data', await data);
  
      } */
    /* console.log(await matchList[0]); */
}

const getChampData = async () => {
    /*  let allChamps = []; */
    const fetch = await axios.get('http://ddragon.leagueoflegends.com/cdn/11.9.1/data/en_US/champion.json')
        .then(async (resp) => {
            let champ = await resp.data;
            /*     allChamps.push(resp.data.data); */
            let allChamps = [];
            for (let ch in champ.data) {
                allChamps.push(ch);
            }
            return allChamps;
        })
    return await fetch;
}
