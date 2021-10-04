import React, {useState, useEffect} from 'react'
import {ApiRequester} from '../utils/utils'
import { useSelector, useDispatch, connect } from 'react-redux';
import { CustomBox } from './minicomponents/CustomBox'
import RoomNavigation from './homecomponents/RoomNavigation'
import Room from './homecomponents/Room'
import { useMediaQuery } from 'react-responsive';
import * as Actions from '../redux/actions'
import { BiMenu } from 'react-icons/bi'


function Home(props) {
    let username = props.username;
    let password = props.password;

    let api = new ApiRequester(username, password);
    
    const dispatch = useDispatch();
    const [drawer, setDrawer] = useState(false);
    const state = useSelector(state => state.roomNavState);
    const roomState = useSelector(state => state.roomState);
    const isTabletOrMobile = useMediaQuery({ query: '(max-width: 600px)' })
    
    useEffect(() => {

        dispatch({type: 'UpdateLoading',payload: true})
        dispatch(Actions.updateUsername(username));
        dispatch(Actions.updatePassword(password));

        api.setMethod('post');
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
        api.setMethod('get');
        api.makeRequest('/api/chat/user/').then((response) => {
            dispatch(Actions.updateUser(response.data));
        });
    }, []);
    useEffect(() => {
        if (roomState.currentRoom) {
            setDrawer(false);
        }
    }, [roomState]);

    function openCloseDrawer(e) {
        if (drawer) setDrawer(false);
        else setDrawer(true);
    }

    let header = null;
    if (!isTabletOrMobile) {
        header = <div id="room_navigation" className="roomcontainer__list layout">
            <RoomNavigation/>
        </div>
    } else {
        if (drawer)
            header =
                <div id="room_navigation" className="roomcontainer__list layout">
                    <RoomNavigation />
                </div>
        else
            header = null
    }
    
    let loading = state.loading;
    if (loading == false) {
        return (
            <>
                <div className="roomcontainer">
                    
                    {header}
                    <div className="roomcontainer__room layout">
                        <div className="roomheader">
                            {isTabletOrMobile ?
                                <div className="roomheader__menu_icon" onClick={openCloseDrawer}>
                                    <BiMenu size={40} />
                                </div> : null
                            }
                            <div className="roomheader__content">
                                <h2 align="center">Welcome To Chatroom</h2>
                                <p>Developer Shivansh Shrivastava</p>
                            </div>
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
