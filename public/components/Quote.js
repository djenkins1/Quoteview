import React from "react";

import QuoteScore from "./QuoteScore";

var ObjectId = require('mongodb').ObjectID;

export default class Quote extends React.Component
{
    //shows a quote and its author and score
    render()
    {
        var quoteTimeStamp = ObjectId( this.props.quoteObj.qid ).getTimestamp();
        var quoteDate = quoteTimeStamp.toLocaleDateString();
        var quoteTime = quoteTimeStamp.toLocaleTimeString( [], {hour: '2-digit', minute:'2-digit'} );
        return (
            <div className='quoteDivContainer list-group-item d-flex flex-column justify-content-center align-items-start'>
                <div className='quoteTextContainer'>
                    <q className='quoteBody'>{this.props.quoteObj.body}</q>
                    <div className='quoteAuthor'> -- {this.props.quoteObj.author}</div>
                    <div className='quoteSubmitted'> Submitted by {this.props.quoteObj.creatorName} on {quoteDate} at {quoteTime} </div>
                </div>
                <QuoteScore score={this.props.quoteObj.score} qid={this.props.quoteObj.qid} upvoteFunc={this.props.upvoteFunc}
                    downvoteFunc={this.props.downvoteFunc} loggedInAs={this.props.loggedInAs} />
            </div>
        );
    }
}

