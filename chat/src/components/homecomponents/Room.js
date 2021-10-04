import React, { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux';
import { CircularProgress } from '@material-ui/core'
import { websocket_url } from '../../global'
import { MessageWebApi } from '../../utils/utils'
import { WebMessageHandler } from '../../utils/Handler'
import { makeDropZone } from '../../utils/utils';
import FileUploadView from '../popup/FileUploadView';
import ReactDOM from 'react-dom'

export default function Room(props) {
    // usingDispatch to update redux store
    const dispatch = useDispatch();

    //fetching the data from redux store
    const userData = useSelector(state => state.userData);
    const roomState = useSelector(state => state.roomState);
    const fileInputRef = useRef(null);

    //if room is in null state then text will be displayed
    const [room, setRoom] = useState('');
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState(false);
    const [messageApi, setMessageApi] = useState(null);
    const [isDropzonReady, setIsDropzonReady] = useState(false);

    let messageBoxRef = useRef(null);

    //if this will be loading then that means websocket is in connecting state

    var message_api, webmessage, client;

    async function updateWebsocketState(room_id) {
        return new Promise((resolve, reject) => {
            if (messageApi) messageApi.close_connection();
            client = new WebSocket(
                websocket_url
                + '/'
                + room_id
                + '/?'
                + `username=${userData.username}&password=${userData.password}`
            )
            client.onopen = () => {
                message_api = new MessageWebApi(client);
                message_api.set_username(userData.username);
                message_api.set_password(userData.password);
                message_api.set_roomname(room_id);
                message_api.set_user(userData.user);
                webmessage = new WebMessageHandler(message_api);
                webmessage.handle_message("message_box");
                resolve(message_api);
            }
            client.onclose = () => {
                reject('connection closed');
            }
        })
    }

    useEffect(() => {
        if (roomState.currentRoom) {
            if (messageBoxRef.current) messageBoxRef.current.innerText = ''
            let new_room = roomState.currentRoom;
            setSelected(true);
            
            if (new_room != room) {
                setLoading(true);
                //new_room = room_1 ==> we have to take substring
                let room_id = new_room.substring(5, new_room.length);
                updateWebsocketState(room_id).then((message_api) => {
                    setMessageApi(message_api);
                    setRoom(new_room);
                    setLoading(false);
                    message_api.fetch_messages();
                    makeDropZone('message_box', 'input_room_file', function (container, file) {
                        var div = document.createElement('div');
                        div.classList.add('absolute_center');
                        div.classList.add('popup_file__container')
                        document.body.append(div);
                        ReactDOM.render(
                            <FileUploadView
                                message_api={message_api}
                                file={file}
                                self={div}
                            />, div
                        );
                    })
                }).catch((error) => {
                    setLoading(false);
                });
            }
        }
    }, [roomState]);

    function handleSendMessage(e) {
        var message = document.getElementById('input_message').value;
        messageApi.send_message_to_room('new_message', message);
        document.getElementById('input_message').value = ''
    }

    if (selected && !loading) {
        return (
            <>
                <div id="message_box" ref={messageBoxRef} className="roomcontainer__room__messagebox"></div>
                <div className="roomcontainer__room__inputs">
                    <textarea id="input_message" className="room_input" type="text" placeholder="Enter Your Message Here : " />
                    <button id="send_message_button" className="room_input" type="submit" onClick={handleSendMessage}>Send Message</button>
                    <input ref={fileInputRef} id='input_room_file' className="room_input" type='file' hidden/>
                    <label htmlFor="input_room_file">Upload File</label>
                </div>
            </>
        )
    }
    else if (!selected && !loading) {
        return (
            <>
                <div className="roomcontainer__room__messagebox flex_center_row">
                    <h1 align="center" style={{ color: 'white' }}>Please Select Any Room To Connect.</h1>
                </div>
                <div className="roomcontainer__room__inputs">
                    <textarea id="input_message" className="room_input" type="text" placeholder="Enter Your Message Here : " />
                    <button id="send_message_button" className="room_input" type="submit">Send Message</button>
                </div>
            </>
        )
    }
    else {
        return (
            <>
                <div className="roomcontainer__room__messagebox flex_center_column">
                    <CircularProgress size={70} />
                    <h2 style={{ color: 'white' }}>Connecting To Room</h2>
                </div>
                <div className="roomcontainer__room__inputs">
                    <textarea id="input_message" className="room_input" type="text" placeholder="Enter Your Message Here : " />
                    <button id="send_message_button" className="room_input" type="submit">Send Message</button>
                </div>
            </>
        )
    }
    
}
