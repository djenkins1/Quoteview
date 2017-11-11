var fs = require('fs');

var cryptoRandomString = require('crypto-random-string');

/*
function: generateSessionKey
info:
    This function returns a cryptographically secure key for a session.
parameters:
    none
returns:
    string, a cryptographically secure key for a session
*/
function generateSessionKey()
{
    return cryptoRandomString( 32 );
}

/*
function: pathFromSessionKey
info:
    this function returns the path to the session file for the key given.
parameters:
    key, string, the session key
returns:
    string, the path to the session file for the key given
*/
function pathFromSessionKey( key )
{
    return "./session/" + encodeURIComponent( key ) + ".json";
}

/*
function: session_start
info:
    Creates a session file on the server and returns the session key
parameters:
    none
returns:
    string, the key for the newly created session
*/
//creates a new session
function session_start()
{
    var sessionKey = generateSessionKey();
    var sessionFilePath = pathFromSessionKey( sessionKey );
    if ( fs.existsSync( sessionFilePath  ) )
    {
        throw new Error( "SESSION ALREADY EXISTS: " + sessionKey );
    }
    
    fs.writeFileSync( sessionFilePath, "{}" , 'utf-8' );
    return sessionKey;
}

/*
function: session_exists
info:
    Can be used to check whether a session with the key given is valid.
parameters:
    sessionKey, string, the key identifying a session
returns:
    boolean, true if session with key exists or false otherwise
*/
function session_exists( sessionKey )
{
    if ( sessionKey == undefined )
    {
        return false;
    }
    var sessionFilePath = pathFromSessionKey( sessionKey );
    return ( fs.existsSync( sessionFilePath  ) );
}

/*
function: session_write
info:
    Writes the sessionData given to the session file for the session with key given.
parameters:
    sessionKey, string, the key for the session to be updated.
    sessionData, object, gets converted to json and output to the session file.
returns:
    nothing
*/
function session_write( sessionKey, sessionData )
{
    var sessionFilePath = pathFromSessionKey( sessionKey );
    fs.writeFileSync( sessionFilePath, JSON.stringify( sessionData ), 'utf-8' );
}

/*
function: session_destroy
info:
    this function deletes the file for the session given
parameters:
    sessionKey, string, the key for the session to be destroyed.
returns:
    nothing
*/
function session_destroy( sessionKey )
{
    var sessionFilePath = pathFromSessionKey( sessionKey );
    fs.unlinkSync( sessionFilePath );
}

/*
function: session_read
info:
    this function reads the data from the session file belonging to the key given.
    it then returns the data as an object
parameters:
    sessionKey, string, the key for the session to be read
returns:
    object, the parsed object from the json within the session file
*/
function session_read( sessionKey )
{
    var sessionFilePath = pathFromSessionKey( sessionKey );
    return JSON.parse( fs.readFileSync( sessionFilePath, 'utf-8' ) );
}

exports.session_read = session_read;
exports.session_destroy = session_destroy;
exports.session_write = session_write;
exports.session_start = session_start;
exports.session_exists = session_exists;

