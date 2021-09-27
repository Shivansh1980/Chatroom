import React, { useState, useEffect } from 'react'
import { api_url } from '../../global'
import {useSelector, useDispatch, connect} from 'react-redux'
import { homeStyles } from '../../styles/ChatStyles'
import { makeStyles } from '@material-ui/core/styles'
import UserProfileView from './UserProfileView'

function RoomNavigation(props) {
    const dispatch = useDispatch();
    const userData = useSelector(state => state.userData);
    const myState = useSelector(state => state.navigationState);

    const classes = makeStyles(homeStyles)();

    function handleRoomChange(e) {
        dispatch({ type: 'UpdateCurrentRoom', payload: e.target.id });
    }

    let data = [];
    let rooms = myState.rooms;
    if (!myState.loading) {
        for (let i = 0; i < rooms.length; i++) {
            if (rooms[i].image === null || rooms[i].image == '') {
                rooms[i].image = 'https://www.kindpng.com/picc/m/24-248253_user-profile-default-image-png-clipart-png-download.png';
            }
            let image = api_url + rooms[i].image;
            data.push(
                <div key={rooms[i].id} id={'room_' + rooms[i].id} className="roomcard" onClick={handleRoomChange}>
                    <div id={'room_' + rooms[i].id}>
                        <img src={image} className="roomcard__image" />
                    </div>
                    <p id={'room_' + rooms[i].id} className="roomcard__p">{rooms[i].room_name}</p>
                </div>
            );
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
