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
    await col.drop()
    console.log('collection successfully droped')
    client.close()
  } catch (err) {
    console.log(err.stack)
    client.close()
  }
}

run().catch(console.dir)
