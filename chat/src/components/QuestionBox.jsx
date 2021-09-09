import React, { Component } from 'react'
import * as chat  from '../utils/ChatMessage'
import { addEvents, updateMessage, initializeLoadingScreen } from '../utils/ChatMessage';
import $ from 'jquery'
import Dropzone from 'react-dropzone'
import '../minicomponents/CustomBox'
import CustomBox from '../minicomponents/CustomBox';
import { FaArrowCircleDown } from 'react-icons/fa'
import {
    show_image_to_text_box,
    hide_image_to_text_box,
    hide_loading_screen,
    show_loading_screen,
    display_questions_box_items_at_start,
    show_progress_box,
    hide_progress_box
} from '../styles/AlterCSS'
import Handler from '../utils/Handler'

export class QuestionBox extends Component {

    constructor(props) {
        super(props);
        this.message_api = this.props.message_api;

        this.client = this.props.message_api.get_client();
        this.username = this.props.message_api.get_username();
        this.roomname = this.props.message_api.get_roomname();
        this.handler = new Handler(this.message_api);

        this.send_message = this.send_message.bind(this);
        this.handle_upload_image = this.handle_upload_image.bind(this);
        this.handle_clear_room_messages = this.handle_clear_room_messages.bind(this);
        this.handle_update_progress = this.handle_update_progress.bind(this);
        this.handle_go_to_last_message = this.handle_go_to_last_message.bind(this);
        this.logoutHandler = this.logoutHandler.bind(this);
    }

    state = {
        connected: '',
        inputquestion: '',
        file: null,
        progress: 0.01,
        active_users:[]
    }

    logoutHandler(event) {
        localStorage.removeItem("username");
        localStorage.removeItem("roomname");
        window.location.reload();
    }


    handle_go_to_last_message(event) {
        var question_box = document.getElementById('questions_box');
        question_box.scrollTop = question_box.scrollHeight;
    }

    handlle_change_room(username, roomname) {
        var ref = this;
        this.props.changeroom(username, roomname)
        .then(function (client) {
            localStorage.removeItem("username");
            localStorage.removeItem("roomname");
            localStorage.setItem("username", username);
            localStorage.setItem("roomname", roomname);
            ref.client.reinitialize(client);
        });
    }

    handle_update_progress(new_progress) {
        this.setState({
            progress:new_progress
        })
    }
    
    send_message(event) {
        this.message_api.send_message_to_room('new_message', this.state.inputquestion);
        this.setState({
            inputquestion: '',
        })
        event.preventDefault();
    }

    handle_clear_room_messages(event) {
        var password = prompt('Enter Password : ');
        this.message_api.clear_room_messages(password);
    }

    handle_upload_image(event, data) {
        var to_text = false;
        var upload = false;
        if ($("#convert_to_text").is(":checked"))
            to_text = true;
        if ($("#direct_upload").is(":checked")) {
            upload = true;
        }
        if (data["button"] == "upload") {
            if (to_text && upload)
                alert("You can't tick both");
            else if (!to_text && !upload) {
                alert("Please Select Atleast One or Cancel");
            }
            else if (upload && !to_text) {
                var description = $('#image_description').val();
                if (description == null) description = "";
                this.message_api.send_file_to_group(this.state.file, description);
                hide_image_to_text_box();
            }
            else {
                hide_image_to_text_box();
                show_progress_box();
                var update_progress = this.handle_update_progress;
                this.message_api.send_image_text(this.state.file[0], function (progress) {
                    update_progress(progress)
                })
            }
        }
        else {
            hide_image_to_text_box();
        }
        event.preventDefault();
    }

    onDrop = (acceptedFiles) => {
        console.log(acceptedFiles);
        this.setState({
            file:acceptedFiles
        })
        show_image_to_text_box();
    }

    componentDidMount() {
        this.handler.handle_message(); //web socket on meesage handler
        chat.take_notification_permissions();
        chat.initializeLoadingScreen("loading");
        show_loading_screen();
        console.log('websocket connection successful');
        
        this.message_api.update_active_users();

        chat.fetchMessages(this.client, this.username, this.roomname);

        document.removeEventListener('copy', function () {
            return;
        })
        document.addEventListener('copy', function (e) {
            var text = $('#copy_it').val();
            if(e.clipboardData == null || text == null || e == null) return
            e.clipboardData.setData('text/plain', text);
            e.preventDefault();
            $('#copy_it').remove();
        });
    }
    render() {

        return (
            <div className="QuestionBoxLayout">
                <div className="question_box_header">
                    <Dropzone
                        onDrop={this.onDrop}
                        accept="image/*"
                    >
                        {({ getRootProps, getInputProps, isDragActive, isDragReject }) => (

                            <div {...getRootProps({ className: "dropzone", id: "dropzone" })}>
                                <input {...getInputProps()} />
                                {!isDragActive && 'Click here or drop a file to upload!'}
                                {isDragActive && !isDragReject && "Drop it like it's hot!"}
                                {isDragReject && "File type not accepted, sorry!"}
                            </div>
                        )}
                    </Dropzone>
                    <button id="clear_message_button" onClick={this.handle_clear_room_messages}>Clear All Messages</button>
                    <div className="available_rooms">
                        <h2>Active Users</h2>
                        <ul id="active_user_container"> </ul>
                    </div>
                </div>
                
                <div className="message_box_container">
                    <CustomBox boxName="image_to_text_box" handler={this.handle_upload_image} />
                    <CustomBox boxName="progress_box" progress={this.state.progress} text="Converting Image To Text"/>
                    <CustomBox boxName="logout_box" logoutHandler={this.logoutHandler} />
                    
                    <div id="questions_box" className="questions_box">
                        <div className="message_loading"></div>
                        <div className="down_arrow_button" onClick={this.handle_go_to_last_message}><FaArrowCircleDown color="white" size={ 40}/></div>
                    </div>

                    <div className="question_input_container">
                        <textarea id="input_question"
                            type="text"
                            onChange={(event) => {
                                this.setState({ inputquestion: event.target.value })
                            }}
                            value={this.state.inputquestion}
                            placeholder="Enter Message..."
                        />
                        <input
                            id="post_question_button"
                            type="submit"
                            onClick={this.send_message}
                            value="POST" />
                    </div>
                </div>
            </div >
        )
    }
}

export default QuestionBox