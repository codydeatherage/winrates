const auth = require('./auth.json');
const axios = require('axios');
const MongoClient = require('mongodb').MongoClient;
const cursor = require('mongodb').Cursor;
const cron = require('node-cron');
const champs = require('./champion.json');
const MatchDataDB = require('./MatchDataDB')
const matchIDQuery = require('./MatchIDQuery');
const dbUrl = 'mongodb://localhost/LoLWinrates';
let allMatches = [];
const analyzeMatches = async (callback) => {
    MongoClient.connect(dbUrl, { useUnifiedTopology: true }, async (err, client) => {
        const db = client.db('LoLWinrates');
        let arr = await db.collection('challenger-match-data').find({ gameId: { $exists: true } }).toArray();

        console.log('done');
        allMatches = arr;
        callback();
        client.close();

    })
}
const test = async () => {
    let cb = () => {
        console.log(allMatches[0].teams[1].win);
    }
    let list = await analyzeMatches(cb);
}
/* test(); */

/*
** ChampName: {
    gamesPicked: ,
    gamesBanned: ,
    gamesOnBlue: ,
    gamesOnRed: ,
    gamesWonOnRed: ,
    gamesWonOnBlue ,
    gamesWon: ,
    gamesLost: ,
    matchups: [{champName: , gamesPlayed: , gamesWon: , gamesLost: }, ....]
}
*/

MongoClient.connect(dbUrl, { useUnifiedTopology: true }, async (err, client) => {
    const db = client.db('LoLWinrates');
    /* let arr = await db.collection('champion-data'); */
    for (let ch in champs.champions) {
        await db.collection('champion-data').insertOne(
            {
                name: ch,
                gamesPicked: 0,
                gamesBanned: 0,
                gamesOnBlue: 0,
                gamesOnRed: 0,
                gamesWonOnRed: 0,
                gamesWonOnBlue: 0,
                gamesWon: 0,
                gamesLost: 0,
                matchups: []
            }
        )
    }
    console.log('done');
    client.close();

})



