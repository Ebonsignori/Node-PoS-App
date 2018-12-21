import React from "react";
import Modal from 'react-modal';
import {closeModal} from "../../actions/modals";
import connect from "react-redux/es/connect/connect";

const modal_name = "registration";

@connect((store) => {
    return {
        registration_modal_open: store.modals.registration_modal_open
    }
})
export class ExampleModal extends React.Component {
    constructor() {
        super();

        this.afterOpenModal = this.afterOpenModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
    }

    afterOpenModal() {
    }

    closeModal() {
        this.props.dispatch(closeModal(modal_name))
    }

    render() {
        return (
            <Modal
                isOpen={this.props.registration_modal_open}
                onAfterOpen={this.afterOpenModal}
                onRequestClose={this.closeModal}
                contentLabel="Registration Modal"
            >

            </Modal>
        );
    }
}