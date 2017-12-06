import React from "react";
import QuoteList from "./QuoteList";
import Constants from "./Constants";

//for sorting quotes in descending order
function compareQuotesByScore( a,b ) 
{
    return ( b.score - a.score );
}

/*
This is meant as an abstract class for components that intend to request and keep track of quotes data.
*/
export default class QuotePage extends React.Component
{
    constructor( props )
    {
        super( props );
        this.state = {};
        if ( props.newQuote )
        {
            this.addQuote( props.newQuote );
            props.finishAddQuote( props.newQuote );
        }
    }

    componentDidUpdate(prevProps, prevState)
    {
        if ( this.props.newQuote )
        {
            console.log( "NEW QUOTE" );
            this.addQuote( this.props.newQuote );
            this.props.finishAddQuote( this.props.newQuote );
        }        
    }

    //rendering is to be handled by child classes
    render() 
    {
       throw new Error('render() must be handled by subclass,it is not implemented by QuotePage class');
    }

    addQuote( newQuote ) 
    {
        //put the quote in the right place based on its score
        if ( this.shouldAddQuote( newQuote ) )
        {
            //make a copy of the quotes for modification so as to update state later
            var quotesCopy = this.state.quotes.slice();
            for ( var i = 0; i < this.state.quotes.length; i++ )
            {
                if ( this.state.quotes[ i ].score < newQuote.score )
                {
                    break;
                }
            }

            //insert the newQuote into the quotesCopy at position i
            quotesCopy.splice( i, 0, newQuote );
            this.setState( { "quotes" : quotesCopy } );
        }
    }

    //shouldAddQuote is to be handled by child classes
    //should return true if the quote can be added or false otherwise
    shouldAddQuote( newQuote )
    {
       throw new Error('addQuote() must be handled by subclass,it is not implemented by QuotePage class');
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
        //make a copy of the quotes for modification so as to update state later
        var quotesCopy = this.state.quotes.slice();
        //go through all the quotes,find the quote that has the updated quote's qid
        //once found,overwrite that position with the updated quote
        for ( var i = 0; i < quotesCopy.length; i++ )
        {
            let atQuote = quotesCopy[ i ];
            if ( atQuote.qid === qid )
            {
                let prevQuote = quotesCopy[ i - 1 ];
                let nextQuote = quotesCopy[ i + 1 ];
                let swapIndex = i;
                //if the previous quote in the list has lower score than the updated quote then need to swap them
                if ( prevQuote && prevQuote.score <= newData.score )
                {
                    swapIndex = i - 1;
                }
                //if the next quote in the list has higher score than the updated quote then need to swap them
                else if ( nextQuote && nextQuote.score >= newData.score )
                {
                    swapIndex = i + 1;
                }

                //swap the elements and break out of the loop
                prevQuote = quotesCopy[ swapIndex ];
                quotesCopy[ swapIndex ] = newData;
                if ( i != swapIndex )
                {
                    quotesCopy[ i ] = prevQuote;
                }
                break;
            }
        }

        //update the state if and only if the for loop did not go to end of the quotes array
        if ( i < quotesCopy.length )
        {
            quotesCopy.sort( compareQuotesByScore );
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
        var send_url = "/upvoteQuote";
        if ( this.props.userName && this.props.userName.role === Constants.ROLE_USER_ADMIN )
        {
            send_url = "/flagQuote";
        }
        this.voteQuote( qid, send_url );
    }

    downvoteQuote( qid )
    {
        var send_url = "/downvoteQuote";
        if ( this.props.userName && this.props.userName.role === Constants.ROLE_USER_ADMIN )
        {
            send_url = "/unflagQuote";
        }
        this.voteQuote( qid, send_url );
    }
}
