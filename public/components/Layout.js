import React from "react";

import NavBar from "./NavBar";

import QuoteList from "./QuoteList";

export default class Layout extends React.Component
{
    render()
    {
        return (
            <div>
                <NavBar />
                <QuoteList />
            </div>
        );
    }
}
