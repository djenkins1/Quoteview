import React from "react";

//the main layout for the page
export default class SignupForm extends React.Component
{
    render()
    {
        return (
            <form action='/newUser' id='newUserForm' method='post'>
                <input size='30' type='text' name='username' placeholder='Username' />
                <br /><br />
                <input size='30' type='password' name='password' placeholder='Password' />
                <br /><br />
            </form>
        );
    }
}


