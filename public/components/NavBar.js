import React from "react";

//TODO: need to have different navbar if logged in on session
export default class NavBar extends React.Component
{
    render()
    {
        return (
            <nav className="navbar sticky-top navbar-dark bg-primary justify-content-between navbar-expand-lg">
                <a className="navbar-brand">Quote View</a>
                <div id="navbarLinks" className="collapse navbar-collapse">
                    <a id="newUserLink" className="nav-item nav-link" href="#">Login/Signup</a>
                    <a id="newQuoteLink" className="nav-item nav-link disabled" href="#">New Quote</a>
                </div>
            </nav>
        );
    }


}
