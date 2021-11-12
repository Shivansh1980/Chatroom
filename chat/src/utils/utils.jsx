import axios from 'axios';
import { api_url, hostname, ws_protocol } from '../global'
import {getCookie} from './ChatMessage'
import Push from 'push.js'
import $ from 'jquery';

// < ---------------------------- functions implementations ---------------------------------->


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

export function convertToBase64(blobFile, callback) {
    var fileToLoad = blobFile;
    var fileReader = new FileReader();
    fileReader.onload = function (fileLoadedEvent) {
        let base64 = fileLoadedEvent.target.result;
        callback(base64);
    };
    fileReader.readAsDataURL(fileToLoad);
}

export function checkIfImageExists(url, callback) {
    const img = new Image();

    img.src = url;

    if (img.complete) {
        callback(true);
    } else {
        img.onload = () => {
            callback(true);
        };

        img.onerror = () => {
            callback(false);
        };
    }
}

export function take_notification_permissions() {
    if (!Notification) {
        alert('Desktop Notification not available in your browser');
        return;
    }
    if (Notification.permission != 'granted') {
        Notification.requestPermission();
        Push.Permission.get();
    }
}

export function showNotification(username, roomname, message) {
    if (Notification.permission != 'granted')
        Notification.requestPermission();
    else {
        var notification = new Notification(`Awesome Chatroom:\n${roomname}<--${username}`, {
            body: message,
            icon: 'https://i.pinimg.com/originals/87/68/a6/8768a6b1df27243034f123988cfdb9d1.jpg'
        });

        notification.onclick = () => {
            notification.close();
            window.parent.focus();
        }
    }
}

export async function makeDropZone(containerId, fileInputId, callback) {
    // let container = dropzone.current.parentNode;

    let container = document.getElementById(containerId);
    let fileInputRef = document.getElementById(fileInputId);
    $(container).off();

    $(container).on('dragover', e => {
        e.preventDefault(); // to stop the default behavior
        container.classList.add('dropzone__over');
    })


    let dragoutListeners = ['dragleave', 'dragend'];
    dragoutListeners.forEach(type => {
        $(container).on((type), e => {
            container.classList.remove('dropzone__over');
        })
    })

    $(container).on('drop', e => {
        e.preventDefault();
        let files = e.originalEvent.dataTransfer.files;
        if (files.length && fileInputRef) {
            fileInputRef.files = files;
            console.log(container,fileInputRef,files);
            callback(container, files[0]);
        }
        container.classList.remove('dropzone__over');
    })
}

export function loadImage(src, callback) {
    var image = new Image();
    image.onload = function () {
        callback(src);
    }
    image.src = src;
}

export function loadImages(srcs, callback) {
    let length = srcs.length;
    let remaining = srcs.length;
    for (let i = 0; i < length; i++) {
        let src = srcs[i];
        let image = new Image();
        image.onload = function () {
            remaining--;
            if (remaining === 0) {
                callback(srcs);
            }
        }
        image.src = src
    }
}


// < ---------------------- Classes Implementations --------------------->

export class ApiRequester{
    constructor(username, password) {
        this.username = username;
        this.password = password;
        this.method = null;
        this.data = {};
        this.body = {};
        this.headers = { 'Content-Type': 'application/json', 'x-csrftoken': getCookie('csrftoken')};
    }
    
    setData(data) {
        this.data = data;
    }
    setBody(body) {
        this.body = body;
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
                    },
                    body: ref.body
                    
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

export class MessageWebApi {
    ws_protocol = ws_protocol
    hostname = hostname

    //roomname => room_id or group_id based upon the situtation it handles that.
    constructor(client) {
        this.api_url = api_url + '/';
        this.client = client;
        this.username = null
        this.roomname = null
        this.user = null;
        this.active_users = [];
        this.is_group = false;
    }

    set_is_group(is_group) {
        this.is_group = is_group;
    }

    is_group() {
        return this.is_group;
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

    update_message(data = { command: 'update_message', 'current_message': null, 'updated_message': null, 'id': null, 'username': null, 'roomname': null }) {
        if (this.is_group == true) {
            data['group_id'] = this.roomname;
        }
        this.client.send(JSON.stringify(data));
    }

    send_file_to_group(file, description, callback) {
        const client = this.client;
        var username = this.username
        var roomname = this.roomname

        let file_data = {
            'command': 'new_file',
            'filename': file.name,
            'username': username,
            'roomname': roomname,
            'id': Date.now().toString(),
        };

        if (this.is_group) file_data['group_id'] = this.roomname;

        if (file.name.endsWith('.pdf') || file.name.endsWith('.PDF')) {
            convertToBase64(file, function (base64) {
                file_data['dataURL'] = base64
                client.send(JSON.stringify(file_data));
                console.log(file_data);
                callback(true);
            });
        }
        else {
            file_data['description'] = description;
            toDataURL(file, function (dataURL) {
                file_data['dataURL'] = dataURL;
                client.send(JSON.stringify(file_data));
                console.log(file_data);
                callback(true);
            })
        }
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
                ref.send_message_to_room("new_message", result.text);
                output(true);
            }).catch(function (err) {
                output(false);
            });
    }

    send_message_to_room(command, message) {
        if (this.is_group == true) this.send_message_to_group(command, message);
            
        else {
            this.client.send(JSON.stringify({
                'command': command,
                'message': message,
                'username': this.username,
                'roomname': this.roomname
            }));
        }
    }

    send_message_to_group(command, message) {
        this.client.send(JSON.stringify({
            'command': command,
            'message': message,
            'username': this.username,
            'roomname': this.roomname,
            'group_id': this.roomname,
        }))
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
    close_connection() {
        this.client.close();
    }
}