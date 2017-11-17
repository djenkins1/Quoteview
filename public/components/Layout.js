import React from "react";

import NavBar from "./NavBar";

import QuoteList from "./QuoteList";

import SignupModal from "./SignupModal";

//the main layout for the page
export default class Layout extends React.Component
{
    constructor( props )
    {
        super( props );
        this.state = {};
        //TODO: next line is for testing,needs to be removed
        this.state.modalType = "signup";
    }

    render()
    {
        var modalDiv = ( <div /> );
        //if the state.modalType is defined then show a modal for that type
        //  otherwise, just show an empty div instead of the modal
        if ( this.state.modalType )
        {
            //TODO: need to distinguish between the modals
            modalDiv = ( <SignupModal /> );        
        }

        return (
            <div>
                <NavBar />
                <QuoteList />
                {modalDiv}
            </div>
        );
    }

    //TODO: need to be able to change the modalType dynamically from other elements


}
