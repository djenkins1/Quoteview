import React from "react";

import Quote from "./Quote";

import $ from "jquery";

export default class QuoteList extends React.Component
{
    constructor( props ) 
    {
        super(props);
        this.state = { quotes : [] };
        this.getData();
    }


    render()
    {
        var quotesShown = [];
        for ( var i = 0; i < this.state.quotes.length; i++ )
        {
            var myQuote = this.state.quotes[ i ];
            quotesShown.push( <Quote key={i} author={myQuote.author} body={myQuote.body} score={myQuote.score} qid={myQuote.qid} /> );
        }

        if ( quotesShown.length == 0 )
        {
            quotesShown.push( <div key={0}>There are currently no quotes.</div> );
        }

        return (
            <div id="quoteList" className="list-group">
                {quotesShown}
            </div>
        );
    }

    getData()
    {
        var self = this;
        $.get( "/quotes" , function( data, status )
        {
            if ( data.length == 0 )
            {
                return;
            }

            self.setState( { quotes: data } );
        });
    }

}
