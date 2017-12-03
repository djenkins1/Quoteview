import React from "react";

export default class SignupForm extends React.Component
{
    handleUserField( e )
    {
        this.props.userChange( e.target.value );
    }

    handleEnterPress( e )
    {
        if ( e.which == 13 || e.keyCode == 13 )
        {
            this.props.submitFunc( undefined );
        }
    }

    handlePasswordField( e )
    {
        this.props.passChange( e.target.value );
    }

    render()
    {
        return (
            <form action='/newUser' method='post' >
                <input size='30' 
                    onKeyPress={this.handleEnterPress.bind( this )}
                    onChange={this.handleUserField.bind(this)} 
                    type='text' name='username' placeholder='Username' 
                    className="form-control" maxlength="100" required/>
                <br />
                <input 
                    size='30' type='password' name='password' 
                    onChange={this.handlePasswordField.bind( this )} 
                    onKeyPress={this.handleEnterPress.bind( this )}
                    placeholder='Password' className="form-control" maxlength="100" required/>
                <br />
            </form>
        );
    }
}


