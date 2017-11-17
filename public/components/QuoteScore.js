import React from "react";

//contains the score for a quote
export default class QuoteScore extends React.Component
{
    render()
    {
        return (
            <div className='badgeContain align-items-end align-self-end'>
                <a className='badge badge-primary badge-pill quoteBadge' href='/upvoteQuote' data-qid={this.props.qid}>+</a>
                <span className='badge badge-primary badge-pill quoteBadge quoteScore'>{this.props.score}</span>
                <a className='badge badge-primary badge-pill quoteBadge' href='/downvoteQuote' data-qid={this.props.qid}>-</a>
            </div>
        );
    }
}
