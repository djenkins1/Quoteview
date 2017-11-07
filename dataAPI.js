/*
Author: Dilan Jenkins
File: dataAPI.js
Info:
    This is a module for node js.
    It is used as an API for accessing the quotes database.
*/

var mysql = require('mysql');

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

//add the functions above to this module so that they are usable outside of the module
exports.getAllQuotes = getAllQuotes;
exports.createQuote = createQuote;


