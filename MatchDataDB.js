const auth = require('./auth.json');
const axios = require('axios');
const MongoClient = require('mongodb').MongoClient;
const dbUrl = 'mongodb://localhost/LoLWinrates';
class MatchDataDB {
    constructor() {

    }

    getMatchData = async (matchId) => {
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

    getMatchIds = async () => {
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
            /*  return arr[0].matches; */
        });
    }


}