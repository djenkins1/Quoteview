import React from "react";
import Quote from "./Quote";

export default class QuoteList extends React.Component
{
    //setup the quotes in the state and call getData for ajax call
    constructor( props ) 
    {
        super(props);
        this.state = { quotes : [], requestDone: false };
        this.getData();
    }

    //called whenever state changes
    render()
    {
        var quotesShown = [];
        //add a Quote component for each quote that is within the state.quotes array
        for ( var i = 0; i < this.state.quotes.length; i++ )
        {
            var myQuote = this.state.quotes[ i ];
            quotesShown.push( 
                <Quote key={i} author={myQuote.author} body={myQuote.body} score={myQuote.score} qid={myQuote.qid} 
                    upvoteFunc={this.upvoteQuote.bind(this)} downvoteFunc={this.downvoteQuote.bind( this )} /> 
            );
        }

        //if there are not any quotes in the state,then show a message
        if ( quotesShown.length == 0 )
        {
            //if the ajax request has already finished then there are not any quotes on the server
            //  therefore show an appropriate message
            if ( this.state.requestDone )
            {
                quotesShown.push( <div key={0}>There are currently no quotes.</div> );
            }
            else
            {
                //the request has not finished yet, so show loading message
                quotesShown.push( <div key={0}>Loading quotes, please wait...</div> );
            }
        }

        return (
            <div id="quoteList" className="list-group">
                {quotesShown}
            </div>
        );
    }

    //sends ajax get request to server for all the quotes
    //once server responds,put the quotes into the state and update it to render again
    getData()
    {
        var self = this;
        $.get( "/quotes" , function( data, status )
        {
            if ( data.length == 0 )
            {
                self.setState( { quotes: [] , requestDone: true } );
                return;
            }

            self.setState( { quotes: data , requestDone: true } );
        });
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
}
