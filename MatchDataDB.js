const auth = require('./auth.json');
const axios = require('axios');
const MongoClient = require('mongodb').MongoClient;
const dbUrl = 'mongodb://localhost/LoLWinrates';

class MatchDataDB {
    constructor(dbUrl, header) {
        this.dbUrl = dbUrl;
        this.header = header;
        this.matches = [];
        this.matchData = [];
    }

    getMatchData = async (matchId) => {
        axios.get(`https://americas.api.riotgames.com/lol/match/v5/matches/${matchId}?api_key=${auth.key}`,
            {
                headers: this.header
            }).then(async (response) => {
                await response.data;
                const {gameId, gameVersion, queueId} = response.data.info;
                let version = gameVersion.slice(0,5);
                //420 is queueId for 5v5 Ranked SoloQ :)
                if (version === "11.11" && queueId === 420) {
                    if(this.matchData.indexOf(response.data.info) < 0){
                        this.matchData.push(response.data.info);
                    }
                }
            }).catch((e) => {
                //some
                console.error(`!! Code ${e.response.status} --> ${matchId} !!`);
            })
    }

    getMatchIds = async (collection) => {
        MongoClient.connect(this.dbUrl, { useUnifiedTopology: true }, async (err, client) => {
            const db = client.db('LoLWinrates');
            let arr = await db.collection(`${collection}`).find({ matchId: { $exists: true } }).toArray();
            for (let match of arr) {
                if (this.matches.indexOf(match) < 0) {
                    this.matches.push(match.matchId);
                }
            }
            console.log(`${this.matches.length} matchIds found`);
            client.close();
        });
    }

    updateDB = async (data) => {
        MongoClient.connect(this.dbUrl, { useUnifiedTopology: true }, async (err, client) => {
            const db = client.db('LoLWinrates');
            let dupes = 0;
            let newMatches = 0;
            for(let match of data){

                if (await db.collection('challenger-match-data-v11.11').find({ "gameId": match.gameId}).count() === 0) {
                      await db.collection('challenger-match-data-v11.11').insertOne(
                        {...match}
                    );
                    newMatches++;
                }
                else{
                    dupes++;
                }
            }
            console.log(`${data.length} matches - ${dupes} duplicates, ${newMatches} new matches`);
            client.close();
        });
    }
}

module.exports = MatchDataDB;