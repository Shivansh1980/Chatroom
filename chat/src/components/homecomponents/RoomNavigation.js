import React from 'react';
import { api_url } from '../../global'
import {useSelector, useDispatch, connect} from 'react-redux'
import { BsPlus } from 'react-icons/bs'
import { MdDelete } from 'react-icons/md'
import { BiShow } from 'react-icons/bi';
import UserProfileView from './UserProfileView'
import ReactDOM from 'react-dom'
import UsersList from '../popup/UsersList'
import store from '../../redux/store'
import { Provider } from 'react-redux'
import { ApiRequester } from '../../utils/utils'
import { show_info } from '../../styles/js/AlterCSS';
import { useMediaQuery } from 'react-responsive';
import ImageView from '../containers/ImageView';

function RoomNavigation(props) {
    const dispatch = useDispatch();

    const isTabletOrMobile = useMediaQuery({ query: '(max-width: 800px)' })
    //These Room are Updated By Home Component
    const userData = useSelector(state => state.userData);

    const myState = useSelector(state => state.roomNavState);

    // const classes = makeStyles(homeStyles)();

    function handleRoomChange(e, room_id = null) {
        if (e.target.className == "roomcard__image") return;
        dispatch({ type: 'UpdateCurrentRoom', payload: room_id ? room_id : e.target.id });
    }

    function removeUsersFromGroup(selectedUsers, group_id) {
        let api = new ApiRequester(userData.username, userData.password);
        api.setMethod('POST');
        api.setData({ users: selectedUsers, group_id: group_id });
        api.makeRequest('/api/chat/command/remove_users_from_group/')
            .then((response) => {
                let res = response.data;
                if (res.status == true) {
                    if (res.removed_users.length > 0) show_info({ title: 'Users', content: 'Selected Users Deleted Successfully', color: 'green', time: 5 })
                    else show_info({ title: 'Users', content: 'Selected Users Not Exists In Group', color: 'green', time: 5 })
                } else {
                    show_info({ title: 'Users', content: res.error, color: 'red', time: 5 })
                }
            })
            .catch((error) => {
                show_info({ title: 'Users', content: 'something wrong happened', color: 'red', time: 5 })
            })
    }

    function addUsersToGroup(selectedUsers, group_id) {
        let api = new ApiRequester(userData.username, userData.password);
        api.setMethod('POST');
        api.setData({ users: selectedUsers, group_id: group_id });
        api.makeRequest('/api/chat/command/add_users_to_group/')
            .then((response) => {
                let res = response.data;
                if (res.status == true) {
                    if(res.added_users.length > 0) show_info({ title: 'Users', content: 'Selected Users Added Successfully', color: 'green', time: 5 })
                    else show_info({ title: 'Users', content: 'Selected Users Already Exists In Group', color: 'green', time: 5 })
                } else {
                    show_info({ title: 'Users', content: res.error, color: 'red', time: 5 })
                }
            })
            .catch((error) => {
                show_info({ title: 'Users', content: error, color: 'red', time: 5 })
            })
    }

    function showUsersContainer(e, mode, room_id=null) {
        let body = document.getElementsByTagName('body')[0];
        let div = document.createElement('div');
        div.id = 'user_list_container_'+ room_id ? room_id : e.target.id;
        div.className = "user_list_container absolute_center flex_center_column";
        body.appendChild(div);

        if (mode == "add_user") {
            ReactDOM.render(
                <Provider store={store}>
                    <UsersList
                        heading="Add Users To Group"
                        mode="add_users"
                        onComplete={addUsersToGroup}
                        self={div}
                    />
                </Provider>,
                div);
        } else if (mode == "remove_user") {
            ReactDOM.render(
                <Provider store={store}>
                    <UsersList
                        heading="Remove Users From Group"
                        mode="remove_users"
                        onComplete={removeUsersFromGroup}
                        self={div}
                    />
                </Provider>,
                div);
        } else if (mode == "show_group_users") {
            ReactDOM.render(
                <Provider store={store}>
                    <UsersList
                        heading="List of Users in Group"
                        mode="show_users"
                        group_id={room_id}
                        self={div} />
                </Provider>,
                div);
        }
    }

    function showImage(img, src=null) {
        let div = document.createElement('div');
        div.class = "relative";
        div.id = "image_view_" + img.id;
        let body = document.getElementsByTagName("body")[0];
        body.appendChild(div);
        ReactDOM.render(<ImageView self={div} image={img ? img : src} />, div);
    }

    let data = [];
    let rooms = myState.rooms;
    //if mystate.loading is true that means the available rooms being fetched from server. 
    //You can see the implementation of this in Home Component.
    if (!myState.loading) {
        for (let i = 0; i < rooms.length; i++) {
            if (rooms[i].is_group) {
                data.push(
                    <div key={'group_' + rooms[i].id} className="roomcard group lightblue">
                        <div onClick={e => handleRoomChange(e, 'group_'+rooms[i].id)}>
                            <div className="group_card_conntainer">
                                <img
                                    id={ 'group_card_image_' + rooms[i].id}
                                    src={rooms[i].image != null && rooms[i].image != '' ? api_url + rooms[i].image : 'https://www.kindpng.com/picc/m/24-248253_user-profile-default-image-png-clipart-png-download.png'}
                                    className="roomcard__image"
                                    onClick={e => handleRoomChange(e, 'group_'+rooms[i].id)}
                                />
                            </div>
                            <p id={'group_' + rooms[i].id} className="roomcard__p">{rooms[i].group_name}</p>
                        </div>
                        {rooms[i].admin == userData.user.id ?
                            <div id={rooms[i].id} className="flex_center_column group_action_button_container">
                                <div id={rooms[i].id} className="group_plus_user_icon group_action_button" onClick={e => showUsersContainer(e, "add_user", rooms[i].id)}>
                                    {isTabletOrMobile ? null : "Add Users"} <BsPlus size={20} />
                                </div>
                                <div id={rooms[i].id} className="group_delete_user_icon group_action_button" onClick={e => showUsersContainer(e, "remove_user", rooms[i].id)}>
                                    {isTabletOrMobile ? null : "Delete Users"} <MdDelete size={20} />
                                </div>
                                <div id={rooms[i].id} className="group_delete_user_icon group_action_button" onClick={e => showUsersContainer(e, "show_group_users", rooms[i].id)}>
                                    {isTabletOrMobile ? null : "Show Users"} <BiShow size={20} />
                                </div>
                            </div>
                            :
                            null
                        }
                    </div>
                );
            } else {
                let user = userData.user.id == rooms[i].user1.id ? rooms[i].user2 : rooms[i].user1;
                data.push(
                    <div key={'room_card_container_'+rooms[i].id} id={'room_card_container_' + rooms[i].id} className="roomcard relative" onClick={e => handleRoomChange(e, 'room_' + rooms[i].id)}>
                        <div id={'room_' + rooms[i].id} className="room_card_image_container">
                            <img
                                src={user.pic != null && user.pic != '' ? api_url + user.pic : 'https://www.kindpng.com/picc/m/24-248253_user-profile-default-image-png-clipart-png-download.png'}
                                className="roomcard__image"
                                onClick={(e) => {
                                    let image = e.target;
                                    showImage(image);
                                }}
                            />
                        </div>
                        <p id={'room_name_' + rooms[i].id} className="roomcard__p">{rooms[i].room_name} </p>
                        <p style={{ position: 'absolute', top: 1, right: 1, zIndex: 1, fontSize: "20px", color:"green" }}>{user.name}</p>
                    </div>
                );
            }
        }
    }
    return (
        <>
            <div className="roomlistheader">
                <UserProfileView />
            </div>
            <div className="roomcontainer__list__searchbox">
                <input placeholder="Search room here..." className="search_input" type="text" />
            </div>
            {data}
        </>
    )
}

const mapStateToProps = (state) => ({
    roomState: state.changeRoom
});

export default connect(mapStateToProps)(RoomNavigation)