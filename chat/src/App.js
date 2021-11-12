import React from 'react'
import Login from './components/Login'
import Signup from './components/Signup'
import './styles/css/App.scss'
import './styles/css/Android.css'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import store from './redux/store';
import { Provider } from 'react-redux';

function App() {
  
  return (
    <>
      <Provider store={store}>
        <Router>
          <Switch>
            <Route path='/signup/' component={Signup} />
            <Route path='/' component={Login} />
          </Switch>
        </Router>
      </Provider>
    </>
  );
}

export default App;
