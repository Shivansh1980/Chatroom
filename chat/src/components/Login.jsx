import React, { Component } from 'react'
import Home from './Home'
import { CircularProgress } from '@material-ui/core';
import axios from 'axios';
import { CustomBox } from '../minicomponents/CustomBox'
import {Link} from 'react-router-dom'
import { api_url } from '../global'
import { getCookie } from '../utils/ChatMessage'
import {show_info} from '../styles/AlterCSS'

export class Login extends React.Component {
    state = {
        isLoggedIn: false,
        username: '',
        roomname: '',
        password: '',
        isLoading: false,
        isError: false,
        errorMessage:''
    }
    constructor(props) {
        super(props);
        this.handlePassword = this.handlePassword.bind(this);
        this.handleUsername = this.handleUsername.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }
    componentDidMount() {
        let uname = localStorage.getItem('username')
        let pass = localStorage.getItem('password')
        let ref = this;
        if (uname && pass) {
            axios({
                method: 'POST',
                url: api_url + '/api/chat/user/login/',
                headers: { 'Content-Type': 'application/json'},
                data: {username:uname, password:pass}
            }).then(function (response) {
                let res = response.data;
                if (res.status == true) {
                    ref.setState({ username: uname, password: pass });
                    ref.setState({ isError: false});
                    ref.setState({ isLoading: false });
                    ref.setState({ isLoggedIn: true });
                }
            }).catch(function (error) {
                alert(error.message);
            });
        }
        this.searchInput.focus();
    }
    handleSubmit(event) {
        this.setState({ isLoading: true });

        var username  = this.state.username;
        var password = this.state.password;

        if (username != "" && password != "") {
            let ref = this;
            axios({
                method: 'POST',
                url: api_url+'/api/chat/user/login/',
                headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCookie('csrftoken') },
                data: { 'username': username, 'password': password }
            }).then((response) => {
                let res = response.data;
                if (res.status === true) {
                    localStorage.setItem('username', username);
                    localStorage.setItem('password', password);
                    ref.setState({
                        isLoading: false,
                        isLoggedIn: true,
                        isError: false,
                    });
                }
                else {
                    ref.setState({
                        isLoading: false,
                        isLoggedIn: false,
                        isError: true,
                        errorMessage:res.error
                    });
                }

            }).catch((error) => {
                console.log(error.message);
                ref.setState({ isLoading: false, isLoggedIn: false });
            })
        }
        else {
            alert("You can't leave any field empty");
        }
        event.preventDefault();
    }
    handlePassword(e) {
        this.setState({
            password: e.target.value
        })
    }

    handleUsername(event) {
        this.setState({
            username: event.target.value
        });
    }
    render() {
        const isLoggedIn = this.state.isLoggedIn;
        if (isLoggedIn === false) {
            return (
                <div className="RoomContainer">
                    {this.state.isError ?
                        <CustomBox
                            boxName="error_box"
                            error_message={this.state.errorMessage}
                            hidden={false}
                        />
                        :
                        <CustomBox
                            boxName="error_box"
                            hidden={true}
                        />
                    }
                    <h2>Login To The Chatroom</h2>
                    <form className="RoomForm" onSubmit={this.handleSubmit}>
                        <p className='intro'>Created By Shivansh Shrivastava</p>
                        <label htmlFor="">Enter Username: </label>
                        <input className="input-username" ref={inputEl => (this.searchInput = inputEl)} type="text" onChange={this.handleUsername} value={this.state.username} />

                        <label htmlFor="">Enter Password: </label>
                        <input className="input-room-name" type="password" onChange={this.handlePassword} value={this.state.password} />
                        <div>
                            <input className='input-submit' type="submit" value="Login"/>
                            <Link to='/signup/'>
                                <input className='input-submit' type="submit" value="Go To Signup" />
                            </Link>
                        </div>
                        <div>
                            {this.state.isLoading ? <CircularProgress/>:null}
                        </div>
                        
                    </form>
                </div>
            )
        }
        else {
            return <Home username={this.state.username} password={this.state.password}/>
        }
    }
}

export default Login
