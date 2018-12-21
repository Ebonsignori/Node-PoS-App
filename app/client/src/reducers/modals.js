import {OPEN_MODAL, CLOSE_MODAL} from "../constants/action_types";

const initial_state = {
    registration_modal_open: false,
    not_logged_in_modal_open: false
};

// Tokens reducer
export function modalsReducer(state=initial_state, action) {
    switch (action.type) {
        case OPEN_MODAL:
            switch (action.modal_to_open) {
                case "registration":
                    return {
                        ...state,
                        registration_modal_open: true
                    };
                case "not_logged_in":
                    return {
                        ...state,
                        not_logged_in_modal_open: true
                    };
                default:
                    console.log("No modal for modal" + action.modal_to_open + " passed into openModal(modal)");
                    return {...state};
            }


        case CLOSE_MODAL:
            switch (action.modal_to_close) {
                case "registration":
                    return {
                        ...state,
                        registration_modal_open: false
                    };
                case "not_logged_in":
                    return {
                        ...state,
                        not_logged_in_modal_open: false
                    };
                default:
                    console.log("No modal for modal" + action.modal_to_close + " passed into closeModal(modal)");
                    return {...state};
            }
        default:
            return state;
    }
}