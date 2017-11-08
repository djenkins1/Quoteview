//this function handles when the upvote/downvote button have been clicked on a specific quote
//it sends a post request to the server and then updates the score for that quote when the server response gets back
function handleVoteClick( e )
{
    $.post( $( this ).attr( "href" ) , { "qid" : $( this ).data( "qid" ) } , function( data, status )
    {
        if ( data.qid == undefined )
        {
            console.log( "BAD REQUEST,NO QID" );
            return;
        }

        $( "#quoteScore" + data.qid ).text( data.score );
    });

    e.preventDefault();
    return false;
}

//given an object that holds data about a quote, 
//  this function creates the html elements for the quote and appends them to the DOM 
function createAndAppendQuoteDiv( myQuote )
{
    var newItem = $( "<div />" );
    newItem.attr( "id" , "quoteDiv" + myQuote.qid );
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
    newUpvoteBadge.attr( "href" , "/upvoteQuote" );
    newUpvoteBadge.data( "qid" , myQuote.qid );
    newUpvoteBadge.click( handleVoteClick );

    var newScoreBadge = $( "<span />" );
    newScoreBadge.attr( "id" , "quoteScore" + myQuote.qid );
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
    newDownvoteBadge.attr( "href" , "/downvoteQuote" );
    newDownvoteBadge.data( "qid" , myQuote.qid );
    newDownvoteBadge.click( handleVoteClick );

    $( "#quoteList" ).append( newItem );
    newItem.append( newItemQuoteDiv );
    newItem.append( newItemQuote );
    newItem.append( newItemAuthor );
    newItem.append( newBadgeContainer );
    newBadgeContainer.append( newUpvoteBadge );
    newBadgeContainer.append( newScoreBadge );
    newBadgeContainer.append( newDownvoteBadge );    
}

//this function handles when the server sends a response back for a new quote that was added
function handleAddQuote( data, status )
{
    console.log( "Add Quote Data: " , data );
    if ( data.qid == undefined )
    {
        console.log( "SERVER DID NOT CREATE QUOTE" )
        return;
    }
    //TODO: put the quote in the correct place based on its score

    createAndAppendQuoteDiv( data );
}

function handleNewQuoteForm( e )
{
    var dataObj = {};
    $( "#newQuoteForm" ).children().each(
    function()
    {
        var key = $( this ).attr( "name" );
        dataObj[ key ] = $( this ).val();
    });
    $.post( $( "#newQuoteForm" ).attr( "action" ) , dataObj , handleAddQuote );
    $( "#basicModalCancel" ).click();

    e.preventDefault();
    return false;
}

$( document ).ready(
function()
{
    //TODO: rate limit upvote/downvote of quotes so that can only vote once per second
    //TODO: user login/password and creator field for quotes
    //TODO: redo listing of quotes when a quote has been upvoted/downvoted(do this client side)

    $.get( "/quotes" , function( data, status )
    {
        for ( var i = 0; i < data.length; i++ )
        {
            createAndAppendQuoteDiv( data[ i ] );
        }
    });

    $( "#newQuoteLink" ).on( "click" , function( e )
    {
        $( "#basicModal .modal-title" ).text( "Add New Quote" );
        var modalBodyHTML = "<form action='/newQuote' id='newQuoteForm' method='post'>";
        modalBodyHTML += "<input size='41' type='text' name='author' placeholder='Author' /><br><br>";
        modalBodyHTML += "<textarea rows='8' cols='40' name='body' placeholder='Text'></textarea>";
        modalBodyHTML += "</form>";
        $( '#basicModal .modal-body' ).html( modalBodyHTML );
        $( "#basicModalYes" ).text( "Add" );
        $( "#basicModalYes" ).off( "click" );
        $( "#basicModalYes" ).on( "click" , handleNewQuoteForm );
        $( "#basicModalCancel" ).text( "Cancel" );
        $( "#basicModal" ).modal();
        e.preventDefault();
    });

    /*
    var dateObj = new Date();
    $.post( "/newQuote" , { "author" : "CPU" , "body" : dateObj.getTime() }, function( data, status )
    {
        console.log( data );
    });
    */
});
