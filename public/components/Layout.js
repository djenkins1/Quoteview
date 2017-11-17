import React from "react";

import NavBar from "./NavBar";

import Quote from "./Quote";

export default class Layout extends React.Component
{
    render()
    {
        return (
            <div>
                <NavBar />
                <div id="quoteList" className="list-group">
                    <Quote author="Redbeard" body="What is your name?" score="0" qid="abcdefghijk" />
                </div>
            </div>
        );
    }
}
