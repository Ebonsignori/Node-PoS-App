/* Module imports */
import React from "react";
import { render } from "react-dom";
import { Provider } from "react-redux";

/* Global styles */
import './config/global.css'

/* Local imports */
import {App} from "./components/App";
import {initStore} from "./store";

const store = initStore();

// Initialize react app, wrapped by redux provider, into top-level html DOM
render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById("root")
);