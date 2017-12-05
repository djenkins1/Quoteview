/*
Author: Dilan Jenkins
File: dataAPI.js
Info:
    This is a module for node js.
    It is used as an API for accessing the quotes database.
*/
var Constants = require( "./public/components/Constants" );

var bcrypt = require('bcrypt');

var ObjectId = require('mongodb').ObjectID;

//how many rounds of hashing should be used
const SALT_ROUNDS = 10;

const QUOTE_TABLE = "quote";

const USER_TABLE = "user";

//global singleton of the mysql connection object
var _conn = undefined;

/*
function: getDefaultConn
info:
    Creates a mongo db connection object and connects to it.
    Stores that connection object as global singleton for future function calls.
parameters:
    onFinish, function, the function to be called when the mongo db connects
returns:
    nothing
*/
//creates a mysql connection object,connects to it and returns it
function getDefaultConn( onFinish )
{
    if ( _conn )
    {
        onFinish( _conn );
        return;
    }

    var mongoClient = require('mongodb').MongoClient; 
    var url = "mongodb://localhost:27017/quotes";
    mongoClient.connect(url, function(err, db) 
    {
        if (err) throw err;

        _conn = db;
        onFinish( _conn );
        
    });
}

/*
function: getQuotesByFlag
info:
    This function is a helper function for getting quotes.
    It calls onFinish with the results from the query when finished.
parameters:
    onFinish, function, the function to be called when the query is done
    isFlagged, boolean, optional: if defined then the function only gets quotes with the same flagged value
    creatorId, string/ObjectId, optional: if defined then the function only gets quotes that have creatorId given
returns:
    nothing
*/
function getQuotesByFlag( onFinish, isFlagged , creatorId )
{
    var myQuery = {};
    if ( isFlagged !== undefined )
    {
        myQuery.flagged = !!isFlagged;
    }

    if ( creatorId !== undefined )
    {
        myQuery.creatorId = creatorId;
        if ( typeof creatorId === "string" )
        {
            myQuery.creatorId = ObjectId( creatorId );
        }
    }

    getDefaultConn( function( db )
    {
        db.collection( QUOTE_TABLE ).find( myQuery ).sort( { score : -1 } ).toArray( function(err, results ) 
        {
            if (err) throw err;
            for ( var i = 0; i < results.length; i++ )
            {
                results[ i ].qid = results[ i ]._id;
            }
            onFinish( results );
        
        });
    });
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
    getQuotesByFlag( onFinish, false, undefined );
}

/*
function: createQuoteWithUsername
info:
    Inserts a quote into the database with the values given as parameters.
    Calls onFinish function provided when the quote has been inserted.
    Can use result.insertId for the id of the quote that was inserted
parameters:
    author, string, the author of the quote
    body, string, the text of the quote
    creatorId, int, id of a user who created the quote on the site
    creatorName, string, the username of the user who created the quote on the site
    onFinish, function, the function to be called when the quote has been inserted
returns:
    nothing
*/
function createQuoteWithUsername( author, body, creatorId, creatorName, onFinish )
{
    var creatorIdObj = creatorId;
    if ( typeof creatorId === "string" )
    {
        creatorIdObj = ObjectId( creatorId );
    }

    getDefaultConn( function( db )
    {
        var toInsert = { 
            "author" : author, 
            "body" : body, 
            "creatorId" : creatorIdObj, 
            "creatorName" : creatorName, 
            "score" : 0 ,
            "flagged" : false 
        };

        db.collection( QUOTE_TABLE ).insertOne( toInsert, function(err, result ) 
        {
            if (err) throw err;

            var passedObj = { "insertId" : result.insertedId };
            onFinish( passedObj );
        
        });
    });
}

/*
function: createQuote
info:
    Inserts a quote into the database with the values given as parameters.
    Calls onFinish function provided when the quote has been inserted.
    Can use result.insertId for the id of the quote that was inserted.
    Wrapper function for createQuoteWithUsername for backwards compatibility.
        USE createQuoteWithUsername if username of creatorId has already been queried and is known.
parameters:
    author, string, the author of the quote
    body, string, the text of the quote
    creatorId, int, id of a user who created the quote on the site
    onFinish, function, the function to be called when the quote has been inserted
returns:
    nothing
*/
function createQuote( author, body, creatorId, onFinish )
{
    getUserData( creatorId , function( userObj )
    {
        createQuoteWithUsername( author, body, creatorId, userObj.username, onFinish );
    });
}

/*
function: _updateQuoteScore
info:
    This is a helper function for increment/decrement of a quote's score.
parameters:
    qid, string, the id of the quote
    increment, boolean, true for incrementing a value by 1 or false for decrementing by 1
    onFinish, function, the function called when the update has finished
returns:
    nothing
*/
function _updateQuoteScore( qid, increment, onFinish )
{
    var valueIncrement = 1;
    if ( !increment )
    {
        valueIncrement = -1;
    }

    var myQuery = { "_id" : qid };
    if ( typeof qid === "string" )
    {
        myQuery._id = ObjectId( qid );
    }

    var newValues = { $inc: { "score" : valueIncrement } };
    getDefaultConn( function( db )
    {
        db.collection( QUOTE_TABLE ).updateOne( myQuery, newValues, function(err, resultObj ) 
        {
            if (err) throw err;

            var passedObj = { "affectedRows" : resultObj.result.nModified };
            onFinish( passedObj );
        });
    });
}

function closeConnection()
{
    getDefaultConn( function( db ) 
    {
        db.close();
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
    _updateQuoteScore( qid, true, onFinish );
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
    _updateQuoteScore( qid, false, onFinish );
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
    var myQuery = { "_id" : qid };
    if ( typeof qid === "string" )
    {
        myQuery._id = ObjectId( qid );
    }

    getDefaultConn( function( db )
    {
        db.collection( QUOTE_TABLE ).findOne( myQuery, function(err, result ) 
        {
            if (err) throw err;

            if ( result )
            {
                result.qid = result._id;
            }

            onFinish( result );
        
        });
    });
}

/*
function: createUserWithRole
info:
    This function uses the database to create a row in the users table.
parameters:
    username, string, the username for the new user
    password, string, the password for the new user
    role, string, the role for the new user
    onFinish, function, the function to be called when the user has been created
returns:
    nothing
*/
function createUserWithRole( username, password, role, onFinish )
{
    bcrypt.hash( password, SALT_ROUNDS, function(err, hash) 
    {
        getDefaultConn( function( db )
        {
            var toInsert = { "username" : username.toLowerCase(), "password" : hash, "role" : role };
            db.collection( USER_TABLE ).insertOne( toInsert, function(err, result ) 
            {
                if (err) throw err;

                var passedObj = { "insertId" : result.insertedId };
                onFinish( passedObj );
            
            });
        });
    });
}

/*
function: createUser
info:
    This function uses the database to create a row in the users table.
parameters:
    username, string, the username for the new user
    password, string, the password for the new user
    onFinish, function, the function to be called when the user has been created
returns:
    nothing
*/
function createUser( username, password, onFinish )
{
    createUserWithRole( username, password, Constants.ROLE_USER_DEFAULT, onFinish );
}

/*
function: isUsernameTaken
info:
    This function calls onFinish with the results of whether the username given already exists.
parameters:
    username, string, the username to check
    onFinish, function, the function called when the database query is finished
returns:
    nothing
*/
function isUsernameTaken( username, onFinish )
{
    getDefaultConn( function( db )
    {
        db.collection( USER_TABLE ).findOne( { "username" : username.toLowerCase() } , function( err, result ) 
        {
            if ( err ) throw err;

            var isTaken = false;
            if ( result && result.username )
            {
                isTaken = true;
            }
            onFinish( isTaken );
        });
    });
}

/*
function: getUserData
info:
    This function gets the data in the row in the users table that is identified by the userId given.
parameters:
    userId, int, the id of the user
    onFinish, function, the function to be called for results to be passed on when the database query is done
returns:
    nothing
*/
function getUserData( userId, onFinish )
{
    var myQuery = { "_id" : userId };
    if ( typeof userId === "string" )
    {
        myQuery._id = ObjectId( userId );
    }

    getDefaultConn( function( db )
    {
        db.collection( USER_TABLE ).findOne( myQuery , function( err, result ) 
        {
            if ( err ) throw err;
            if ( result && result._id )
            {
                result.userId = result._id;
            }

            onFinish( result );
        });
    });
}

/*
function: verifyUserCredentials
info:
    This function queries the database to see if the username and password match
*/
function verifyUserCredentials( username, password, onFinish )
{
    getDefaultConn( function( db )
    {
        db.collection( USER_TABLE ).findOne( { "username" : username.toLowerCase() }, function( err, result )
        {
            if ( err ) throw err;

            if ( result && result.password )
            {
                // Load hash from your password DB.
                bcrypt.compare( password, result.password, function(err, res) 
                {
                    if ( err ) throw err;

                    result.password = undefined;
                    result.userId = result._id;
                    onFinish( res, result );
                });                
            }
            else
            {
                onFinish( false, {} );
            }
        });
    });
}

/*
function: cleanDatabase
info:
    This function clears out all collections that are in the database.
parameters:
    onFinish, function, the function to be called once the database has been cleared
returns:
    nothing
*/
function cleanDatabase( onFinish )
{
    getDefaultConn( function( db )
    {
        db.collection( QUOTE_TABLE ).drop(function(err, delOK) 
        {
            if (err) throw err;

            if (delOK) 
                console.log("Quote Collection deleted");

            db.collection( USER_TABLE ).drop(function(err2, delOK2) 
            {
                if (err2) throw err;

                if (delOK2) 
                    console.log("User Collection deleted");

                onFinish();
            });
        });
    });    
}

/*
function: setupDatabase
info:
    This function creates the database and sets up each of the collections if they do not exist.
parameters:
    onFinish, function, the function that is called when the database has been setup
returns:
    nothing
*/
function setupDatabase( onFinish )
{
    getDefaultConn( function( db )
    {
        db.createCollection( USER_TABLE, function(err, res) 
        {
            if (err) throw err;

            console.log("User table created!");
            db.createCollection( QUOTE_TABLE , function(err, res) 
            {
                if (err) throw err;

                console.log("Quote table created!");
                db.collection( USER_TABLE ).createIndex( "username" , function( err, res )
                {
                    if ( err ) throw err;

                    console.log( "Index created for username on " + USER_TABLE );
                    db.collection( QUOTE_TABLE ).createIndex( "flagged" , function( err, res )
                    {
                        if ( err ) throw err;

                        console.log( "Index created for flagged on " + QUOTE_TABLE );
                        db.collection( QUOTE_TABLE ).createIndex( "score" , function( err, res )
                        {
                            if ( err ) throw err;

                            console.log( "Index created for score on " + QUOTE_TABLE );
                            onFinish();
                        });
                    });
                });
            });
        });    
    });
}

/*
function: getAllQuotesFromUser
info:
    This function passes along the quotes that were created by the user with id given.
parameters:
    userId, string, the id of the user who created the quotes
    onFinish, function, the function to be called when the database query finishes.
returns:
    nothing
*/
function getAllQuotesFromUser( userId, onFinish )
{
    getQuotesByFlag( onFinish, false, userId );
}

/*
function: _setQuoteFlagged
info:
    This is a helper function for setting a quote to be flagged/not flagged.
parameters:
    qid, string/objectId, the id of the quote
    flagValue, boolean, what the quote's flagged field should be set to
    onFinish, function, the function called when the update has finished
returns:
    nothing
*/
function _setQuoteFlagged( qid, flagValue, onFinish )
{
    var newValues = { $set: { "flagged" : !!flagValue } };
    var myQuery = { "_id" : qid };
    if ( typeof qid === "string" )
    {
        myQuery._id = ObjectId( qid );
    }

    getDefaultConn( function( db )
    {
        db.collection( QUOTE_TABLE ).updateOne( myQuery, newValues, function(err, resultObj ) 
        {
            if (err) throw err;

            var passedObj = { "affectedRows" : resultObj.result.nModified };
            onFinish( passedObj );
        });
    });   
}

/*
function: flagQuote
info:
    This function sets flagged to true for the quote with qid given.
parameters:
    qid, string/objectId, the unique identifier for the quote
    onFinish, function, the function to be called when the query finishes.
returns:
    nothing
*/
function flagQuote( qid, onFinish )
{
    _setQuoteFlagged( qid, true, onFinish );
}

/*
function: unflagQuote
info:
    This function sets flagged to false for the quote with qid given.
parameters:
    qid, string/objectId, the unique identifier for the quote
    onFinish, function, the function to be called when the query finishes.
returns:
    nothing
*/
function unflagQuote( qid, onFinish )
{
    _setQuoteFlagged( qid, false, onFinish );
}


//add the functions above to this module so that they are usable outside of the module
exports.getAllQuotes = getAllQuotes;
exports.createQuote = createQuote;
exports.upvoteQuote = upvoteQuote;
exports.downvoteQuote = downvoteQuote;
exports.getQuoteById = getQuoteById;
exports.createUser = createUser;
exports.verifyUserCredentials = verifyUserCredentials;
exports.getUserData = getUserData;
exports.isUsernameTaken = isUsernameTaken;
exports.cleanDatabase = cleanDatabase;
exports.closeConnection = closeConnection;
exports.setupDatabase = setupDatabase;
exports.createQuoteWithUsername = createQuoteWithUsername;
exports.getAllQuotesFromUser = getAllQuotesFromUser;
exports.flagQuote = flagQuote;
exports.unflagQuote = unflagQuote;
exports.getQuotesByFlag = getQuotesByFlag;
exports.createUserWithRole = createUserWithRole;

