import { applyMiddleware, createStore } from "redux";
import thunk from 'redux-thunk';
import logger from 'redux-logger';
import { all_reducers } from "../reducers/index";

export let store;

export function initStore() {
    // Apply middleware and reducers to store
    const middleware = applyMiddleware(thunk, logger);

    // Create store and save in exported variable
    store = createStore(all_reducers, middleware);

    // TEMP: For accessing store in dev console (remove in production)
    window.store = store;

    return store;
}