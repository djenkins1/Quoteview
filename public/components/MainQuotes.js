import React from "react";
import QuoteList from "./QuoteList";
import Constants from "./Constants";

export default class MainQuotes extends React.Component
{
    constructor( props )
    {
        super( props );
        this.state = {};
        if ( props.finishedLoginCheck )
        {
            this.getData( "/quotes" , {} );
        }
    }

    componentDidUpdate(prevProps, prevState)
    {
        if ( prevProps.finishedLoginCheck != true && this.props.finishedLoginCheck )
        {
            this.getData( "/quotes" , {} );
        }
    }

    render()
    {
        return (
            <div>
                <h1> All Quotes </h1>
                <QuoteList quotes={this.state.quotes} requestDone={this.state.requestDone} />
            </div>
        );
    }

    getData( fromQuoteUrl, fromQuoteParams )
    {
        var self = this;
        //sends ajax get request to server for all the quotes
        $.get( fromQuoteUrl , fromQuoteParams, function( data, status )
        {
            if ( data.length == 0 )
            {
                self.setState( { quotes: [] } );
                self.setState( { requestDone: true } );
                return;
            }

            self.setState( { quotes: data } );
            self.setState( { requestDone: true } );
        });
    }
}

/*
    <QuoteList quotes={this.state.quotes} requestDone={this.state.requestDone} 
        downvoteQuote={this.downvoteQuote.bind( this )} upvoteQuote={this.upvoteQuote.bind( this )} 
        authorClickFunc={this.getQuotesByCreator.bind(this)} />
*/
