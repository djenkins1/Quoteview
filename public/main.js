//object containing all the quotes by their id being the key
var allQuotes = {};

//array that contains ids of quotes that are in descending order by their score
var quotesByScore = [];

//swap the quote that has been updated if it needs to be swapped
//return true if the list was modified or false otherwise
function updateQuoteByScore( quoteDict, list, quoteId )
{
    //find the quote and swap it if needed
    var i;
    for( i = 0; i < list.length; i++ )
    {
        if ( list[ i ] == quoteId )
        {
            break;
        }
    }

    //if the whole list was traversed without finding the quote then log to console and return
    if ( i >= list.length )
    {
        console.log( "Quote with id not in list yet:" , quoteId );
        return false;
    }

    var myQuote = quoteDict[ list[ i ] ];
    
    //check to see if quote has score higher than quote to the left
    //  if so then swap and return true
    var leftQuote = list[ i - 1 ];
    if ( leftQuote !== undefined && quoteDict[ leftQuote ].score < myQuote.score )
    {
        list[ i - 1] = myQuote.qid;
        list[ i ] = leftQuote;
        return true;
    }
    
    //otherwise check to see if quote has lower score than quote to the right
    //  if so then swap and return true
    var rightQuote = list[ i + 1 ];
    if ( rightQuote !== undefined && quoteDict[ rightQuote ].score > myQuote.score )
    {
        list[ i + 1] = myQuote.qid;
        list[ i ] = rightQuote;
        return true;
    }

    //otherwise, no need to swap,return false
    return false;
}

//inserts the quote with id given into the list given in a position so that the list is sorted
//assumes that the list is already sorted by score before adding the new quote
function insertQuoteByScore( quoteDict, list, quoteId )
{
    //if the list is empty then the new quote must go at the beginning of the empty list,so push it and return
    if ( list.length == 0 )
    {
        list.push( quoteId );
        return;
    }

    var myQuote = quoteDict[ quoteId ];
    var i;
    //starting at the beginning of the list,look for the first element with score less than the quote to be inserted
    //once that element is found,use the value of i as where to insert the new quote
    //if the element is not found,the new quote goes at the end
    for (i = 0; i < list.length; i++ )
    {
        var atQuote = quoteDict[ list[ i ] ];
        if ( atQuote.score < myQuote.score )
        {
            break;
        }
    }

    //if the whole list was traversed and there were no elements with a smaller score than the new quote
    //  then the new quote goes at the end of the list,so just push it and return
    if ( i >= list.length )
    {
        list.push( quoteId );
        return;
    }

    //insert the new quote at position i
    list.splice( i , 0 , quoteId );
}

function updateQuotesView( quoteDict, list )
{
    var quoteDivs = $( "#quoteList" ).children();
    for ( var i = 0; i < list.length; i++ )
    {
        var myQuote = quoteDict[ list[ i ] ];
        //update the author,body and score
        //also update the data qid for both left,score and right buttons
        quoteDivs.eq( i ).find( ".quoteScore" ).text( myQuote.score );
        quoteDivs.eq( i ).find( ".quoteBadge" ).data( "qid" , myQuote.qid );
        quoteDivs.eq( i ).find( ".quoteBody" ).text( myQuote.body );
        quoteDivs.eq( i ).find( ".quoteAuthor" ).text( "--" + myQuote.author );
    }
}

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

        allQuotes[ data.qid ] = data;
        updateQuoteByScore( allQuotes, quotesByScore, data.qid );
        updateQuotesView( allQuotes, quotesByScore );     
    });

    e.preventDefault();
    return false;
}

//given an object that holds data about a quote, 
//  this function creates the html elements for the quote and appends them to the DOM 
function createAndAppendQuoteDiv( myQuote )
{
    var newItem = $( "<div />" );
    newItem.addClass( "list-group-item" );
    newItem.addClass( "d-flex" );
    newItem.addClass( "flex-column" );
    newItem.addClass( "justify-content-center" );
    newItem.addClass( "align-items-start" );

    var newItemQuoteDiv = $( "<div />" );
    var newItemQuote = $( "<q />" );
    newItemQuote.addClass( "quoteBody" );
    newItemQuote.text( myQuote.body );

    var newItemAuthor = $( "<div />" );
    newItemAuthor.text( "--" + myQuote.author );
    newItemAuthor.addClass( "quoteAuthor" );

    var newBadgeContainer = $( "<div />" );
    newBadgeContainer.addClass( "badgeContain" );
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
    newScoreBadge.addClass( "badge" );
    newScoreBadge.addClass( "badge-primary" );
    newScoreBadge.addClass( "badge-pill" );
    newScoreBadge.addClass( "quoteBadge" );
    newScoreBadge.addClass( "quoteScore" );
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
    if ( data.qid == undefined )
    {
        console.log( "SERVER DID NOT CREATE QUOTE" )
        return;
    }

    if ( quotesByScore.length == 0 )
    {
        $( "#quoteList" ).html("");
    }
    allQuotes[ data.qid ] = data;
    insertQuoteByScore( allQuotes, quotesByScore, data.qid );
    createAndAppendQuoteDiv( data );
    updateQuotesView( allQuotes, quotesByScore );
}

function getFormData( formId )
{
    var toReturn = {};
    $( formId ).children().each(
    function()
    {
        if ( $( this ).attr( "name" ) )
        {
            var key = $( this ).attr( "name" );
            toReturn[ key ] = $( this ).val();
        }
    });

    return toReturn;
}

function handleNewQuoteForm( e )
{
    var dataObj = getFormData( "#newQuoteForm" );
    $.post( $( "#newQuoteForm" ).attr( "action" ) , dataObj , handleAddQuote );
    $( "#basicModalCancel" ).click();

    e.preventDefault();
    return false;
}

function handleNewUserForm( e )
{
    var formData = getFormData( "#newUserForm" );
    $.post( $( "#newUserForm" ).attr( "action" ), formData , function( data, status )
    {
        //{ userId: 5, username: "Maxride", role: "user" }
        if ( data.error || data.errors )
        {
            $( "#loginAlertBox" ).html("");
            for ( var i = 0; i < data.errors.length; i++ )
            {
                var alertDiv = $( "<div />" );
                alertDiv.addClass( "alert" ).addClass( "alert-danger" );
                alertDiv.text( data.errors[ i ].name + ":" + data.errors[ i ].problem );
                $( "#loginAlertBox" ).append( alertDiv );
            }
        }
        else
        {
            nowLoggedIn( data );
            $( "#basicModalCancel").click();
        }
    });
    
    e.preventDefault();
    return false;
}

function nowLoggedIn( userData )
{
    $( "#newQuoteLink" ).removeClass( "disabled" );
    $( "#newUserLink" ).remove();
    var helloUserElement = $( "<span />" );
    helloUserElement.text( "Hello, " + userData.username );
    helloUserElement.addClass( "navbar-text" );
    helloUserElement.css( "color" , "white" );
    $( "#navbarLinks" ).prepend( helloUserElement );
    var logoutLink = $( "<a />" );
    logoutLink.addClass( "nav-item" ).addClass( "nav-link" );
    logoutLink.text( "Logout" );
    logoutLink.attr( "href" , "/logout" );
    logoutLink.on( "click" , function( e )
    {
        $.get( $( this ).attr( "href" ) , function( data, status )
        {
            console.log( data );
            //the user is now logged out,reload the page
            location.reload( true );
        });
        e.preventDefault();
        return false;
    });
    $( "#navbarLinks" ).append( logoutLink );
}

function changeModal( title, body, yesText, noText, onYes )
{
    $( "#basicModal .modal-title" ).text( title );
    $( '#basicModal .modal-body' ).html( body );
    $( "#basicModalYes" ).text( yesText  );
    $( "#basicModalYes" ).off( "click" );
    $( "#basicModalYes" ).on( "click" , onYes );
    $( "#basicModalCancel" ).text( noText );
    $( "#basicModal" ).modal();
}

$( document ).ready(
function()
{
    //FUTURE:
    //TODO: show creator of a quote on the quote somewhere
    //          problem, need to get username from creatorId
    //TODO: pagination on quotes by using after field
    //TODO: scrolling down on page should get another page of quotes
    //TODO: rate limit upvote/downvote of quotes so that can only vote once per second
    //TODO: should only be able to upvote/downvote quotes if logged in
    //TODO: should not be able to upvote/downvote own posts

    //send a request to the server to see if currently logged in
    $.get( "/userData", function( data, status )
    {
        if ( data.username )
        {
            nowLoggedIn( data );
        }
    });

    //send a request to the server for the quotes and display the results on the page
    $.get( "/quotes" , function( data, status )
    {
        if ( data.length == 0 )
        {
            $( "#quoteList" ).text( "There are currently no quotes." );        
        }

        for ( var i = 0; i < data.length; i++ )
        {
            allQuotes[ data[ i ].qid ] = data[ i ];
            insertQuoteByScore( allQuotes, quotesByScore, data[ i ].qid );
            createAndAppendQuoteDiv( data[ i ] );
        }
    });



    //toggles between the signup and login forms
    $( document.body ).on( "click" , "#toggleSignForm", function( e )
    {
        var toggledText = "Login";
        var formAction = "/newUser";
        var formTitle = "Sign Up";
        if ( $( this ).text() === "Login" )
        {
            toggledText = "Sign Up";
            formAction = "/login";
            formTitle = "Login";
        }

        $( "#newUserForm" ).attr( "action" , formAction );  
        $( this ).text( toggledText );
        console.log( formTitle );
        $( "#basicModal .modal-title" ).text( formTitle );
        $( "#basicModalYes" ).text( formTitle  );

        e.preventDefault();
        return false;
    });

    $( "#newQuoteLink" ).on( "click" , function( e )
    {
        if ( $( this ).hasClass( "disabled" ) )
        {
            e.preventDefault();
            return false;
        }

        var modalBodyHTML = "<form action='/newQuote' id='newQuoteForm' method='post'>";
        modalBodyHTML += "<input size='41' type='text' name='author' placeholder='Author' /><br><br>";
        modalBodyHTML += "<textarea rows='8' cols='40' name='body' placeholder='Text'></textarea>";
        modalBodyHTML += "</form>";
        changeModal( "Add New Quote", modalBodyHTML, "Add" , "Cancel" , handleNewQuoteForm );
        e.preventDefault();
        return false;
    });

    //TODO: post should not cause redirect, use json response to change page view
    $( "#newUserLink" ).on( "click" , function( e )
    {
        var modalBodyHTML = "<form action='/login' id='newUserForm' method='post'>";
        modalBodyHTML += "<input size='30' type='text' name='username' placeholder='Username' /><br><br>";
        modalBodyHTML += "<input size='30' type='password' name='password' placeholder='Password' /><br><br>";
        modalBodyHTML += "<a href='#' id='toggleSignForm'>Sign Up</a>";
        //TODO: toggle between sign up(/newUser) and login(/login)
        modalBodyHTML += "</form>";
        modalBodyHTML += "<div id='loginAlertBox'></div>";
        changeModal( "Login", modalBodyHTML, "Login" , "Cancel" , handleNewUserForm );
        e.preventDefault();        
    });
});
