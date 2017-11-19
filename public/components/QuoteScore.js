import React from "react";

//contains the score for a quote
export default class QuoteScore extends React.Component
{
    render()
    {
        return (
            <div className='badgeContain align-items-end align-self-end'>
                <a className='badge badge-primary badge-pill quoteBadge' onClick={this.handleUpvote.bind( this )}
                    href='#' data-qid={this.props.qid}> + </a>
                <span className='badge badge-primary badge-pill quoteBadge quoteScore'> {this.props.score} </span>
                <a className='badge badge-primary badge-pill quoteBadge' onClick={this.handleDownvote.bind( this )}
                    href='#' data-qid={this.props.qid}> - </a>
            </div>
        );
    }

    handleUpvote( e )
    {
        e.preventDefault();
        this.props.upvoteFunc( this.props.qid );
    }

    handleDownvote( e )
    {
        e.preventDefault();
        this.props.downvoteFunc( this.props.qid );
    }
}
