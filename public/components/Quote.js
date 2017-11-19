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
                    <q className='quoteBody'>{this.props.body}</q>
                    <div className='quoteAuthor'> -- {this.props.author}</div>
                </div>
                <QuoteScore score={this.props.score} qid={this.props.qid} upvoteFunc={this.props.upvoteFunc}
                    downvoteFunc={this.props.downvoteFunc} />
            </div>
        );
    }
}

