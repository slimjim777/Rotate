import React, { Component } from 'react';
import MyRota from './components/MyRota';
import Songs from './components/Songs';

import Login from './components/Login';
import Navigation from './components/Navigation';
import Person from './models/person';
import './App.css';

class App extends Component {

    constructor(props) {
        super(props)
        
        this.state = {
            user: {},
            canAdministrate: false,
        }
        
        this.getPermissions()
    }

    getPermissions () {

        Person.permissions().then((response) => {
            var user = JSON.parse(response.body).permissions;
            console.log('+++', user)
            this.setState({user: user});
        });
    }

    canAdministrate() {
        if (!this.state.user) {
            return false;
        }
        if (this.state.user.role === 'admin') {
            return true;
        }
        if (!this.props.params.id) {
            return false;
        }
        var eventId = parseInt(this.props.params.id, 10);
        for (var i=0; i < this.state.user.events_admin.length; i++) {
            if (this.state.user.events_admin[i].id === eventId) {
                return true;
            }
        }
        return false;
    }

    render() {

        var path = window.location.pathname;
        console.log('---', this.state.user)

        return (
          <div id="main" className="container-fluid" role="main">

            {path === '/' ?
              <Login />
              :
              <Navigation user={this.state.user} />
            }

            {path === '/rota' ? <MyRota user={this.state.user} /> : ''}
            {path === '/rota/songs' ? <Songs user={this.state.user} /> : ''}

          </div>
        );
    }
}

export default App;
