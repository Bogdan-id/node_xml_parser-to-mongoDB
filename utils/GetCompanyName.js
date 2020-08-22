// global.__basedir = __dirname

const fs = require("fs")    
const MongoClient = require('mongodb').MongoClient
const url = 'mongodb+srv://user332145:dvaodin1233@mythirdcluster.ebwlk.mongodb.net/open-data?retryWrites=true&w=majority'
const client = new MongoClient(url)
const dbName = "open-data"

const assert = require('assert')


async function run() {
  try {
    await client.connect()
    console.log("Connected correctly to server")

    
    const db = client.db(dbName)
    const col = db.collection("companyNnames")
    const edrpou = await col.countDocuments()//  findOne({edrpou: '33880354'}) //

    console.log(edrpou)
    // let i  = 0
    // edrpou.each(function(err, item) {
    //   i++
    //   if(err) console.log(err)
    //   if(item) console.log(i, item)
    // })
    client.close()
  } catch (err) {
    console.log(err.stack)
    client.close()
  }
}

run().catch(console.dir)
