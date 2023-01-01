import React from 'react';
import {getCookie} from './utils/ChatMessage'
export var web_protocol = window.location.protocol; //either http: or https:
export var ws_protocol = web_protocol == "http:" ? "ws://" : "wss://";
export var hostname = window.location.host == "localhost:3000" ? "127.0.0.1:8000" : window.location.host;
export var api_url = web_protocol + "//" + hostname;
export var websocket_url = ws_protocol + hostname + "/chatroom/ws/";
var csrftoken = getCookie('csrftoken');
export const CsrfToken = () => {
    return (
        <input type="hidden" name="csrfmiddlewaretoken" value={csrftoken} />
    );
};