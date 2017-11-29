import React from "react";
import ReactDOM from "react-dom";
import Layout from "./components/Layout";
//import MainQuotes from "./components/MainQuotes";
//import CreatorQuotes from "./components/CreatorQuotes";
import App from "./components/App";
import { BrowserRouter, Route , Switch } from "react-router-dom";

const mainBody = document.getElementById( "mainBody" );

const app = <App />;
ReactDOM.render( app , mainBody );
