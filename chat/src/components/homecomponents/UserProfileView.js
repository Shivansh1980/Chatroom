import React,{useEffect, useState} from 'react'
import ReactDOM from 'react-dom'
import { ImCross } from 'react-icons/im'
import { BsPlus } from 'react-icons/bs'
import { ApiRequester } from '../../utils/utils'
import store from '../../redux/store'
import { Provider, useDispatch, useSelector } from 'react-redux'
import { show_info } from '../../styles/js/AlterCSS'
import * as Actions from '../../redux/actions'
import { api_url } from '../../global'
import CreateRoomView from '../popup/CreateRoomView'

function UpdateProfileView(props) {
    let user = props.user;
    let self = props.self;
    let root = document.getElementById('root');

    const dispatch = useDispatch();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const [name, setName] = useState('');
    const [pic, setPic] = useState(null);

    function updateProfile(e) {
        if (name || pic) {
            let formData = new FormData();
            formData.append('newname', name);
            formData.append('pic', pic);
            let api = new ApiRequester(username, password);
            api.setMethod('post');
            api.setData(formData);
            api.makeRequest('/api/chat/user/updateprofile/').then((response) => {
                let res = response.data;
                if (res.status == true) {
                    show_info({
                        title: 'Profile',
                        content: 'Profile Updated Successfully',
                        time: 2,
                        textColor:'green'
                    })
                    dispatch(Actions.updateUser(res.data.user));
                    removeSelf(e);
                }
                else {
                    show_info({
                        title: 'Failed',
                        content: 'Failed to Update',
                        time: 2,
                        textColor:'red'
                    })
                }
            });
        }
        else {
            alert("You can't leave any field empty")
        }
        e.preventDefault();
    }

    function removeSelf(e) {
        root.classList.remove('blur');
        ReactDOM.unmountComponentAtNode(self);
        self.remove();
    }

    function logout(e) {
        localStorage.removeItem('username');
        localStorage.removeItem('password');
        window.location.reload();
    }
    
    useEffect(() => {
        let data = store.getState().userData;
        setUsername(data.username);
        setPassword(data.password);
    }, []);

    return (
        <>
            {root.classList.add('blur')}
            <div className="update_profile__cancel" onClick={removeSelf}>
                <ImCross />
            </div>
            <div className="update_profile__header">
                <img src={user.pic ? api_url+user.pic : 'https://www.kindpng.com/picc/m/24-248253_user-profile-default-image-png-clipart-png-download.png'} />
                <h3 align="center">{user.name}</h3>
                <button className="update_profile__header_button" onClick={ logout }>Logout</button>
            </div>
            <form className="update_profile__form" onSubmit={updateProfile}>
                <input id={"user_name_input" + user.id} placeholder="Enter new name..." name="username" value={name} onChange={(e) => setName(e.target.value)}/>
                <label for={"user_pic_input" + user.id}>Edit Profile Picture</label>
                <input id={"user_pic_input" + user.id} type="file" name="picture" onChange={(e) => setPic(e.target.files[0]) }/>
                <input type="submit" value="Update" />
            </form>
        </>
    )
}

export default function UserProfileView(props) {
    let user = useSelector((state) => state.userData.user);
    
    function handleOpen(e) {
        let div = document.createElement('div');
        div.id = 'update_profile_' + user.id;
        div.classList.add('absolute_center');
        document.body.appendChild(div);
        ReactDOM.render(
            <Provider store={store}>
                <UpdateProfileView self={div} user={user} />
            </Provider>, div
        );
        div.classList.add('update_profile_container');
    }
    function handleCreateRoom(e) {
        let div = document.createElement('div');
        div.id = 'create_roomm_' + user.id;
        div.classList.add('absolute_center');
        document.body.appendChild(div);
        ReactDOM.render(
            <Provider store={store}>
                <CreateRoomView self={div} user={user} />
            </Provider>, div
        );
        div.classList.add('create_room_container');
    }

    if (!user) {
        return (
            <h2>No User Specified</h2>
        )
    }
    return (
        <div className="user_profile_container">
            <div className="user_profile__image" onClick={handleOpen}>
                <img id={'user_image_' + user.id} src={user.pic != null && user.pic != '' ? api_url+user.pic : 'https://www.kindpng.com/picc/m/24-248253_user-profile-default-image-png-clipart-png-download.png'} />
            </div>
            <p className="user_profile__p">{user.name}</p>
            <div className="user_profile__addroom" onClick={handleCreateRoom}>
                <BsPlus size={ 20 }/>
            </div>

        </div>
    )
}
