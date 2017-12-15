import React from "react";
import BaseModal from "./BaseModal";
import SignupForm from "./SignupForm";
import InputModal from "./InputModal";

export default class LoginModal extends InputModal
{
    constructor( props )
    {
        super( props );
        this.inputData.username = "";
        this.inputData.password = "";
    }

    render()
    {
        //TODO: uses SignupForm for now,in future could build and use seperate LoginForm instead
        return (
            <BaseModal modalTitle='Login'
                modalBody={<SignupForm onFieldChange={this.updateField.bind( this )} submitFunc={this.login.bind(this)} />}
                yesText='Login' noText='Cancel' 
                yesFunc={this.login.bind( this )} 
                noFunc={this.props.clearModal} errors={this.state.errors}/>
        );
    }

    login()
    {
        var self = this;
        //send ajax request to server attempting to login with username/password combo
        $.post( "/login" , self.inputData , function( data, status )
        {
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
