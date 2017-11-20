import React from "react";
import Quote from "./Quote";

export default class QuoteList extends React.Component
{
    //called whenever state changes
    render()
    {
        var quotesShown = [];
        //add a Quote component for each quote that is within the state.quotes array
        if ( this.props.quotes )
        {
            for ( var i = 0; i < this.props.quotes.length; i++ )
            {
                var myQuote = this.props.quotes[ i ];
                quotesShown.push( 
                    <Quote key={i} author={myQuote.author} body={myQuote.body} score={myQuote.score} qid={myQuote.qid} 
                        upvoteFunc={this.props.upvoteQuote} downvoteFunc={this.props.downvoteQuote} /> 
                );
            }
        }

        //if there are not any quotes in the state,then show a message
        if ( quotesShown.length == 0 )
        {
            //if the ajax request has already finished then there are not any quotes on the server
            //  therefore show an appropriate message
            if ( this.props.requestDone )
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
}
