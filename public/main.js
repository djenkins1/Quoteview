$( document ).ready(
function()
{
    //TODO: add functionality for upvote and downvote buttons,should use AJAX
    $.get( "/quotes" , function( data, status )
    {
        for ( var i = 0; i < data.length; i++ )
        {
            var myQuote = data[ i ];
            console.log( myQuote );

            var newItem = $( "<div />" );
            newItem.addClass( "list-group-item" );
            newItem.addClass( "d-flex" );
            newItem.addClass( "flex-column" );
            newItem.addClass( "justify-content-center" );
            newItem.addClass( "align-items-start" );

            var newItemQuoteDiv = $( "<div />" );
            var newItemQuote = $( "<q />" );
            newItemQuote.text( myQuote.body );

            var newItemAuthor = $( "<div />" );
            newItemAuthor.text( "--" + myQuote.author );

            var newBadgeContainer = $( "<div />" );
            newBadgeContainer.attr( "id" , "badgeContain" );
            newBadgeContainer.addClass( "align-items-end" );
            newBadgeContainer.addClass( "align-self-end" );
            newBadgeContainer.css( "position" , "relative" );
            newBadgeContainer.css( "bottom" , "20px" );

            var newUpvoteBadge = $( "<a />" );
            newUpvoteBadge.addClass( "badge" );
            newUpvoteBadge.addClass( "badge-primary" );
            newUpvoteBadge.addClass( "badge-pill" );
            newUpvoteBadge.addClass( "quoteBadge" );
            newUpvoteBadge.text( "+" );
            newUpvoteBadge.attr( "href" , "/upvoteQuote?qid=" + myQuote.qid );

            var newScoreBadge = $( "<span />" );
            newScoreBadge.addClass( "badge" );
            newScoreBadge.addClass( "badge-primary" );
            newScoreBadge.addClass( "badge-pill" );
            newScoreBadge.addClass( "quoteBadge" );
            newScoreBadge.text( myQuote.score );

            var newDownvoteBadge = $( "<a />" );
            newDownvoteBadge.addClass( "badge" );
            newDownvoteBadge.addClass( "badge-primary" );
            newDownvoteBadge.addClass( "badge-pill" );
            newDownvoteBadge.addClass( "quoteBadge" );
            newDownvoteBadge.text( "-" );
            newDownvoteBadge.attr( "href" , "/downvoteQuote?qid=" + myQuote.qid );

            $( "#quoteList" ).append( newItem );
            newItem.append( newItemQuoteDiv );
            newItem.append( newItemQuote );
            newItem.append( newItemAuthor );
            newItem.append( newBadgeContainer );
            newBadgeContainer.append( newUpvoteBadge );
            newBadgeContainer.append( newScoreBadge );
            newBadgeContainer.append( newDownvoteBadge );
            



        }
    });

    var dateObj = new Date();
    $.post( "/newQuote" , { "author" : "CPU" , "body" : dateObj.getTime() }, function( data, status )
    {
        console.log( data );
    });
});
