import React from "react";
import Constants from "./Constants";

//contains the score for a quote
export default class QuoteScore extends React.Component
{
    render()
    {
        var add_symbol = "+";
        var sub_symbol = "-";
        var add_title = "Upvote";
        var sub_title = "Downvote";
        var loggedInEnableClass = " disabled bg-secondary";
        var loggedInTitle = "You must be logged in to vote.";
        if ( this.props.loggedInAs )
        {
            loggedInEnableClass = "";
            loggedInTitle = "";
            if ( this.props.loggedInAs.role === Constants.ROLE_USER_ADMIN )
            {
                add_symbol = "\u2691";
                sub_symbol = "\u2690";
                add_title = "Flag";
                sub_title = "Unflag";
            }
        }

        return (
            <div className='badgeContain align-items-end align-self-end'>
                <a className={'badge badge-primary badge-pill quoteBadge' + loggedInEnableClass }
                    onClick={this.handleUpvote.bind( this )}
                    href="#"
                    title={add_title}
                    data-container="body" 
                    data-toggle="popover" 
                    data-placement="top" 
                    data-content={loggedInTitle}> {add_symbol} </a>
                <span className='badge badge-primary badge-pill quoteBadge quoteScore'> {this.props.score} </span>
                <a className={'badge badge-primary badge-pill quoteBadge' + loggedInEnableClass }
                    onClick={this.handleDownvote.bind( this )}
                    title={sub_title}
                    href="#"                     
                    data-container="body" 
                    data-toggle="popover" 
                    data-placement="top" 
                    data-content={loggedInTitle}> {sub_symbol} </a>
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
