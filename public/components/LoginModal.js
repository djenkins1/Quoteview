import React from "react";
import BaseModal from "./BaseModal";
import SignupForm from "./SignupForm";

export default class LoginModal extends React.Component
{
    constructor( props )
    {
        super( props );
        this.state = { "errors" : [] };
        this.inputData = {"username" : "" , "password" : "" };
    }

    //whenever the username input is changed,update this component's username in the inputData field
    updateUserField( userName )
    {
        this.inputData.username = userName;
    }

    //whenever the password input is changed,update this component's password in the inputData field
    updatePassField( passWord )
    {
        this.inputData.password = passWord;
    }

    render()
    {
        //TODO: uses SignupForm for now,in future could build and use seperate LoginForm instead
        return (
            <BaseModal modalTitle='Login' 
                modalBody={<SignupForm userChange={this.updateUserField.bind(this)} 
                    passChange={this.updatePassField.bind( this )} 
                    username={this.inputData.username} password={this.inputData.password} 
                    submitFunc={this.login.bind(this)} />}
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
