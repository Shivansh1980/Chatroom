import axios from 'axios';
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { CustomBox } from '../minicomponents/CustomBox'
import { api_url } from '../global'
import { CircularProgress } from '@material-ui/core'
import {getCookie} from '../utils/ChatMessage'

export default function Signup() {
    let [username, setUsername] = useState('');
    let [password, setPassword] = useState('');
    let [confirmPassword, setConfirmPassword] = useState('');
    let [loading, setLoading] = useState(false);
    let [error, setError] = useState(null);

    function signup(e) {
        setLoading(true);
        if (username != '' && password != '') {
            if (password == confirmPassword) {
                axios({
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCookie('csrftoken')},
                    url: api_url + '/api/chat/user/signup/',
                    data:{username:username, password:password}
                }).then((response) => {
                    let res = response.data;
                    if (res.status == true) {
                        setError(null);
                        setLoading(false);
                        alert('User Created Successfully');
                    }
                    else {
                        setLoading(false);
                        setError(res.error);
                    }
                })
            } else {
                setError('Password Not Matched');
                setLoading(false);
            }
        }
        e.preventDefault();
    }
    return (
        <div className="RoomContainer">
            {error ?
                <CustomBox boxName="error_box" hidden={false} error_message={error} />
                :
                <CustomBox boxName="error_box" hidden={true} error_message={error} />
            }
            <h2>Chatroom Signup</h2>
            <form className="RoomForm" onSubmit={signup}>
                <p className='intro'>Created By Shivansh Shrivastava</p>
                <label htmlFor="">Username: </label>
                <input className="input-username" type="text" onChange={(e) => setUsername(e.target.value)} value={username} />

                <label htmlFor="">Password: </label>
                <input className="input-room-name" type="password" onChange={(e) => setPassword(e.target.value)} value={password} />
                <label htmlFor="">Confirm Password: </label>
                <input className="input-room-name" type="password" onChange={(e) => setConfirmPassword(e.target.value)} value={confirmPassword} />
                <div>
                    <input className='input-submit' type="submit" value="Signup" />
                    <Link to='/'>
                        <input className='input-submit' type="button" value="Go To Login" />
                    </Link>
                    {loading ? <CircularProgress/> : null}
                </div>
            </form>
        </div>
    )
}

// useEffect(() => {
//     axios({
//         method: 'POST',
//         url: api_url,
//         headers: { 'Content-Type': 'application/json' },
//         data: { 'username': username, 'password': password }
//     }).then((response) => {
//         let res = response.data;
//         if (res.status === true)
//             alert('Awesome');
//         else {
//             alert(res.error);
//         }
//     }).catch((error) => {
//         console.log(error.message)
//     })
// }, [])
