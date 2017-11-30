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
        if ( this.props.modalType )
        {
            //distinguish between the modals
            if ( this.props.modalType === Constants.TXT_NAV_SIGNUP )
            {
                modalDiv = ( 
                    <SignupModal clearModal={this.props.clearModal} changeModal={this.props.changeModal} 
                        onUpdateUser={this.props.onUpdateUser} />
                ); 
            }  
            else if ( this.props.modalType === Constants.TXT_NAV_SIGNIN )
            {
                modalDiv = ( 
                    <LoginModal clearModal={this.props.clearModal} changeModal={this.props.changeModal} 
                        onUpdateUser={this.props.onUpdateUser} />
                ); 
            }    
            else if ( this.props.modalType === Constants.TXT_QUOTE_NEW )
            {
                modalDiv = ( 
                    <NewQuoteModal clearModal={this.props.clearModal} changeModal={this.props.changeModal}  />
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
                    <NavBar changeModal={this.props.changeModal} userName={this.props.userName} 
                        onUpdateUser={this.props.onUpdateUser} />
                    {this.props.children}
                    {modalDiv}
                </div>
            );
    }

/*
    addQuote( newQuote )
    {
        var quotesCopy = this.state.quotes.slice();
        quotesCopy.push( newQuote );
        this.setState( { "quotes" : quotesCopy } );
    }
*/

}
