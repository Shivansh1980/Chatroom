import $ from 'jquery'
import { google_icon } from './Icons'
import React from 'react';
import ReactDOM from 'react-dom';
import CodeView from '../components/containers/CodeView'

export function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

export function initializeLoadingScreen(classname) {
    var loading_box = $("." + classname);
    for (var i = 1; i <= 20; i++){
        var span = document.createElement('span');
        span.setAttribute("style", `--i:${i};`)
        loading_box.append(span);
    }
}

// Loading the messages from the server to the box

export function loadAllMessages(data) {
    let selector = data.selector;
    let messages = data.messages;
    let currentUser = data.currentUser;
    let currentRoom = data.currentRoom;
    let msgbox = document.getElementById(selector);

    if (msgbox) {
        for (var i = 0; i < messages.length; i++) {
            var message = messages[i];
            if (toString(currentRoom) === toString(message.room)) {
                if (message.user.id === currentUser.id) {
                    appendMessageRight(selector, message, currentUser.name);
                }
                else {
                    appendMessageLeft(selector, message, message.user.name);
                }
            }
        }
        msgbox.scrollTop = msgbox.scrollHeight;
    } else {
        alert("container for holding messages doesn't exists")
    }
}

export function loadQuestionList(data, username, roomname) {
    var messages = data['questions_list'];
    var selector = "questions_box";
    for (var i = 0; i < messages.length; i++) {
        if (roomname === data['roomname']) {
            if (data['username'] === username) {
                appendMessageRight(selector, messages[i], data['username']);
            }
            else {
                appendMessageLeft(selector, messages[i], data['username']);
            }
        }
    }
}

export function fetchMessages(client, username, roomname) {
    client.send(JSON.stringify({
        'command': 'fetch_messages',
        'username': username,
        'roomname': roomname
    }));
}


// Appending the updated messages from the user

export function updateMessage(message) {
    let id = 'message_' + message.id;
    let content = document.getElementById(id);
    if (content == null) {
        alert('message not exists');
        return;
    }
    content.innerText = message.message;
}
export function performScrollIfRequired(selector) {
    let box = document.querySelector("#" + selector);
    let curHeight = box.scrollTop + box.clientHeight;
    let belowHeight = box.scrollHeight - curHeight;
    if (belowHeight < (2 * box.clientHeight)) {
        box.scrollTop = box.scrollHeight;
    }
    console.log("current Height: ", curHeight);
    console.log("below Height: ", belowHeight);
}

export function appendMessageLeft(selector, message, username) {
    let id = message.id;
    var parentElement = document.querySelector("#" + selector);
    var div = document.createElement('div');
    div.setAttribute('class', 'left_message_container');
    
    //adding username heading
    var h = document.createElement('h4');
    h.setAttribute('class', 'message_username');
    h.setAttribute('align', 'center');
    h.innerHTML = '<span id="username">' + username + '</span>';
    $(div).append(h);

    //adding google search button
    $(div).append(`<button id="google_search_button" class="message_buttons" value='${message.message}'">${google_icon} Search on Google</button>`);
    $(div).append(`<button id="copy_message_button" class="message_buttons" value='${message.message}'"> Copy </button>`);

    //adding message
    var child = document.createElement('p');
    child.setAttribute('class', 'left_message');
    if (id != null) child.setAttribute('id', 'message_' + id);
    
    if (message.iscode) {
        child.classList.add('code_message');
        $(div).append(child);
        parentElement.appendChild(div);
        ReactDOM.render(<CodeView language="cpp" code={message.message} self={child} />, child);
    } else {
        child.innerText = message.message;
        $(div).append(child);
        parentElement.appendChild(div);
    }
}

export function appendMessageRight(selector, message, username) {
    let id = message.id;
    var parentElement = document.querySelector("#"+selector);

    var div = document.createElement('div');
    div.setAttribute('class', 'right_message_container');

    //adding username header
    var h = document.createElement('h4');
    h.setAttribute('class', 'message_username');
    h.setAttribute('align', 'center');
    h.innerHTML = '<span id="username">' + username + '</span>';
    $(div).append(h);

    //adding google search button
    $(div).append(`<button class="message_buttons google_search_button" value='${message.message}'">${google_icon} Search on Google</button>`);
    $(div).append(`<button class="message_buttons copy_message_button" value='${message.message}'"> Copy </button>`);

    //adding message
    var child = document.createElement('p');
    child.setAttribute('class', 'right_message');
    if (id != null) child.setAttribute('id', 'message_' + id);
    console.log(message);
    if (message.iscode) {
        child.classList.add('code_message');
        $(div).append(child);
        parentElement.appendChild(div);
        ReactDOM.render(<CodeView language="cpp" code={message.message} self={child} />, child);
    } else {
        child.innerText = message.message;
        $(div).append(child);
        parentElement.appendChild(div);
    }
}


// Adding the required events

export function addEvents(message_api, username, roomname) {
    let client = message_api.get_client();
    $('.copy_message_button').unbind("click").bind("click", function (e) {
        let text = e.target.parentElement.innerText;
        copyTextToClipboard(text);
        window.confirm("Copied Successfully")
        return false;
    })
    $('.copy_message_button').unbind("click").bind("click", function (e) {
        let text = e.target.parentElement.innerText;
        copyTextToClipboard(text);
        window.confirm("Copied Successfully");
        return false;
    })
    $('.google_search_button').unbind("click").bind("click", function (e) {
        var text = e.target.value
        var search = "http://www.google.com/search?q=" + text;
        window.open(search, "_blank");
    })

    $('.right_message').unbind("click").bind("click", function () {
        var answer = prompt('Enter Answer : ');
        if (answer === null || answer === "") {
            return;
        }
        else {
            var updated_message = this.innerText + '\nAnswer: ' + answer;
            var current_message = this.innerText;
            message_api.update_message(
                {
                    'command': 'update_message',
                    'current_message': current_message,
                    'updated_message': updated_message,
                    'id': this.id,
                    'username': username,
                    'roomname': roomname
                }
            );
        }

    })
    $(".left_message").unbind("click").bind("click", function (e) {
        var answer = prompt('Enter Answer : ');
        if (answer === null || answer === "") {
            return;
        }

        var updated_message = this.innerText +'\nAnswer: ' + answer;
        var current_message = this.innerText;

        message_api.update_message(
            {
                'command': 'update_message',
                'current_message': current_message,
                'updated_message': updated_message,
                'id': this.id,
                'username': username,
                'roomname': roomname
            }
        );
    })
}

// Showing the Notifications
export function fallbackCopyTextToClipboard(text) {
    var textArea = document.createElement("textarea");
    textArea.value = text;

    // Avoid scrolling to bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        var successful = document.execCommand('copy');
        var msg = successful ? 'successful' : 'unsuccessful';
        console.log('Fallback: Copying text command was ' + msg);
    } catch (err) {
        console.error('Fallback: Oops, unable to copy', err);
    }

    document.body.removeChild(textArea);
}

export function copyTextToClipboard(text) {
    if (!navigator.clipboard) {
        fallbackCopyTextToClipboard(text);
        return;
    }
    navigator.clipboard.writeText(text).then(function () {
        console.log('Async: Copying to clipboard was successful!');
    }, function (err) {
        console.error('Async: Could not copy text: ', err);
    });
}

