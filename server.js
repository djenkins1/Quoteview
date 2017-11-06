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

urlHandler.registerObserver( "/hello.html" , [] , helloWorld, standardErrorCall );
urlHandler.registerObserver( "/square.html" , [ { "name" : "number" , "type" : "float" , "required" : true } ], squareNumber, standardErrorCall );
urlHandler.registerObserver( "/exponent.html" , [ { "name" : "number" , "type" : "float" , "required" : true } , { "name" : "exp" , "type" : "float" , "required" : false } ], exponentNumber, standardErrorCall );

http.createServer(function (request, response) 
{
    urlHandler.handleUrl( request.url, response );
}).listen(8081);

// Console will print the message
console.log('Server running at http://127.0.0.1:8081/');

