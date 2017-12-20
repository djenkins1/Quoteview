import React from "react";
import QuoteList from "./QuoteList";
import Constants from "./Constants";
import QuotePage from "./QuotePage";

export default class SearchQuotes extends QuotePage
{
    constructor( props )
    {
        super( props );
        this.hasRequestedData = false;

        if ( props.finishedLoginCheck && props.match.params.searchTerms )
        {
            this.getData( "/qsearch" , { "searchTerms" : props.match.params.searchTerms } );
        }        
    }

    componentDidUpdate( prevProps, prevState )
    {
        super.componentDidUpdate( prevProps, prevState );
        if ( prevProps.match.params.searchTerms != this.props.match.params.searchTerms || !this.hasRequestedData )
        {
            this.getData( "/qsearch" , { "searchTerms" : this.props.match.params.searchTerms } );
            this.hasRequestedData = true;
        }
    }

    render()
    {
        return (
            <div>
                <h1> Results for {this.props.match.params.searchTerms} </h1>
                <QuoteList quotes={this.state.quotes}
                    requestDone={this.state.requestDone}
                    loggedInAs={this.props.userName}
                    downvoteQuote={this.downvoteQuote.bind( this )} upvoteQuote={this.upvoteQuote.bind( this )} />
            </div>
        );
    }

    shouldAddQuote( newQuote )
    {
        return false;
    }
}
