const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'b2astyriqlmaokfgozyc-mysql.services.clever-cloud.com',
  user: 'u6kwxj98pyge2exk',
  password: 'YcPjltl7uAyABv31rPtB',
  database: 'b2astyriqlmaokfgozyc',
  port: 3306
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('Connected to database');
});

module.exports = connection;
