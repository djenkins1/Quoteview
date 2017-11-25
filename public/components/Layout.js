import React from "react";
import NavBar from "./NavBar";
import QuoteList from "./QuoteList";
import SignupModal from "./SignupModal";
import LoginModal from "./LoginModal";
import NewQuoteModal from "./NewQuoteModal";

/*
//----------------------------
//TODO BOARD
//----------------------------
//PRIORITY
//
//FUTURE:
//quotes need to be ordered by score and need to be re-ordered when quotes get voted on
//if there is a problem with logout then error message must be shown to user somehow
//rate limit upvote/downvote of quotes so that can only vote once per second
//should only be able to upvote/downvote quotes if logged in
//should not be able to upvote/downvote own posts
//use hash table to keep track of position of quotes on quoteList for faster updating
//replace createQuote calls with createQuoteWithUsername wherever possible
//
//POSSIBLE:
//My Quotes tab that only shows quotes submitted by current user logged in (link to in navbar)
//Page for quotes that were submitted by a particular user(similar functionality to My Quotes)
//Search quotes by particular text string in author/body
//Add email field to signup form
//Quote collection should have another field being datetime when they were submitted
//(?)pagination on quotes by using after field
//(?)scrolling down on page should get another page of quotes
//----------------------------
*/

//the main layout for the page
export default class Layout extends React.Component
{
    constructor( props )
    {
        super( props );
        this.state = {};
        this.getData();
    }

    render()
    {
        var modalDiv = ( <div /> );
        //if the state.modalType is defined then show a modal for that type
        //  otherwise, just show an empty div instead of the modal
        if ( this.state.modalType )
        {
            //distinguish between the modals
            if ( this.state.modalType === "Sign Up" )
            {
                modalDiv = ( 
                    <SignupModal clearModal={this.clearModalType.bind(this)} modalChange={this.changeModalType.bind(this)} 
                        userChange={this.changeUser.bind( this )} userClear={this.clearUser.bind( this )} 
                        quoteAdd={this.addQuote.bind( this )} /> 
                ); 
            }  
            else if ( this.state.modalType === "Login" )
            {
                modalDiv = ( 
                    <LoginModal clearModal={this.clearModalType.bind(this)} modalChange={this.changeModalType.bind(this)} 
                        userChange={this.changeUser.bind( this )} userClear={this.clearUser.bind( this )} 
                        quoteAdd={this.addQuote.bind( this )} /> 
                ); 
            }    
            else if ( this.state.modalType === "New Quote" )
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

        return (
            <div>
                <NavBar modalChange={this.changeModalType.bind(this)} userName={this.state.userName} 
                    userClear={this.clearUser.bind( this )} />
                <QuoteList quotes={this.state.quotes} requestDone={this.state.requestDone} 
                    downvoteQuote={this.downvoteQuote.bind( this )} upvoteQuote={this.upvoteQuote.bind( this )} />
                {modalDiv}
            </div>
        );
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

    getData()
    {
        var self = this;
        $.get( "/userData" , {} , function( data, status )
        {
            if ( data.username )
            {
                self.clearModalType();
                self.setState( { "userName" : data } );
            }
        });

        //sends ajax get request to server for all the quotes
        $.get( "/quotes" , function( data, status )
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
