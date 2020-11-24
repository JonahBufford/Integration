/**
 * In general copy paste this code
 * Update the URI to your own database
 */


const mongoose = require('mongoose');

// Update with your own Database URI
    const mongoDB = process.env.MONGODB_URI || 'mongodb+srv://JonahBufford:SPU2020@cluster0.816i7.mongodb.net/Integration?retryWrites=true&w=majority';

mongoose
    .connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => {
        console.log('DB Connected!');
    })
    .catch(error => {
        console.log('Connection Error: ${err.message}');
    });

const db = mongoose.connection;

// Bind the console to errors, to show them on console
db.on('error', console.error.bind(console, 'MongoDB Connection Error'));

module.exports = db;
