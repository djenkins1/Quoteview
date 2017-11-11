/*
Author: Dilan Jenkins
File: urlHandler.js
Info:
    This is a module for node js.
    It is used for registering handlers for specific url paths on a server.
    It can be used for specifying required/optional url parameters for a specific url.
    As well as allowing type checking of said parameters.
Object Types:
observer object:
    observer.type = string ,POST if handler is for post requests or GET if handler is for get requests
    observer.path = string ,the file path that the handler is meant to be for
    observer.callback = function ,called once the url parameters have been validated
    observer.onError = function ,called if any of the url parameters are invalid(i.e missing if required or wrong type)
    observer.params = array of parameterSchema objects
  
parameterSchema object: 
    parameterSchema.name = string ,the name of the required parameter
    parameterSchema.type = string ,the type of the required parameter(i.e string,int,float)
    parameterSchema.required = boolean ,true if must be in the url or false if optional
    TODO: any other validation required,i.e if number must be in specific range...

TODO: should be able to also specify min/max values or string lengths of values
TODO: other types like email
TODO: maybe move over to mongo db for dataAPI
*/

var http = require("http");
var url = require('url');
var validator = require('validator');
var fs = require('fs'); 
var qs = require('querystring');
var mime = require('mime');
var sessionCookie = require( "./sessionCookie" );

//holds a dictionary where the key is a path on the server and the value is an observer object
var handlerObservers = {};

/*
function: createParameter
info:
    Creates a parameterSchema object with the given parameters as its attributes.
parameters:
    name, string, the name of the parameter that the parameterSchema is for
    type, string, the type that the parameter with name is supposed to be
    isRequired, boolean, whether the parameter is required(true) or optional(false)
returns:
    The newly created parameterSchema object
*/
function createParameter( name, type, isRequired )
{
    return { "name" : name , "type" : type , "required" : isRequired };
}

/*
function: redirectToUrl
info:
    Sends back in the response to redirect to the url given.
parameters:
    response, object, an http response object
    redirectTo, string, a url to redirect to
returns:
    nothing
*/
function redirectToUrl( response, redirectTo, sessionObj, onFinish )
{
    console.log( "Redirecting to: " , redirectTo );
    response.writeHead(302,  {Location: redirectTo } );
    onFinish( sessionObj );
}

/*
function: registerObserverObject
info:
    Adds the observer object given to the dictionary of observers.
    The key for the said observer is the path attribute within the object.
parameters:
    observer: object ,see observer object documentation
returns:
    nothing
exceptions:
    throws an exception if the observer object has no path attribute or it is undefined
*/
function registerObserverObject( observer )
{
    if ( observer == undefined )
    {
        throw new Error( "Observer object undefined" );
        return;
    }

    if ( observer.path == undefined )
    {
        throw new Error( "Path for observer is undefined" );
        return;
    }

    if ( handlerObservers[ observer.path ] )
    {
        console.log( "Overwriting old observer for path: " , observer.path );
    }

    handlerObservers[ observer.path ] = observer;
}

/*
function: registerObserver
info:
    Wrapper function for registerObserverObject.
    This function wraps the parameters given into an object and then calls registerObserverObject with wrapped object.
parameters:
    path: string ,the file pathname that the observer is meant to listen to
    params: array of objects, see parameterSchema object documentation
    callback: function, the function to be called if the request url parameters are found to be valid
    errorCall: function, the function to be called if the request url parameters are found to be invalid
returns:
    nothing 
*/
function registerObserver( requestType, path , params, callback, errorCall )
{
    registerObserverObject( { "type" : requestType , "path" : path , "params" : params, "callback" : callback, "onError" : errorCall } );
}

/*
function: checkType
info:
    This is a function that checks whether the given value can be converted to the type given.
parameters:
    value, anything, the value to check
    type , string, a string representing the type that the value is supposed to be.
returns:
    boolean
    true if value is of type given.
    false otherwise.
*/
function checkType( value, type )
{
    if ( type == "string" )
    {
        return true;
    }

    if ( type == "int" )
    {
        return validator.isInt( value );
    }

    if ( type == "float" )
    {
        return validator.isFloat( value );
    }

    console.log( value + " fell through for type " + type );
    return false;
}

/*
function: checkParameters
info:
    Checks the url parameters provided to see if they match what is needed
parameters:
    parameterSchema, list of objects with following attributes
        name,the name of the required parameter
        type,the type of the required parameter(i.e string,int,float)
        required,true if must be in the url or false if optional
    queryObj, object with keys being parameter names and values being the actual values       
returns:
    Object containing attribute called errors that is a list of parameters that were invalid
        errors is an empty array if none of the parameters were invalid
*/
function checkParameters( parameterSchema, queryObj )
{
    var toReturn = { "errors" : [] };
    for ( var i = 0; i < parameterSchema.length; i++ )
    {
        var schemaObj = parameterSchema[ i ];
        //if the schemaObj.name is not found in queryObj and schemaObj.required is true then add to error
        if ( queryObj[ schemaObj.name ] == undefined && schemaObj.required )
        {
            var objError = { "name" : schemaObj.name , "problem" : "missing" };
            toReturn.errors.push( objError );
            continue;
        }

        //if the query parameter given does not match the type given,then add to error
        if ( queryObj[ schemaObj.name ] != undefined && !checkType( queryObj[ schemaObj.name ] , schemaObj.type ) )
        {
            var objError = { "name" : schemaObj.name , "problem" : "wrong type" };
            toReturn.errors.push( objError );
            continue;
        }
    }

    return toReturn;
}

/*
function: handleFile
info:
    Function to be called when the request is for a specific file and an observer is not meant to respond to it.
parameters:
    path: string, the path to the file that is requested
    response: object, http response object
*/
function handleFile( path , response )
{
    fs.readFile( path, function(err, data) 
    {
        //if there was an error then assume the file does not exist and output 404 error
        if (err) 
        {
            response.writeHead(404, {'Content-Type': 'text/html'});
            response.write("404 Not Found");
            response.end();
            return;
        } 

        //otherwise,no error occured so output the file with the content-type being the correct mime type of the file
        response.writeHead(200, {'Content-Type': mime.getType( path ) });
        response.write(data);
        response.end();
    });
}

/*
function: validateAndCall
info:
    This function validates the parameters within the request to the observer's specified parameters.
    If the parameters are valid, this function calls the observer's callback function.
    If the parameters are invalid, this function calls the observer's onError function.
parameters:
    observer: object, an observer object
    requestParams: object, a dictionary of key value pairs that were the parameters/body of the request
    response: object, an http response object
returns:
    nothing
*/
function validateAndCall( observer, requestParams, request, response )
{
    var validatedObj = checkParameters( observer.params, requestParams );
    //if the parameters were validated successfully,then call the callback function in the observer object
    if ( validatedObj.errors.length == 0 )
    {
        var sessionObj = sessionCookie.onEntry( request, response );
        observer.callback( requestParams, response, sessionObj, function( sessionData )
        {
            end( request, response, sessionData ); 
        } );

    }
    else
    {
        //at least one of the parameters was invalid,call the onError function in the observer object
        observer.onError( validatedObj.errors, requestParams, response, sessionObj, function( sessionData )
        {
            end( request, response, sessionData ); 
        } );
    }
}

/*
function: handleGet
info:
    This function handles a get request.
    Checks to see if there is an observer for the requested pathname.
    If there is no observer,assume the request is for a file and output said file if it exists.
parameters:
    request: object, an http request object
    response: object, an http response object
    parsedUrl: object, the components of the url that was requested
returns:
    nothing
*/
function handleGet( request, response, parsedUrl )
{
    //if there is a particular observer for the pathname specified in the request
    if ( handlerObservers[ parsedUrl.pathname ] )
    {
        return validateAndCall( handlerObservers[ parsedUrl.pathname ], parsedUrl.query, request, response );
    }
    else
    {
        //if there is no observer for the pathname given,then try to give a file back
        console.log( "No observer for path: " + parsedUrl.pathname );
        handleFile( "./public/" + parsedUrl.pathname , response );
    }
}

/*
function: handlePost
info:
    This function handles a post request.
    Checks to see if there is an observer for the requested pathname and that the observer is for type POST.
    If there is no observer of type post for the url,then log to console and call handleGet function.
    If the request body is too large(more than 10mb) then stop the request and output an error message.
    Otherwise, call validateAndCall function
parameters:
    request: object, an http request object
    response: object, an http response object
    parsedUrl: object, the components of the url that was requested
returns:
    nothing
*/
function handlePost( request, response, parsedUrl )
{
    if ( handlerObservers[ parsedUrl.pathname ] == undefined || handlerObservers[ parsedUrl.pathname ].type !== "POST" )
    {
        console.log( "No observer for post request,trying get request" );
        return handleGet( request, response, parsedUrl );
    }

    var requestBody = '';
    request.on( 'data' , function(data) 
    {
        requestBody += data;
        //if the body of the request is larger than 10mb then stop the request
        if( requestBody.length > 1e7 ) 
        {
            response.writeHead(413, 'Request Entity Too Large', {'Content-Type': 'text/html'});
            response.end('413: Request Entity Too Large');
            return;
        }
    });

    request.on( 'end', function() 
    {
        var formData = qs.parse(requestBody);
        return validateAndCall( handlerObservers[ parsedUrl.pathname ], formData, request, response );
    });
}

/*
function: handleUrl
info:
    To be called whenever a request is to be handled.
    Converts the request url given to its components and figures out which observer to notify.
parameters:
    request, object, http request object
    response, object, http response object that is used to send back a response
returns:
    nothing
*/
function handleUrl( request, response )
{
    var parsedUrl = url.parse( request.url, true);
    //console.log(q.host); //string of the hostname,i.e www.website.com
    //console.log(q.pathname); //string of the path and file requested
    //console.log(q.search); //string of the parameters within the url
    //var qdata = q.query; //object with key value pairs representing the url parameters

    //if the request method is get,then handle request using handleGet function
    if(request.method === "GET") 
    {
        return handleGet( request, response, parsedUrl );
    }
    else if ( request.method === "POST" ) //the request method is post,use the handlePost function
    {
        return handlePost( request, response, parsedUrl );
    }
    else 
    {
        //the method is neither get nor post,output error message
        response.writeHead(405, 'Method Not Supported', {'Content-Type': 'text/html'});
        response.end('405: Method Not Supported');
        return;
    }
}

/*
function: end
info:
    This function is called when an observer is done handling a request.
    It updates the session and ends the response.
parameters:
    request, object, an http request object
    response, object, an http response object
    sessionObj, object, an object with attributes:
        key, string, the session token
        data, object, the data for the session
returns:
    nothing
*/
function end( request, response, sessionObj )
{
    sessionCookie.onExit( request, response, sessionObj.key, sessionObj.data );
    response.end();
}

//add the functions above to this module so that they are usable outside of the module
exports.checkParameters = checkParameters;
exports.handleUrl = handleUrl;
exports.registerObserverObject = registerObserverObject;
exports.checkType = checkType;
exports.registerObserver = registerObserver;
exports.handleFile = handleFile;
exports.createParameter = createParameter;
exports.redirectToUrl = redirectToUrl;


