import React from "react";
import QuoteList from "./QuoteList";
import Constants from "./Constants";

export default class CreatorQuotes extends React.Component
{
    constructor( props )
    {
        super( props );
        this.state = { quoteUser: "???" };
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
        console.log( "UPDATING" );
        console.log( prevProps.match.params );
        if ( prevProps.match.params.creator != this.props.match.params.creator || !this.hasRequestedData )
        {
            this.getData( "/quotes" , { "creator" : this.props.match.params.creator } );
            this.hasRequestedData = true;
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
                <QuoteList quotes={this.state.quotes} 
                    requestDone={this.state.requestDone} 
                    loggedInAs={this.props.userName} 
                    downvoteQuote={this.downvoteQuote.bind( this )} upvoteQuote={this.upvoteQuote.bind( this )} />
            </div>
        );
    }

    //sends an ajax request for quotes with the parameters given
    getData( fromQuoteUrl, fromQuoteParams )
    {
        console.log( "REQUESTING" );
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

    updateQuote( qid, newData )
    {
        var quotesCopy = this.state.quotes.slice();
        for ( var i = 0; i < quotesCopy.length; i++ )
        {
            var atQuote = quotesCopy[ i ];
            if ( atQuote.qid === qid )
            {
                quotesCopy[ i ] = newData;
                break;
            }
        }

        //update the state if and only if the for loop did not go to end of the quotes array
        if ( i < quotesCopy.length )
        {
            this.setState( { "quotes" : quotesCopy } );
        }
    }

    voteQuote( qid, href )
    {
        var self = this;
        $.post( href , { "qid" : qid } , function( data, status )
        {
            if ( data.qid )
            {
                self.updateQuote( qid, data );
            }
            else
            {
                //TODO: show error message
                console.log( "BAD " + href + ",No qid" );
            }
        });
    }

    upvoteQuote( qid )
    {
        this.voteQuote( qid, "/upvoteQuote" );
    }

    downvoteQuote( qid )
    {
        this.voteQuote( qid, "/downvoteQuote" );
    }
}

