import React from "react";
import ReactDOM from "react-dom";
import Layout from "./components/Layout";
import MainQuotes from "./components/MainQuotes";
import { BrowserRouter, Route } from "react-router-dom";

const app = document.getElementById( "mainBody" );

ReactDOM.render( 
    <BrowserRouter>
        <Layout >
            <Route path="/" component={MainQuotes} />
        </Layout>
    </BrowserRouter>
    , app 
);
