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
                headers:  this.header 
            }).then(async (response) => {
                console.log('promise done');
                await response.data;
                /* const { participants } = await response.data.metadata; */
                if(response.data.info.gameMode == "CLASSIC")
                console.log('MatchInfo: ', response.data.info);
                /* return participants; */
            }).catch((e) => {
                console.error(`!! Code ${e.response.status} --> ${e.response.statusText} !!`);
            })
            .then(() => console.log())
    }

    getMatchIds = async (collection) => {
        MongoClient.connect(this.dbUrl, { useUnifiedTopology: true }, async (err, client) => {
            console.log('Connected to mongodb...');
            const db = client.db('LoLWinrates');
            // console.log('reading challenger matches from db');

            let arr = await db.collection(`${collection}`).find({matchId : {$exists: true}}).toArray();
            /* console.log(arr[0]); */
            for (let match of arr) {
                if(this.matches.indexOf(match) < 0){
                    this.matches.push(match.matchId);
                }
            }

            await this.getMatchData(this.matches[0]);
           /*  console.log('testMatches', testMatches); */
            client.close();
            /*  return arr[0].matches; */
        });
    }


}

module.exports = MatchDataDB;