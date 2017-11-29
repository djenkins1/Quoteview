import React from "react";
import QuoteList from "./QuoteList";
import Constants from "./Constants";

/*
//----------------------------
//TODO BOARD
//----------------------------
//PRIORITY
//(DONE)need to pass get loggedInAs somehow and pass it to QuoteList
//need page for My Quotes and change navbar <a> to link
//need to show username of creator when showing CreatorQuotes page component
//need to redo login/signup modals to code using react router
//  AFTER: need to redo new quote modal to code using react router
//
//FUTURE:
//quotes need to be ordered by score and need to be re-ordered when quotes get voted on
//hovering over disabled upvote/downvote badge should show caption saying need to log in
//if there is a problem with logout then error message must be shown to user somehow
//Search quotes by particular text string in author/body
//keep track of quotes that user has voted on and stop them from voting more than once on the same quote
//
//POSSIBLE:
//Add email field to signup form
//admin panel to hide quotes
//add back button functionality
//Server Sessions: delete session files periodically
//(?)pagination on quotes by using after field
//(?)scrolling down on page should get another page of quotes
//(?)use hash table to keep track of position of quotes on quoteList for faster updating
//----------------------------
*/

export default class MainQuotes extends React.Component
{
    constructor( props )
    {
        super( props );
        this.state = {};
        if ( props.finishedLoginCheck )
        {
            this.getData( "/quotes" , {} );
        }
    }

    componentDidUpdate(prevProps, prevState)
    {
        if ( prevProps.finishedLoginCheck != true && this.props.finishedLoginCheck )
        {
            this.getData( "/quotes" , {} );
        }
    }

    render()
    {
        return (
            <div>
                <h1> All Quotes </h1>
                <QuoteList quotes={this.state.quotes} requestDone={this.state.requestDone} />
            </div>
        );
    }

    getData( fromQuoteUrl, fromQuoteParams )
    {
        var self = this;
        //sends ajax get request to server for all the quotes
        $.get( fromQuoteUrl , fromQuoteParams, function( data, status )
        {
            if ( data.length == 0 )
            {
                self.setState( { quotes: [] } );
                self.setState( { requestDone: true } );
                return;
            }

            self.setState( { quotes: data } );
            self.setState( { requestDone: true } );
        });
    }
}

/*
    <QuoteList quotes={this.state.quotes} requestDone={this.state.requestDone} 
        downvoteQuote={this.downvoteQuote.bind( this )} upvoteQuote={this.upvoteQuote.bind( this )} 
        authorClickFunc={this.getQuotesByCreator.bind(this)} />
*/
