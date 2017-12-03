import React from "react";
import Constants from "./Constants";
import { NavLink } from 'react-router-dom';

export default class NavLinks extends React.Component
{
    render()
    {
        return (
            <div className="collapse navbar-collapse nav-tabs" id="navBarTop" >
                {this.props.children}
            </div>
        );
    }
}
