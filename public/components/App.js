import React from "react";
import ReactDOM from "react-dom";
import Layout from "./Layout";
import MainQuotes from "./MainQuotes";
import CreatorQuotes from "./CreatorQuotes";
import { HashRouter, Route , Switch } from "react-router-dom";

/*
//----------------------------
//TODO BOARD
//----------------------------
//PRIORITY
//
//FUTURE:
//quotes need to be ordered by score and need to be re-ordered when quotes get voted on
//hovering over disabled upvote/downvote badge should show caption saying need to log in
//if there is a problem with logout then error message must be shown to user somehow
//Search quotes by particular text string in author/body
//keep track of quotes that user has voted on and stop them from voting more than once on the same quote
//spruce up navbar styling
//should try to do something other than redirect for when a new quote has been added
//
//POSSIBLE:
//Add email field to signup form
//  could also add confirm password field
//admin panel to hide quotes
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
            <HashRouter>
                <Layout userName={this.state.userName} onUpdateUser={ this.getData.bind( this ) } modalType={this.state.modalType}
                    clearModal={this.clearModalType.bind( this )} changeModal={this.changeModalType.bind( this )} >
                    <Switch >
                        <Route path="/quotes/:creator" render={(props)=>
                            <CreatorQuotes userName={this.state.userName}
                                {...props} 
                                finishedLoginCheck={this.state.finishedLoginCheck} />
                        } />
                        <Route path="/" render={(props)=>
                            <MainQuotes userName={this.state.userName} 
                                {...props}
                                finishedLoginCheck={this.state.finishedLoginCheck} />
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
}
