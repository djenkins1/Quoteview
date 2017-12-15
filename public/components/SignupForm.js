import React from "react";
import InputForm from "./InputForm";

export default class SignupForm extends InputForm
{
    render()
    {
        return (
            <form action='/newUser' method='post' >
                <input size='30' 
                    onKeyPress={this.handleEnterPress.bind( this )}
                    onChange={this.handleFieldChange.bind(this)} 
                    type='text' name='username' placeholder='Username' 
                    className="form-control" maxLength="100" required/>
                <br />
                <input 
                    size='30' type='password' name='password' 
                    onChange={this.handleFieldChange.bind( this )} 
                    onKeyPress={this.handleEnterPress.bind( this )}
                    placeholder='Password' className="form-control" maxLength="100" required/>
                <br />
            </form>
        );
    }
}


