const mysql = require('mysql')
require('dotenv/config')

const config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
}
// var connection = mysql.createConnection(config)

var connection = mysql.createPool(config)

function handleDisconnect() {
    console.log('start handleDisconnect');
    connection.end()
    connection = mysql.createPool(config)
    console.log('New connect');
    connection.on('error', function (err) {
        if (err) {
            console.log('error and re-connect');
            handleDisconnect();
        }
    });
}
handleDisconnect();

module.exports = connection
