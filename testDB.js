var Constants = require( "./public/components/Constants" );
const dataAPI = require( "./dataAPI" );
const assert = require('assert');
const myUsername = "jenkins";
const myQuoteAuthor = "Dilan Jenkins";
const myQuoteBody = "Dilan was here!";
const adminUser = "djenkins1";
var myUserId = undefined;
var myQuotes = [];

describe('TestDatabase', function() 
{
    //The before() callback gets run before all tests in the suite.
    //Clean and setup the database. 
    before( function( done )
    {
        dataAPI.cleanDatabase( function()
        {
            dataAPI.setupDatabase( done );
        } );
    });

    //The beforeEach() callback gets run before each test in the suite.
    beforeEach( function( done )
    {
        done();
    });

    //test that isUsernameTaken returns false for a username that has not been taken yet.
    it( 'test username not taken', function( done )
    {
        const otherUsername = "dilan";
        dataAPI.isUsernameTaken( otherUsername, function( isTaken )
        {
            assert.equal( isTaken, false );
            done();
        } );
    });

    //test that isEmailTaken returns false for a email address that has not been taken yet.
    it( 'test email not taken', function( done )
    {
        const otherUsername = "dilan";
        dataAPI.isEmailTaken( otherUsername + "@email.com", function( isTaken )
        {
            assert.equal( isTaken, false );
            done();
        } );
    });

    //test that createUser returns a user object
    it( 'test create user normal' , function( done )
    {
        dataAPI.createUser( myUsername + "@email.com" , myUsername, myUsername, function( resultObj )
        {
            assert.ok( resultObj.insertId );
            myUserId = resultObj.insertId;
            done();
        } );
    });

    //test that isUsernameTaken returns true for the username of the newly created user 
    it( 'test username already taken' , function( done )
    {
        dataAPI.isUsernameTaken( myUsername, function( isTaken )
        {
            assert.ok( isTaken );
            done();
        });
    });

    //test that isEmailTaken returns true for the email address of the newly created user
    it( 'test email already taken', function( done )
    {
        dataAPI.isEmailTaken( myUsername + "@email.com", function( isTaken )
        {
            assert.equal( isTaken, true );
            done();
        } );
    });

    //test that verifyUserCredentials returns false for a user with the wrong password
    it( 'test bad password verifyUserCredentials' , function( done )
    {
        dataAPI.verifyUserCredentials( myUsername, "BAD PASS" , function( isValid, resultUser )
        {
            assert.equal( isValid , false );
            done();
        });
    });

    //test that verifyUserCredentials returns false for a user that does not exist
    it( 'test non-user verifyUserCredentials' , function( done )
    {
        const nonUser = "BADUSER";
        dataAPI.verifyUserCredentials( nonUser, nonUser, function( isValid, resultUser )
        {
            assert.equal( isValid , false );
            done();
        });
    });

    //test that verifyUserCredentials returns true for valid username and password combo
    it( 'test good verifyUserCredentials' , function( done )
    {
        dataAPI.verifyUserCredentials( myUsername, myUsername, function( isValid, resultUser )
        {
            assert.ok( isValid );
            assert.ok( resultUser.userId );
            done();
        });
    });

    //test that getUserData returns correct information for valid user id
    it( 'test good getUserData' , function( done )
    {
        dataAPI.getUserData( myUserId, function( userObj )
        {
            assert.ok( userObj );
            assert.deepEqual( myUserId, userObj.userId );
            assert.equal( myUsername, userObj.username );
            done();
        });
    });

    //test that getUserData returns nothing for invalid user id
    it( 'test bad id getUserData' , function( done )
    {
        dataAPI.getUserData( "123456789ABC", function( userObj )
        {
            assert.equal( userObj , null );
            done();
        });        
    });

    //test that createQuote returns insertId for a newly created quote
    it( 'test good createQuote' , function( done )
    {
        dataAPI.createQuote( myQuoteAuthor, myQuoteBody, myUserId, function( quoteResult )
        {
            assert.ok( quoteResult.insertId );
            myQuotes.push( quoteResult.insertId );
            done();
        });
    });

    //tests that createQuoteWithUsername returns insertId for a newly created quote
    it( 'test good createQuoteWithUsername' , function( done )
    {
        dataAPI.createQuoteWithUsername( myQuoteAuthor, myQuoteBody, myUserId, myUsername, function( quoteResult )
        {
            assert.ok( quoteResult.insertId );
            myQuotes.push( quoteResult.insertId );
            done();
        });
    });

    //tests that getQuoteById returns correct information for valid qid
    it( 'test good getQuoteById', function( done )
    {
        dataAPI.getQuoteById( myQuotes[ 0 ], function( quoteObj )
        {
            assert.deepEqual( quoteObj.qid, myQuotes[ 0 ]  );
            assert.equal( quoteObj.author, myQuoteAuthor );
            assert.equal( quoteObj.body, myQuoteBody );
            assert.deepEqual( quoteObj.creatorId , myUserId );
            assert.equal( quoteObj.creatorName, myUsername );
            assert.equal( quoteObj.score, 0 );
            done();
        });
    });

    //tests that upvoteQuote successfully increments the score for a valid qid
    it( 'test good upvoteQuote' , function( done )
    {
        dataAPI.upvoteQuote( myQuotes[ 0 ], function( resultObj )
        {
            assert.equal( resultObj.affectedRows , 1 );
            dataAPI.getQuoteById( myQuotes[ 0 ], function( quoteObj )
            {
                assert.equal( quoteObj.score, 1 );
                done();
            });
        });
    });

    //tests that downvoteQuote successfully decrements the score for a valid qid
    it( 'test good downvoteQuote' , function( done )
    {
        dataAPI.downvoteQuote( myQuotes[ 0 ], function( resultObj )
        {
            assert.equal( resultObj.affectedRows , 1 );
            dataAPI.getQuoteById( myQuotes[ 0 ], function( quoteObj )
            {
                assert.equal( quoteObj.score, 0 );
                done();
            });
        });
    });

    //tests that downvoteQuote successfully decrements the score for a valid qid
    it( 'test good from zero downvoteQuote' , function( done )
    {
        dataAPI.downvoteQuote( myQuotes[ 1 ], function( resultObj )
        {
            assert.equal( resultObj.affectedRows , 1 );
            dataAPI.getQuoteById( myQuotes[ 1 ], function( quoteObj )
            {
                assert.equal( quoteObj.score, -1 );
                done();
            });
        });
    });

    //tests that upvoteQuote successfully increments the score for a valid qid
    it( 'test good from negative upvoteQuote' , function( done )
    {
        dataAPI.upvoteQuote( myQuotes[ 1 ], function( resultObj )
        {
            assert.equal( resultObj.affectedRows , 1 );
            dataAPI.getQuoteById( myQuotes[ 1 ], function( quoteObj )
            {
                assert.equal( quoteObj.score, 0 );
                done();
            });
        });
    });
    
    //tests that getAllQuotesFromUser returns the correct results
    it( 'test good getAllQuotesFromUser' , function( done )
    {
        dataAPI.getAllQuotesFromUser( myUserId, function( results )
        {
            assert.equal( results.length, myQuotes.length );
            for( var i = 0; i < results.length; i++ )
            {
                assert.deepEqual( results[ i ].creatorId , myUserId );
                assert.equal( results[ i ].creatorName, myUsername );
            }
            done();
        });
    });

    //creates a new user and a new quote and tests that all quotes are returned successfully from getAllQuotes
    it( 'test good getAllQuotes' , function( done )
    {
        const otherUsername = "badmoon";
        dataAPI.createUser( otherUsername + "@email.com" , otherUsername, otherUsername, function( userResult )
        {
            assert.ok( userResult.insertId );
            var otherUserId = userResult.insertId;
            dataAPI.createQuote( "Dummy Author" , "Dummy Body" , otherUserId, function( quoteResult )
            {
                assert.ok( quoteResult.insertId );
                dataAPI.getAllQuotes( function( results )
                {
                    assert.equal( results.length, myQuotes.length + 1 );
                    done();
                });
            });
        });
    });

    it( 'test good searchQuotesByFlag' , function( done )
    {
        dataAPI.searchQuotesByFlag( undefined, undefined, "jenkins" , function( results )
        {
            assert.ok( results.length );
            done();
        });
    });

    it( 'test bad searchQuotesByFlag' , function( done )
    {
        dataAPI.searchQuotesByFlag( undefined, undefined, "NORESULTS" , function( results )
        {
            assert.equal( results.length , 0 );
            done();
        });
    });

    it( 'test good flagQuote' , function( done )
    {
        dataAPI.flagQuote( myQuotes[ 0 ], function( updateResult )
        {
            assert.equal( updateResult.affectedRows , 1 );
            dataAPI.getQuoteById( myQuotes[ 0 ] , function( quoteObj )
            {
                assert.equal( quoteObj.flagged, true );
                done();
            });
        });
    });

    it( 'test good unflagQuote' , function( done )
    {
        dataAPI.unflagQuote( myQuotes[ 0 ], function( updateResult )
        {
            assert.equal( updateResult.affectedRows , 1 );
            dataAPI.getQuoteById( myQuotes[ 0 ] , function( quoteObj )
            {
                assert.equal( quoteObj.flagged, false );
                done();
            });
        });
    });

    it( 'test good flagQuote 2' , function( done )
    {
        dataAPI.flagQuote( myQuotes[ 0 ], function( updateResult )
        {
            assert.equal( updateResult.affectedRows , 1 );
            dataAPI.getQuoteById( myQuotes[ 0 ] , function( quoteObj )
            {
                assert.equal( quoteObj.flagged, true );
                done();
            });
        });
    });

    //tests that upvoteQuote does not update the score for a flagged quote
    it( 'test flagged upvoteQuote' , function( done )
    {
        dataAPI.upvoteQuote( myQuotes[ 0 ], function( resultObj )
        {
            assert.equal( resultObj.affectedRows , 0 );
            done();
        });
    });

    //tests that downvoteQuote does not update the score for a flagged quote
    it( 'test flagged downvoteQuote' , function( done )
    {
        dataAPI.downvoteQuote( myQuotes[ 0 ], function( resultObj )
        {
            assert.equal( resultObj.affectedRows , 0 );
            done();
        });
    });

    it( 'test good admin createUserWithRole' , function( done )
    {
        dataAPI.createUserWithRole( adminUser + "@email.com", adminUser, adminUser, Constants.ROLE_USER_ADMIN , function( resultObj )
        {
            assert.ok( resultObj.insertId );
            let adminId = resultObj.insertId;
            dataAPI.getUserData( adminId, function( userObj )
            {
                assert.equal( userObj.role, Constants.ROLE_USER_ADMIN );
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

