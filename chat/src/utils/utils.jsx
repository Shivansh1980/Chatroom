import axios from 'axios';
import { hide_progress_box } from "../styles/AlterCSS";
import { api_url, hostname, ws_protocol } from '../global'

export class ApiRequester{
    constructor(username, password) {
        this.username = username;
        this.password = password;
        this.method = null;
        this.data = {};
        this.headers = { 'Content-Type': 'application/json' };
    }
    
    setData(data) {
        this.data = data;
    }
    setMethod(method) {
        this.method = method;
    }
    setHeaders(headers) {
        this.headers = headers;
    }
    makeRequest(url) {
        const ref = this;
        if (ref.method && url && ref.username && ref.password) {

            return new Promise(function (resolve, reject) {
                axios({
                    method: ref.method,
                    url: api_url+url,
                    headers: ref.headers,
                    data: ref.data,
                    auth: {
                        username: ref.username,
                        password: ref.password
                    }
                }).then((response) => {
                    resolve(response);
                }).catch((error) => {
                    reject(error);
                });
            })
        }
        else {
            return new Promise((resolve, reject) => {
                reject('method, url, data, username and password required')
            });
        }
    }
}

export function toDataURL(file, callback) {
    var reader = new FileReader();
    reader.onload = function () {
        var dataURL = reader.result;
        callback(dataURL);
    }
    reader.readAsDataURL(file);
}

export function dataUrlToFile(dataurl, filename) {
    var arr = dataurl.split(',');
    var mime = arr[0].match(/:(.*?);/)[1];
    var bstr = atob(arr[1]);
    var n = bstr.length;
    var u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
}

export class MessageWebApi {
    ws_protocol = ws_protocol
    hostname = hostname

    constructor(client) {
        this.api_url = api_url + '/';
        this.client = client;
        this.username = null
        this.roomname = null
        this.user = null;
        this.active_users = [];
    }

    fetch_messages() {
        if (this.client && this.username && this.password) {
            this.send_message_to_room('fetch_messages', '');
            return true;
        }
        else {
            return false;
        }
    }

    send_file_to_group(file, description) {
        const client = this.client;
        var username = this.username
        var roomname = this.roomname
        toDataURL(file[0], function (dataURL) {
            client.send(JSON.stringify({
                'command': 'new_file',
                'dataURL': dataURL,
                'description': description,
                'username': username,
                'roomname': roomname,
                'id': Date.now().toString(),
            }));
        })
    }

    async update_active_users() {
        this.send_message_to_room('get_active_users', {});
    }

    send_image_text(image, callback, output) {
        var Tesseract = window.Tesseract;
        var ref = this;
        Tesseract.recognize(image)
            .progress(function (packet) {
                callback(Math.round(packet.progress * 100))
            })
            .then(function (result) {
                hide_progress_box();
                ref.send_message_to_room("new_message", result.text);
            });
    }

    send_message_to_room(command, message) {
        this.client.send(JSON.stringify({
            'command': command,
            'message': message,
            'username': this.username,
            'roomname': this.roomname
        }));
    }

    clear_room_messages(password) {
        this.client.send(JSON.stringify({
            'command': 'clear_room_messages',
            'username': this.username,
            'roomname': this.roomname,
            'password': password
        }));
    }

    get_token() {
        let cookieValue = null,
            name = "csrftoken";
        if (document.cookie && document.cookie !== "") {
            let cookies = document.cookie.split(";");
            for (let i = 0; i < cookies.length; i++) {
                let cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) == (name + "=")) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }


    get_client() {
        return this.client;
    }
    get_messages() {
        return this.messages;
    }

    get_response() {
        return this.response;
    }

    get_room_messages(roomname) {
        var messages = [];
        this.messages.map(message => {
            if (message.roomname === roomname)
                messages.push(message);
        })
        return messages;
    }

    get_answered_messages() {
        var answered_messages = []
        this.messages.map(message => {
            if (message.isanswer === true)
                answered_messages.push(message);

        })
        return answered_messages;
    }

    set_roomname(roomname) {
        this.roomname = roomname;
    }

    set_username(username) {
        this.username = username
    }

    set_password(password) {
        this.password = password;
    }

    set_user(user) {
        this.user = user;
    }

    get_user() {
        return this.user;
    }

    get_roomname() {
        return this.roomname;
    }

    get_username() {
        return this.username;
    }

    get_hostnmae() {
        return this.hostname;
    }

    get_ws_protocol() {
        return this.ws_protocol;
    }
}