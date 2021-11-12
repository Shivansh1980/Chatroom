export const updateLoading = (loading) => {
    return {
        type:'UpdateLoading',
        payload: loading
    }
}
export const updateRooms = (groups_and_rooms) => {
    let rooms_data = groups_and_rooms.rooms_data;
    let groups_data = groups_and_rooms.groups_data;
    let rooms = [];
    groups_data.map(group => {
        group['is_group'] = true;
        rooms.push(group);
    });
    rooms_data.map(room => {
        room['is_group'] = false;
        rooms.push(room);
    });
    return {
        type: 'UpdateRooms',
        payload: rooms
    }
}
export const updateError = (error) => {
    return {
        type: 'UpdateError',
        payload: error
    }
}

export const updateCurrentRoom = (room) => {
    return {
        type: 'UpdateCurrentRoom',
        payload: room
    }
}
export const updateUsername = (username) => {
    return {
        type: 'UpdateUsername',
        payload: username
    }
}
export const updatePassword = (password) => {
    return {
        type: 'UpdatePassword',
        payload: password
    }
}
export const updateState = (state) => {
    return {
        type: 'UpdateState',
        payload: state
    }
}
export const updateMessageApi = (message_api) => {
    return {
        'type': 'UpdateMessageApi',
        payload: message_api
    }
}

export const updateUser = (user) => {
    return {
        type: 'UpdateUser',
        payload: user
    }
}

export const updateRoomLoading = (loading) => {
    return {
        type: 'UpdateRoomLoading',
        payload: loading
    }
}