var dataAPI = require( "./dataAPI" );

var testUsername = "DILAN";

function testModified( result )
{
    console.log( "RESULT:" , result.affectedRows == 1 );
}

function logQuotes( results )
{
    for ( var i = 0; i < results.length; i++ )
    {
        logQuote( results[ i ] );
    }
}

function logQuotesAndQuit( results )
{
    logQuotes( results );
    dataAPI.closeConnection();
}

function logQuote( quote )
{
    console.log( quote );
}

function updateQuoteWithId( quoteResult )
{
    dataAPI.upvoteQuote( quoteResult.insertId , function( result )
    {
        testModified( result );
        console.log( "Quote by id:" );
        dataAPI.getQuoteById( quoteResult.insertId, logQuote );
        dataAPI.getAllQuotes( logQuotes );
        dataAPI.downvoteQuote( quoteResult.insertId , function( result2 )
        {
            testModified( result2 );
            dataAPI.getAllQuotes( logQuotesAndQuit );
        });
    });
}

function createQuoteWithUser( userResult )
{
    dataAPI.createQuote( "Dilan", "Hello " + ( new Date() ).getTime(), userResult._id, updateQuoteWithId );
}

function testUsernameTaken( userResult )
{
    dataAPI.isUsernameTaken( testUsername, function( isTaken ) 
    {
        console.log( "Username is taken? " , isTaken );
        createQuoteWithUser( userResult );
    });
}

function testGetUser( userResult )
{
    dataAPI.getUserData( userResult.insertId , testUsernameTaken );
}

function testVerifyUser( userResult )
{
    dataAPI.verifyUserCredentials( testUsername, testUsername , function( isVerified, userData )
    {
        console.log( "VERIFY PASSWORD: " , isVerified );
        dataAPI.verifyUserCredentials( testUsername, "BAD PASSWORD" , function( isVerified, userData )
        {
            console.log( "VERIFY PASSWORD 2: " , isVerified );
            testGetUser( userResult );
        });
    });
}

dataAPI.createUser( testUsername , testUsername , testVerifyUser );


