const dataAPI = require( "./dataAPI" );
const assert = require('assert');
const myUsername = "jenkins";
var myUserId = undefined;

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
    //TODO: could clean and setup database in between test runs for safer testing
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

    //test that createUser returns a user object
    it( 'test create user normal' , function( done )
    {
        dataAPI.createUser( myUsername, myUsername, function( resultObj )
        {
            assert.ok( resultObj.insertId );
            myUserId = resultObj.insertId;
            done();
        } );
    });

    //test that isUsernameTaken returns true for the username of the newly created user 
    //TODO: once the database is cleaned between test cases this test will need to create a user first before its own assertions
    it( 'test username already taken' , function( done )
    {
        dataAPI.isUsernameTaken( myUsername, function( isTaken )
        {
            assert.ok( isTaken );
            done();
        });
    });

    //test that verifyUserCredentials returns false for a user with the wrong password
    //TODO: once the database is cleaned between test cases this test will need to create a user before its own assertions
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

    //after() is run after all tests have completed.
    //close down the database connection
    after( function( done ) 
    {
        dataAPI.closeConnection();
        done();
    });
});

