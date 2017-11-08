var http = require("http");
var url = require('url');
var urlHandler = require('./urlHandler');
var execsql = require('execsql');
var dataAPI = require( "./dataAPI" );

//test function for no parameters
function helloWorld( queryObj, response )
{
    response.writeHead(200, {'Content-Type': 'text/plain'});
    response.write( "Hello World\n" );
    response.end();
}

//simple error function that displays whatever errors occurred
function standardErrorCall( errorList, queryObj, response )
{
    response.writeHead(200, {'Content-Type': 'text/plain'});
    for ( var i = 0; i < errorList.length; i++ )
    {
        response.write( errorList[ i ].name + ": " + errorList[ i ].problem + "\n" );
    }

    response.end();
}

//error function that responds with whatever errors occurred in a json format
function outputErrorAsJson( errorList ,queryObj, response )
{
    response.writeHead( 400, {'Content-Type': 'text/json'});
    var errorObj = { "error" : true , "errors" : errorList };
    response.write( JSON.stringify( errorObj ) );
    response.end();
}

//test function for required parameters of specific type
function squareNumber( queryObj, response )
{
    response.writeHead(200, {'Content-Type': 'text/plain'});
    //sanity test to make sure required parameter can not be undefined
    if ( queryObj.number == undefined )
    {
        console.log( "Problem, required number undefined" );
        respondServerError( queryObj, response );
        return;
    }

    var squared = Number( queryObj.number ) * Number( queryObj.number );
    response.write( queryObj.number + " squared is " + squared +  "\n" );  
    response.end();  
}

//test function for mix of required and optional parameters of specific type
function exponentNumber( queryObj, response )
{
    response.writeHead(200, {'Content-Type': 'text/plain'});
    //sanity test to make sure required parameter can not be undefined
    if ( queryObj.number == undefined )
    {
        console.log( "Problem, required number undefined" );
        respondServerError( queryObj, response );
        return;
    }

    var toPower = 2;
    if ( queryObj.exp != undefined )
    {
        toPower = Number( queryObj.exp );
    }

    var result = Math.pow( Number( queryObj.number ) , toPower );
    response.write( queryObj.number + " to the power of " + toPower + " is " + result +  "\n" );  
    response.end();  
}

//test function for handling a post request
function handleNewUserForm( queryObj, response )
{
    response.writeHead( 200, {'Content-Type': 'text/plain'});
    if ( queryObj.username === undefined || queryObj.password === undefined )
    {
        console.log( "Problem, required parameters undefined" );
        return;
    }

    response.write( "Username: " + queryObj.username + "\n" );
    response.write( "Password: " + queryObj.password + "\n" );
    response.end();
}

//responds with all the quotes in the database
function returnAllQuotes( queryObj , response )
{
    dataAPI.getAllQuotes( function( results ) {
        response.writeHead(200, {'Content-Type': 'text/json'});
        response.write( JSON.stringify( results ) );
        response.end();
    });
}

//sends back a 500 error
function respondServerError( queryObj, response )
{
    response.writeHead( 500, {'Content-Type': 'text/plain'});
    response.write( "500 Internal Server Error" );
    response.end();
}

//creates a quote with the parameters given and responds with json representation of the new quote
function postQuote( queryObj , response )
{
    //if either of the two required parameters is undefined then something is wrong with the urlHandler since it should have caught this
    //in this case,respond with a 500 error
    if ( queryObj.author == undefined || queryObj.body == undefined )
    {
        console.log( "Problem, required parameters undefined" );
        respondServerError( queryObj, response );
        return;
    }

    dataAPI.createQuote( queryObj.author, queryObj.body, function( result ) {
        response.writeHead(200, {'Content-Type': 'text/json'});
        var resultObj = { "qid" : result.insertId , "author" : queryObj.author , "body" : queryObj.body };
        response.write( JSON.stringify( resultObj ) );
        response.end();        
    });
}

//endpoint for upvoting a quote
function postUpvoteQuote( queryObj, response )
{
    //if the only required parameter is undefined then something is wrong with the urlHandler since it should have caught this
    //in this case,respond with a 500 error
    if ( queryObj.qid == undefined )
    {
        console.log( "Problem, required parameters undefined" );
        respondServerError( queryObj, response );
        return;
    }

    dataAPI.upvoteQuote( queryObj.qid, function( result ) 
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
            response.end();
            return;          
        });
    });    
}

//endpoint for downvoting a quote
function postDownvoteQuote( queryObj, response )
{
    //if the only required parameter is undefined then something is wrong with the urlHandler since it should have caught this
    //in this case,respond with a 500 error
    if ( queryObj.qid == undefined )
    {
        console.log( "Problem, required parameters undefined" );
        respondServerError( queryObj, response );
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
            response.end();
            return;          
        });
    });  
}

//redirects to the index.html file
function redirectIndex( queryObj, response )
{
    urlHandler.redirectToUrl( response , "/index.html" );
}

//setups the observer handlers
function setupHandlers()
{
    //sets up a simple redirect to index.html when empty path is given
    urlHandler.registerObserver( "GET" , "/" , [] , redirectIndex, standardErrorCall );
    //setups the other observers to test various functionality
    urlHandler.registerObserver( "GET", "/hello" , [] , helloWorld, standardErrorCall );
    urlHandler.registerObserver( "GET" , "/square" , [ { "name" : "number" , "type" : "float" , "required" : true } ], squareNumber, standardErrorCall );
    urlHandler.registerObserver( "GET" , "/exponent" , [ { "name" : "number" , "type" : "float" , "required" : true } , { "name" : "exp" , "type" : "float" , "required" : false } ], exponentNumber, standardErrorCall );
    urlHandler.registerObserver( "POST" , "/newUser" , [ urlHandler.createParameter( "username" , "string" , true ) , urlHandler.createParameter( "password" , "string" , true ) ], handleNewUserForm, standardErrorCall );
    urlHandler.registerObserver( "GET" , "/errorTest" , [] , respondServerError , standardErrorCall );
    //setup the observer for getting all quotes
    urlHandler.registerObserver( "GET" , "/quotes" , [] , returnAllQuotes, outputErrorAsJson );
    urlHandler.registerObserver( "POST" , "/newQuote" , [ urlHandler.createParameter( "author" , "string" , true ) , urlHandler.createParameter( "body" , "string" , true ) ], postQuote, outputErrorAsJson );
    urlHandler.registerObserver( "POST" , "/upvoteQuote" , [ urlHandler.createParameter( "qid" , "string" , true ) ], postUpvoteQuote, outputErrorAsJson );
    urlHandler.registerObserver( "POST" , "/downvoteQuote" , [ urlHandler.createParameter( "qid" , "string" , true ) ], postDownvoteQuote, outputErrorAsJson );
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
    if ( myArgs[ 0 ] === "--server" )
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
        //TODO: clean the database       
        console.log( "Command not yet implemented: " , myArgs[ 0 ] );
    }
    else if ( myArgs[ 0 ] === "--setup" )
    {
        //setup the database
        var dbConfig = {
            host: 'localhost',
            user: 'root',
            password: ''
        };
        execsql.config(dbConfig).execFile( './quotes.sql', function(err, results)
        {
            if ( err ) throw err;
            console.log(results);
            execsql.end();
        });
    }
    else
    {
        console.log( "Unknown command: ", myArgs[ 0 ] );
    }
}



