import React from "react";

export default class NavBar extends React.Component
{
    render()
    {
        //if there is a user logged in, then show different NavBar for logged in user
        if ( this.props.userName )
        {
            return (
                <nav className="navbar sticky-top navbar-dark bg-primary justify-content-between navbar-expand-lg">
                    <a className="navbar-brand">Quote View</a>
                    <div className="collapse navbar-collapse">
                        <span className="navbar-text"> Hello, {this.props.userName.username} </span>
                        <a className="nav-item nav-link" href="#" onClick={this.handleClickLink.bind( this )} >New Quote</a>
                        <a className="nav-item nav-link" href="#" onClick={this.handleLogout.bind( this )} >Logout</a>
                    </div>
                </nav>
            );
        }

        return (
            <nav className="navbar sticky-top navbar-dark bg-primary justify-content-between navbar-expand-lg">
                <a className="navbar-brand">Quote View</a>
                <div className="collapse navbar-collapse">
                    <a onClick={this.handleClickLink.bind( this )} className="nav-item nav-link" href="#">Login</a>
                    <a onClick={this.handleClickLink.bind( this )} className="nav-item nav-link" href="#">Sign Up</a>
                </div>
            </nav>
        );
    }

    handleClickLink( e )
    {
        e.preventDefault();
        this.props.modalChange( e.target.innerText );
    }

    handleLogout( e )
    {
        e.preventDefault();
        var self = this;
        //send ajax request to server to logout the user
        $.get( "/logout" , {}, function( data, status )
        {
            if ( data.error || data.errors )
            {
                //TODO: show any errors to user
                console.log( data.errors );
                return;
            }

            self.props.userClear();
        });
    }

}
