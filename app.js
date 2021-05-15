const auth = require('./auth.json');
const axios = require('axios');
const MongoClient = require('mongodb').MongoClient;
const cursor = require('mongodb').Cursor;
const cron = require('node-cron');
const champs = require('champion.json');
/* const { endianness } = require('node:os'); */

const url = 'mongodb://localhost/LoLWinrates';
let matchesToQuery = [];
let winrateLast20 = 0;
const header = { //Request header for Riot API
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.85 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Charset": "application/x-www-form-urlencoded; charset=UTF-8",
    "Origin": "https://developer.riotgames.com",
};
//https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/Zkw3ioDdn1ooWvk779ib5AJJy-PELX0I7GWW68TTfRdOOh6hqRW_n20rB5sUz8_pYaULFGlcWL16xw/ids?start=0&count=20
const getMatchLists = async (pid) => {
    axios.get(`https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/${pid}/ids?start=0&count=20&api_key=${auth.key}`,
        {
            headers: { header }
        }).then((response) => {
            for (let match of response.data) {
                if (!matchesToQuery.includes(match)) {
                    matchesToQuery.push(match);
                }
            }
        }).catch((e) => {
            console.error(e);
        })
        .then(() => {
            //console.log('Generated Match List'/* , matchesToQuery */);
            /* console.log('MatchList set found!', matchesToQuery.length); */
            matchesToQuery = [];
            /*  return matchesToQuery; */
        })
}

const getPuuidByName = (name) => {
    //console.log('Input Name: ', name);
    const encodedName = encodeURI(name);
    let pid = '';
    axios.get(`https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${encodedName}?api_key=${auth.key}`,
        {
            headers: { header }
        }).catch((e) => {
            console.error(`!! Code ${e.response.status} --> ${e.response.statusText} !! ${name}`);
        }).then(async (response) => {
            if (!response) {
                console.log('MatchId Error:', name);
                pid = '';
            } else {
                const { puuid } = response.data;
                pid = puuid;
                /*  console.log('++', pid); */
            }
        })
        .then(() => {
            if (pid) getMatchLists(pid);
        })
}

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
       /*  let list = await db.collection('matches').find() *//* .toArray((e, doc) =>{
            console.log(doc);
        }) */;
        //  console.log(list);
        console.log('list');

        let arr = await db.collection('matches').find({ "name": "sentientAI" }).toArray();
        /*  console.log(arr[0].matches); */
        /*        client.close(); */
        console.log(arr[0].matches);
        for (let match of arr[0].matches) {
            testMatches.push(match);
        }
        console.log('first match: ', await getMatchData(arr[0].matches[0]));
        console.log('testMatches', testMatches);
        client.close();
        return arr[0].matches;

        /*       await console.dir(aggregateResult.s); */
    })


        /* .then(async ()=>{
           // for(let match of matchList){
                const data = getMatchData(match);
                console.log('data', await data);
            //}
        }) */
        ;
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
const test = async () => {
    /*     const names = await getChampData();
        console.log('n', names); */
    let allNames = [];
    for (let ch in champs.champions) {

    }
    /* console.log(champs.champions); */
}

async function delay(t) {
    return new Promise((resolve) => {
        setTimeout(() => resolve(), t);
    });
}

const rateFetch = async (list) => {
    for (let i = 0; i < list.names.length; i++) {
        getPuuidByName(list.names[i].name);
    }
    console.log('Set Found');
}

const getChallengerData = async () => {
    axios.get(`https://na1.api.riotgames.com/lol/league/v4/challengerleagues/by-queue/RANKED_SOLO_5x5?api_key=${auth.key}`,
        {
            headers: { header }
        }).then(async (response) => {
            const { entries } = response.data;
            let challengerSummoners = [];

            for (let ent of entries) {
                if (challengerSummoners.indexOf(ent.summonerName) <= 0) {
                    challengerSummoners.push({ name: ent.summonerName, id: ent.summonerId });
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

            let limit = 9;
            let index = 0;
            let ratedFetches = setInterval(async () => {
                let time = 1000;
                if (index >= challengerSummoners.length) {
                    clearInterval(ratedFetches);
                }
                for (let i = 0; i < 5; i++) {
                    if (index >= challengerSummoners.length) {
                        clearInterval(ratedFetches);
                        break;
                    }
                    if (challengerSummoners.slice(index, limit)) {
                        console.log(`Fetching ${index}->${limit}`);
                    }
                    await delay(time);
                    rateFetch({ names: challengerSummoners.slice(index, limit) });
                    index += 10;
                    limit += 10;
                }
            }, 115000)
        }).catch((e) => {
            console.error(`!! Code ${e.response.status} --> ${e.response.statusText} !!`);;
        })
}
/* test(); */
/* console.log(allChamps); */
/* getAllMatchData(); */
/* getPuuidByName('sentientAI') */
/* getMatchIdsFromDb(); */
getChallengerData();
