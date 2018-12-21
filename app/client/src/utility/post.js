import {SERVER_URL} from "../config/config";

export async function postObject(uri, send_object, options) {
    const response = await fetch(SERVER_URL + uri, {
                        method: "POST",
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            'Cache': 'no-cache'
                        },
                        body: JSON.stringify(send_object),
                        credentials: options.needs_credentials ? "include" : "omit"
                    });

    options.log_results && console.log(response.ok ? "Successful response!" : "Failed response");

    if (options.return_response) {
        return response;
    }
}