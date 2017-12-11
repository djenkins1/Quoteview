var Constants = require( "./public/components/Constants" );
const dataAPI = require( "./dataAPI" );
const assert = require('assert');
var http = require('http');
const normalUsername = "jenkins";
const adminUsername = "djenkins1";
var querystring = require('querystring');
var adminId = undefined;
var normalUserId = undefined;
var cookieList = undefined;
var myQuoteId = undefined;

function assertErrorField( errorField, errorName, errorProblem, onFinish )
{
    assert.equal( errorField.name , errorName );
    assert.equal( errorField.problem , errorProblem );
    onFinish();
}

function assertErrorJSON( errorJSON )
{
    assert.ok( errorJSON.error );
    assert.ok( errorJSON.errors );
    assert.ok( errorJSON.errors.length );
}

function assertAdminError( errorObj, onFinish )
{
    assertErrorJSON( errorObj );
    assertErrorField( errorObj.errors[ 0 ] , "user" , "not admin", onFinish );
}

function assertNotUserError( errorObj, onFinish )
{
    assertErrorJSON( errorObj );
    assertErrorField( errorObj.errors[ 0 ] , "user" , "not logged in", onFinish );
}

function sendPostRequest( urlPath, postData, onFinish )
{
    // An object of options to indicate where to post to
    var options = {
        port: '8081',
        path: urlPath,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength( postData )
        }
    };

    //if the cookie list is defined then add the cookies to the headers
    if ( cookieList )
    {
        options.headers.Cookie = cookieList;
    }

    // Set up the request
    var postRequest = http.request( options, function( res ) 
    {
        var data = "";
        res.setEncoding('utf8');
        res.on( 'data', function( chunk ) 
        {
            data += chunk;
        });

        res.on( 'end', function () 
        {
            if ( cookieList === undefined || res.headers[ 'set-cookie'] )
            {
                cookieList = res.headers['set-cookie'];
            }
            onFinish( res, data );
        });
    });

    // post the data
    postRequest.write( postData );
    postRequest.end();
}

//sends a get request to the url given and passes along the response and it's data
function sendGetRequest( urlPath,  onFinish )
{
    var options = { 
        port: 8081,
        path: urlPath,
    };

    if ( cookieList )
    {
        options.headers = {'Cookie': cookieList };
    }

    http.get( options, function( res ) 
    {
        var data = '';
        res.on('data', function (chunk) 
        {
            data += chunk;
        });

        res.on('end', function () 
        {
            if ( cookieList === undefined || res.headers[ 'set-cookie'] )
            {
                cookieList = res.headers['set-cookie'];
            }
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

//create a quote with random author/body
//use userId as creator of quote
//call onFinish when quotes have been created
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
                dataAPI.createUserWithRole( adminUsername, adminUsername, Constants.ROLE_USER_ADMIN, function( result )
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
        sendGetRequest( "/quotes" , function( res, data )
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
        sendGetRequest( "/quotes?creator=" + normalUserId , function( res, data )
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

    //test that /newUser endpoint returns correct username in response
    it( 'Test Signup' , function( done )
    {
        var userObj = { "username" : "newusername" , "password" : "newusername" };
        sendPostRequest( "/newUser" , querystring.stringify( userObj ), function( res, data )
        {
            assert.equal( res.statusCode , 200 );
            var userData = JSON.parse( data );
            assert.ok( userData.username );
            assert.ok( userData.userId );
            assert.equal( userData.username, userObj.username );
            done();
        });
    });

    //test that /logout endpoint returns 200 status
    it( 'Test Logout' , function( done )
    {
        sendGetRequest( "/logout" , function( res, data )
        {
            assert.equal( res.statusCode , 200 );
            done();
        });
    });

    //test that /login endpoint returns correct username in response
    it( 'Test Login' , function( done )
    {
        var userObj = { "username" : normalUsername , "password" : normalUsername };
        sendPostRequest( "/login" , querystring.stringify( userObj ), function( res, data )
        {
            assert.equal( res.statusCode , 200 );
            var userData = JSON.parse( data );
            assert.ok( userData.username );
            assert.ok( userData.userId );
            assert.equal( userData.username, userObj.username );
            done();
        });
    });

    //test that /userData returns correct data in response when logged in
    it( 'Test UserData' , function( done )
    {
        sendGetRequest( "/userData" , function( res, data )
        {
            assert.equal( res.statusCode , 200 );
            var userData = JSON.parse( data );
            assert.ok( userData.username );
            assert.ok( userData.userId );
            assert.ok( userData.role );
            assert.equal( userData.username, normalUsername );
            assert.equal( userData.role, Constants.ROLE_USER_DEFAULT );
            done();
        });
    });

    //test that /newQuote actually creates a quote and it matches what is in the database after creation
    it( 'Test newQuote good' , function( done )
    {
        var quoteBody = "Testing...";
        var quoteAuthor = "Tester";
        var newQuoteForm = { "author" : quoteAuthor , body : quoteBody };
        sendPostRequest( "/newQuote" , querystring.stringify( newQuoteForm ), function( res, data )
        {
            assert.equal( res.statusCode , 200 );
            var quoteDataFromServer = JSON.parse( data );
            assert.ok( quoteDataFromServer.qid );
            assert.ok( quoteDataFromServer.author );
            assert.ok( quoteDataFromServer.body );
            assert.ok( quoteDataFromServer.creatorId );
            assert.equal( quoteDataFromServer.author, quoteAuthor );
            assert.equal( quoteDataFromServer.body, quoteBody );
            dataAPI.getQuoteById( quoteDataFromServer.qid , function( quoteResult )
            {
                var quoteJson = JSON.parse( JSON.stringify( quoteResult ) );
                assertQuotesEqual( quoteDataFromServer, quoteJson );
                myQuoteId = quoteDataFromServer.qid;
                done();
            });
        });        
    });

    //test that /downvoteQuote actually results in the database downvoting the quote
    it( 'Test downvoteQuote good' , function( done )
    {
        sendGetRequest( "/downvoteQuote?qid=" + myQuoteId , function( res, data )
        {
            assert.equal( res.statusCode , 200 );
            var quoteDataFromServer = JSON.parse( data );
            assert.ok( quoteDataFromServer.qid );
            assert.ok( quoteDataFromServer.author );
            assert.ok( quoteDataFromServer.body );
            assert.ok( quoteDataFromServer.creatorId ); 
            assert.equal( quoteDataFromServer.qid, myQuoteId );
            assert.equal( quoteDataFromServer.creatorId, JSON.parse( JSON.stringify( normalUserId ) ) );
            assert.equal( quoteDataFromServer.score, -1 );
            dataAPI.getQuoteById( myQuoteId , function( quoteResult )
            {
                var quoteJson = JSON.parse( JSON.stringify( quoteResult ) );
                assertQuotesEqual( quoteDataFromServer, quoteJson );
                myQuoteId = quoteDataFromServer.qid;
                done();
            });            
        });
    });

    //test that /upvoteQuote actually results in the database upvoting the quote
    it( 'Test upvoteQuote good' , function( done )
    {
        sendGetRequest( "/upvoteQuote?qid=" + myQuoteId , function( res, data )
        {
            assert.equal( res.statusCode , 200 );
            var quoteDataFromServer = JSON.parse( data );
            assert.ok( quoteDataFromServer.qid );
            assert.ok( quoteDataFromServer.author );
            assert.ok( quoteDataFromServer.body );
            assert.ok( quoteDataFromServer.creatorId ); 
            assert.equal( quoteDataFromServer.qid, myQuoteId );
            assert.equal( quoteDataFromServer.creatorId, JSON.parse( JSON.stringify( normalUserId ) ) );
            assert.equal( quoteDataFromServer.score, 0 );
            dataAPI.getQuoteById( myQuoteId , function( quoteResult )
            {
                var quoteJson = JSON.parse( JSON.stringify( quoteResult ) );
                assertQuotesEqual( quoteDataFromServer, quoteJson );
                myQuoteId = quoteDataFromServer.qid;
                done();
            });            
        });
    });

    //test that /upvoteQuote endpoint returns error if quote id is invalid
    it( 'Test Error UpvoteQuote Invalid ID' , function( done )
    {
        sendGetRequest( "/upvoteQuote?qid=BADQUOTES" , function( res, data )
        {
            assert.equal( res.statusCode , 200 );
            var errorObj = JSON.parse( data );
            assertErrorJSON( errorObj );
            assertErrorField( errorObj.errors[ 0 ], "qid", "wrong type", done );
        });
    });

    //test that /downvoteQuote endpoint returns error if quote id is invalid
    it( 'Test Error DownvoteQuote Invalid ID' , function( done )
    {
        sendGetRequest( "/downvoteQuote?qid=ABADQUOTEZ" , function( res, data )
        {
            assert.equal( res.statusCode , 200 );
            var errorObj = JSON.parse( data );
            assertErrorJSON( errorObj );
            assertErrorField( errorObj.errors[ 0 ], "qid", "wrong type", done );
        });
    });

    //test that /quotes endpoint returns error if creator id given is invalid
    it( 'Test Error Quotes Invalid Creator ID' , function( done )
    {
        sendGetRequest( "/quotes?creator=ABADQUOTEZ" , function( res, data )
        {
            assert.equal( res.statusCode , 200 );
            var errorObj = JSON.parse( data );
            assertErrorJSON( errorObj );
            assertErrorField( errorObj.errors[ 0 ], "creator", "wrong type", done );
        });
    });   

    //test that /upvoteQuote endpoint returns error if quote id is valid length/type but not actually in database
    it( 'Test Error UpvoteQuote Nonexistent ID' , function( done )
    {
        sendGetRequest( "/upvoteQuote?qid=0123456789AB" , function( res, data )
        {
            assert.equal( res.statusCode , 200 );
            var errorObj = JSON.parse( data );
            assertErrorJSON( errorObj );
            assertErrorField( errorObj.errors[ 0 ], "qid", "invalid quote", done );
        });
    });

    //test that /downvoteQuote endpoint returns error if quote id is valid length/type but not actually in database
    it( 'Test Error DownvoteQuote Nonexistent ID' , function( done )
    {
        sendGetRequest( "/downvoteQuote?qid=0123456789AB" , function( res, data )
        {
            assert.equal( res.statusCode , 200 );
            var errorObj = JSON.parse( data );
            assertErrorJSON( errorObj );
            assertErrorField( errorObj.errors[ 0 ], "qid", "invalid quote", done );
        });
    });

    //test that /quotes endpoint returns empty array if creator id given is valid length/type but not actually in database
    it( 'Test Quotes Nonexistent Creator ID' , function( done )
    {
        sendGetRequest( "/quotes?creator=0123456789AB" , function( res, data )
        {
            assert.equal( res.statusCode , 200 );
            var dataJSON = JSON.parse( data );
            assert.equal( dataJSON.length, 0 );
            done();
        });
    }); 

    //test that /flagged endpoint returns error if the user is not an admin
    it( 'Test Error Flagged As User' , function( done )
    {
        sendGetRequest( "/flagged" , function( res, data )
        {
            assert.equal( res.statusCode , 200 );
            var errorObj = JSON.parse( data );
            assertAdminError( errorObj, done );
        });
    });

    //test that /newQuote endpoint returns error if the author field does not have enough characters
    it( 'Test Error NewQuote MinLength Author' , function( done )
    {
        var quoteBody = "Long Enough";
        var quoteAuthor = "1234";
        var newQuoteForm = { "author" : quoteAuthor , body : quoteBody };
        sendPostRequest( "/newQuote" , querystring.stringify( newQuoteForm ), function( res, data )
        {
            assert.equal( res.statusCode , 200 );
            var errorObj = JSON.parse( data );
            assertErrorJSON( errorObj );
            assert.equal( errorObj.errors[ 0 ].name , "author" );
            assert.ok( errorObj.errors[ 0 ].problem );
            done();
        }); 
    });

    //test that /newQuote endpoint returns error if the author field has too many characters
    it( 'Test Error NewQuote MaxLength Author' , function( done )
    {
        var quoteBody = "Long Enough";
        var quoteAuthor = "This String Is Way Too Long And should cause an error for this endpoint";
        var newQuoteForm = { "author" : quoteAuthor , body : quoteBody };
        sendPostRequest( "/newQuote" , querystring.stringify( newQuoteForm ), function( res, data )
        {
            assert.equal( res.statusCode , 200 );
            var errorObj = JSON.parse( data );
            assertErrorJSON( errorObj );
            assert.equal( errorObj.errors[ 0 ].name , "author" );
            assert.ok( errorObj.errors[ 0 ].problem );
            done();
        }); 
    });

    //test that /newQuote endpoint returns error if the body field has too many characters
    it( 'Test Error NewQuote MaxLength Body' , function( done )
    {
        //generate 3001 characters for the body so that it is too large and endpoint complains
        var crypto = require("crypto");
        var quoteBody = crypto.randomBytes( 3001 ).toString('hex');

        var quoteAuthor = "Author Fine";
        var newQuoteForm = { "author" : quoteAuthor , body : quoteBody };
        sendPostRequest( "/newQuote" , querystring.stringify( newQuoteForm ), function( res, data )
        {
            assert.equal( res.statusCode , 200 );
            var errorObj = JSON.parse( data );
            assertErrorJSON( errorObj );
            assert.equal( errorObj.errors[ 0 ].name , "body" );
            assert.ok( errorObj.errors[ 0 ].problem );
            done();
        }); 
    });

    //test that /newQuote endpoint returns error if the body field has too few characters
    it( 'Test Error NewQuote MinLength Body' , function( done )
    {
        var quoteBody = "1234";
        var quoteAuthor = "Author Fine";
        var newQuoteForm = { "author" : quoteAuthor , body : quoteBody };
        sendPostRequest( "/newQuote" , querystring.stringify( newQuoteForm ), function( res, data )
        {
            assert.equal( res.statusCode , 200 );
            var errorObj = JSON.parse( data );
            assertErrorJSON( errorObj );
            assert.equal( errorObj.errors[ 0 ].name , "body" );
            assert.ok( errorObj.errors[ 0 ].problem );
            done();
        }); 
    });

    //test that /flagQuote endpoint returns error if the user is not an admin
    it( 'Test Error FlagQuote As User' , function( done )
    {
        var quoteObj = { "qid" : myQuoteId };
        sendPostRequest( "/flagQuote" , querystring.stringify( quoteObj ), function( res, data )
        {
            assert.equal( res.statusCode , 200 );
            var errorObj = JSON.parse( data );
            assertAdminError( errorObj, done );
        });
    });

    //test that /unflagQuote endpoint returns error if the user is not an admin
    it( 'Test Error UnflagQuote As User' , function( done )
    {
        var quoteObj = { "qid" : myQuoteId };
        sendPostRequest( "/unflagQuote" , querystring.stringify( quoteObj ), function( res, data )
        {
            assert.equal( res.statusCode , 200 );
            var errorObj = JSON.parse( data );
            assertAdminError( errorObj, done );
        });
    });

    //test that /logout endpoint returns 200 status
    it( 'Test Logout 2' , function( done )
    {
        sendGetRequest( "/logout" , function( res, data )
        {
            assert.equal( res.statusCode , 200 );
            done();
        });
    });

    //test that /newQuote returns an error if not logged in
    it( 'Test Error NewQuote Not User' , function( done )
    {
        var quoteBody = "Testing...";
        var quoteAuthor = "Tester";
        var newQuoteForm = { "author" : quoteAuthor , body : quoteBody };
        sendPostRequest( "/newQuote" , querystring.stringify( newQuoteForm ), function( res, data )
        {
            assert.equal( res.statusCode , 200 );
            assertNotUserError( JSON.parse( data ), done );
        });        
    });

    //test that /upvoteQuote returns an error if not logged in
    it( 'Test Error UpvoteQuote Not User' , function( done )
    {
        sendGetRequest( "/upvoteQuote?qid=" + myQuoteId , function( res, data )
        {
            assert.equal( res.statusCode , 200 );
            assertNotUserError( JSON.parse( data ), done );
        });        
    });

    //test that /downvoteQuote returns an error if not logged in
    it( 'Test Error DownvoteQuote Not User' , function( done )
    {
        sendGetRequest( "/downvoteQuote?qid=" + myQuoteId , function( res, data )
        {
            assert.equal( res.statusCode , 200 );
            assertNotUserError( JSON.parse( data ), done );
        });        
    });

    //test that /login endpoint returns correct username/role in response for admin user
    it( 'Test Login Admin' , function( done )
    {
        var userObj = { "username" : adminUsername , "password" : adminUsername };
        sendPostRequest( "/login" , querystring.stringify( userObj ), function( res, data )
        {
            assert.equal( res.statusCode , 200 );
            var userData = JSON.parse( data );
            assert.ok( userData.username );
            assert.ok( userData.userId );
            assert.ok( userData.role );
            assert.equal( userData.username, userObj.username );
            assert.equal( userData.role, Constants.ROLE_USER_ADMIN );
            done();
        });
    });

    //test that /flagQuote endpoint actually results in the quote being flagged as true
    it( 'Test FlagQuote' , function( done )
    {
        var quoteObj = { "qid" : myQuoteId };
        sendPostRequest( "/flagQuote" , querystring.stringify( quoteObj ), function( res, data )
        {
            assert.equal( res.statusCode , 200 );
            var quoteData = JSON.parse( data );
            assert.ok( quoteData.qid );
            assert.ok( quoteData.flagged );
            assert.equal( quoteData.qid, quoteObj.qid );
            dataAPI.getQuoteById( myQuoteId , function( quoteResult )
            {
                var quoteJson = JSON.parse( JSON.stringify( quoteResult ) );
                assertQuotesEqual( quoteData, quoteJson );
                done();
            }); 
        });
    });

    //test that /flagged endpoint actually returns flagged quotes
    it( 'Test Flagged' , function( done )
    {
        sendGetRequest( "/flagged" , function( res, data )
        {
            assert.equal( res.statusCode , 200 );
            var quotesData = JSON.parse( data );
            assert.equal( quotesData.length , 1 );
            assert.ok( quotesData[ 0 ].qid );
            assert.ok( quotesData[ 0 ].flagged );
            assert.equal( quotesData[ 0 ].qid, myQuoteId );
            done();
        });
    });

    //test that /unflagQuote endpoint actually results in the quote being flagged false
    it( 'Test UnflagQuote' , function( done )
    {
        var quoteObj = { "qid" : myQuoteId };
        sendPostRequest( "/unflagQuote" , querystring.stringify( quoteObj ), function( res, data )
        {
            assert.equal( res.statusCode , 200 );
            var quoteData = JSON.parse( data );
            assert.ok( quoteData.qid );
            assert.equal( quoteData.qid, quoteObj.qid );
            assert.equal( quoteData.flagged, false );
            dataAPI.getQuoteById( myQuoteId , function( quoteResult )
            {
                var quoteJson = JSON.parse( JSON.stringify( quoteResult ) );
                assertQuotesEqual( quoteData, quoteJson );
                done();
            }); 
        });
    });

    //test that /unflagQuote endpoint returns error if quote id is invalid
    it( 'Test Error UnflagQuote Invalid ID' , function( done )
    {
        var quoteObj = { "qid" : "ABADQUOTE" };
        sendPostRequest( "/unflagQuote" , querystring.stringify( quoteObj ), function( res, data )
        {
            assert.equal( res.statusCode , 200 );
            var errorObj = JSON.parse( data );
            assertErrorJSON( errorObj );
            assertErrorField( errorObj.errors[ 0 ], "qid", "wrong type", done );
        });
    });

    //test that /flagQuote endpoint returns error if quote id is invalid
    it( 'Test Error FlagQuote Invalid ID' , function( done )
    {
        var quoteObj = { "qid" : "ABADQUOTE" };
        sendPostRequest( "/flagQuote" , querystring.stringify( quoteObj ), function( res, data )
        {
            assert.equal( res.statusCode , 200 );
            var errorObj = JSON.parse( data );
            assertErrorJSON( errorObj );
            assertErrorField( errorObj.errors[ 0 ], "qid", "wrong type", done );
        });
    });

    //test that /flagged endpoint returns error if creator id given is invalid
    it( 'Test Error Flagged Invalid Creator ID' , function( done )
    {
        sendGetRequest( "/flagged?creator=ABADQUOTEZ" , function( res, data )
        {
            assert.equal( res.statusCode , 200 );
            var errorObj = JSON.parse( data );
            assertErrorJSON( errorObj );
            assertErrorField( errorObj.errors[ 0 ], "creator", "wrong type", done );
        });
    });   

    //test that /flagQuote endpoint returns error if quote id is valid length/type but not actually in database
    it( 'Test Error FlagQuote Nonexistent ID' , function( done )
    {
        var quoteObj = { "qid" : "0123456789AB" };
        sendPostRequest( "/flagQuote" , querystring.stringify( quoteObj ), function( res, data )
        {
            assert.equal( res.statusCode , 200 );
            var errorObj = JSON.parse( data );
            assertErrorJSON( errorObj );
            assertErrorField( errorObj.errors[ 0 ], "qid", "invalid quote", done );
        });
    });

    //test that /unflagQuote endpoint returns error if quote id is valid length/type but not actually in database
    it( 'Test Error UnflagQuote Nonexistent ID' , function( done )
    {
        var quoteObj = { "qid" : "0123456789AB" };
        sendPostRequest( "/unflagQuote" , querystring.stringify( quoteObj ), function( res, data )
        {
            assert.equal( res.statusCode , 200 );
            var errorObj = JSON.parse( data );
            assertErrorJSON( errorObj );
            assertErrorField( errorObj.errors[ 0 ], "qid", "invalid quote", done );
        });
    });

    //test that /flagged endpoint returns empty array if creator id given is valid length/type but not actually in database
    it( 'Test Flagged Nonexistent Creator ID' , function( done )
    {
        sendGetRequest( "/flagged?creator=0123456789AB" , function( res, data )
        {
            assert.equal( res.statusCode , 200 );
            var dataJSON = JSON.parse( data );
            assert.equal( dataJSON.length, 0 );
            done();
        });
    }); 

    //test that /logout endpoint returns 200 status
    it( 'Test Logout Admin' , function( done )
    {
        sendGetRequest( "/logout" , function( res, data )
        {
            assert.equal( res.statusCode , 200 );
            done();
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

