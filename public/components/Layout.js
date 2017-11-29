import React from "react";
import NavBar from "./NavBar";
import SignupModal from "./SignupModal";
import LoginModal from "./LoginModal";
import NewQuoteModal from "./NewQuoteModal";
import Constants from "./Constants";

export default class Layout extends React.Component
{
    constructor( props )
    {
        super( props );
        this.state = { };
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
                    <SignupModal clearModal={this.clearModalType.bind(this)} modalChange={this.changeModalType.bind(this)} />
                ); 
                /*
                        userChange={this.changeUser.bind( this )} userClear={this.clearUser.bind( this )} 
                        quoteAdd={this.addQuote.bind( this )} /> 
                */
            }  
            else if ( this.state.modalType === Constants.TXT_NAV_SIGNIN )
            {
                modalDiv = ( 
                    <LoginModal clearModal={this.clearModalType.bind(this)} modalChange={this.changeModalType.bind(this)} />
                ); 
                /*
                    userChange={this.changeUser.bind( this )} userClear={this.clearUser.bind( this )} 
                    quoteAdd={this.addQuote.bind( this )} /> 
                */
            }    
            else if ( this.state.modalType === Constants.TXT_QUOTE_NEW )
            {
                modalDiv = ( 
                    <NewQuoteModal clearModal={this.clearModalType.bind(this)} modalChange={this.changeModalType.bind(this)} />
                );                 
                //quoteAdd={this.addQuote.bind( this )} />
            }
            else
            {
                console.log( "FELL THROUGH MODALTYPE" );
            } 
        }

        return (
                <div>
                    <NavBar modalChange={this.changeModalType.bind(this)} userName={this.state.userName} />
                    {this.props.children}
                    {modalDiv}
                </div>
            );
            //NAVBAR: userClear={this.clearUser.bind( this )}  />
    }

    changeModalType( newType )
    {
        this.setState( { "modalType" : newType } );
    }

    clearModalType()
    {
        this.setState( { "modalType" : undefined } );
    }

/*

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
            //this.setState( { "currentTitle" : Constants.TXT_TITLE_DEFAULT } );
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
*/
}
