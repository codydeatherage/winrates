const auth = require('./auth.json');
const axios = require('axios');
const MongoClient = require('mongodb').MongoClient;

const url = 'mongodb://localhost/winrates';

MongoClient.connect(url, {useUnifiedTopology: true },(err, db)=>{
    console.log('Connected');
    db.close();
});
/*
axios.post('https://na1.api.riotgames.com/lol/platform/v3/champion-rotations', 
            { headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36",
                "Accept-Language": "en-US,en;q=0.9",
                "Accept-Charset": "application/x-www-form-urlencoded; charset=UTF-8",
                "Origin": "https://developer.riotgames.com",
                "X-Riot-Token": {apiKey}
                }
    }).then( (response) => {
        console.log('promise done');
        const {data} = response.data;
        for(let champ in data){
            console.log(champ);
            allChamps.push(champ);
        }
    }).catch( (e) => {
        console.error(e);
    })

 */

async function getAllChampNames(){
    const allChamps = [];
    try{
      const prom = axios.get('http://ddragon.leagueoflegends.com/cdn/10.16.1/data/en_US/champion.json',
                                  {params: {
                                      ID: 'RGAPI-cbb4716d-90f4-4cb9-b571-98d8b6309c61'
                                      }
                                  });
      const response = await prom;
      const {data} = response.data;
      for(let champ in data){
 /*          console.log(champ); */
          allChamps.push(champ);
      }
     
      return allChamps;
    }catch(err){console.error(err)}
}

    const allChamps = getAllChampNames();
 /*    console.log(allChamps); */