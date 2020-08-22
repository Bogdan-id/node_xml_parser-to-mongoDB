global.__basedir = __dirname;

const https = require('https')
const XmlStream = require('xml-stream');
const fs = require("fs");    
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

let handle = require('./handlers');

const unzipper = require('unzipper');

var options = {
  host: 'nais.gov.ua',
  port: 443,
  path: '/m/ediniy-derjavniy-reestr-yuridichnih-osib-fizichnih-osib-pidpriemtsiv-ta-gromadskih-formuvan'
};

const pathToFile = './xml/'
var fileName

https.get(options, function(res) {
  console.log('statusCode:', res.statusCode);
  console.log('headers:', res.headers);

  res.on('data', (d) => {
    let url = handle.getUrlFromHtml(d)
    fileName = url.substr(url.lastIndexOf('/') + 1)
  });

  res.on('end', function() {
    console.log(url)
    const file = fs.createWriteStream(pathToFile + fileName)

    var request = https.request(url, function(response) {
      console.log('Status code: ' + response.statusCode)
      console.log('Headers: ' + response.headers)
      response.pipe(file)
    })

    request.end()

    file.on('finish', function() {
      console.log('Writing file finished')
      fs.createReadStream(pathToFile + fileName).pipe(unzipper.Extract({ path: pathToFile }));
    })
  })

  res.on('error', function(e) {
    console.log("Got error: " + e.message);
  });
})

const dbName = 'open-data';
const dbCollection = 'companyNnames';

const url = `mongodb+srv://user332145:dvaodin1233@mythirdcluster.ebwlk.mongodb.net/${dbName}?retryWrites=true&w=majority`;
const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true
  };

const objMaxLength = 25000;

const client = new MongoClient(url, options);

client.connect(function(err) {
  assert.equal(null, err);
  console.log('\r' + "Connected successfully to Mongo server");
  console.log(' ')

  const xmlFileReadStream = fs.createReadStream(__dirname + '/data.xml');
  const xmlFileWriurlream = new XmlStream(xmlFileReadStream);

  
  const db = client.db(dbName);
  let col = db.collection(dbCollection);
  
  function run() {

    let P = ["\\", "|", "/", "-"];
    let x = 0;

    const loader = function() {
      process.stdout.write("\r" + P[x++]);
      x &= 3;
    } 

    let arrOfObj = [];
    let totalCount = 0;

    function insertItems(documentEnd) {
      let twirlTimer = setInterval(loader, 250);

      col.insertMany(arrOfObj, function(err, result) {
        if(err) { console.log(err); return ;};

        if(documentEnd === 0) {

          totalCount += arrOfObj.length
          arrOfObj = [];

          console.log('Total added: ' + totalCount + ' documents', '\r');

          clearInterval(twirlTimer);

          console.log('Parsing ended')
          return
        } else {
          arrOfObj = [];
          clearInterval(twirlTimer);
          xmlFileWriurlream.resume();
        }
      });
      
    }
    xmlFileWriurlream.on('endElement: RECORD', 
      function({ EDRPOU, SHORT_NAME, NAME }) {
        if(EDRPOU){
          arrOfObj.push({
            edrpou: EDRPOU,
            name: SHORT_NAME ? SHORT_NAME : NAME
          });
          
          process.stdout.write("\r" + 'Parsing circles: ' + arrOfObj.length + "\r");

          if(arrOfObj.length >= objMaxLength) {
            
            totalCount += arrOfObj.length

            console.log('Total added: ' + totalCount + ' documents', '\r');
            console.log(' ')

            xmlFileWriurlream.pause();
            insertItems();
          };
        } else return;
      }
    );
    xmlFileWriurlream.on('end', () => {
      insertItems(0);
      client.close(function(err, result) {
        if(err) { console.log(err); return; };
        console.log('Connection closed')
      })
    });
  }
  run();
});
