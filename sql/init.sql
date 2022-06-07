DROP TABLE IF EXISTS users;

CREATE TABLE users
(
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR
(90) UNIQUE,
    hashedPassword VARCHAR
(90),
    firstname VARCHAR
(90),
    lastname VARCHAR
(90),
 city VARCHAR
(90), 
language VARCHAR
(90)
);