import React from "react";
import QuoteScore from "./QuoteScore";
var ObjectId = require('mongodb').ObjectID;
import { Link } from 'react-router-dom';

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
                    <div className='quoteSubmitted'>
                        <span>Submitted by </span>
                        <Link to={"/quotes/" + this.props.quoteObj.creatorId} >{this.props.quoteObj.creatorName}</Link> 
                        <span> on </span>
                        <span>{quoteDate} at {quoteTime}</span>
                    </div>
                </div>
                <QuoteScore score={this.props.quoteObj.score} qid={this.props.quoteObj.qid} upvoteFunc={this.props.upvoteFunc}
                    downvoteFunc={this.props.downvoteFunc} loggedInAs={this.props.loggedInAs} />
            </div>
        );
    }

    handleAuthorClick( e )
    {
        e.preventDefault();
        this.props.authorClickFunc( this.props.quoteObj.creatorId, this.props.quoteObj.creatorName );
    }
}

