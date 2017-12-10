import React from "react";
import ReactDOM from "react-dom";
import Layout from "./Layout";
import MainQuotes from "./MainQuotes";
import CreatorQuotes from "./CreatorQuotes";
import AdminQuotes from "./AdminQuotes";
import { HashRouter, Route , Switch } from "react-router-dom";

/*
//----------------------------
//TODO BOARD
//----------------------------
//PRIORITY
//Need unit testing of endpoints for server
//  error testing
//      test not being logged in on privileged endpoints(upvoteQuote,downvoteQuote,newQuote)
//      test invalid ids for users/quotes(upvoteQuote(qid),downvoteQuote(qid),newQuote(creatorId),quotes(creatorId))
//      test length requirements for strings such as body/author(newQuote,newUser,login)
//      test username not taken for newUser
//      test username/password incorrect match for login
//      test not being logged in for /userData
//      test invalid ids on administrator endpoints(flagQuote(qid),unflagQuote(qid),flagged(creatorId))
//      do not do error testing for: logout
//
//FUTURE:
//Search quotes by particular text string in author/body
//  see text search mongodb bookmark
//  would need to add search box to navbar
//      having problems with navbar though
//  OR: search modal with link on navbar that allows searching by title/author/created by...
//Add email field to signup form
//  could also add confirm password field
//  would also need to generalize Form fields onChange
//if there is a problem with logout then error message must be shown to user somehow
//update readme to include Mocha and unit testing info
//  to run database unit tests: mocha -t 100000 testDB.js 
// my account page where password can be changed
//add more aria compatibility/concerns
//
//POSSIBLE:
//flagged quotes should disappear from AdminQuotes page if they are unflagged in update
//flagged quotes should not be able to be voted on by anyone(endpoint protection only)
//ability to edit quotes that were created by the logged in user
//Convert to using express instead of custom middleware
//  need to have endpoint unit testing in place before this conversion
//Maybe move to using react-bootstrap and update modal code properly
//Server Sessions: delete session files periodically
//keep track of quotes that user has voted on and stop them from voting more than once on the same quote
//  what if they want to reverse their vote?
//(?)pagination on quotes by using after field
//   scrolling down on page should get another page of quotes
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
            <HashRouter>
                <Layout userName={this.state.userName} 
                    onUpdateUser={ this.getData.bind( this ) } 
                    modalType={this.state.modalType}
                    clearModal={this.clearModalType.bind( this )} 
                    changeModal={this.changeModalType.bind( this )} 
                    onAddQuote={this.handleAddQuote.bind( this )} >
                    <Switch >
                        <Route path="/quotes/:creator" render={(props)=>
                            <CreatorQuotes userName={this.state.userName}
                                {...props}
                                newQuote={this.state.newQuote}
                                finishedLoginCheck={this.state.finishedLoginCheck} 
                                finishAddQuote={this.finishAddQuote.bind( this )} />
                        } />
                       <Route path="/flagged" render={(props)=>
                            <AdminQuotes userName={this.state.userName} 
                                {...props}
                                newQuote={this.state.newQuote}
                                finishedLoginCheck={this.state.finishedLoginCheck} 
                                finishAddQuote={this.finishAddQuote.bind( this )} />
                        } />
                        <Route path="/" render={(props)=>
                            <MainQuotes userName={this.state.userName} 
                                {...props}
                                newQuote={this.state.newQuote}
                                finishedLoginCheck={this.state.finishedLoginCheck} 
                                finishAddQuote={this.finishAddQuote.bind( this )} />
                        } />
                    </Switch>
                </Layout>
            </HashRouter>
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

    handleAddQuote( newQuoteData )
    {
        console.log( "handleAddQuote" );
        if ( newQuoteData.qid === undefined )
        {
            throw new Error( "newQuoteData qid is undefined for handleAddQuote" );
        }

        this.setState( { "newQuote" : newQuoteData } );
    }

    finishAddQuote( newQuoteData )
    {
        this.setState( { "newQuote" : undefined } );
    }
}
