const auth = require('./auth.json');
const axios = require('axios');
const MongoClient = require('mongodb').MongoClient;
const cursor = require('mongodb').Cursor;
const cron = require('node-cron');
const champs = require('./champion.json');
const MatchDataDB = require('./MatchDataDB')
const matchIDQuery = require('./MatchIDQuery');
const express = require('express');
const PORT = process.env.PORT || 3001;
const app = express();

app.listen(PORT, () =>{
    console.log(`Server listening on ${PORT}`);
})
const dbUrl = 'mongodb://localhost/LoLWinrates';
let matchesToQuery = [];

/* let query = new matchIDQuery(0, 9, header, dbUrl);
let matchDb = new MatchDataDB(dbUrl, header); */
const test = async () => {
    let matchDb = new MatchDataDB(dbUrl, header);
    let query = new matchIDQuery(0, 9, header, dbUrl);
    let matchList = await matchDb.getMatchIds('challenger-matches-v11.11').then(() => {
        let ratedFetches = setInterval(async () => {
            let time = 1500;
            if (query.index >= matchDb.matches.length) {
                clearInterval(ratedFetches);
            }
            for (let i = 0; i < 5; i++) {
                if (query.index >= matchDb.matches.length) {
                    clearInterval(ratedFetches);
                    break;
                }
                if (matchDb.matches.slice(query.index, query.limit)) {
                    console.log(`Fetching ${query.index}->${query.limit}`);
                }
                await query.delay(time);
                let list = { matches: [...matchDb.matches.slice(query.index, query.limit)] }
                console.log(`New Query: ${list.matches.length}`);
                for (let i = 0; i < list.matches.length; i++) {
                    await matchDb.getMatchData(list.matches[i]);
                }
                await query.delay(time/2);
                console.log('matchData length:', matchDb.matchData.length);
                await matchDb.updateDB(matchDb.matchData).then(()=>{
                    matchDb.matchData = [];
                    query.index += 10;
                    query.limit += 10;
                });
            }
        },75000)
    });
}


const test2 = async () => {
    let matchDb = new MatchDataDB(dbUrl, header);
    let query = new matchIDQuery(0, 9, header, dbUrl);
    await matchDb.getMatchIds('challenger-matches-v11.11').then(async () => {
        
        await query.delay(500);
    }).then(async ()=>{
        console.log(matchDb.matches.length);
        for(let i = 0; i < 10; i++){
            await matchDb.getMatchData(matchDb.matches[i]);
            await query.delay(250);
            console.log(matchDb.matches[i]);
            console.log(matchDb.matchData.length);
        }   
    }).then(async ()=>{
        console.log('fsdfsd', matchDb.matchData.length);
        await matchDb.updateDB(matchDb.matchData);
    })   
}
/* test2(); */
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
                    //console.log('New Query');
                    query.getPuuidByName(list.names[i].name);
                }
                query.index += 10;
                query.limit += 10;
            }
        }, 65000)
    });
    console.log('query:', await names);
}
/* let query = new matchIDQuery(0, 9, header, dbUrl);
feedChallengerMatchIdToDb(query); */
/* query.getChallengerData(); */

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
