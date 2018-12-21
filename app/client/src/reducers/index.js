import { combineReducers } from "redux"

import {modalsReducer} from "./modals";

// Combine all reducers and export them for store
export const all_reducers = combineReducers({
    modals: modalsReducer,
});

