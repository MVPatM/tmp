import mysql from 'mysql'
var db = mysql.createConnection({
    host: 'localhost', // database server 위치
    user: 'root', 
    password: '1234',
    database: 'userinfo',
    port: '3306'
})

db.connect();

export default db;

/*
if using new database, use the next cmd
CREATE DATABASE userinfo;
USE userinfo;
CREATE TABLE usertable(
    ID INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(20) NOT NULL,
    userchn VARCHAR(200) NOT NULL,
    phonenum VARCHAR(20) NOT NULL
);
*/