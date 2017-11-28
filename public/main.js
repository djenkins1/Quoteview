import React from "react";
import ReactDOM from "react-dom";
import Layout from "./components/Layout";
import MainQuotes from "./components/MainQuotes";
import CreatorQuotes from "./components/CreatorQuotes";
import { BrowserRouter, Route , Switch } from "react-router-dom";

const app = document.getElementById( "mainBody" );

ReactDOM.render( 
    <BrowserRouter>
        <Layout >
            <Switch >
                <Route path="/quotes/:creator" component={CreatorQuotes} />
                <Route path="/" component={MainQuotes} />
            </Switch>
        </Layout>
    </BrowserRouter>
    , app 
);
