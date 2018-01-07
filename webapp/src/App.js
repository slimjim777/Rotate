import React, { Component } from 'react';
import MyRota from './components/MyRota';
import Songs from './components/Songs';
import Events from './components/Events';
import EventDetail from './components/EventDetail';
import EventOverview from './components/EventOverview';
import People from './components/People';

import Login from './components/Login';
import Navigation from './components/Navigation';
import {sectionFromPath, subsectionFromPath, subSubsectionFromPath} from './components/Utils';
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
        var section = sectionFromPath(window.location.pathname);
        var subsection = subsectionFromPath(window.location.pathname);
        var subsubsection = subSubsectionFromPath(window.location.pathname);
        console.log('***', path)
        console.log('***', section, subsection)

        return (
          <div id="main" className="container-fluid" role="main">

            {section === '' ? <Login /> : <Navigation user={this.state.user} active={section} />}

            {(section === 'rota') ? <MyRota user={this.state.user} id={subsection} /> : ''}
            {section === 'people' ? <People user={this.state.user} /> : ''}
            {section === 'songs' ? <Songs user={this.state.user} /> : ''}
            {((section === 'events') && (!subsection)) ? <Events user={this.state.user} /> : ''}
            {((section === 'events') && (subsubsection === 'overview')) ? <EventOverview modelId={subsection} user={this.state.user} /> : ''}
            {((section === 'events') && (subsection)) ? <EventDetail modelId={subsection} user={this.state.user} onDate={subsubsection} /> : ''}

          </div>
        );
    }
}

export default App;
