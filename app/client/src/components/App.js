import React from "react";
import {connect} from "react-redux";

/* React-modal*/
import Modal from 'react-modal';
Modal.setAppElement("body");

/* Styles */
import './App.css';
import {postObject} from "../utility/post";

@connect(() => {
    return {
    }
})
export class App extends React.Component {
    constructor(props) {
        super(props);
    }

    test() {
        (async () => {
            const response = await postObject("/menu",  {
                item_name: "New item 2",
                item_price: 666,
                category: "egg-specialties"
            }, {
                // Options for the postObject method
                return_response: true,
                log_results: true
            });

            if (response.status === 200) {
                let user_response = await response.text();
                // If JSON, parse
                if (user_response[0] === "{") {
                    user_response = JSON.parse(user_response);
                }

                console.log(user_response);
            } else {
                console.error("Error creating a new menu item");
            }
        })();
    }

    render() {
        return (
            <React.Fragment>
                <div className="app-grid">
                    <div className="dash-container">
                        <h1>Dashboard</h1>
                    </div>
                    <div className="login-container">
                        <h2>Login</h2>
                    </div>
                    <div className="chat-container">
                        <h2>Chat</h2>
                    </div>
                    <div className="main-container">
                        <h1>Main</h1>
                        <button onClick={this.test}>Test</button>
                    </div>
                </div>

                {/*Modals*/}

            </React.Fragment>
        )
    }
}
