/*
Author: Dilan Jenkins
File: dataAPI.js
Info:
    This is a module for node js.
    It is used as an API for accessing the quotes database.
*/

var mysql = require('mysql');
var bcrypt = require('bcrypt');

//how many rounds of hashing should be used
const SALT_ROUNDS = 10;

//global singleton of the mysql connection object
var _conn = undefined;

/*
function: getDefaultConn
info:
    Creates a mysql connection object and connects to it.
    Stores that connection object as global singleton for future function calls.
parameters:
    none
returns:
    a mysql connection object
*/
//creates a mysql connection object,connects to it and returns it
function getDefaultConn()
{
    if ( _conn )
    {
        return _conn;
    }

    _conn = mysql.createConnection(
    {
        host: "localhost",
        user: "root",
        password: "",
        database: "QUOTES"
    });

    _conn.connect( function(err) 
    {
        if (err) throw err;
    });

    return _conn;
}

/*
function: getAllQuotes
info:
    Queries the database for an array of all the quotes that are in the database.
    Passes the array to the onFinish function provided.
parameters:
    onFinish: function, the function to be called when the database has responded to the query
returns:
    nothing
*/
function getAllQuotes( onFinish )
{
    var conn = getDefaultConn();
    conn.query("SELECT * FROM QUOTE ORDER BY SCORE DESC", function (err, result, fields) 
    {
        if (err) throw err;

        onFinish( result ); 
    });
}

/*
function: createQuote
info:
    Inserts a quote into the database with the values given as parameters.
    Calls onFinish function provided when the quote has been inserted.
    Can use result.insertId for the id of the quote that was inserted
parameters:
    author, string, the author of the quote
    body, string, the text of the quote
    onFinish, function, the function to be called when the quote has been inserted
returns:
    nothing
TODO: need to also insert the creatorId
*/
function createQuote( author, body, onFinish )
{
    var conn = getDefaultConn();
    conn.query("INSERT INTO QUOTE( author, body, score ) VALUES( ? , ? , 0 )", [ author, body ] , function (err, result, fields) 
    {
        if (err) throw err;

        onFinish( result ); 
    });
}

/*
function: upvoteQuote
info:
    Increments the score for the quote with qid given.
    Calls onFinish function provided when the quote has been updated
    Can use result.affectedRows to see if the update worked(i.e qid is valid id for a row in the quote table)
parameters:
    qid, string, the id of the quote to be updated.
    onFinish, function, function to be called when the quote has been updated
returns:
    nothing
*/
function upvoteQuote( qid, onFinish )
{
    var conn = getDefaultConn();
    conn.query("UPDATE QUOTE SET score=score+1 WHERE qid=?", [ qid ] , function (err, result, fields) 
    {
        if (err) throw err;

        onFinish( result ); 
    });
}

/*
function: downvoteQuote
info:
    Decrements the score for the quote with qid given.
    Calls onFinish function provided when the quote has been updated
    Can use result.affectedRows to see if the update worked(i.e qid is valid id for a row in the quote table)
parameters:
    qid, string, the id of the quote to be updated.
    onFinish, function, function to be called when the quote has been updated
returns:
    nothing
*/
function downvoteQuote( qid, onFinish )
{
    var conn = getDefaultConn();
    conn.query("UPDATE QUOTE SET score=score-1 WHERE qid=?", [ qid ] , function (err, result, fields) 
    {
        if (err) throw err;

        onFinish( result ); 
    });
}

/*
function: getQuoteById
info:
    This function calls the onFinish function with the database results on the quote that has the qid specified.
paramters:
    qid: string, the id of the quote
    onFinish: function, the function to be called when the database query has finished
returns:
    nothing
*/
function getQuoteById( qid, onFinish )
{
    var conn = getDefaultConn();
    conn.query("SELECT * FROM QUOTE WHERE qid=? LIMIT 1", [ qid ] , function (err, result, fields) 
    {
        if (err) throw err;

        //send back exactly one row,or if no rows were in the result then send back empty object
        var resultObj = {};
        if ( result.length > 0 )
        {
            resultObj = result[ 0 ];
        }

        onFinish( resultObj ); 
    });
}

function createUser( username, password, onFinish )
{
    var conn = getDefaultConn();
    bcrypt.hash( password, SALT_ROUNDS, function(err, hash) 
    {
        // Store hash in your password DB.
        conn.query("INSERT INTO USERS( username, password, role ) VALUES( ? , ? , 'user' )", [ username, hash ] , function (err, result, fields) 
        {
            if (err) throw err;

            onFinish( result ); 
        });
    });
}

function verifyUserCredentials( username, password, onFinish )
{
    //TODO: call onFinish with result if user credentials check out/don't
}

//add the functions above to this module so that they are usable outside of the module
exports.getAllQuotes = getAllQuotes;
exports.createQuote = createQuote;
exports.upvoteQuote = upvoteQuote;
exports.downvoteQuote = downvoteQuote;
exports.getQuoteById = getQuoteById;
exports.createUser = createUser;
exports.verifyUserCredentials = verifyUserCredentials;

