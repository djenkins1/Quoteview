var dataAPI = require( "./dataAPI" );

var totalQuotesCreated = 0;

var testUsername = "DILAN";

var createdUser = {};

const PAGE_SIZE = 10;

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

function createQuoteWithUser( userResult, onFinish )
{
    dataAPI.createQuote( "Dilan", "Hello " + ( new Date() ).getTime(), userResult._id, onFinish );
}

function testUsernameNotTaken( userResult )
{
    dataAPI.isUsernameTaken( testUsername + '@123', function( isTaken ) 
    {
        console.log( "Username is taken? " , isTaken );
        createQuoteWithUser( userResult, updateQuoteWithId );
    });
}

function testUsernameTaken( userResult )
{
    dataAPI.isUsernameTaken( testUsername, function( isTaken ) 
    {
        console.log( "Username is taken? " , isTaken );
        testUsernameNotTaken( userResult );
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

function testPages( results )
{
    if ( results == undefined || results.length == 0 )
    {
        console.log( "ALL END" );
        dataAPI.closeConnection();
        return;
    }

    console.log( "PAGE START" )
    logQuotes( results );
    console.log( "PAGE END" );

    dataAPI.getPagedQuotes( results[ results.length - 1]._id , PAGE_SIZE, testPages );
}

function createAnotherQuote( quoteResult )
{
    totalQuotesCreated++;
    if ( totalQuotesCreated >= 50 )
    {
        console.log( "Fifty quotes created" );
        dataAPI.getRecentQuotes( PAGE_SIZE, testPages );
        return;
    }

    createQuoteWithUser( createdUser, createAnotherQuote );
}

function testCreateFiftyQuotes( userResult )
{
    createdUser = userResult;
    createQuoteWithUser( userResult, createAnotherQuote );
}

function normalTest()
{
    dataAPI.createUser( testUsername , testUsername , testVerifyUser );
}

function pagedQuotesTest()
{
    dataAPI.createUser( testUsername , testUsername , testCreateFiftyQuotes );
}


//normalTest();
pagedQuotesTest();

