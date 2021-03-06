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
    quoteObj.author = "Author " + Date.now();
    quoteObj.body = "Body testing " + Date.now();
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

//creates multiple quotes and waits for database to finish for all of them before calling onFinish
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
                dataAPI.createUserWithRole( adminUsername + "@email.com" , adminUsername, adminUsername, Constants.ROLE_USER_ADMIN, function( result )
                {
                    adminId = result.insertId;
                    dataAPI.createUser( normalUsername + "@email.com" , normalUsername, normalUsername, function( res2 )
                    {
                        normalUserId = res2.insertId;
                        setupQuotes( done );
                    });
                });
            });
        } );
    });

    //test that /quotes endpoint returns the same thing as dataAPI.getAllQuotes
    it('Test All Quotes Good', function (done) 
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
    it('Test Creator Quotes Good', function (done) 
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

    //test that /qsearch endpoint returns the same thing as dataAPI.getAllQuotes
    it('Test Search Quotes Good', function (done) 
    {
        var searchTerms = "Testing";
        sendGetRequest( "/qsearch?searchTerms=" + searchTerms , function( res, data )
        {
            assert.equal( res.statusCode , 200 );
            //convert data to object using JSON.parse and verify quotes one by one
            var quotesInData = JSON.parse( data );
            assert.ok( quotesInData.length );
            dataAPI.searchQuotesByFlag( undefined, false, searchTerms, function( results )
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

    //test that /qsearch endpoint returns empty array for search terms that are not found
    it('Test SearchQuotes No Results', function (done) 
    {
        var searchTerms = "NORESULTSHERE";
        sendGetRequest( "/qsearch?searchTerms=" + searchTerms , function( res, data )
        {
            assert.equal( res.statusCode , 200 );
            var quotesInData = JSON.parse( data );
            assert.equal( quotesInData.length , 0 );
            done();
        });
    });

    //test that /qsearch endpoint returns error if the searchTerm field has too many characters
    it( 'Test Error SearchQuotes MaxLength SearchTerms' , function( done )
    {
        //generate enough characters for the body so that it is too large and endpoint complains
        var crypto = require("crypto");
        var searchTerms = crypto.randomBytes( 257 ).toString('hex');
        sendGetRequest( "/qsearch?searchTerms=" + searchTerms , function( res, data )
        {
            assert.equal( res.statusCode , 200 );
            var errorObj = JSON.parse( data );
            assertErrorJSON( errorObj );
            assert.equal( errorObj.errors[ 0 ].name , "searchTerms" );
            assert.ok( errorObj.errors[ 0 ].problem );
            done();
        });
    });

    //test that /qsearch endpoint returns error if the searchTerm field has too many characters
    it( 'Test Error SearchQuotes MinLength SearchTerms' , function( done )
    {
        var searchTerms = "sml";
        sendGetRequest( "/qsearch?searchTerms=" + searchTerms , function( res, data )
        {
            assert.equal( res.statusCode , 200 );
            var errorObj = JSON.parse( data );
            assertErrorJSON( errorObj );
            assert.equal( errorObj.errors[ 0 ].name , "searchTerms" );
            assert.ok( errorObj.errors[ 0 ].problem );
            done();
        });
    });

    //test that /qsearch endpoint returns error if missing searchTerms parameter
    it( 'Test Error SearchQuotes Missing SearchTerms', function( done )
    {
        var searchTerms = "sml";
        sendGetRequest( "/qsearch" , function( res, data )
        {
            assert.equal( res.statusCode , 200 );
            var errorObj = JSON.parse( data );
            assertErrorJSON( errorObj );
            assert.equal( errorObj.errors[ 0 ].name , "searchTerms" );
            assert.ok( errorObj.errors[ 0 ].problem );
            done();
        });
    });

    //test that /newUser endpoint returns error if confirmpass does not match password given
    it( 'Test Error NewUser Confirmpass Mismatch' , function( done )
    {
        var myNewUsername = "newusername";
        var userObj = { "email" : myNewUsername + "@email.com" , "username" : myNewUsername , "password" : myNewUsername };
        userObj.confirmpass = userObj.password + "extra";
        sendPostRequest( "/newUser" , querystring.stringify( userObj ), function( res, data )
        {
            assert.equal( res.statusCode , 200 );
            var errorObj = JSON.parse( data );
            assertErrorJSON( errorObj );
            assertErrorField( errorObj.errors[ 0 ], "password", "does not match confirm", done );
        });
    });

    //test that /newUser endpoint returns correct username in response
    it( 'Test Signup Good' , function( done )
    {
        var myNewUsername = "newusername";
        var userObj = { "email" : myNewUsername + "@email.com" , "username" : myNewUsername , "password" : myNewUsername };
        userObj.confirmpass = userObj.password;
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
    it( 'Test Logout Good' , function( done )
    {
        sendGetRequest( "/logout" , function( res, data )
        {
            assert.equal( res.statusCode , 200 );
            done();
        });
    });

    //test that /login endpoint returns correct username in response
    it( 'Test Login Good' , function( done )
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
    it( 'Test UserData Good' , function( done )
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
    it( 'Test NewQuote Good' , function( done )
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
    it( 'Test DownvoteQuote Good' , function( done )
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
    it( 'Test UpvoteQuote Good' , function( done )
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
    it( 'Test Error Quotes Nonexistent Creator ID' , function( done )
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

    //test that /newQuote endpoint returns error if missing author parameter
    it( 'Test Error NewQuote Missing Author', function( done )
    {
        var quoteBody = "Long Enough";
        var newQuoteForm = { body : quoteBody };
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

    //test that /newQuote endpoint returns error if missing body parameter
    it( 'Test Error NewQuote Missing Body', function( done )
    {
        var quoteAuthor = "Long Enough";
        var newQuoteForm = { author : quoteAuthor };
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

    //test that /upvoteQuote endpoint returns error if qid parameter is missing
    it( 'Test Error UpvoteQuote Missing qid' , function( done )
    {
        sendGetRequest( "/upvoteQuote" , function( res, data )
        {
            assert.equal( res.statusCode , 200 );
            var errorObj = JSON.parse( data );
            assertErrorJSON( errorObj );
            assert.equal( errorObj.errors[ 0 ].name , "qid" );
            assert.ok( errorObj.errors[ 0 ].problem );
            done();
        });
    });

    //test that /downvoteQuote endpoint returns error if qid parameter is missing
    it( 'Test Error DownvoteQuote Missing qid' , function( done )
    {
        sendGetRequest( "/downvoteQuote" , function( res, data )
        {
            assert.equal( res.statusCode , 200 );
            var errorObj = JSON.parse( data );
            assertErrorJSON( errorObj );
            assert.equal( errorObj.errors[ 0 ].name , "qid" );
            assert.ok( errorObj.errors[ 0 ].problem );
            done();
        });
    });

    //test that /logout endpoint returns 200 status
    it( 'Test Logout As User Good' , function( done )
    {
        sendGetRequest( "/logout" , function( res, data )
        {
            assert.equal( res.statusCode , 200 );
            done();
        });
    });

    //test that /newUser endpoint returns error if the username field has too many characters
    it( 'Test Error Signup MaxLength Username' , function( done )
    {
        //generate 101 characters for the username so that it is too large and endpoint complains
        var crypto = require("crypto");
        var userObj = {};
        userObj.password = "longEnough";
        userObj.email = userObj.password + "@emailone.com";
        userObj.username = crypto.randomBytes( 101 ).toString('hex');
        userObj.confirmpass = userObj.password;
        sendPostRequest( "/newUser" , querystring.stringify( userObj ), function( res, data )
        {
            assert.equal( res.statusCode , 200 );
            var errorObj = JSON.parse( data );
            assertErrorJSON( errorObj );
            assert.equal( errorObj.errors[ 0 ].name , "username" );
            assert.ok( errorObj.errors[ 0 ].problem );
            done();
        });
    });

    //test that /newUser endpoint returns error if the username field has too few characters
    it( 'Test Error Signup MinLength Username' , function( done )
    {
        var email = "1234@email.com";
        var userObj = { "email" : email, "username" : "1234" , "password" : "longEnough" };
        userObj.confirmpass = userObj.password;
        sendPostRequest( "/newUser" , querystring.stringify( userObj ), function( res, data )
        {
            assert.equal( res.statusCode , 200 );
            var errorObj = JSON.parse( data );
            assertErrorJSON( errorObj );
            assert.equal( errorObj.errors[ 0 ].name , "username" );
            assert.ok( errorObj.errors[ 0 ].problem );
            done();
        });
    });

    //test that /newUser endpoint returns error if the password field has too many characters
    it( 'Test Error Signup MaxLength Password' , function( done )
    {
        //generate 101 characters for the password so that it is too large and endpoint complains
        var crypto = require("crypto");
        var userObj = {};
        userObj.username = "longEnough";
        userObj.email = userObj.username + "@emailone.com";
        userObj.password = crypto.randomBytes( 101 ).toString('hex');
        userObj.confirmpass = userObj.password;
        sendPostRequest( "/newUser" , querystring.stringify( userObj ), function( res, data )
        {
            assert.equal( res.statusCode , 200 );
            var errorObj = JSON.parse( data );
            assertErrorJSON( errorObj );
            assert.equal( errorObj.errors[ 0 ].name , "password" );
            assert.ok( errorObj.errors[ 0 ].problem );
            done();
        });
    });

    //test that /newUser endpoint returns error if the password field has too few characters
    it( 'Test Error Signup MinLength Password' , function( done )
    {
        var userObj = { "email" : "longEnough@emailone.com" , "username" : "longEnough" , "password" : "1234" };
        userObj.confirmpass = userObj.password;
        sendPostRequest( "/newUser" , querystring.stringify( userObj ), function( res, data )
        {
            assert.equal( res.statusCode , 200 );
            var errorObj = JSON.parse( data );
            assertErrorJSON( errorObj );
            assert.equal( errorObj.errors[ 0 ].name , "password" );
            assert.ok( errorObj.errors[ 0 ].problem );
            done();
        });
    });

    //test that /newUser endpoint returns error if the email field has too few characters
    it( 'Test Error Signup MinLength Email' , function( done )
    {
        var userObj = { "email" : "a@bc" , "username" : "longEnough" , "password" : "123456" };
        userObj.confirmpass = userObj.password;
        sendPostRequest( "/newUser" , querystring.stringify( userObj ), function( res, data )
        {
            assert.equal( res.statusCode , 200 );
            var errorObj = JSON.parse( data );
            assertErrorJSON( errorObj );
            assert.equal( errorObj.errors[ 0 ].name , "email" );
            assert.ok( errorObj.errors[ 0 ].problem );
            done();
        });
    });

    //test that /newUser endpoint returns error if the email field has too many characters
    it( 'Test Error Signup MaxLength Email' , function( done )
    {
        //generate 301 characters for the email so that it is too large and endpoint complains
        var crypto = require("crypto");
        var userObj = {};
        userObj.username = "longEnough";
        userObj.password = "123456";
        userObj.email = crypto.randomBytes( 301 ).toString('hex') + "@email.com";
        userObj.confirmpass = userObj.password;

        sendPostRequest( "/newUser" , querystring.stringify( userObj ), function( res, data )
        {
            assert.equal( res.statusCode , 200 );
            var errorObj = JSON.parse( data );
            assertErrorJSON( errorObj );
            assert.equal( errorObj.errors[ 0 ].name , "email" );
            assert.ok( errorObj.errors[ 0 ].problem );
            done();
        });
    });

    //test that /newUser endpoint returns error if the confirmpass field has too many characters
    it( 'Test Error Signup MaxLength Confirmpass' , function( done )
    {
        //generate 101 characters for the confirmpass so that it is too large and endpoint complains
        var crypto = require("crypto");
        var userObj = {};
        userObj.username = "longEnough";
        userObj.password = "123456";
        userObj.confirmpass = crypto.randomBytes( 101 ).toString('hex');
        userObj.email = "longEnough@emailtwo.com";

        sendPostRequest( "/newUser" , querystring.stringify( userObj ), function( res, data )
        {
            assert.equal( res.statusCode , 200 );
            var errorObj = JSON.parse( data );
            assertErrorJSON( errorObj );
            assert.equal( errorObj.errors[ 0 ].name , "confirmpass" );
            assert.ok( errorObj.errors[ 0 ].problem );
            done();
        });
    });

    //test that /newUser endpoint returns error if the confirmpass field has too few characters
    it( 'Test Error Signup MinLength Confirmpass' , function( done )
    {
        //generate 101 characters for the confirmpass so that it is too large and endpoint complains
        var userObj = {};
        userObj.username = "longEnough";
        userObj.password = "123456";
        userObj.confirmpass = "1234";
        userObj.email = "longEnough@emailtwo.com";

        sendPostRequest( "/newUser" , querystring.stringify( userObj ), function( res, data )
        {
            assert.equal( res.statusCode , 200 );
            var errorObj = JSON.parse( data );
            assertErrorJSON( errorObj );
            assert.equal( errorObj.errors[ 0 ].name , "confirmpass" );
            assert.ok( errorObj.errors[ 0 ].problem );
            done();
        });
    });

    //test that /newUser endpoint returns error if the email field is not in correct format
    it( 'Test Error Signup Not An Email' , function( done )
    {
        var userObj = {};
        userObj.username = "longEnough";
        userObj.password = "123456";
        userObj.email = "notEmail";
        userObj.confirmpass = userObj.password;

        sendPostRequest( "/newUser" , querystring.stringify( userObj ), function( res, data )
        {
            assert.equal( res.statusCode , 200 );
            var errorObj = JSON.parse( data );
            assertErrorJSON( errorObj );
            assert.equal( errorObj.errors[ 0 ].name , "email" );
            assert.ok( errorObj.errors[ 0 ].problem );
            done();
        });
    });

    //test that /login endpoint returns error if the username field has too many characters
    it( 'Test Error Login MaxLength Username' , function( done )
    {
        //generate 101 characters for the username so that it is too large and endpoint complains
        var crypto = require("crypto");
        var userNameGen = crypto.randomBytes( 101 ).toString('hex');

        var userObj = { "email" : "longEnough@emailone.com" ,"username" : userNameGen , "password" : "longEnough" };
        sendPostRequest( "/login" , querystring.stringify( userObj ), function( res, data )
        {
            assert.equal( res.statusCode , 200 );
            var errorObj = JSON.parse( data );
            assertErrorJSON( errorObj );
            assert.equal( errorObj.errors[ 0 ].name , "username" );
            assert.ok( errorObj.errors[ 0 ].problem );
            done();
        });
    });

    //test that /login endpoint returns error if the username field has too few characters
    it( 'Test Error Login MinLength Username' , function( done )
    {
        var userObj = { "email" : "asdf12345@emailone.com" , "username" : "1234" , "password" : "longEnough" };
        sendPostRequest( "/login" , querystring.stringify( userObj ), function( res, data )
        {
            assert.equal( res.statusCode , 200 );
            var errorObj = JSON.parse( data );
            assertErrorJSON( errorObj );
            assert.equal( errorObj.errors[ 0 ].name , "username" );
            assert.ok( errorObj.errors[ 0 ].problem );
            done();
        });
    });

    //test that /login endpoint returns error if the password field has too many characters
    it( 'Test Error Login MaxLength Password' , function( done )
    {
        //generate 101 characters for the password so that it is too large and endpoint complains
        var crypto = require("crypto");
        var passwordGen = crypto.randomBytes( 101 ).toString('hex');

        var userObj = { "username" : "longEnough" , "password" : passwordGen };
        sendPostRequest( "/login" , querystring.stringify( userObj ), function( res, data )
        {
            assert.equal( res.statusCode , 200 );
            var errorObj = JSON.parse( data );
            assertErrorJSON( errorObj );
            assert.equal( errorObj.errors[ 0 ].name , "password" );
            assert.ok( errorObj.errors[ 0 ].problem );
            done();
        });
    });

    //test that /login endpoint returns error if the password field has too few characters
    it( 'Test Error Login MinLength Password' , function( done )
    {
        var userObj = { "username" : "longEnough" , "password" : "1234" };
        sendPostRequest( "/login" , querystring.stringify( userObj ), function( res, data )
        {
            assert.equal( res.statusCode , 200 );
            var errorObj = JSON.parse( data );
            assertErrorJSON( errorObj );
            assert.equal( errorObj.errors[ 0 ].name , "password" );
            assert.ok( errorObj.errors[ 0 ].problem );
            done();
        });
    });

    //test that /newUser endpoint returns error if the username is already taken
    it( 'Test Error NewUser Username Taken' , function( done )
    {
        var userObj = { "email" : "longEnough@emailone.com" ,"username" : normalUsername , "password" : "1234567890" };
        userObj.confirmpass = userObj.password;
        sendPostRequest( "/newUser" , querystring.stringify( userObj ), function( res, data )
        {
            assert.equal( res.statusCode , 200 );
            var errorObj = JSON.parse( data );
            assertErrorJSON( errorObj );
            assertErrorField( errorObj.errors[ 0 ], "user", "already taken", done );
        });
    });

    //test that /newUser endpoint returns error if the email address is already taken
    it( 'Test Error NewUser Email Taken' , function( done )
    {
        var userObj = { "email" : normalUsername + "@email.com" ,"username" : "notTakenYet" , "password" : "1234567890" };
        userObj.confirmpass = userObj.password;
        sendPostRequest( "/newUser" , querystring.stringify( userObj ), function( res, data )
        {
            assert.equal( res.statusCode , 200 );
            var errorObj = JSON.parse( data );
            assertErrorJSON( errorObj );
            assertErrorField( errorObj.errors[ 0 ], "email", "already taken", done );
        });
    });

    //test that /newUser endpoint returns error if the username is already taken(but with uppercase username)
    it( 'Test Error NewUser Username Case Sensitive' , function( done )
    {
        var userObj = { "email" : "longEnough@emailone.com" ,"username" : normalUsername.toUpperCase() , "password" : "1234567890" };
        userObj.confirmpass = userObj.password;
        sendPostRequest( "/newUser" , querystring.stringify( userObj ), function( res, data )
        {
            assert.equal( res.statusCode , 200 );
            var errorObj = JSON.parse( data );
            assertErrorJSON( errorObj );
            assertErrorField( errorObj.errors[ 0 ], "user", "already taken", done );
        });
    });

    //test that /newUser endpoint returns error if the username parameter is missing
    it( 'Test Error NewUser Missing Username' , function( done )
    {
        var userObj = { "email" : "longEnough@emailone.com" , "password" : "1234567890" };
        userObj.confirmpass = userObj.password;
        sendPostRequest( "/newUser" , querystring.stringify( userObj ), function( res, data )
        {
            assert.equal( res.statusCode , 200 );
            var errorObj = JSON.parse( data );
            assertErrorJSON( errorObj );
            assertErrorField( errorObj.errors[ 0 ], "username", "missing", done );
        });
    });

    //test that /newUser endpoint returns error if the password parameter is missing
    it( 'Test Error NewUser Missing Password' , function( done )
    {
        var userObj = { "email" : "longEnough@emailone.com" , "username" : "1234567890" };
        userObj.confirmpass = "123456";
        sendPostRequest( "/newUser" , querystring.stringify( userObj ), function( res, data )
        {
            assert.equal( res.statusCode , 200 );
            var errorObj = JSON.parse( data );
            assertErrorJSON( errorObj );
            assertErrorField( errorObj.errors[ 0 ], "password", "missing", done );
        });
    });

    //test that /newUser endpoint returns error if the confirmpass parameter is missing
    it( 'Test Error NewUser Missing Confirmpass' , function( done )
    {
        var userObj = { "email" : "longEnough@emailone.com" , "username" : "1234567890" };
        userObj.password = "longEnough";
        sendPostRequest( "/newUser" , querystring.stringify( userObj ), function( res, data )
        {
            assert.equal( res.statusCode , 200 );
            var errorObj = JSON.parse( data );
            assertErrorJSON( errorObj );
            assertErrorField( errorObj.errors[ 0 ], "confirmpass", "missing", done );
        });
    });

    //test that /newUser endpoint returns error if the email parameter is missing
    it( 'Test Error NewUser Missing Email' , function( done )
    {
        var userObj = { "username" : "1234567890" , "password" : "1234567890" };
        userObj.confirmpass = userObj.password;
        sendPostRequest( "/newUser" , querystring.stringify( userObj ), function( res, data )
        {
            assert.equal( res.statusCode , 200 );
            var errorObj = JSON.parse( data );
            assertErrorJSON( errorObj );
            assertErrorField( errorObj.errors[ 0 ], "email", "missing", done );
        });
    });

    //test that /login endpoint returns error if the username parameter is missing
    it( 'Test Error Login Missing Username' , function( done )
    {
        var userObj = { "password" : "1234567890" };
        sendPostRequest( "/login" , querystring.stringify( userObj ), function( res, data )
        {
            assert.equal( res.statusCode , 200 );
            var errorObj = JSON.parse( data );
            assertErrorJSON( errorObj );
            assertErrorField( errorObj.errors[ 0 ], "username", "missing", done );
        });
    });

    //test that /login endpoint returns error if the password parameter is missing
    it( 'Test Error Login Missing Password' , function( done )
    {
        var userObj = { "username" : "1234567890" };
        sendPostRequest( "/login" , querystring.stringify( userObj ), function( res, data )
        {
            assert.equal( res.statusCode , 200 );
            var errorObj = JSON.parse( data );
            assertErrorJSON( errorObj );
            assertErrorField( errorObj.errors[ 0 ], "password", "missing", done );
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

    //test that /userData returns error when not logged in
    it( 'Test Error UserData Not User' , function( done )
    {
        sendGetRequest( "/userData" , function( res, data )
        {
            assert.equal( res.statusCode , 200 );
            assertNotUserError( JSON.parse( data ), done );
        });
    });

    //test that /login endpoint returns error when wrong password is given for a correct username
    it( 'Test Error Login Wrong Password' , function( done )
    {
        var userObj = { "username" : adminUsername , "password" : adminUsername + "0123" };
        sendPostRequest( "/login" , querystring.stringify( userObj ), function( res, data )
        {
            assert.equal( res.statusCode , 200 );
            var errorObj = JSON.parse( data );
            assertErrorJSON( errorObj );
            assertErrorField( errorObj.errors[ 0 ], "user", "invalid combination", done );
        });
    });    

    //test that /login endpoint returns correct username/role in response for admin user
    it( 'Test Login Admin Good' , function( done )
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
    it( 'Test FlagQuote Good' , function( done )
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
    it( 'Test Flagged Good' , function( done )
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

    //test that /upvoteQuote endpoint returns error if quote given is flagged
    it( 'Test Error UpvoteQuote Flagged Quote' , function( done )
    {
        sendGetRequest( "/upvoteQuote?qid=" + myQuoteId , function( res, data )
        {
            assert.equal( res.statusCode , 200 );
            var errorObj = JSON.parse( data );
            assertErrorJSON( errorObj );
            assertErrorField( errorObj.errors[ 0 ], "qid", "invalid quote", done );
        });
    });

    //test that /downvoteQuote endpoint returns error if quote given is flagged
    it( 'Test Error DownvoteQuote Flagged Quote' , function( done )
    {
        sendGetRequest( "/downvoteQuote?qid=" + myQuoteId , function( res, data )
        {
            assert.equal( res.statusCode , 200 );
            var errorObj = JSON.parse( data );
            assertErrorJSON( errorObj );
            assertErrorField( errorObj.errors[ 0 ], "qid", "invalid quote", done );
        });
    });

    //test that /unflagQuote endpoint actually results in the quote being flagged false
    it( 'Test UnflagQuote Good' , function( done )
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

    //test that /unflagQuote endpoint returns error if qid parameter is missing
    it( 'Test Error UnflagQuote Nonexistent ID' , function( done )
    {
        var quoteObj = {};
        sendPostRequest( "/unflagQuote" , querystring.stringify( quoteObj ), function( res, data )
        {
            assert.equal( res.statusCode , 200 );
            var errorObj = JSON.parse( data );
            assertErrorJSON( errorObj );
            assertErrorField( errorObj.errors[ 0 ], "qid", "missing", done );
        });
    });

    //test that /flagQuote endpoint returns error if qid parameter is missing
    it( 'Test Error FlagQuote Nonexistent ID' , function( done )
    {
        var quoteObj = {};
        sendPostRequest( "/flagQuote" , querystring.stringify( quoteObj ), function( res, data )
        {
            assert.equal( res.statusCode , 200 );
            var errorObj = JSON.parse( data );
            assertErrorJSON( errorObj );
            assertErrorField( errorObj.errors[ 0 ], "qid", "missing", done );
        });
    });

    //test that /flagged endpoint returns empty array if creator id given is valid length/type but not actually in database
    it( 'Test Error Flagged Nonexistent Creator ID' , function( done )
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
    it( 'Test Logout Admin Good' , function( done )
    {
        sendGetRequest( "/logout" , function( res, data )
        {
            assert.equal( res.statusCode , 200 );
            done();
        });
    });

    //test that /logout endpoint returns error if not logged in
    it( 'Test Error Logout Not User' , function( done )
    {
        sendGetRequest( "/logout" , function( res, data )
        {
            assert.equal( res.statusCode , 200 );
            var errorObj = JSON.parse( data );
            assertNotUserError( errorObj , done );
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

