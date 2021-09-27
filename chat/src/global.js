export var ws_protocol = "ws://";
export var hostname = window.location.host == "localhost:3000" ? "127.0.0.1:8000" : window.location.host;
export var api_url = "http://" + hostname;
export var websocket_url = ws_protocol + hostname + "/chatroom/ws/chat";