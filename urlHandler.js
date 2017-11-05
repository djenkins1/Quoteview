/*
Author: Dilan Jenkins
File: urlHandler.js
Info:
    This is a module for node js.
    It is used for registering handlers for specific url paths on a server.
    It can be used for specifying required/optional url parameters for a specific url.
    As well as allowing type checking of said parameters.
*/

var http = require("http");
var url = require('url');
var validator = require('validator');

//holds a dictionary where the key is a path on the server and the value is an observer object
var handlerObservers = {};
//observer object:
//observer.path = string ,the file path that the handler is meant to be for
//observer.callback = function ,called once the url parameters have been validated
//observer.onError = function ,called if any of the url parameters are invalid(i.e missing if required or wrong type)
//observer.params = array of parameterSchema objects
//  parameterSchema object: 
//      parameterSchema.name = string ,the name of the required parameter
//      parameterSchema.type = string ,the type of the required parameter(i.e string,int,float)
//      parameterSchema.required = boolean ,true if must be in the url or false if optional
//      TODO: any other validation required,i.e if number must be in specific range...

registerObserverObject = function( observer )
{
    if ( observer.path == undefined )
    {
        throw new Error( "Path for observer is undefined" );
    }

    if ( handlerObservers[ observer.path ] )
    {
        console.log( "Overwriting old observer for path: " , observer.path );
    }

    handlerObservers[ observer.path ] = observer;
}

registerObserver = function( path , params, callback, errorCall )
{
    registerObserverObject( { "path" : path , "params" : params, "callback" : callback, "onError" : errorCall } );
}

//return true if the value given is of type given or false otherwise
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

    //TODO: other types like email

    console.log( value + " fell through for type " + type );
    return false;
}

/*
    function: checkParameters
    parameters:
        parameterSchema, list of objects with following attributes
            name,the name of the required parameter
            type,the type of the required parameter(i.e string,int,float)
            required,true if must be in the url or false if optional
        queryObj, object with keys being parameter names and values being the actual values       
    returns:
        Object containing attribute called error that is a list of parameters that were invalid
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
        if ( !checkType( queryObj[ schemaObj.name ] , schemaObj.type ) )
        {
            var objError = { "name" : schemaObj.name , "problem" : "wrong type" };
            toReturn.errors.push( objError );
            continue;
        }

        //TODO: should be able to also specify min/max values or string lengths of values
    }

    return toReturn;
}

handleUrl = function( urlStr, response )
{
    var q = url.parse( urlStr, true);
    //console.log(q.host); //string of the hostname,i.e www.website.com
    //console.log(q.pathname); //string of the path and file requested
    //console.log(q.search); //string of the parameters within the url
    //var qdata = q.query; //object with key value pairs representing the url parameters
    //console.log(qdata.id); //returns 'february'


    if ( handlerObservers[ q.pathname ] )
    {
        var validatedObj = checkParameters( handlerObservers[ q.pathname ].params, q.query );
        if ( validatedObj.errors.length == 0 )
        {
            handlerObservers[ q.pathname ].callback( q.query, response );
        }
        else
        {
            handlerObservers[ q.pathname ].onError( validatedObj.errors, q.query, response );
        }
    }
    else
    {
        //if there is no observer for the pathname given,then let response be 404 Not Found
        //TODO: if the file exists on the server,use it
        console.log( "No observer for path: " + q.pathname );
        response.writeHead( 404, {'Content-Type': 'text/html'});
        response.end("404 Not Found");
        return false;
    }
}

//add the functions above to this module so that they are usable outside of the module
exports.checkParameters = checkParameters;
exports.handleUrl = handleUrl;
exports.registerObserverObject = registerObserverObject;
exports.checkType = checkType;
exports.registerObserver = registerObserver;


