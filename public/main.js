$( document ).ready(
function()
{
    $.get( "/quotes" , function( data, status )
    {
        for ( var i = 0; i < data.length; i++ )
        {
            console.log( data[ i ] );
        }
    });
});
