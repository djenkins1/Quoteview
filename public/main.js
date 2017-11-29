import React from "react";
import ReactDOM from "react-dom";
import Layout from "./components/Layout";
import App from "./components/App";

const mainBody = document.getElementById( "mainBody" );

const app = <App />;
ReactDOM.render( app , mainBody );
