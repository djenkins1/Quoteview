import React from "react";
import BaseModal from "./BaseModal";
import SignupForm from "./SignupForm";

//the main layout for the page
export default class SignupModal extends React.Component
{
    constructor( props )
    {
        super( props );
        this.state = {};
        this.inputData = {"username" : "" , "password" : ""};
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
        return (
            <BaseModal modalTitle='Sign Up' 
                modalBody={<SignupForm userChange={this.updateUserField.bind(this)} 
                    passChange={this.updatePassField.bind( this )} />}
                yesText='Sign Up' noText='Cancel' 
                yesFunc={this.signup.bind( this )} 
                noFunc={this.props.clearModal} />
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
                //TODO: need to display problems to user
                console.log( "ERROR:" + data.error );
                console.log( data.errors );
                return;
            }
            
            //otherwise, no problems so update the user logged in to the server's response
            self.props.clearModal();
            self.props.userChange( data );
        });
    }
}
