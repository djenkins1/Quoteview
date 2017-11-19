import React from "react";

//the main layout for the page
export default class SignupForm extends React.Component
{
    handleUserField( e )
    {
        this.props.userChange( e.target.value );
    }

    handlePasswordField( e )
    {
        this.props.passChange( e.target.value );
    }

    render()
    {
        return (
            <form action='/newUser' id='newUserForm' method='post'>
                <input size='30' onChange={this.handleUserField.bind(this)} type='text' name='username' placeholder='Username' />
                <br /><br />
                <input size='30' onChange={this.handlePasswordField.bind( this )} type='password' name='password' placeholder='Password' />
                <br /><br />
            </form>
        );
    }
}


