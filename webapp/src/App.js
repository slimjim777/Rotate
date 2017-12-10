import React, { Component } from 'react';
import MyRota from './components/MyRota';
import Login from './components/Login';
import Navigation from './components/Navigation';
import Person from './models/person';
import './App.css';

class App extends Component {

    constructor(props) {
        super(props)
        
        this.state = {
            user: {},
        }
    }

    getPermissions () {

        Person.permissions().then(function(response) {
            var user = JSON.parse(response.body).permissions;
            this.setState({user: user, canAdministrate: this.setCanAdministrate(user)});
        });
    }


    render() {

        var path = window.location.pathname;

        return (
          <div id="main" className="container-fluid" role="main">

            {path === '/' ?
              <Login />
              :
              <Navigation user={this.state.user} />
            }

            {path === '/rota' ?
              <MyRota user={this.state.user} />
              : ''
            }

          </div>
        );
    }
}

export default App;
