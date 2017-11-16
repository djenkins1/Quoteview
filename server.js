var http = require("http");
var url = require('url');
var urlHandler = require('./urlHandler');
var execsql = require('execsql');
var dataAPI = require( "./dataAPI" );

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

//test function for required parameters of specific type
function squareNumber( queryObj, response, sessionObj, onFinish )
{
    response.writeHead(200, {'Content-Type': 'text/plain'});
    //sanity test to make sure required parameter can not be undefined
    if ( queryObj.number == undefined )
    {
        console.log( "Problem squareNumber, required number undefined" );
        respondServerError( queryObj, response, sessionObj, onFinish );
        return;
    }

    var squared = Number( queryObj.number ) * Number( queryObj.number );
    response.write( queryObj.number + " squared is " + squared +  "\n" );  
    onFinish( sessionObj ); 
}

//test function for mix of required and optional parameters of specific type
function exponentNumber( queryObj, response, sessionObj, onFinish )
{
    response.writeHead(200, {'Content-Type': 'text/plain'});
    //sanity test to make sure required parameter can not be undefined
    if ( queryObj.number == undefined )
    {
        console.log( "Problem exponentNumber, required number undefined" );
        respondServerError( queryObj, response, sessionObj, onFinish );
        return;
    }

    var toPower = 2;
    if ( queryObj.exp != undefined )
    {
        toPower = Number( queryObj.exp );
    }

    var result = Math.pow( Number( queryObj.number ) , toPower );
    response.write( queryObj.number + " to the power of " + toPower + " is " + result +  "\n" );  
    onFinish( sessionObj );
}

//responds with all the quotes in the database
function returnAllQuotes( queryObj , response, sessionObj, onFinish )
{
    dataAPI.getAllQuotes( function( results ) {
        response.writeHead(200, {'Content-Type': 'text/json'});
        response.write( JSON.stringify( results ) );
        onFinish( sessionObj );
    });
}

//sends back a 500 error
function respondServerError( queryObj, response, sessionObj, onFinish )
{
    response.writeHead( 500, {'Content-Type': 'text/plain'});
    response.write( "500 Internal Server Error" );
    onFinish( sessionObj );
}

//tests session handling
function testSession( queryObj, response, sessionObj, onFinish )
{
    if ( sessionObj.data.whale )
    {
        sessionObj.data.whale = "NO";
    }
    else
    {
        sessionObj.data.whale = "yes";
    }

    response.writeHead( 200, {'Content-Type': 'text/plain'});
    response.write( "SESSION " + sessionObj.data.whale );
    onFinish( sessionObj );
}

//logout the user and invalidate the session
function logoutUser( queryObj, response, sessionObj, onFinish )
{
    sessionObj.deleted = true;
    response.writeHead( 200, {'Content-Type': 'text/json'});
    var resultObj = { "status" : "logged out" };
    response.write( JSON.stringify( resultObj ) );
    onFinish( sessionObj );    
}

//test that a session gets deleted correctly
function testDeleteSession( queryObj, response, sessionObj, onFinish )
{
    sessionObj.deleted = true;
    response.writeHead( 200, {'Content-Type': 'text/plain'});
    response.write( "DELETING SESSION" );
    onFinish( sessionObj );
}

//endpoint for seeing which user is logged in on this session
function loggedInAs( queryObj, response, sessionObj, onFinish )
{
    if ( sessionObj.data.user == undefined )
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
    if ( queryObj.username == undefined || queryObj.password == undefined )
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

    dataAPI.isUsernameTaken( queryObj.username , function( result )
    {
        if ( result )
        {
            var errorList = [ { "name" : "user" , "problem" : "already taken" } ];
            outputErrorAsJson( errorList, queryObj, response, sessionObj, onFinish );
            return;
        }

        //create a user and log in as them,then redirect to index
        dataAPI.createUser( queryObj.username, queryObj.password, function( result ) 
        {
            sessionObj.data.user = result.insertId;
            response.writeHead(200, {'Content-Type': 'text/json'});
            var userObj = { "userId" : result.insertId , "username" : queryObj.username, "role" : "user" };
            response.write( JSON.stringify( userObj ) );
            onFinish( sessionObj ); 
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
        response.write( JSON.stringify( resultObj ) );
        onFinish( sessionObj );         
    });
}

//function to be called whenever someone needs to be logged in and is not
function needLoginRedirect( queryObj, response, sessionObj, onFinish )
{
    redirectIndex( queryObj, response, sessionObj, onFinish );    
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

    dataAPI.createQuote( queryObj.author, queryObj.body, sessionObj.data.user, function( result ) {
        response.writeHead(200, {'Content-Type': 'text/json'});
        var resultObj = { "qid" : result.insertId , "author" : queryObj.author , "body" : queryObj.body , "score" : 0 };
        response.write( JSON.stringify( resultObj ) );
        onFinish( sessionObj );     
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

    dataAPI.upvoteQuote( queryObj.qid, function( result ) 
    {
        if ( result.affectedRows == 0 )
        {
            outputErrorAsJson( {"error": true , "errors": [{"name":"qid","problem":"invalid quote" }]}, queryObj, response, sessionObj, onFinish );
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

    dataAPI.downvoteQuote( queryObj.qid, function( result ) 
    {
        if ( result.affectedRows == 0 )
        {
            outputErrorAsJson( {"error": true , "errors": [{"name":"qid","problem":"invalid quote" }]}, queryObj, response );
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
    //setups the other observers to test various functionality
    /*
    urlHandler.registerObserver( "GET", "/hello" , [] , helloWorld, standardErrorCall );
    urlHandler.registerObserver( "GET" , "/square" , [ { "name" : "number" , "type" : "float" , "required" : true } ], squareNumber, standardErrorCall );
    urlHandler.registerObserver( "GET" , "/exponent" , [ { "name" : "number" , "type" : "float" , "required" : true } , { "name" : "exp" , "type" : "float" , "required" : false } ], exponentNumber, standardErrorCall );
    urlHandler.registerObserver( "GET" , "/errorTest" , [] , respondServerError , standardErrorCall );
    */
    urlHandler.registerObserver( "GET" , "/sessionTest" , [] , testSession, standardErrorCall );
    urlHandler.registerObserver( "GET" , "/sessionDelete" , [] , testDeleteSession, standardErrorCall );
    //setup the observer for getting all quotes
    urlHandler.registerObserver( "GET" , "/quotes" , [] , returnAllQuotes, outputErrorAsJson );
    urlHandler.registerObserver( "POST" , "/newQuote" , [ urlHandler.createParameter( "author" , "string" , true, 5, 60 ) , urlHandler.createParameter( "body" , "string" , true, 5, 3000 ) ], postQuote, outputErrorAsJson );
    urlHandler.registerObserver( "POST" , "/upvoteQuote" , [ urlHandler.createParameter( "qid" , "string" , true , 1 , 256 ) ], postUpvoteQuote, outputErrorAsJson );
    urlHandler.registerObserver( "POST" , "/downvoteQuote" , [ urlHandler.createParameter( "qid" , "string" , true , 1, 256 ) ], postDownvoteQuote, outputErrorAsJson );
    urlHandler.registerObserver( "POST" , "/newUser" , [ urlHandler.createParameter( "username" , "string" , true, 5, 100 ) , urlHandler.createParameter( "password" , "string" , true, 5, 100 ) ], testCreateUser , outputErrorAsJson );
    urlHandler.registerObserver( "POST" , "/login" , [ urlHandler.createParameter( "username" , "string" , true, 5, 100 ) , urlHandler.createParameter( "password" , "string" , true, 5, 100 ) ],  loginUser, outputErrorAsJson );
    urlHandler.registerObserver( "GET" , "/userData" , [] , loggedInAs, outputErrorAsJson );
    urlHandler.registerObserver( "GET" , "/logout" , [] , logoutUser , outputErrorAsJson );
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



