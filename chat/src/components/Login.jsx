import React, { Component } from 'react'
import Home from './Home'

export class Login extends React.Component {

    state = {
        isLoggedIn: false,
        username: '',
        roomname: ''
    }
    constructor(props) {
        super(props);
        this.handleRoomName = this.handleRoomName.bind(this);
        this.handleUsername = this.handleUsername.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }
    componentDidMount() {
        var username = localStorage.getItem("username");
        var roomname = localStorage.getItem("roomname");
        if (username != null && roomname != null) {
            this.setState({ username: username, roomname: roomname });
            this.setState({isLoggedIn:true})
        }
        else {
            this.setState({isLoggedIn:false, username:"", password:""})
        }
        this.searchInput.focus();
    }
    handleSubmit(event) {
        var username  = this.state.username;
        var roomname = this.state.roomname;

        if (username != "" && roomname != "") {
            localStorage.setItem("username", this.state.username);
            localStorage.setItem("roomname", this.state.roomname);
            this.setState({
                isLoggedIn: true
            })
        }
        else {
            alert("You can't leave any field empty");
        }
        event.preventDefault();
    }
    handleRoomName(event) {
        this.setState({
            roomname: event.target.value
        });
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
                    <form className="RoomForm" onSubmit={this.handleSubmit}>
                        <p className='intro'>Created By Shivansh Shrivastava</p>
                        <label htmlFor="">Enter Username : </label>
                        <input className="input-username" ref={inputEl => (this.searchInput = inputEl)} type="text" onChange={this.handleUsername} value={this.state.username} />

                        <label htmlFor="">Enter Room Name : </label>
                        <input className="input-room-name" type="text" onChange={this.handleRoomName} value={this.state.roomname} />

                        <input className='input-submit' type="submit" value="Enter"/>
                        
                    </form>
                </div>
            )
        }
        else {
            return <Home username={this.state.username} roomname={this.state.roomname}/>
        }
    }
}

export default Login
