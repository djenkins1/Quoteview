import React from "react";

import NavBar from "./NavBar";

export default class Layout extends React.Component
{
    render()
    {
        return (
            <div>
                <NavBar />
                <h1>Hello World</h1>
            </div>
        );
    }
}
