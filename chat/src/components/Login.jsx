import React, { Component } from 'react'
import Home from './Home'
import { CircularProgress } from '@material-ui/core';
import axios from 'axios';
import { CustomBox } from './minicomponents/CustomBox'
import {Link} from 'react-router-dom'
import { api_url } from '../global'
import { getCookie } from '../utils/ChatMessage'
import { loadImage } from '../utils/utils'
import { show_info } from '../styles/js/AlterCSS'

export class Login extends React.Component {
    state = {
        loadingImages: false,
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
        this.tryLocalLogin = this.tryLocalLogin.bind(this);
    }

    tryLocalLogin() {
        let uname = localStorage.getItem('username');
        let pass = localStorage.getItem('password');
        let ref = this;
        if (uname && pass) {
            axios({
                method: 'POST',
                url: api_url + '/api/chat/user/login/',
                headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCookie('csrftoken') },
                data: { username: uname, password: pass }
            }).then(function (response) {
                let res = response.data;
                if (res.status == true) {
                    // let root = document.getElementById('root');
                    // root.style.backgroundImage = `url('')`;
                    ref.setState({ username: uname, password: pass });
                    ref.setState({ isError: false });
                    ref.setState({ isLoading: false });
                    ref.setState({ isLoggedIn: true });
                    ref.setState({ loadingImages: false});
                }
                else {
                    alert('failed');
                    localStorage.removeItem('username');
                    localStorage.removeItem('password');
                    ref.setState({ isError: res.error });
                    ref.setState({ isLoading: false });
                    ref.setState({ isLoggedIn: false });
                    ref.setState({ loadingImages: false});
                }
            }).catch(function (error) {
                localStorage.removeItem('username');
                localStorage.removeItem('password');
                ref.setState({
                    isLoggedIn: false,
                    loadingImages: false,
                    isLoading: false
                });
                alert(error.message);
            });
        } else {
            ref.setState({
                isLoggedIn: false,
                loadingImages: false,
                isLoading: false
            });
        }
    }

    componentDidMount() {
        let ref = this;
        ref.setState({ loadingImages: true });
        loadImage('http://static.demilked.com/wp-content/uploads/2016/06/gif-animations-replace-loading-screen-10.gif', function (src) {
            let root = document.getElementById('root');
            root.style.backgroundImage = `url(${src})`;
            ref.tryLocalLogin(ref);
        })
    }

    handleSubmit(event) {
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
                    // let root = document.getElementById('root');
                    // root.style.backgroundImage = `url('')`;
                }
                else {
                    ref.setState({
                        loadingImages: false,
                        isLoading: false,
                        isLoggedIn: false,
                        isError: true,
                        errorMessage: res.error,
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
        if (isLoggedIn === false && !this.state.loadingImages) {
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
        else if (this.state.loadingImages) {
            return (
                <img src={process.env.PUBLIC_URL + '/static/media/loader1.gif'} style={{width: '100%', height:'100%'} }/>
            )
        }
        else {
            return <Home username={this.state.username} password={this.state.password}/>
        }
    }
}

export default Login
