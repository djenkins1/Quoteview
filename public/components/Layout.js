import React from "react";
import NavBar from "./NavBar";
import QuoteList from "./QuoteList";
import SignupModal from "./SignupModal";
import LoginModal from "./LoginModal";
import NewQuoteModal from "./NewQuoteModal";
import Constants from "./Constants";

/*
//----------------------------
//TODO BOARD
//----------------------------
//PRIORITY
//quotes need to be ordered by score and need to be re-ordered when quotes get voted on
//Page for quotes that were submitted by a particular user(similar functionality to My Quotes)
//  Have functionality,just need to be able to reset back to everyone's quotes on logout
//
//FUTURE:
//if there is a problem with logout then error message must be shown to user somehow
//Search quotes by particular text string in author/body
//keep track of quotes that user has voted on and stop them from voting more than once on the same quote
//
//POSSIBLE:
//Add email field to signup form
//admin panel to hide quotes
//hovering over disabled upvote/downvote badge should show caption saying need to log in
//add back button functionality
//(?)pagination on quotes by using after field
//(?)scrolling down on page should get another page of quotes
//(?)use hash table to keep track of position of quotes on quoteList for faster updating
//----------------------------
*/

//the main layout for the page
export default class Layout extends React.Component
{
    constructor( props )
    {
        super( props );
        this.state = { "currentTitle" : Constants.TXT_TITLE_DEFAULT };
        this.getData( "/quotes" , {} );
    }

    render()
    {
        var modalDiv = ( <div /> );
        //if the state.modalType is defined then show a modal for that type
        //  otherwise, just show an empty div instead of the modal
        if ( this.state.modalType )
        {
            //distinguish between the modals
            if ( this.state.modalType === Constants.TXT_NAV_SIGNUP )
            {
                modalDiv = ( 
                    <SignupModal clearModal={this.clearModalType.bind(this)} modalChange={this.changeModalType.bind(this)} 
                        userChange={this.changeUser.bind( this )} userClear={this.clearUser.bind( this )} 
                        quoteAdd={this.addQuote.bind( this )} /> 
                ); 
            }  
            else if ( this.state.modalType === Constants.TXT_NAV_SIGNIN )
            {
                modalDiv = ( 
                    <LoginModal clearModal={this.clearModalType.bind(this)} modalChange={this.changeModalType.bind(this)} 
                        userChange={this.changeUser.bind( this )} userClear={this.clearUser.bind( this )} 
                        quoteAdd={this.addQuote.bind( this )} /> 
                ); 
            }    
            else if ( this.state.modalType === Constants.TXT_QUOTE_NEW )
            {
                modalDiv = ( 
                    <NewQuoteModal clearModal={this.clearModalType.bind(this)} modalChange={this.changeModalType.bind(this)} 
                        quoteAdd={this.addQuote.bind( this )} />
                );                 
            }
            else
            {
                console.log( "FELL THROUGH MODALTYPE" );
            } 
        }

        //if there is a current page that the user is on then render that page
        if ( this.state.currentPage )
        {
            return (
                <div>
                    Not yet implemented
                </div>
            );
        }
        else
        {
            return (
                    <div>
                        <NavBar modalChange={this.changeModalType.bind(this)} userName={this.state.userName} 
                            userClear={this.clearUser.bind( this )} 
                            authorClickFunc={this.getQuotesByCreator.bind(this)} />
                        <h1>{this.state.currentTitle} </h1>
                        <QuoteList quotes={this.state.quotes} requestDone={this.state.requestDone} 
                            downvoteQuote={this.downvoteQuote.bind( this )} upvoteQuote={this.upvoteQuote.bind( this )} 
                            loggedInAs={this.state.userName}
                            authorClickFunc={this.getQuotesByCreator.bind(this)} />
                        {modalDiv}
                    </div>
                );
        }
    }

    changeModalType( newType )
    {
        this.setState( { "modalType" : newType } );
    }

    clearModalType()
    {
        this.setState( { "modalType" : undefined } );
    }

    changeUser( userObj )
    {
        this.setState( { "userName" : userObj } );
    }

    clearUser()
    {
        this.setState( { "userName" : undefined } );
    }

    addQuote( newQuote )
    {
        var quotesCopy = this.state.quotes.slice();
        quotesCopy.push( newQuote );
        this.setState( { "quotes" : quotesCopy } );
    }

    getQuotesByCreator( creatorId, creatorName )
    {
        //if the creatorId is undefined then assume that we want all quotes to be shown
        if ( creatorId === undefined )
        {
            //if the page is already showing all of the quotes then there is no need to send another request to the server
            if ( this.state.currentTitle === Constants.TXT_TITLE_DEFAULT )
            {
                console.log( "Already showing All Quotes,cancelled sending another request" );
                return;
            }

            console.log( "CreatorId undefined, getting all quotes" );
            this.setState( { "currentTitle" : Constants.TXT_TITLE_DEFAULT } );
            this.getData( "/quotes" , {} );
            return;
        }

        //if we are getting quotes from the currently logged in user
        //  then update the title of the page to 'My Quotes'
        if ( this.state.userName && creatorName.toLowerCase() === this.state.userName.username )
        {
            this.setState( { "currentTitle" : "My Quotes" } );
        }
        else
        {
            this.setState( { "currentTitle" : "Quotes by " + creatorName } );
        }

        this.getData( "/quotes" , { "creator" : creatorId } );
    }

    getData( fromQuoteUrl, fromQuoteParams )
    {
        var self = this;
        $.get( "/userData" , {} , function( data, status )
        {
            if ( data.username )
            {
                self.clearModalType();
                self.setState( { "userName" : data } );
            }

            //sends ajax get request to server for all the quotes
            $.get( fromQuoteUrl , fromQuoteParams, function( data, status )
            {
                if ( data.length == 0 )
                {
                    self.setState( { quotes: [] } );
                    self.setState( { requestDone: true } );
                    return;
                }

                self.setState( { quotes: data } );
                self.setState( { requestDone: true } );
            });
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
