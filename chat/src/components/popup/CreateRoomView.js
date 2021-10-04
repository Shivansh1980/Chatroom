import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux';
import ReactDOM from 'react-dom'
import { ApiRequester } from '../../utils/utils'
import {show_info} from '../../styles/js/AlterCSS'
import { api_url } from '../../global'
import { CircularProgress } from '@material-ui/core';
import { ImCross } from 'react-icons/im'
import {updateRooms} from '../../redux/actions'

export default function CreateRoomView(props) {
    let self = props.self;
    let root = document.getElementById('root');
    let dispatch = useDispatch();
    let userData = useSelector(state => state.userData);

    const [loading, setLoading] = useState(false);
    const [roomForm, setRoomForm] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [userViews, setUserViews] = useState([]);
    const [searchedUsername, setSearchedUsername] = useState('');

    function get_user_views(users) {
        let views = [];
        for (let i = 0; i < users.length; i++) {
            views.push(
                <div
                    id={"user_" + users[i].id}
                    key={"user_" + users[i].id}
                    className="create_room_profileview user_profile_container"
                    onClick={(e) => {
                        setRoomForm(true);
                        setSelectedUserId(e.target.id);
                    }}
                >
                    <div className="create_room_profileview__image user_profile__image">
                        <img src={users[i].pic != null && users[i].pic != '' ? api_url + users[i].pic : 'https://www.kindpng.com/picc/m/24-248253_user-profile-default-image-png-clipart-png-download.png'} />
                    </div>
                    <p id={"user_" + users[i].id} className="create_room_profileview__p user_profile__p">{users[i].name}</p>
                </div>
            )
        }
        return views;
    }

    function createRoom(e) {
        setLoading(true);
        e.preventDefault();
        let room_image = e.target.room_image.files[0];
        let room_name = e.target.room_name.value;
        let user2_id = selectedUserId;
        console.log(room_image);
        //user_1
        user2_id = user2_id.substring(5, selectedUserId.length);
        user2_id = parseInt(user2_id);

        let formData = new FormData();
        formData.append('room_name', room_name);
        formData.append('user2_id', user2_id);
        formData.append('room_image', room_image);
        
        let api = new ApiRequester(userData.username, userData.password);
        api.setMethod('POST');
        api.setData(formData);
        api.setHeaders({'Content-Type':'multipart/form-data'});
        api.makeRequest('/api/chat/command/create_room/').then((response) => {
            let res = response.data;
            if (res.status == true) {
                dispatch(updateRooms(res.data));
                setLoading(false);
                show_info({
                    title: 'Room',
                    content: 'Room created successfully',
                    color: 'green',
                    time: 4
                })
                removeSelf();
            }
            else {
                show_info({
                    title: 'Room',
                    content: res.error,
                    color: 'red',
                    time: 4
                })
                setLoading(false);
            }
        })
        e.preventDefault();
    }

    function searchUser(e) {
        setLoading(true);
        setSearchedUsername(e.target.value);
        let api = new ApiRequester(userData.username, userData.password);
        api.setMethod('POST')
        api.setData({ 'username': searchedUsername })
        api.makeRequest('/api/chat/search_user/').then((response) => {
            let views = get_user_views(response.data.data);
            setUserViews(views);
            setLoading(false);
        }).catch((error) => {
            setLoading(false);
        })
        
    }
    useEffect(() => {
        setLoading(true);
        let api = new ApiRequester(userData.username, userData.password);
        api.setMethod('post');
        api.makeRequest('/api/chat/command/get_users/').then((response) => {
            let users = response.data.data;
            let views = get_user_views(users);
            setLoading(false);
            setUserViews(views);
        }).catch((error) => {
            setLoading(false);
        })
        
    }, []);

    function removeSelf(e) {
        root.classList.remove('blur');
        ReactDOM.unmountComponentAtNode(self);
        self.remove();
    }

    return (
        <>
            {root.classList.add('blur')}
            <div className="update_profile__cancel" onClick={removeSelf}>
                <ImCross />
            </div>
            {!roomForm ?
                <div>
                    <div className="user_search_container">
                        <input id="user_search__input" type="text" placeholder="Search for users.." value={searchedUsername} onChange={(e) => { searchUser(e); setSearchedUsername(e.target.value); }} />
                    </div>
                    {loading ?
                        <div className="flex_center_row">
                            <CircularProgress />
                        </div>
                        :
                        <div className="user_search__list">
                            {userViews}
                        </div>
                    
                    }
                </div>
                :
                <div>
                    <form className="create_room__form" onSubmit={createRoom}>
                        <label htmlFor='input_room_name'>Enter Room Name</label>
                        <input className="create_room__form__input" name="room_name" id="input_room_name" type='text' placeholder="Enter room name ..." />

                        <label htmlFor='input_room_image'>Select Room Picture</label>
                        <input id="input_room_image" className="create_room__form__input" accept="image/*" name="room_image" type="file" />
                        
                        <input className="create_room__form__button" type="submit" value="Create Room" />
                    </form>
                    {loading ?
                        <div className="flex_center_row">
                            <CircularProgress />
                        </div>
                    : null}
                </div>
            }
        </>
    )
}
