import React, { useState, useEffect } from 'react'
import { ApiRequester } from '../../utils/utils'
import ReactDOM from 'react-dom';
import { api_url } from '../../global';
import {useSelector, useDispatch} from 'react-redux'
import { CircularProgress } from '@material-ui/core'
import { ImCross } from 'react-icons/im'
import {getCookie} from '../../utils/ChatMessage'

export default function UsersList(props) {
    let self = props.self;
    let mode = props.mode;

    let userData = useSelector(state => state.userData);

    const [userViews, setUserViews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchedUsername, setSearchedUsername] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);

    function selectionComplete() {
        let group_id = self.id;
        //user_list_container_
        if (group_id.startsWith('user_list_container_')) group_id = group_id.substring(20, group_id.length);
        props.onComplete(selectedUsers, group_id);
        removeSelf();
    }

    function removeSelf() {
        ReactDOM.unmountComponentAtNode(self);
        self.remove();
    }

    function get_user_views(users) {
        let views = [];
        for (let i = 0; i < users.length; i++) {
            views.push(
                <div
                    id={"user_" + users[i].id}
                    key={"user_" + users[i].id}
                    className={
                        selectedUsers.indexOf(users[i].id) == -1 ?
                            "create_room_profileview user_profile_container"
                            :
                            "create_room_profileview user_profile_container black"
                    }
                    onClick={(e) => {
                        let users = selectedUsers;
                        let idx = users.indexOf(e.target.id);
                        if (idx != -1) {
                            users.splice(idx, 1);
                            e.target.style.color = 'black';
                        } else {
                            e.target.style.color = 'green';
                            users.push(e.target.id);
                        }
                        setSelectedUsers(users);
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

    useEffect(() => {
        let api = new ApiRequester(userData.username, userData.password);
        if (mode == "add_users" || mode == "remove_users" || mode == "add_user" || mode == "remove_user") {
            setLoading(true);
            api.setMethod('POST')
            api.setData({ 'username': searchedUsername })
            api.makeRequest('/api/chat/search_user/').then((response) => {
                let views = get_user_views(response.data.data);
                setUserViews(views);
                setLoading(false);
            }).catch((error) => {
                setLoading(false);
            })

        } else if (mode == "show_users") {
            setLoading(true);
            let api = new ApiRequester(userData.username, userData.password);
            api.setMethod('POST');
            if (props.group_id) api.setData({ 'group_id': props.group_id });
            else if (props.room_id) api.setData({ 'room_id': props.room_id });

            api.makeRequest('/api/chat/command/get_users_by_group_id/').then((response) => {
                console.log(response.data);
                let views = get_user_views(response.data.data);
                setUserViews(views);
                setLoading(false);
            }).catch((error) => {
                setLoading(false);
            });
        }
    }, [searchedUsername]);

    return (
        <>  
            <div className="update_profile__cancel" onClick={removeSelf}>
                <ImCross />
            </div>
            {mode=="add_users" || mode == "remove_users" ?
                <div className="user_search_container">
                    <input id="user_search__input" type="text" placeholder="Search for users.." value={searchedUsername} onChange={(e) => setSearchedUsername(e.target.value)} />
                    <button onClick={selectionComplete}>Select Users</button>
                </div>
                :
                null
            }
            {loading ?
                <div className="flex_center_row">
                    <CircularProgress />
                </div>
                :
                <div className="user_search__list">
                    {userViews}
                </div>

            }
        </>
    )
}
