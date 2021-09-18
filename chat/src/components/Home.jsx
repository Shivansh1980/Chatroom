import React, { Component } from 'react'
import { MessageWebApi } from '../utils/MessageApi';
import AnswerBox from './AnswerBox';
import QuestionBox from './QuestionBox';
import { CircularProgress } from '@material-ui/core'

export var hostname = window.location.host
export var ws_protocol = window.location.protocol == "https:" ? "wss" : "ws";
// export var hostname = '127.0.0.1:8000'
export var optional = 'chatroom/'

export class Home extends Component {

    constructor(props) {
        super(props);
        this.username = this.props.username;
        this.roomname = this.props.roomname;

        this.client = new WebSocket(
            ws_protocol
            + '://'
            + hostname
            + '/'
            + optional
            + 'ws/chat/'
            + this.roomname
            + '/'
            + `?username=${this.props.username}`
        );

        this.message_api = new MessageWebApi(this.client);


        this.message_api.set_username(this.username);
        this.message_api.set_roomname(this.roomname);

        this.go_to_chatroom = this.go_to_chatroom.bind(this);
        this.go_to_answers = this.go_to_answers.bind(this);
        this.handle_change_room = this.handle_change_room.bind(this);
    }

    async handle_change_room(username, roomname) {
        const ref = this;
        return new Promise(function (resolve, reject) {
            ref.username = username;
            ref.roomname = roomname;
            ref.client = new WebSocket(
                ws_protocol
                + '://'
                + hostname
                + '/'
                + optional
                + 'ws/chat/'
                + this.roomname
                + '/'
                + `?username=${ref.username}`
            );
            ref.client.onopen = () => {
                resolve(ref.client);
            }
            ref.client.onerror = (e) => {
                reject('error while connecting to websocket');
            }
            ref.client.onclose = () => {
                reject('connection closed')
            }
        })
    }

    go_to_chatroom() {
        this.setState({
            questions_layout: true,
            answer_layout:false
        })
    }
    go_to_answers() {
        this.setState({
            questions_layout: false,
            answer_layout: true
        })
    }

    state = {
        isConnected:false,
        questions_layout: false,
        answer_layout: true,
    }

    componentDidMount() {
        var ref = this;
        this.client.onopen = () => {
            ref.setState({
                isConnected: true
            })
        }
        this.client.onclose = () => {
            ref.setState({
                isConnected: false
            })
        }
    }

    render() {
        let answers_layout = this.state.answer_layout;
        let questions_layout = this.state.questions_layout;
        let isConnected = this.state.isConnected;

        let layout;
        if (answers_layout && isConnected) {
            layout =
                <div className="AnswerBox">
                    <AnswerBox
                        message_api={this.message_api}
                        username={this.username}
                        roomname={this.roomname}
                    changeroom={this.handle_change_room}
                    go_to_chatroom = {this.go_to_chatroom}
                    />
                </div>
        }
        else if (questions_layout && isConnected) {
            layout =
                <div id="QuestionViewContainer" className="QuestionViewContainer">
                    <QuestionBox
                        message_api={this.message_api}
                        username={this.username}
                        roomname={this.roomname}
                        changeroom={this.handle_change_room}
                    />
                </div>
        }
        else {
            layout =
                <div className="loading">
                    <h3>Please Wait Connecting to Chatroom</h3>
                    <div>
                        <CircularProgress />
                    </div>
                </div>
        }
        return (
            <>
                {layout}
            </>
        )
        
    }
}

export default Home
