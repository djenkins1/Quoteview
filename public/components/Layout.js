import React from "react";
import NavBar from "./NavBar";
import QuoteList from "./QuoteList";
import SignupModal from "./SignupModal";

/*
//PRIORITY
//TODO: need to work on other modals(login/newQuote)
//TODO: need to be able to distinguish between modals based on state in layout
//TODO: need to show errors to user for sign up modal,and other modals
//TODO: need to get upvote and downvote buttons working, for now ignore order of quotes
//
//FUTURE:
//TODO: move QuoteList getData to layout component and pass as prop
//TODO: quotes need to be ordered by score and need to be re-ordered when quotes get voted on
//TODO: if there is a problem with logout then error message must be shown to user somehow
//TODO: show creator of a quote on the quote somewhere
//          problem, need to get username from creatorId
//TODO: pagination on quotes by using after field
//TODO: scrolling down on page should get another page of quotes
//TODO: rate limit upvote/downvote of quotes so that can only vote once per second
//TODO: should only be able to upvote/downvote quotes if logged in
//TODO: should not be able to upvote/downvote own posts
*/

//the main layout for the page
export default class Layout extends React.Component
{
    constructor( props )
    {
        super( props );
        this.state = {};
    }

    render()
    {
        var modalDiv = ( <div /> );
        //if the state.modalType is defined then show a modal for that type
        //  otherwise, just show an empty div instead of the modal
        if ( this.state.modalType )
        {
            //TODO: need to distinguish between the modals
            modalDiv = ( 
                <SignupModal clearModal={this.clearModalType.bind(this)} modalChange={this.changeModalType.bind(this)} 
                    userChange={this.changeUser.bind( this )} userClear={this.clearUser.bind( this )} /> 
            );        
        }

        return (
            <div>
                <NavBar modalChange={this.changeModalType.bind(this)} userName={this.state.userName} 
                    userClear={this.clearUser.bind( this )} />
                <QuoteList />
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
        $( ".modal-backdrop" ).remove();
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

    componentDidMount()
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
    }
}
