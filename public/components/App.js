import React from "react";
import ReactDOM from "react-dom";
import Layout from "./Layout";
import MainQuotes from "./MainQuotes";
import CreatorQuotes from "./CreatorQuotes";
import { BrowserRouter, Route , Switch } from "react-router-dom";

/*
//----------------------------
//TODO BOARD
//----------------------------
//PRIORITY
//need to pass along userName data object to quotes
//  and need to handle upvote/downvote 
//need page for My Quotes and change navbar <a> to link
//need to show username of creator when showing CreatorQuotes page component
//need to redo login/signup modals to code using react router
//  AFTER: need to redo new quote modal to code using react router
//
//FUTURE:
//quotes need to be ordered by score and need to be re-ordered when quotes get voted on
//hovering over disabled upvote/downvote badge should show caption saying need to log in
//if there is a problem with logout then error message must be shown to user somehow
//Search quotes by particular text string in author/body
//keep track of quotes that user has voted on and stop them from voting more than once on the same quote
//
//POSSIBLE:
//Add email field to signup form
//admin panel to hide quotes
//add back button functionality
//Server Sessions: delete session files periodically
//(?)pagination on quotes by using after field
//(?)scrolling down on page should get another page of quotes
//(?)use hash table to keep track of position of quotes on quoteList for faster updating
//----------------------------
*/

export default class App extends React.Component
{
    constructor( props )
    {
        super( props );
        this.state = { "finishedLoginCheck" : false };
        this.getData();
    }

    render()
    {
        return (
            <BrowserRouter>
                <Layout userName={this.state.userName} onUpdateUser={ this.getData.bind( this ) } modalType={this.state.modalType}
                    clearModal={this.clearModalType.bind( this )} changeModal={this.changeModalType.bind( this )} >
                    <Switch >
                        <Route path="/quotes/:creator" render={(props)=>
                            <CreatorQuotes userData={this.state.userName} finishedLoginCheck={this.state.finishedLoginCheck}
                                {...props} />
                        } />
                        <Route path="/" render={(props)=>
                            <MainQuotes 
                                userData={this.state.userName} 
                                {...props}
                                finishedLoginCheck={this.state.finishedLoginCheck} />
                        } />
                    </Switch>
                </Layout>
            </BrowserRouter>
        );
    }

    getData()
    {
        var self = this;
        $.get( "/userData" , {} , function( data, status )
        {
            if ( data.username )
            {
                self.clearModalType();
                self.setState( { "userName" : data } );
            }
            else
            {
                self.setState( { "userName" : undefined } );
            }

            self.setState( { "finishedLoginCheck" : true } );
        });
    }

    changeModalType( newType )
    {
        this.setState( { "modalType" : newType } );
    }

    clearModalType()
    {
        this.setState( { "modalType" : undefined } );
    }
}
