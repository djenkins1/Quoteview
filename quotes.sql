CREATE DATABASE IF NOT EXISTS QUOTES;
USE QUOTES;

DROP TABLE IF EXISTS QUOTE;
CREATE TABLE QUOTE
(
    qid      int PRIMARY KEY NOT NULL AUTO_INCREMENT,
    author  varchar( 256 ) NOT NULL,
    body    text NOT NULL,
    score   int NOT NULL
);

INSERT INTO QUOTE( author, body, score ) VALUES( 'Dilan Jenkins' , 'Hello, World!' , 0 );
