import React from "react";
import ReactDOM from "react-dom";
import Layout from "./Layout";
import MainQuotes from "./MainQuotes";
import CreatorQuotes from "./CreatorQuotes";
import { BrowserRouter, Route , Switch } from "react-router-dom";

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
                <Layout userData={this.state.userName} >
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

            self.setState( { "finishedLoginCheck" : true } );
        });
    }
}
