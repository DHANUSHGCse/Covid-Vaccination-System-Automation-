const { MongoClient } = require('mongodb');

const uri = 'mongodb://127.0.0.1:27017/';



async function connectToMongoDB(dbName,collectionName) {
  try {
    const client = await MongoClient.connect(uri);
    console.log('Connected to MongoDB');

    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    return { client, db, collection };
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}

module.exports = connectToMongoDB;
