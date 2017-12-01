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
//should try to do something other than redirect for when a new quote has been added
//
//FUTURE:
//admin panel to hide quotes
//Add email field to signup form
//  could also add confirm password field
//  would also need to generalize Form fields onChange
//if there is a problem with logout then error message must be shown to user somehow
//Search quotes by particular text string in author/body
//  see text search mongodb bookmark
//spruce up navbar styling
//if there 2 or more quotes that have the same score and one gets voted on it doesn't bubble up to correct position,just switches place once
//
//POSSIBLE:
//Server Sessions: delete session files periodically
//keep track of quotes that user has voted on and stop them from voting more than once on the same quote
//  what if they want to reverse their vote?
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
