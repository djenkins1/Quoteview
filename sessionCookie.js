var Cookies = require( 'cookies' );
var session = require( "./sessionHandler" );

const SESSION_NAME = "sprice";

/*
function: onEntry
info:
    This function is meant to be called by the request observer as the first line.
    This function checks to see if there is a cookie with a session token.
    If there is a cookie with a session token, then use that session token to read the session.
    Otherwise, create a session and return.
parameters:
    request, object, an http request object
    response, object, an http response object
returns:
    object, attributes:
        key, string, the session token key
        data, object, the data for the session
*/
function onEntry( request, response )
{
    var cookieObj = new Cookies( request, response );
    var sessionToken = cookieObj.get( SESSION_NAME );
    if ( sessionToken && session.session_exists( sessionToken ) )
    {
        return { "key" : sessionToken, "data" : session.session_read( sessionToken ) };
    }
    else
    {
        sessionToken = session.session_start();
        cookieObj.set( SESSION_NAME, sessionToken );
    }

    return { "key" : sessionToken, "data" : session.session_read( sessionToken ) };
}

/*
function: onExit
info:
    This function is meant to be called by the request observer as the last line before request ends.
    This function writes the modified session data for the token given.
parameters:
    request, object, an http request object
    response, object, an http response object
    sessionToken, string, a key for a session
        if undefined then the session is deleted
    sessionData, object, the data for the session that is to be written out
*/
function onExit( request, response, sessionToken, sessionData )
{
    /*
    //TODO: cannot write out to response if it has ended,but async database calls cause problems
    if ( sessionToken == undefined )
    {
        session.session_destroy( sesionToken );
        var cookieObj = new Cookies( request, response );
        //if set is called with only one parameter than it deletes the cookie
        cookieObj.set( SESSION_NAME );
        return;
    }
    */

    if ( !session.session_exists( sessionToken ) )
    {
        throw new Error( "Non-existent session with token: " + sessionToken );
    }

    session.session_write( sessionToken, sessionData );
}

exports.onEntry = onEntry;
exports.onExit = onExit;

