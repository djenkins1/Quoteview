import React from "react";
import BaseModal from "./BaseModal";
import SignupForm from "./SignupForm";
import InputModal from "./InputModal";

export default class SignupModal extends InputModal
{
    constructor( props )
    {
        super( props );
        this.inputData.username = "";
        this.inputData.password = "";
    }

    render()
    {
        return (
            <BaseModal modalTitle='Sign Up' 
                modalBody={<SignupForm onFieldChange={this.updateField.bind( this )} submitFunc={this.signup.bind(this)} />}
                yesText='Sign Up' noText='Cancel' 
                yesFunc={this.signup.bind( this )} 
                noFunc={this.props.clearModal} errors={this.state.errors}/>
        );
    }

    signup( reactDomModal )
    {
        var self = this;
        //send off ajax request to attempt to signup
        $.post( "/newUser" , this.inputData, function( data, status )
        {
            //if there were any problems then show said problems
            if ( data.error || data.errors )
            {
                //display problems to user
                console.log( "ERROR:" + data.error );
                self.setState( { "errors" : data.errors } );
                return;
            }
            
            //otherwise, no problems so update the user logged in to the server's response
            if ( self.props.onUpdateUser )
            {
                self.props.onUpdateUser();
            }
        });
    }
}
