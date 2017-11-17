import React from "react";
import BaseModal from "./BaseModal";
import SignupForm from "./SignupForm";

//the main layout for the page
export default class SignupModal extends React.Component
{
    render()
    {
        return (
            <BaseModal modalTitle='Sign Up' modalBody={<SignupForm />} yesText='Sign Up' noText='Cancel' />
        );
    }
}
