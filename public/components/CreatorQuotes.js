import React from "react";
import QuoteList from "./QuoteList";
import Constants from "./Constants";

export default class CreatorQuotes extends React.Component
{
    constructor( props )
    {
        super( props );
        this.state = { quoteUser: "???" };
        if ( props.finishedLoginCheck && props.match.params.creator )
        {
            this.getData( "/quotes" , { "creator" : props.match.params.creator } );
        }
    }

    //called after either the state or the props of the component have been updated
    //checks to see if the params.creator has changed and if so send a new ajax request for the quotes by the new creator
    componentDidUpdate(prevProps, prevState)
    {
        if ( prevProps.match.params.creator != this.props.match.params.creator )
        {
            this.getData( "/quotes" , { "creator" : this.props.match.params.creator } );
        }
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
                <QuoteList quotes={this.state.quotes} requestDone={this.state.requestDone} loggedInAs={this.props.userName} />
            </div>
        );
    }

    //sends an ajax request for quotes with the parameters given
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
                self.setState( { quoteUser: "???" } );
                return;
            }

            self.setState( { quotes: data } );
            self.setState( { requestDone: true } );
            self.setState( { quoteUser: data[ 0 ].creatorName } );
        });
    }
}

/*
    <QuoteList quotes={this.state.quotes} requestDone={this.state.requestDone} 
        downvoteQuote={this.downvoteQuote.bind( this )} upvoteQuote={this.upvoteQuote.bind( this )} 
        authorClickFunc={this.getQuotesByCreator.bind(this)} />
*/
