$( document ).ready(
function()
{
    //TODO: upvote/downvote buttons for quotes
    //TODO: visible score of quotes
    $.get( "/quotes" , function( data, status )
    {
        for ( var i = 0; i < data.length; i++ )
        {
            var myQuote = data[ i ];
            console.log( myQuote );

            var newCard = $( "<div />" );
            newCard.addClass( "card" );

            var newCardBody = $( "<div />" );
            newCardBody.addClass( "card-body" );

            var newCardQuote = $( "<q />" );
            newCardQuote.text( myQuote.body );

            var newCardAuthor = $( "<span />" );
            newCardAuthor.text( "--" + myQuote.author );

            $( "body" ).append( newCard );
            newCard.append( newCardBody );
            newCardBody.append( newCardQuote );
            newCardBody.append( "<br>" );
            newCardBody.append( newCardAuthor );
        }
    });

    var dateObj = new Date();
    $.post( "/newQuote" , { "author" : "CPU" , "body" : dateObj.getTime() }, function( data, status )
    {
        console.log( data );
    });
});
