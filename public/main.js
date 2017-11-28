import React from "react";
import ReactDOM from "react-dom";
import Layout from "./components/Layout";
import { BrowserRouter, Route } from "react-router-dom";

const app = document.getElementById( "mainBody" );
ReactDOM.render( 
    <BrowserRouter>
        <Route path="/" component={Layout} >

        </Route>
    </BrowserRouter>
    , app 
);
