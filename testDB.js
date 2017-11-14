var dataAPI = require( "./dataAPI" );

function testModified( result )
{
    console.log( "RESULT:" , result.affectedRows == 1 );
}

function logQuotes( results )
{
    for ( var i = 0; i < results.length; i++ )
    {
        console.log( results[ i ] );
    }
}

function logQuotesAndQuit( results )
{
    logQuotes( results );
    dataAPI.closeConnection();
}

function updateQuoteWithId( quoteResult )
{
    dataAPI.upvoteQuote( quoteResult.insertId , function( result )
    {
        testModified( result );
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
    dataAPI.createQuote( "Dilan", "Hello " + ( new Date() ).getTime(), userResult.insertId, updateQuoteWithId );
}

dataAPI.createUser( "dilan" , "dilan" , createQuoteWithUser );


