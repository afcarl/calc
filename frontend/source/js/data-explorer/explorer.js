// @ts-check
/* eslint-disable no-unused-vars */
/* global $, window, document */

import ReactDOM from 'react-dom';
import React from 'react';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';

import App from './components/app';

import { trackVirtualPageview, trackException } from '../common/ga';

import { invalidateRates } from './actions';

import appReducer from './reducers';

import StoreHistorySynchronizer from './history';

import StoreRatesAutoRequester from './rates-request';

import API from './api';

import { populateScheduleLabels } from './schedule-metadata';

const api = new API();
const historySynchronizer = new StoreHistorySynchronizer(window);
const ratesRequester = new StoreRatesAutoRequester(api);
const middlewares = [
  ratesRequester.middleware,
  historySynchronizer.reflectToHistoryMiddleware,
];

if (process.env.NODE_ENV !== 'production') {
  // We only want to include logging middleware code in non-production
  // JS bundles, so we're going to conditionally require it here.
  const createLogger = require('redux-logger'); // eslint-disable-line global-require

  middlewares.push(createLogger());
}

const store = createStore(
  appReducer,
  applyMiddleware(...middlewares),
);

// set default options for all future tooltip instantiations
$.fn.tooltipster('setDefaults', {
  speed: 200,
});

function startApp() {
  historySynchronizer.initialize(store, () => {
    trackVirtualPageview();
  });

  store.dispatch(invalidateRates());

  ReactDOM.render(
    React.createElement(
      Provider,
      { store },
      React.createElement(App, { api }),
    ),
    $('[data-embed-jsx-app-here]')[0],
  );
}

$(() => {
  api.getSchedules((err, schedules) => {
    if (err) {
      trackException(err, true);
    }
    populateScheduleLabels(schedules || []);
    startApp();
  });
});
