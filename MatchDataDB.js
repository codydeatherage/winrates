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
                console.log(response.data.info.gameMode);
                if (response.data.info.gameMode == "CLASSIC") {
                  /*   console.log('MatchInfo: ', response.data.info); */
                    if(this.matchData.indexOf(response.data.info) < 0){
                        this.matchData.push(response.data.info);
                    }
                    /* console.log('Match found'); */
                }
            }).catch((e) => {
                console.error(`!! Code ${e.response.status} --> ${e.response.statusText} !!`);
            })
            .then(async () => {
                await this.updateDB(this.matchData);
                
            }).catch((e) => {
                console.error(`!! Code ${e.response.status} --> ${e.response.statusText} !!`);
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
            console.log('done');
            client.close();
           /*  return this.matches; */
        });
    }

    updateDB = async (data) => {
        MongoClient.connect(this.dbUrl, { useUnifiedTopology: true }, async (err, client) => {
            const db = client.db('LoLWinrates');
            /* console.log(this.matchData.length); */
            for(let match of data){
                if (await db.collection('challenger-match-data').find({ "gameId": match.gameId}).count() === 0) {
                    
                    /* console.log('inserting', match.gameId); */
                      await db.collection('challenger-match-data').insertOne(
                        {...match}
                    );
                }
                else{/* console.log('Duplicate Rejected: ', match.gameId) */}
              /*   console.log('inserting...', match.gameId);
                await db.collection('challenger-match-data').insertOne(
                    {...match},
                    {upsert: true},
                ); */
            }
            /* console.log(count); */
            client.close();
        });
    }
}

module.exports = MatchDataDB;