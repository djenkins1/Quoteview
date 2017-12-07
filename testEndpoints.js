var Constants = require( "./public/components/Constants" );
const dataAPI = require( "./dataAPI" );
const assert = require('assert');
http = require('http');
const normalUsername = "jenkins";
const adminUsername = "djenkins1";
var adminId = undefined;
var normalUserId = undefined;
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

function assertQuotesEqual( actual , expected )
{
    assert.equal( expected.creatorId, actual.creatorId );
    assert.equal( expected.qid, actual.qid );
    assert.equal( expected.creatorName, actual.creatorName );
    assert.equal( expected.body, actual.body );
    assert.equal( expected.author, actual.author );
    assert.equal( expected.flagged, actual.flagged );
}

//TODO: create a quote with random author/body
//TODO: use userId as creator of quote
//TODO: call onFinish when quotes have been created
//TODO: when a quote is created add it's info to the quoteDict with key being qid
function createRandomQuote( userId )
{
    var quoteObj = {};
    quoteObj.author = Date.now();
    quoteObj.body = Date.now();
    quoteObj.creatorId = userId;
    return new Promise( function(resolve, reject) 
    {
        dataAPI.createQuote( quoteObj.author, quoteObj.body , quoteObj.creatorId, function( result ) 
        {
            if ( result.insertId === undefined )
            {
                reject( new Error( "result.insertId is undefined" ) );
            }
            resolve( result );
        });
    });
}

function setupQuotes( onFinish )
{
    var promises = [];
    for (var i = 0; i < 10; i++) 
    {
        promises.push( createRandomQuote( normalUserId ) );
    }

    Promise.all(promises).then( function() 
    {
        // returned data is in arguments[0], arguments[1], ... arguments[n]
        /*
        for( var i = 0; i < arguments.length; i++ )
        {
            console.log( arguments );
        }
        */
        onFinish();
    }, 
    function(err) 
    {
        // error occurred
        if ( err ) throw err;
    });
}

describe('TestEndpoints', function() 
{
    //The before() callback gets run before all tests in the suite.
    //Clean and setup the database. 
    before( function( done )
    {
        dataAPI.cleanDatabase( function()
        {
            dataAPI.setupDatabase( function()
            {
                dataAPI.createUser( adminUsername, adminUsername, function( result )
                {
                    adminId = result.insertId;
                    dataAPI.createUser( normalUsername, normalUsername, function( res2 )
                    {
                        normalUserId = res2.insertId;
                        setupQuotes( done );
                    });
                });
            });
        } );
    });

    //test that /quotes endpoint returns the same thing as dataAPI.getAllQuotes
    it('Test All Quotes', function (done) 
    {
        sendGetRequest( baseUrl + "quotes" , function( res, data )
        {
            assert.equal( res.statusCode , 200 );
            //convert data to object using JSON.parse and verify quotes one by one
            var quotesInData = JSON.parse( data );
            dataAPI.getAllQuotes( function( results )
            {
                var allQuotes = JSON.parse( JSON.stringify( results ) );
                assert.equal( quotesInData.length , allQuotes.length );
                for ( var i = 0; i < quotesInData.length; i++ )
                {
                    assertQuotesEqual( quotesInData[ i ], allQuotes[ i ] );
                }
                done();
            });
        });
    });

    //test that /quotes endpoint returns the same thing as dataAPI.getAllQuotes
    it('Test Creator Quotes', function (done) 
    {
        sendGetRequest( baseUrl + "quotes?creator=" + normalUserId , function( res, data )
        {
            assert.equal( res.statusCode , 200 );
            //convert data to object using JSON.parse and verify quotes one by one
            var quotesInData = JSON.parse( data );
            dataAPI.getAllQuotesFromUser( normalUserId, function( results )
            {
                var allQuotes = JSON.parse( JSON.stringify( results ) );
                assert.equal( quotesInData.length , allQuotes.length );
                for ( var i = 0; i < quotesInData.length; i++ )
                {
                    assertQuotesEqual( quotesInData[ i ], allQuotes[ i ] );
                }
                done();
            });
        });
    });

    //after() is run after all tests have completed.
    //close down the database connection
    after( function( done ) 
    {
        dataAPI.closeConnection();
        done();
    });
});

