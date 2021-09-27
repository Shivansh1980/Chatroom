import $ from 'jquery'
import * as chat from './ChatMessage';
import { hide_loading_screen, display_questions_box_items_at_start } from '../styles/AlterCSS'
import React, { Component } from 'react'
import ReactDOM from 'react-dom';
import ImageContainer from '../minicomponents/ImageContainer'
import {show_info} from '../styles/AlterCSS'
export class WebMessageHandler {
    constructor(message_api) {
        this.message_api = message_api;
        this.client = message_api.get_client();
        this.username = message_api.get_username();
        this.roomname = message_api.get_roomname();
        this.user = message_api.get_user();
    }
    handle_message(selector) {
        
        this.client.onmessage = (e) => {
            const data = JSON.parse(e.data);
            //when you fetch all messages
            if (data['type'] === 'messages') {
                let obj = {
                    selector:selector,
                    currentRoom: this.roomname,
                    currentUser: this.user,
                    messages: data.messages
                }

                if (this.username === data.username) {
                    chat.loadAllMessages(obj);
                }
            }
            // when new message arrived
            else if (data.type === 'new_message') {
                console.log(data);
                if (data.status == false) {
                    show_info({
                        title: 'Posted Data Not Sufficient',
                        content: JSON.stringify(data.error),
                        color: 'red',
                        time:5
                    })
                    return
                }

                if (!document.hasFocus()) {
                    chat.showNotification(data.username, data.roomname, data.message);
                }
                let message = data.data;
                if (message.user.id === this.user.id) {
                    chat.appendMessageRight(selector, message.message, this.user.name, message.id);
                }
                else {
                    chat.appendMessageLeft(selector, message.message, message.user.name, message.id);
                }
            }
                
            else if (data.type === 'updated_message') {
                let updated_message = data;
                chat.updateMessage(updated_message);
            }

            else if (data.type == 'clear_room_messages') {
                if (data.status == true) {
                    $('#'+selector).empty();
                    alert(data.message);
                }
                else if (data.status == false)
                    alert(data.message);
            }
                
            else if (data.type === 'new_file') {
                var box = document.getElementById(selector);
                var div = document.createElement('div');
                div.className = "chatbox_image_container";
                div.id = "image_container_" + data.id;
                box.appendChild(div);
                ReactDOM.render(
                    <ImageContainer
                        id={data.id}
                        src={data.dataURL}
                        message_api={this.message_api}
                    />, div
                );
            }
                
            else if (data.type == 'active_users') {
                document.getElementById('active_user_container').innerText = '';
                data.users.map(user => {
                    $('#active_user_container').append(`<li>${user.name}</li>`)
                    console.log(`<li>${user.name}</li>`);
                })
            }
            else if (data.type == 'image_answer') {
                $('#' + data.id).parent().append(`<p> ${data.message} </p>`);
            }
            chat.addEvents(this.client, this.username, this.roomname);
        }
    }
}

export default WebMessageHandler
