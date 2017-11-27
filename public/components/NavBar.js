import React from "react";
import Constants from "./Constants";

export default class NavBar extends React.Component
{
    render()
    {
        //if there is a user logged in, then show different NavBar for logged in user
        if ( this.props.userName )
        {
            return (
                <nav className="navbar sticky-top navbar-dark bg-primary justify-content-between navbar-expand-lg">
                    <a className="navbar-brand"> {Constants.TXT_TITLE_APP} </a>
                    <div className="collapse navbar-collapse">
                        <span className="navbar-text"> Hello, {this.props.userName.username} </span>
                        <a className="nav-item nav-link" href="#" onClick={this.handleClickQuotes.bind( this )} > 
                            {Constants.TXT_QUOTES_ALL} 
                        </a>
                        <a className="nav-item nav-link" href="#" onClick={this.handleClickQuotes.bind( this )} > 
                            {Constants.TXT_QUOTES_MY} 
                        </a>
                        <a className="nav-item nav-link" href="#" onClick={this.handleClickLinkModal.bind( this )} > {Constants.TXT_QUOTE_NEW} </a>
                        <a className="nav-item nav-link" href="#" onClick={this.handleLogout.bind( this )} > {Constants.TXT_NAV_LOGOUT} </a>
                    </div>
                </nav>
            );
        }

        return (
            <nav className="navbar sticky-top navbar-dark bg-primary justify-content-between navbar-expand-lg">
                <a className="navbar-brand"> {Constants.TXT_TITLE_APP} </a>
                <div className="collapse navbar-collapse">
                    <a onClick={this.handleClickLinkModal.bind( this )} className="nav-item nav-link" href="#"> {Constants.TXT_NAV_SIGNIN} </a>
                    <a onClick={this.handleClickLinkModal.bind( this )} className="nav-item nav-link" href="#"> {Constants.TXT_NAV_SIGNUP} </a>
                    <a className="nav-item nav-link" href="#" onClick={this.handleClickQuotes.bind( this )} > 
                        {Constants.TXT_QUOTES_ALL} 
                    </a>
                </div>
            </nav>
        );
    }

    handleClickLinkModal( e )
    {
        e.preventDefault();
        this.props.modalChange( e.target.innerText );
    }

    handleClickQuotes( e )
    {
        e.preventDefault();
        let targetText = e.target.innerText;
        if ( targetText === Constants.TXT_QUOTES_ALL )
        {
            this.props.authorClickFunc( undefined, undefined );
        }
        else if ( targetText === Constants.TXT_QUOTES_MY )
        {
            this.props.authorClickFunc( this.props.userName.userId, this.props.userName.username );
        }
        else
        {
            console.log( "Fell through on handleClickQuotes targetText: " + targetText );
        }
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
