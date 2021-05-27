const auth = require('./auth.json');
const axios = require('axios');
const MongoClient = require('mongodb').MongoClient;
const cursor = require('mongodb').Cursor;
const cron = require('node-cron');
const champs = require('champion.json');
const MatchDataDB = require('./MatchDataDB')
const matchIDQuery = require('./MatchIDQuery');

const dbUrl = 'mongodb://localhost/LoLWinrates';
let matchesToQuery = [];
const header = { //Request header for Riot API
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.85 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Charset": "application/x-www-form-urlencoded; charset=UTF-8",
    "Origin": "https://developer.riotgames.com",
};
/* let query = new matchIDQuery(0, 9, header, dbUrl);
let matchDb = new MatchDataDB(dbUrl, header); */
const test = async () => {
    let matchDb = new MatchDataDB(dbUrl, header);
    let query = new matchIDQuery(0, 9, header, dbUrl);
    let matchList = await matchDb.getMatchIds('challenger-matches').then(() => {
        query.matchesToQuery = matchDb.matches;
        let ratedFetches = setInterval(async () => {
            let time = 1000;
            if (query.index >= query.matchesToQuery.length) {
                clearInterval(ratedFetches);
            }
            for (let i = 0; i < 5; i++) {
                if (query.index >= query.matchesToQuery.length) {
                    clearInterval(ratedFetches);
                    break;
                }
                if (query.matchesToQuery.slice(query.index, query.limit)) {
                    console.log(`Fetching ${query.index}->${query.limit}`);
                }
                await query.delay(time);
                let list = { matches: [...query.matchesToQuery.slice(query.index, query.limit)] }
                for (let i = 0; i < list.matches.length; i++) {
                    console.log('New Query');
                    matchDb.getMatchData(list.matches[i]);
                }
                query.index += 10;
                query.limit += 10;
            }
        }, 115000)
    });
}

test();
const feedChallengerMatchIdToDb = async (query) => {
    let names = await query.getChallengerData().then(() => {
        let ratedFetches = setInterval(async () => {
            let time = 1000;
            if (query.index >= query.summoners.length) {
                clearInterval(ratedFetches);
            }
            for (let i = 0; i < 5; i++) {
                if (query.index >= query.summoners.length) {
                    clearInterval(ratedFetches);
                    break;
                }
                if (query.summoners.slice(query.index, query.limit)) {
                    console.log(`Fetching ${query.index}->${query.limit}`);
                }
                await query.delay(time);
                let list = { names: [...query.summoners.slice(query.index, query.limit)] }
                for (let i = 0; i < list.names.length; i++) {
                    console.log('New Query');
                    query.getPuuidByName(list.names[i].name);
                }
                query.index += 10;
                query.limit += 10;
            }
        }, 115000)
    });
    console.log('query:', await names);
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

const getAllMatchData = async () => {
    const matchList = await getMatchIdsFromDb().then(async () => {
        let match = testMatches[0];
        const data = getMatchData(match);
        console.log('data', await data);
    })
    console.log('Calculating winrate...');
}

const getChampData = async () => {
    const fetch = await axios.get('http://ddragon.leagueoflegends.com/cdn/11.9.1/data/en_US/champion.json')
        .then(async (resp) => {
            let champ = await resp.data;
            let allChamps = [];
            for (let ch in champ.data) {
                allChamps.push(ch);
            }
            return allChamps;
        })
    return await fetch;
}
