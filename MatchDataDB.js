const auth = require('./auth.json');
const axios = require('axios');
const MongoClient = require('mongodb').MongoClient;
const dbUrl = 'mongodb://localhost/LoLWinrates';

class MatchDataDB {
    constructor(dbUrl, header) {
        this.dbUrl = dbUrl;
        this.header = header;
        this.matches = [];
    }

    getMatchData = async (matchId) => {
        axios.get(`https://americas.api.riotgames.com/lol/match/v5/matches/${matchId}?api_key=${auth.key}`,
            {
                headers: this.header
            }).then(async (response) => {
                await response.data;
                if (response.data.info.gameMode == "CLASSIC") {
                    /*  console.log('MatchInfo: ', response.data.info); */
                    console.log('Match found');
                }
            }).catch((e) => {
                console.error(`!! Code ${e.response.status} --> ${e.response.statusText} !!`);
            })
            .then(() => console.log())
    }

    getMatchIds = async (collection) => {
        MongoClient.connect(this.dbUrl, { useUnifiedTopology: true }, async (err, client) => {
            console.log('Connected to mongodb...');
            const db = client.db('LoLWinrates');
            let arr = await db.collection(`${collection}`).find({ matchId: { $exists: true } }).toArray();
            for (let match of arr) {
                if (this.matches.indexOf(match) < 0) {
                    this.matches.push(match.matchId);
                }
            }
            client.close();
            return this.matches;
        });
    }

    updateDB = async () => {
        MongoClient.connect(this.dbUrl, { useUnifiedTopology: true }, async (err, client) => {
            console.log('Connected to mongodb...');
            const db = client.db('LoLWinrates');
            let count = 0;
            await db.collection('challenger-matches').find().forEach(() => {
                count++;
            });
            console.log(count);
            client.close();
        });
    }
}

module.exports = MatchDataDB;