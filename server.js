var http = require("http");
var url = require('url');
var urlHandler = require('./urlHandler');

function helloWorld( queryObj, response )
{
    response.writeHead(200, {'Content-Type': 'text/plain'});
    response.write( "Hello World\n" );
}

function standardErrorCall( errorList, queryObj, response )
{
    response.writeHead(200, {'Content-Type': 'text/plain'});
    for ( var i = 0; i < errorList.length; i++ )
    {
        response.write( errorList[ i ].name + ": " + errorList[ i ].problem + "\n" );
    }
}

function squareNumber( queryObj, response )
{
    response.writeHead(200, {'Content-Type': 'text/plain'});
    if ( queryObj.number == undefined )
    {
        console.log( "Problem, required number undefined" );
        return;
    }

    var squared = Number( queryObj.number ) * Number( queryObj.number );
    response.write( queryObj.number + " squared is " + squared +  "\n" );    
}

urlHandler.registerObserver( "/hello.html" , [] , helloWorld, standardErrorCall );
urlHandler.registerObserver( "/square.html" , [ { "name" : "number" , "type" : "float" , "required" : true } ], squareNumber, standardErrorCall );
//TODO: need to test optional parameters

http.createServer(function (request, response) 
{
    // Send the HTTP header 
    // HTTP Status: 200 : OK
    // Content Type: text/plain
    response.writeHead(200, {'Content-Type': 'text/plain'});

    urlHandler.handleUrl( request.url, response );
    response.end();
}).listen(8081);

// Console will print the message
console.log('Server running at http://127.0.0.1:8081/');

