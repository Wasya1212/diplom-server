import * as React from "react";
import * as ReactDOM from "react-dom";

import { Provider } from "react-redux";
import { createStore } from "redux";

import reducer from "./reducers/index";

import "./public/index.sass";

import App from "./App";

const AppContainer = document.querySelector('#app');

const store = createStore(reducer);

store.subscribe(() => {
  console.log(store.getState())
});

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  AppContainer
);
