import React from "react";

import QuoteScore from "./QuoteScore"

export default class Quote extends React.Component
{
    //shows a quote and its author and score
    render()
    {
        return (
            <div className='list-group-item d-flex flex-column justify-content-center align-items-start'>
                <div>
                    <q className='quoteBody'>{this.props.quoteObj.body}</q>
                    <div className='quoteAuthor'> -- {this.props.quoteObj.author}</div>
                    <div className='quoteSubmitted'> Submitted by {this.props.quoteObj.creatorName} </div>
                </div>
                <QuoteScore score={this.props.quoteObj.score} qid={this.props.quoteObj.qid} upvoteFunc={this.props.upvoteFunc}
                    downvoteFunc={this.props.downvoteFunc} />
            </div>
        );
    }
}

