import React from 'react';
import { Route } from 'react-router';
import App from './app';
import Home from './home';

export default (
  <Route component={App}>
    <Route path='/' component={Home} />
  </Route>
);
