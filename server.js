var http = require("http");
var url = require('url');
var urlHandler = require('./urlHandler');
var execsql = require('execsql');
var dataAPI = require( "./dataAPI" );
var Constants = require( "./public/components/Constants" );

//simple error function that displays whatever errors occurred
function standardErrorCall( errorList, queryObj, response, sessionObj, onFinish )
{
    response.writeHead(200, {'Content-Type': 'text/plain'});
    for ( var i = 0; i < errorList.length; i++ )
    {
        response.write( errorList[ i ].name + ": " + errorList[ i ].problem + "\n" );
    }

    onFinish( sessionObj );
}

//error function that responds with whatever errors occurred in a json format
function outputErrorAsJson( errorList ,queryObj, response, sessionObj, onFinish )
{
    response.writeHead( 200, {'Content-Type': 'text/json'});
    var errorObj = { "error" : true , "errors" : errorList };
    response.write( JSON.stringify( errorObj ) );
    onFinish( sessionObj );
}

//responds with all the quotes in the database
function returnAllQuotes( queryObj , response, sessionObj, onFinish )
{
    if ( queryObj.creator )
    {
        dataAPI.getAllQuotesFromUser( queryObj.creator, function( results ) {
            response.writeHead(200, {'Content-Type': 'text/json'});
            response.write( JSON.stringify( results ) );
            onFinish( sessionObj );
        });       
    }
    else
    {
        dataAPI.getAllQuotes( function( results ) {
            response.writeHead(200, {'Content-Type': 'text/json'});
            response.write( JSON.stringify( results ) );
            onFinish( sessionObj );
        });
    }
}

//returns list of flagged quotes if logged in
function returnFlaggedQuotes( queryObj, response, sessionObj, onFinish )
{
    //if the user is not logged in then stop them from getting the flagged quotes
    if ( sessionObj.data.user === undefined )
    {
        var errorList = [ { "name" : "user" , "problem" : "not logged in" } ];
        outputErrorAsJson( errorList, queryObj, response, sessionObj, onFinish );
        return;
    }

    //if the user is not an admin then stop them from getting the flagged quotes
    if ( sessionObj.data.role !== Constants.ROLE_USER_ADMIN )
    {
        var errorList = [ { "name" : "user" , "problem" : "not admin" } ];
        outputErrorAsJson( errorList, queryObj, response, sessionObj, onFinish );
        return;
    }

    dataAPI.getQuotesByFlag( function( results ) 
    {
        response.writeHead(200, {'Content-Type': 'text/json'});
        response.write( JSON.stringify( results ) );
        onFinish( sessionObj );
    } 
    , true, queryObj.creator );
}

//sends back a 500 error
function respondServerError( queryObj, response, sessionObj, onFinish )
{
    response.writeHead( 500, {'Content-Type': 'text/plain'});
    response.write( "500 Internal Server Error" );
    onFinish( sessionObj );
}

//logout the user and invalidate the session
function logoutUser( queryObj, response, sessionObj, onFinish )
{
    if ( sessionObj.data.user === undefined )
    {
        var errorList = [ { "name" : "user" , "problem" : "not logged in" } ];
        outputErrorAsJson( errorList, queryObj, response, sessionObj, onFinish );
        return;
    }

    sessionObj.deleted = true;
    response.writeHead( 200, {'Content-Type': 'text/json'});
    var resultObj = { "status" : "logged out" };
    response.write( JSON.stringify( resultObj ) );
    onFinish( sessionObj );    
}

//endpoint for seeing which user is logged in on this session
function loggedInAs( queryObj, response, sessionObj, onFinish )
{
    if ( sessionObj.data.user === undefined )
    {
        var errorList = [ { "name" : "user" , "problem" : "not logged in" } ];
        outputErrorAsJson( errorList, queryObj, response, sessionObj, onFinish );
        return;
    }

    dataAPI.getUserData( sessionObj.data.user , function( result )
    {
        response.writeHead(200, {'Content-Type': 'text/json'});
        var resultObj = { "userId" : result.userId , "username" : result.username , "role" : result.role };
        response.write( JSON.stringify( resultObj ) );
        onFinish( sessionObj ); 
    });
}

//creates the user and redirects to index
function testCreateUser( queryObj, response, sessionObj, onFinish )
{
    //if either of the two required parameters are undefined then something went wrong with server code
    if ( queryObj.username === undefined || queryObj.password === undefined 
        || queryObj.email === undefined || queryObj.confirmpass === undefined )
    {
        console.log( "Problem testCreateUser, required parameters undefined" );
        respondServerError( queryObj, response, sessionObj, onFinish );
        return;
    }

    //if the current session already has a user logged in,then cannot create a new user
    if ( sessionObj.data.user )
    {
        var errorList = [ { "name" : "user" , "problem" : "already logged in" } ];
        outputErrorAsJson( errorList, queryObj, response, sessionObj, onFinish );
        return;
    }

    //if the passwords do not match, then output an error
    if ( queryObj.password !== queryObj.confirmpass )
    {
        var errorList = [ { "name" : "password" , "problem" : "does not match confirm" } ];
        outputErrorAsJson( errorList, queryObj, response, sessionObj, onFinish );
        return;
    }

    dataAPI.isUsernameTaken( queryObj.username , function( userTaken )
    {
        if ( userTaken )
        {
            var errorList = [ { "name" : "user" , "problem" : "already taken" } ];
            outputErrorAsJson( errorList, queryObj, response, sessionObj, onFinish );
            return;
        }

        dataAPI.isEmailTaken( queryObj.email , function( emailTaken )
        {
            if ( emailTaken )
            {
                var errorList = [ { "name" : "email" , "problem" : "already taken" } ];
                outputErrorAsJson( errorList, queryObj, response, sessionObj, onFinish );
                return;
            }

            //create a user and log in as them,then redirect to index
            dataAPI.createUser( queryObj.email, queryObj.username, queryObj.password, function( result ) 
            {
                sessionObj.data.user = result.insertId;
                sessionObj.data.username = queryObj.username;
                sessionObj.data.role = Constants.ROLE_USER_DEFAULT;
                response.writeHead(200, {'Content-Type': 'text/json'});
                var userObj = { "userId" : result.insertId , "username" : queryObj.username, "role" : Constants.ROLE_USER_DEFAULT };
                response.write( JSON.stringify( userObj ) );
                onFinish( sessionObj ); 
            });
        });
    });
}

//endpoint for logging in as user
function loginUser( queryObj, response, sessionObj, onFinish )
{
    if ( queryObj.username == undefined || queryObj.password == undefined )
    {
        console.log( "Problem loginUser, required parameters undefined" );
        respondServerError( queryObj, response, sessionObj, onFinish );
        return;    
    }

    if ( sessionObj.data.user )
    {
        var errorList = [ { "name" : "user" , "problem" : "already logged in" } ];
        outputErrorAsJson( errorList, queryObj, response, sessionObj, onFinish );
        return;
    }

    dataAPI.verifyUserCredentials( queryObj.username, queryObj.password, function( isValid, resultObj )
    {
        if ( !isValid )
        {
            var errorList = [ { "name" : "user" , "problem" : "invalid combination" } ];
            outputErrorAsJson( errorList, queryObj, response, sessionObj, onFinish );
            return;
        }

        if ( resultObj.userId == undefined )
        {
            console.log( "Problem loginUser, verifyUserCredentials result is true but resultObj.userId is undefined" );
            respondServerError( queryObj, response, sessionObj, onFinish )
            return;
        }

        response.writeHead(200, {'Content-Type': 'text/json'});
        sessionObj.data.user = resultObj.userId;
        sessionObj.data.username = resultObj.username;
        sessionObj.data.role = resultObj.role;
        response.write( JSON.stringify( resultObj ) );
        onFinish( sessionObj );         
    });
}

//creates a quote with the parameters given and responds with json representation of the new quote
function postQuote( queryObj , response, sessionObj, onFinish )
{
    //if either of the two required parameters is undefined then something is wrong with the urlHandler since it should have caught this
    //in this case,respond with a 500 error
    if ( queryObj.author == undefined || queryObj.body == undefined )
    {
        console.log( "Problem postQuote, required parameters undefined" );
        respondServerError( queryObj, response, sessionObj, onFinish );
        return;
    }

    //if the user is not logged in then send back authorization error
    if ( sessionObj.data.user == undefined )
    {
        var errorList = [ { "name" : "user" , "problem" : "not logged in" } ];
        outputErrorAsJson( errorList, queryObj, response, sessionObj, onFinish );
        return;
    }

    dataAPI.createQuoteWithUsername( queryObj.author, queryObj.body, sessionObj.data.user, sessionObj.data.username, function( result ) {
        dataAPI.getQuoteById( result.insertId , function( quoteObj )
        {
            response.writeHead(200, {'Content-Type': 'text/json'});
            response.write( JSON.stringify( quoteObj ) );
            onFinish( sessionObj );     
        });
    });
}

//endpoint for upvoting a quote
function postUpvoteQuote( queryObj, response, sessionObj, onFinish )
{
    //if the only required parameter is undefined then something is wrong with the urlHandler since it should have caught this
    //in this case,respond with a 500 error
    if ( queryObj.qid == undefined )
    {
        console.log( "Problem postUpvoteQuote, required parameters undefined" );
        respondServerError( queryObj, response, sessionObj, onFinish );
        return;
    }

    //if the user is not logged in then output error
    if ( sessionObj.data.user == undefined )
    {
        outputErrorAsJson( [{"name":"user","problem":"not logged in" }], queryObj, response, sessionObj, onFinish );
        return;           
    }

    dataAPI.upvoteQuote( queryObj.qid, function( result ) 
    {
        if ( result.affectedRows == 0 )
        {
            outputErrorAsJson( [{"name":"qid","problem":"invalid quote" }], queryObj, response, sessionObj, onFinish );
            return;         
        }

        dataAPI.getQuoteById( queryObj.qid, function( result ) 
        {
            response.writeHead( 200, {'Content-Type': 'text/json'});
            response.write( JSON.stringify( result ) );
            onFinish( sessionObj );        
        });
    });    
}

//endpoint for downvoting a quote
function postDownvoteQuote( queryObj, response, sessionObj, onFinish )
{
    //if the only required parameter is undefined then something is wrong with the urlHandler since it should have caught this
    //in this case,respond with a 500 error
    if ( queryObj.qid == undefined )
    {
        console.log( "Problem postDownvoteQuote, required parameters undefined" );
        respondServerError( queryObj, response, sessionObj, onFinish );
        return;
    }

    //if the user is not logged in then output error
    if ( sessionObj.data.user == undefined )
    {
        outputErrorAsJson( [{"name":"user","problem":"not logged in" }], queryObj, response, sessionObj, onFinish );
        return;           
    }

    dataAPI.downvoteQuote( queryObj.qid, function( result ) 
    {
        if ( result.affectedRows == 0 )
        {
            outputErrorAsJson( [{"name":"qid","problem":"invalid quote" }], queryObj, response, sessionObj, onFinish );
            return;          
        }

        dataAPI.getQuoteById( queryObj.qid, function( result ) 
        {
            response.writeHead( 200, {'Content-Type': 'text/json'});
            response.write( JSON.stringify( result ) );
            onFinish( sessionObj );       
        });
    });  
}

//helper function for handling flag/unflag of a quote
function _changeFlagQuote( changeQuoteFunc, queryObj, response, sessionObj, onFinish )
{
    //in this case,respond with a 500 error
    if ( queryObj.qid == undefined )
    {
        console.log( "Problem postFlagQuote, required parameters undefined" );
        respondServerError( queryObj, response, sessionObj, onFinish );
        return;
    }

    //if the user is not logged in then output error
    if ( sessionObj.data.user == undefined )
    {
        outputErrorAsJson( [{"name":"user","problem":"Must be logged in to vote on quote." }], queryObj, response, sessionObj, onFinish );
        return;           
    }

    //if the user is not an admin then respond with an error and stop the request
    if ( sessionObj.data.role !== Constants.ROLE_USER_ADMIN )
    {
        var errorList = [ { "name" : "user" , "problem" : "not admin" } ];
        outputErrorAsJson( errorList, queryObj, response, sessionObj, onFinish );
        return;
    }

    changeQuoteFunc( queryObj.qid, function( result )
    {
        if ( result.affectedRows == 0 )
        {
            outputErrorAsJson( [{"name":"qid","problem":"invalid quote" }], queryObj, response , sessionObj, onFinish );
            return;          
        }

        dataAPI.getQuoteById( queryObj.qid, function( result ) 
        {
            response.writeHead( 200, {'Content-Type': 'text/json'});
            response.write( JSON.stringify( result ) );
            onFinish( sessionObj );       
        });
    });
}

//handles a quote being flagged,need to make sure logged in and user is admin
function postFlagQuote( queryObj, response, sessionObj, onFinish )
{
    _changeFlagQuote( dataAPI.flagQuote, queryObj, response, sessionObj, onFinish );
}

//handles a quote being unflagged,need to make sure logged in and user is admin
function postUnflagQuote( queryObj, response, sessionObj, onFinish )
{
    _changeFlagQuote( dataAPI.unflagQuote, queryObj, response, sessionObj, onFinish );
}

//redirects to the index.html file
function redirectIndex( queryObj, response, sessionObj, onFinish )
{
    urlHandler.redirectToUrl( response , "/index.html", sessionObj, onFinish );
}

//setups the observer handlers
function setupHandlers()
{
    //sets up a simple redirect to index.html when empty path is given
    urlHandler.registerObserver( "GET" , "/" , [] , redirectIndex, standardErrorCall );
    //setup the observer for getting all quotes
    urlHandler.registerObserver( "GET" , "/quotes" , [ urlHandler.createParameter( "creator" , "ObjectId" , false , 1 , 256 ) ] , returnAllQuotes, outputErrorAsJson );
    urlHandler.registerObserver( "POST" , "/newQuote" , [ urlHandler.createParameter( "author" , "string" , true, 5, 60 ) , urlHandler.createParameter( "body" , "string" , true, 5, 3000 ) ], postQuote, outputErrorAsJson );
    urlHandler.registerObserver( "POST" , "/upvoteQuote" , [ urlHandler.createParameter( "qid" , "ObjectId" , true , 1 , 256 ) ], postUpvoteQuote, outputErrorAsJson );
    urlHandler.registerObserver( "POST" , "/downvoteQuote" , [ urlHandler.createParameter( "qid" , "ObjectId" , true , 1, 256 ) ], postDownvoteQuote, outputErrorAsJson );
    urlHandler.registerObserver( "POST" , "/flagQuote" , [ urlHandler.createParameter( "qid" , "ObjectId" , true , 1, 256 ) ] , postFlagQuote, outputErrorAsJson );
    urlHandler.registerObserver( "POST" , "/unflagQuote" , [ urlHandler.createParameter( "qid" , "ObjectId" , true , 1, 256 ) ] , postUnflagQuote, outputErrorAsJson );

    var userSchema = urlHandler.createParameter( "username" , "string" , true, 5, 100 );
    userSchema.finalValidate = urlHandler.validateUsername;
    urlHandler.registerObserver( "POST" , "/newUser" , 
        [ 
            userSchema , 
            urlHandler.createParameter( "password" , "string" , true, 5, 100 ) ,
            urlHandler.createParameter( "confirmpass" , "string" , true, 5, 100 ) ,
            urlHandler.createParameter( "email" , "email" , true, 5, 254 )
        ]
        , testCreateUser , outputErrorAsJson );
    urlHandler.registerObserver( "POST" , "/login" , [ userSchema , urlHandler.createParameter( "password" , "string" , true, 5, 100 ) ],  loginUser, outputErrorAsJson );
    urlHandler.registerObserver( "GET" , "/userData" , [] , loggedInAs, outputErrorAsJson );
    urlHandler.registerObserver( "GET" , "/logout" , [] , logoutUser , outputErrorAsJson );
    urlHandler.registerObserver( "GET" , "/flagged" , [ urlHandler.createParameter( "creator" , "ObjectId" , false , 1 , 256 ) ] , returnFlaggedQuotes , outputErrorAsJson );
    
}

//grab the command line arguments
var myArgs = process.argv.slice(2);

//if there were no arguments
if ( myArgs.length == 0 )
{
    console.log( "You must enter a command option" );
}
else
{
    if ( myArgs[ 0 ] === "--serve" )
    {
        setupHandlers();
        http.createServer(function (request, response) 
        {
            urlHandler.handleUrl( request, response );
        }).listen(8081);

        // Console will print the message
        console.log('Server running at http://127.0.0.1:8081/');
    }
    else if ( myArgs[ 0 ] === "--clean" )
    {
        dataAPI.cleanDatabase( dataAPI.closeConnection );
        console.log( "Database cleaned" );
    }
    else if ( myArgs[ 0 ] === "--setup" )
    {
        dataAPI.setupDatabase( dataAPI.closeConnection );
    }
    else
    {
        console.log( "Unknown command: ", myArgs[ 0 ] );
    }
}



