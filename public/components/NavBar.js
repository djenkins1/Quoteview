import React from "react";

export default class NavBar extends React.Component
{
    render()
    {
        return (
            <nav class="navbar sticky-top navbar-dark bg-primary justify-content-between navbar-expand-lg">
                <a class="navbar-brand">Quote View</a>
                <div id="navbarLinks" class="collapse navbar-collapse">
                    <a id="newUserLink" class="nav-item nav-link" href="#">Login/Signup</a>
                    <a id="newQuoteLink" class="nav-item nav-link disabled" href="#">New Quote</a>
                </div>
            </nav>
        );
    }


}
