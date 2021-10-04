export const updateLoading = (loading) => {
    return {
        type:'UpdateLoading',
        payload: loading
    }
}
export const updateRooms = (rooms) => {
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