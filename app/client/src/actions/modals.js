import {CLOSE_MODAL, OPEN_MODAL} from "../constants/action_types";

// Opens (displays) a react-modal on dispatch
export function openModal(modal_to_open) {
    return {
        type: OPEN_MODAL,
        modal_to_open: modal_to_open
    }
}

// Closes an open react-modal on dispatch
export function closeModal(modal_to_close) {
    return {
        type: CLOSE_MODAL,
        modal_to_close: modal_to_close,
    }
}