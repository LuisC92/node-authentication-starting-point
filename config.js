const mysql = require('mysql');

const connection = mysql.createConnection({
    localhost: 'localhost',
    user: 'root',
    password: 'root',
    database: 'jwt_authentication'
})

module.exports = connection;