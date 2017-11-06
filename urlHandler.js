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
    observer.path = string ,the file path that the handler is meant to be for
    observer.callback = function ,called once the url parameters have been validated
    observer.onError = function ,called if any of the url parameters are invalid(i.e missing if required or wrong type)
    observer.params = array of parameterSchema objects
  
parameterSchema object: 
    parameterSchema.name = string ,the name of the required parameter
    parameterSchema.type = string ,the type of the required parameter(i.e string,int,float)
    parameterSchema.required = boolean ,true if must be in the url or false if optional
    TODO: any other validation required,i.e if number must be in specific range...

TODO: post requests
TODO: should be able to also specify min/max values or string lengths of values
TODO: other types like email
*/

var http = require("http");
var url = require('url');
var validator = require('validator');
var fs = require('fs'); 

//holds a dictionary where the key is a path on the server and the value is an observer object
var handlerObservers = {};

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
registerObserverObject = function( observer )
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
registerObserver = function( path , params, callback, errorCall )
{
    registerObserverObject( { "path" : path , "params" : params, "callback" : callback, "onError" : errorCall } );
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
checkType = function( value, type )
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
checkParameters = function( parameterSchema, queryObj )
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
handleFile = function( path , response )
{
    fs.readFile( path, function(err, data) 
    {
        if (err) 
        {
            response.writeHead(404, {'Content-Type': 'text/html'});
            response.write("404 Not Found");
            response.end();
            return;
        } 

        response.writeHead(200, {'Content-Type': 'text/html'});
        response.write(data);
        response.end();
    });
}

/*
function: handleUrl
info:
    To be called whenever a request is to be handled.
    Converts the urlStr given to its components and figures out which observer to notify.
parameters:
    urlStr, string, the url that was requested
    response, object, http response object that is used to send back a response
returns:
    nothing
*/
handleUrl = function( urlStr, response )
{
    var parsedUrl = url.parse( urlStr, true);
    //console.log(q.host); //string of the hostname,i.e www.website.com
    //console.log(q.pathname); //string of the path and file requested
    //console.log(q.search); //string of the parameters within the url
    //var qdata = q.query; //object with key value pairs representing the url parameters
    //console.log(qdata.id); //returns 'february'
    
    //if there is a particular observer for the pathname specified in the request
    if ( handlerObservers[ parsedUrl.pathname ] )
    {
        var validatedObj = checkParameters( handlerObservers[ parsedUrl.pathname ].params, parsedUrl.query );
        //if the parameters were validated successfully,then call the callback function in the observer object
        if ( validatedObj.errors.length == 0 )
        {
            handlerObservers[ parsedUrl.pathname ].callback( parsedUrl.query, response );
        }
        else
        {
            //at least one of the parameters was invalid,call the onError function in the observer object
            handlerObservers[ parsedUrl.pathname ].onError( validatedObj.errors, parsedUrl.query, response );
        }
    }
    else
    {
        //if there is no observer for the pathname given,then try to give a file back
        console.log( "No observer for path: " + parsedUrl.pathname );
        handleFile( "." + parsedUrl.pathname , response );
    }
}

//add the functions above to this module so that they are usable outside of the module
exports.checkParameters = checkParameters;
exports.handleUrl = handleUrl;
exports.registerObserverObject = registerObserverObject;
exports.checkType = checkType;
exports.registerObserver = registerObserver;
exports.handleFile = handleFile;

