import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import { initializeIcons } from '@fluentui/react'
import './index.css';
import App from './App';
import Subscribe from "./subscribe";
import Unsubscribe from "./unsubscribe";

initializeIcons();

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <Switch>
        <Route path="/home" component={App} />
        <Route path="/subscribe" component={Subscribe} />
        <Route path="/unsubscribe/:email?" component={Unsubscribe} />
        <Redirect exact from="/" to="/home" />
      </Switch>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);
