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
        this.inputData = {"userName" : "" , "passWord" : ""};
    }

    //whenever the username input is changed,update this component's username in the inputData field
    updateUserField( userName )
    {
        this.inputData.userName = userName;
    }

    //whenever the password input is changed,update this component's password in the inputData field
    updatePassField( passWord )
    {
        this.inputData.passWord = passWord;
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
        //TODO: send off ajax request to attempt to signup
        console.log( "SIGNUP" );
        console.log( this.inputData.userName );
        console.log( this.inputData.passWord );
    }
}
