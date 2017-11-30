import React from "react";
import QuoteList from "./QuoteList";
import Constants from "./Constants";

/*
This is meant as an abstract class for components that intend to request and keep track of quotes data.
*/
export default class QuotePage extends React.Component
{
    constructor( props )
    {
        super( props );
        this.state = {};
    }

    //rendering is to be handled by child classes
    render() 
    {
       throw new Error('render() must be handled by subclass,it is not implemented by QuotePage class');
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
