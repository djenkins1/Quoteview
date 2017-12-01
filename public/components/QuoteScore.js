import React from "react";

//contains the score for a quote
export default class QuoteScore extends React.Component
{
    render()
    {
        var loggedInEnableClass = " disabled bg-secondary";
        var loggedInTitle = "You must be logged in to vote.";
        if ( this.props.loggedInAs )
        {
            loggedInEnableClass = "";
            loggedInTitle = "";
        }

        return (
            <div className='badgeContain align-items-end align-self-end'>
                <a className={'badge badge-primary badge-pill quoteBadge' + loggedInEnableClass }
                    onClick={this.handleUpvote.bind( this )}
                    href="#" title={loggedInTitle} 
                    data-container="body" 
                    data-toggle="popover" 
                    data-placement="top" 
                    data-content={loggedInTitle}> + </a>
                <span className='badge badge-primary badge-pill quoteBadge quoteScore'> {this.props.score} </span>
                <a className={'badge badge-primary badge-pill quoteBadge' + loggedInEnableClass }
                    onClick={this.handleDownvote.bind( this )}
                    href="#" title={loggedInTitle} > - </a>
            </div>
        );
    }

    componentDidUpdate(prevProps, prevState)
    {
        //if was logged in but no more than reenable the poppers
        if ( prevProps.loggedInAs && this.props.loggedInAs == undefined )
        {
            $( ".quoteBadge" ).popover( {"container": 'body' } );
        }
        //if logged in now then disable the poppers
        else if ( this.props.loggedInAs !== undefined )
        {
            $( ".quoteBadge" ).popover( "dispose" );
        }
    }

    componentDidMount()
    {
        //enable popper for upvote/downvote buttons
        $( ".quoteBadge" ).popover( {"container": 'body' } );
    }

    componentWillUnmount()
    {
        //disable and dispose of popper for upvote/downvote buttons
        $( ".quoteBadge" ).popover( "dispose" );
    }

    handleUpvote( e )
    {
        e.preventDefault();
        if ( this.props.loggedInAs )
        {
            this.props.upvoteFunc( this.props.qid );
        }
    }

    handleDownvote( e )
    {
        e.preventDefault();
        if ( this.props.loggedInAs )
        {
            this.props.downvoteFunc( this.props.qid );
        }
    }
}
