var http = require("http");
var url = require('url');
var urlHandler = require('./urlHandler');

function helloWorld( queryObj, response )
{
    response.writeHead(200, {'Content-Type': 'text/plain'});
    response.write( "Hello World\n" );
    response.end();
}

function standardErrorCall( errorList, queryObj, response )
{
    response.writeHead(200, {'Content-Type': 'text/plain'});
    for ( var i = 0; i < errorList.length; i++ )
    {
        response.write( errorList[ i ].name + ": " + errorList[ i ].problem + "\n" );
    }

    response.end();
}

function squareNumber( queryObj, response )
{
    response.writeHead(200, {'Content-Type': 'text/plain'});
    //sanity test to make sure required parameter can not be undefined
    if ( queryObj.number == undefined )
    {
        console.log( "Problem, required number undefined" );
        return;
    }

    var squared = Number( queryObj.number ) * Number( queryObj.number );
    response.write( queryObj.number + " squared is " + squared +  "\n" );  
    response.end();  
}

function exponentNumber( queryObj, response )
{
    response.writeHead(200, {'Content-Type': 'text/plain'});
    //sanity test to make sure required parameter can not be undefined
    if ( queryObj.number == undefined )
    {
        console.log( "Problem, required number undefined" );
        response.end();
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

function handleNewUserForm( queryObj, response )
{
    response.writeHead(200, {'Content-Type': 'text/plain'});
    if ( queryObj.username === undefined || queryObj.password === undefined )
    {
        console.log( "Problem, required parameters undefined" );
        return;
    }

    response.write( "Username: " + queryObj.username + "\n" );
    response.write( "Password: " + queryObj.password + "\n" );
    response.end();
}

urlHandler.registerObserver( "GET", "/hello" , [] , helloWorld, standardErrorCall );
urlHandler.registerObserver( "GET" , "/square" , [ { "name" : "number" , "type" : "float" , "required" : true } ], squareNumber, standardErrorCall );
urlHandler.registerObserver( "GET" , "/exponent" , [ { "name" : "number" , "type" : "float" , "required" : true } , { "name" : "exp" , "type" : "float" , "required" : false } ], exponentNumber, standardErrorCall );
urlHandler.registerObserver( "POST" , "/newUser" , [ urlHandler.createParameter( "username" , "string" , true ) , urlHandler.createParameter( "password" , "string" , true ) ], handleNewUserForm, standardErrorCall );

http.createServer(function (request, response) 
{
    urlHandler.handleUrl( request, response );
}).listen(8081);

// Console will print the message
console.log('Server running at http://127.0.0.1:8081/');

