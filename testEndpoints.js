var Constants = require( "./public/components/Constants" );
const dataAPI = require( "./dataAPI" );
const assert = require('assert');
http = require('http');
const myUsername = "jenkins";
const adminUser = "djenkins1";
const baseUrl = "http://localhost:8081/";

//sends a get request to the url given and passes along the response and it's data
//TODO: url parameters
function sendGetRequest( url, onFinish )
{
    http.get( url, function(res ) 
    {
        var data = '';
        res.on('data', function (chunk) 
        {
            data += chunk;
        });

        res.on('end', function () 
        {
            onFinish( res, data );
        });
    });
}

//TODO: need a before function that cleans database and setups all users and quotes
describe('TestEndpoints', function() 
{
    it('Test All Quotes', function (done) 
    {
        sendGetRequest( baseUrl + "quotes" , function( res, data )
        {
            assert.equal( res.statusCode , 200 );
            //TODO: convert data to object using JSON.parse and verify quotes one by one
            console.log( data );
            done();
        });
    });
});

