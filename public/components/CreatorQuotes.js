import React from "react";
import QuoteList from "./QuoteList";
import Constants from "./Constants";
import QuotePage from "./QuotePage";

export default class CreatorQuotes extends QuotePage
{
    constructor( props )
    {
        super( props );
        this.state.quoteUser = "???";
        this.hasRequestedData = false;

        if ( props.finishedLoginCheck && props.match.params.creator )
        {
            this.hasRequestedData = true;
            this.getData( "/quotes" , { "creator" : props.match.params.creator } );
        }
    }

    //called after either the state or the props of the component have been updated
    //checks to see if the params.creator has changed and if so send a new ajax request for the quotes by the new creator
    componentDidUpdate(prevProps, prevState)
    {
        super.componentDidUpdate( prevProps, prevState );
        if ( prevProps.match.params.creator != this.props.match.params.creator || !this.hasRequestedData )
        {
            this.getData( "/quotes" , { "creator" : this.props.match.params.creator } );
            this.hasRequestedData = true;
        }
    }

    shouldAddQuote( newQuote )
    {
        if ( newQuote === undefined || newQuote.creatorId === undefined )
        {
            console.log( "newQuote undefined or newQuote.creatorId undefined" );
            return false;
        }

        if ( newQuote.creatorId !== this.props.match.params.creator )
        {
            console.log( "newQuote not by same creator" );
            return false;
        }

        return true;
    }

    /*
        This method returns the title for the h1 on the page
            returns "My Quotes" if the user is logged in and they are looking at their own quotes
            returns "Quotes by USERNAME" otherwise,where USERNAME is in this.state.quoteUser
    */
    getComponentTitle()
    {
        if ( this.props.userName && this.props.userName.userId == this.props.match.params.creator )
        {
            return Constants.TXT_QUOTES_MY;
        }

        return "Quotes by " + this.state.quoteUser;
    }

    //called whenever the component is updated
    render()
    {
        return (
            <div>
                <h1> {this.getComponentTitle()} </h1>
                <QuoteList quotes={this.state.quotes} 
                    requestDone={this.state.requestDone} 
                    loggedInAs={this.props.userName} 
                    downvoteQuote={this.downvoteQuote.bind( this )} upvoteQuote={this.upvoteQuote.bind( this )} />
            </div>
        );
    }
}

