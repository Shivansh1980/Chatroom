import $ from 'jquery'
import * as chat from './ChatMessage';
import { hide_loading_screen, display_questions_box_items_at_start } from '../styles/AlterCSS'
import React, { Component } from 'react'
import ReactDOM from 'react-dom';
import ImageContainer from '../minicomponents/ImageContainer'

export class Handler {
    constructor(message_api) {
        this.message_api = message_api;
        this.client = message_api.get_client();
        this.username = message_api.get_username();
        this.roomname = message_api.get_roomname();
    }
    handle_message() {
        
        this.client.onmessage = (e) => {
            const data = JSON.parse(e.data);
            //when you fetch all messages
            if (data['type'] === 'messages') {
                hide_loading_screen();
                chat.loadAllMessages("questions_box", data['messages'], this.username, this.roomname);
                display_questions_box_items_at_start();
            }
            // when new message arrived
            else if (data.type === 'new_message') {
                if (data.status == false) {
                    alert(JSON.stringify(data.message));
                    return
                }

                if (!document.hasFocus()) {
                    chat.showNotification(data.username, data.roomname, data.message);
                }
                console.log(data)
                if (data.username === this.username) {
                    chat.appendMessageRight("questions_box", data.message, data.username, data.id);
                }
                else {
                    chat.appendMessageLeft("questions_box", data.message, data.username, data.id);
                }
            }
                
            else if (data.type === 'updated_message') {
                let updated_message = data;
                chat.updateMessage(updated_message);
            }

            else if (data.type == 'clear_room_messages') {
                if (data.status == true) {
                    $('#questions_box').empty();
                    alert(data.message);
                }
                else if (data.status == false)
                    alert(data.message);
            }
                
            else if (data.type === 'new_file') {
                var box = document.getElementById('questions_box');
                var div = document.createElement('div');
                div.className = "chatbox_image_container";
                div.id = "image_container_"+data.id;
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
                    $('#active_user_container').append(`<li>${user.username}</li>`)
                    console.log(`<li>${user.username}</li>`);
                })
            }
            else if (data.type == 'image_answer') {
                $('#'+data.id).parent().append(`<p> ${data.message} </p>`)
            }
            chat.addEvents(this.client, this.username, this.roomname);
        }
    }
}

export default Handler
