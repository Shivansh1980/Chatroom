import rootReducer, { initialRoomState} from './reducers'
import { configureStore } from '@reduxjs/toolkit'

const store = configureStore({
    reducer: rootReducer,
    preloadedState: initialRoomState
})

// const store = createStore(rootReducer, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());
export default store;