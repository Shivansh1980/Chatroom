import $ from 'jquery'
import Push from 'push.js'
import { google_icon } from './Icons'
import React, { Component } from 'react'
import ReactDOM from 'react-dom';
import { ImageContainer } from '../minicomponents/ImageContainer';

var color_the_message = false;

export function initializeLoadingScreen(classname) {
    var loading_box = $("." + classname);
    for (var i = 1; i <= 20; i++){
        var span = document.createElement('span');
        span.setAttribute("style", `--i:${i};`)
        loading_box.append(span);
    }
}

// Loading the messages from the server to the box

export function loadAllMessages(selector, messages, username, roomname) {
    for (var i = 0; i < messages.length; i++) {
        var message = messages[i];
        if (message.isanswer == true)
            color_the_message = true;
        if (roomname === message.roomname) {
            if (message.username === username) {
                appendMessageRight(selector, message.message, message.username, message.id);
            }
            else {
                appendMessageLeft(selector, message.message, message.username, message.id);
            }
        }
        color_the_message = false;
    }
    color_the_message = false;
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
    console.log('your content : ',content);
    if (content == null) {
        alert('message not exists');
        return;
    }
    content.innerText = message.message;
}

export function appendMessageLeft(selector, message, username, id=null) {
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
    $(div).append(`<button id="google_search_button" class="google_search_button" value='${message}'">${google_icon} Search on Google</button>`);

    //adding message
    var child = document.createElement('p');
    child.setAttribute('class', 'left_message');
    if(id != null) child.setAttribute('id', 'message_'+id);
    if (color_the_message == true) {
        child.style.backgroundColor = 'cyan'
        child.style.padding = '5px';
    }
    child.innerText = message;
    $(div).append(child);

    parentElement.appendChild(div);
}


export function appendMessageRight(selector, message, username, id=null) {
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
    $(div).append(`<button id="google_search_button" class="google_search_button" value='${message}'">${google_icon} Search on Google</button>`);

    //adding message
    var child = document.createElement('p');
    child.setAttribute('class', 'right_message');
    if (id != null) child.setAttribute('id', 'message_'+id);

    if (color_the_message == true) {
        child.style.backgroundColor = 'cyan'
        child.style.padding = '5px';
    }
    child.innerText = message;
    $(div).append(child);

    parentElement.appendChild(div);
}


// Adding the required events

export function addEvents(client, username, roomname) {
    $('.right_message').unbind("contextmenu").bind("contextmenu", function (e) {
        copyToClipboard(this);
        window.confirm("Copied Successfully")
        return false;
    })
    $('.left_message').unbind("contextmenu").bind("contextmenu", function (e) {
        copyToClipboard(this);
        window.confirm("Copied Successfully")
        return false;
    })
    $('.right_message').unbind("click").bind("click", function () {
        var answer = prompt('Enter Answer : ');
        if (answer === null || answer === "") {
            return;
        }
        else {
            var updated_message = this.innerText + '\nAnswer: ' + answer;
            var current_message = this.innerText;
            client.send(JSON.stringify({
                'command': 'update_message',
                'current_message': current_message,
                'updated_message': updated_message,
                'id':this.id,
                'username': username,
                'roomname': roomname
            }));
        }

    })
    $(".left_message").unbind("click").bind("click", function (e) {
        var answer = prompt('Enter Answer : ');
        if (answer === null || answer === "") {
            return;
        }

        var updated_message = this.innerText +'\nAnswer: ' + answer;
        var current_message = this.innerText;

        client.send(JSON.stringify({
            'command': 'update_message',
            'current_message': current_message,
            'updated_message': updated_message,
            'id': this.id,
            'username': username,
            'roomname': roomname
        }));
    })
    $('.google_search_button').unbind("click").bind("click", function (e) {
        var text = e.target.value
        var search = "http://www.google.com/search?q=" + text;
        window.open(search, "_blank");
    })
}

// Showing the Notifications

export function copyToClipboard(element) {
    var $temp = $("<p id='copy_it'>");
    $("body").append($temp);
    $temp.val($(element).text()).select();
    document.execCommand("copy");
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