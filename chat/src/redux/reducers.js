import { combineReducers } from "redux";
import { changeRoomEvent } from "./actions"
import axios from 'axios';
import {createReducer} from '@reduxjs/toolkit'

export const initialRoomState = {

    rooms: [],
    loading: false,
    error: null,
    message_api: null,
}

const roomState = {
    loading: false,
    currentRoom: null
}
const userData = {
    username: '',
    password: '',
    user: null
}

const userDataReducer = createReducer(userData, (builder) => {
    builder.addCase('UpdateUsername', (state, action) => {
        state.username = action.payload;
    })
    builder.addCase('UpdatePassword', (state, action) => {
        state.password = action.payload;
    })
    builder.addCase('UpdateUser', (state, action) => {
        state.user = action.payload;
    })
});

const navigationStateReducer = createReducer(initialRoomState, (builder) => {
    builder.addCase('UpdateRooms', (state, action) => {
        state.rooms = action.payload;
    })
    builder.addCase('UpdateLoading', (state, action) => {
        state.loading = action.payload;
    })
    builder.addCase('UpdateError', (state, action) => {
        state.error = action.payload;
    })
    builder.addCase('UpdateState', (state, action) => {
        state.state = action.payload;
    })
    builder.addCase('UpdateMessageApi', (state, action) => {
        state.message_api = action.payload;
    })
})

const roomStateReducer = createReducer(roomState, (builder) => {
    builder.addCase('UpdateRoomLoading', (state, action) => {
        state.roomLoading = action.payload;
    })
    builder.addCase('UpdateCurrentRoom', (state, action) => {
        state.currentRoom = action.payload;
    })
})

const rootReducer = combineReducers({
    roomNavState: navigationStateReducer,
    roomState: roomStateReducer,
    userData: userDataReducer,
});

export default rootReducer;