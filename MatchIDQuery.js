const auth = require('./auth.json');
const axios = require('axios');
const MongoClient = require('mongodb').MongoClient;

class MatchIDQuery {
    constructor(index, limit, header, dbUrl) {
        this.index = index;
        this.limit = limit;
        this.header = header;
        this.url = dbUrl;
        this.summoners = [];
        this.matchesToQuery = [];
    }

    getPuuidByName = (name) => {
        const encodedName = encodeURI(name);
        let pid = '';
        axios.get(`https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${encodedName}?api_key=${auth.key}`,
            {
                headers: this.header
            }).catch((e) => {
                console.error(`!! Code ${e.response.status} --> ${e.response.statusText} !! ${name}`);
            }).then(async (response) => {
                if (!response) {
                    console.log('MatchId Error:', name);
                    pid = '';
                } else {
                    const { puuid } = response.data;
                    pid = puuid;
                }
            })
            .then(() => {
                if (pid) this.getMatchLists(pid);
            })
    }

    getMatchLists = async (pid) => {
        axios.get(`https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/${pid}/ids?start=0&count=100&api_key=${auth.key}`,
            {
                headers: this.header
            }).then(async (response) => {
                await response.data;
                for (let match of response.data) {
                   // this.delay(100);
                    if (!this.matchesToQuery.includes(match)) {
                        this.matchesToQuery.push(match);
                    }
                }
            }).catch((e) => {
                console.error(e);
            })
            .then(async() => {
                await this.updateDB(this.matchesToQuery);
                this.matchesToQuery = [];
            })
    }

    delay = async (t) => {
        return new Promise((resolve) => {
            setTimeout(() => resolve(), t);
        });
    }

    getChallengerData = async () => {
        await axios.get(`https://na1.api.riotgames.com/lol/league/v4/challengerleagues/by-queue/RANKED_SOLO_5x5?api_key=${auth.key}`,
            {
                headers: this.header
            }).then(async (response) => {
                const { entries } = response.data;
                for (let ent of entries) {
                    if (this.summoners.indexOf(ent.summonerName) <= 0) {
                        this.summoners.push({ name: ent.summonerName, id: ent.summonerId });
                    }
                }

                /* The rate limit for a personal keys is by design very limited:
                ** 20 requests every 1 second
                ** 100 requests every 2 minutes 
                **
                ** 20 per second, for 5 seconds, then wait 1:55, repeat
                ** 2 calls per name + 1 call to reach this point
                ** 1st: 9 names/s for 1s, 10 names/s for 4s, wait 1:55
                ** 2nd-Last : 10 names/s for 5s, wait 1:55
                */
            })
    }

    updateDB = (matchList) => {
        MongoClient.connect(this.url, { useUnifiedTopology: true }, async (err, client) => {
            //console.log('Connected to mongodb...');
            const db = client.db('LoLWinrates');

            for (let match of matchList) {
                if (await db.collection('challenger-matches-v11.11').find({ "matchId": `${match}`}).count() === 0) {
                    await db.collection('challenger-matches-v11.11').insertOne(
                        {"matchId": `${match}`}
                    );
                }
               /*  else{
                    console.log('Duplicate rejected,', match);
                } */
            }
            client.close();
        });
    }
}

module.exports = MatchIDQuery;
