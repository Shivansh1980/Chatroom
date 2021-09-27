import React, {useState, useEffect} from 'react'
import { homeStyles } from '../styles/ChatStyles'
import { api_url } from '../global'
import {ApiRequester} from '../utils/utils'
import { useSelector, useDispatch, connect } from 'react-redux';
import { CustomBox } from '../minicomponents/CustomBox'
import RoomNavigation from './homecomponents/RoomNavigation'
import Room from './homecomponents/Room'

import * as Actions from '../redux/actions'

function Home(props) {
    let username = props.username;
    let password = props.password;

    let api = new ApiRequester(username, password);
    
    const dispatch = useDispatch();
    const state = useSelector(state => state.navigationState);
    
    useEffect(() => {
        
        dispatch({type: 'UpdateLoading',payload: true})
        dispatch(Actions.updateUsername(username));
        dispatch(Actions.updatePassword(password));

        api.setMethod('get');
        api.makeRequest('/api/chat/command/get_saved_rooms/').then((response) => {
            let res = response.data;
            if (res.status == true) {
                dispatch(Actions.updateLoading(false))
                dispatch(Actions.updateRooms(res.data));
            }
            else {
                localStorage.removeItem('username');
                localStorage.removeItem('password');
                dispatch(Actions.updateLoading(false));
            }
            
        }).catch((error) => {
            dispatch(Actions.updateError(error.message));
        });
        api.makeRequest('/api/chat/user/').then((response) => {
            dispatch(Actions.updateUser(response.data));
        });
    }, []);
    
    let loading = state.loading;
    if (loading == false) {
        return (
            <>
                <div className="roomcontainer">
                    <div className="roomcontainer__list">
                        <RoomNavigation />
                    </div>
                    <div className="roomcontainer__room">
                        <div className="roomheader">
                            <h1 align="center">Welcome To Chatroom</h1>
                            <p>Developer Shivansh Shrivastava</p>
                        </div>
                        <Room />
                    </div>
                </div>
            </>
        )
    }
    else {
        return (<CustomBox boxName="loader" hidden={false} />)
    }
}
const mapStateToProps = (state) => ({
    roomState:state.changeRoom
});

export default connect(mapStateToProps)(Home)
