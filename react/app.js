'use strict';
var React = require('react');
import { render } from 'react-dom'
import { Router, Route, Link, browserHistory } from 'react-router'

var MyRota = require('./components/MyRota');
var People = require('./components/People');
var PeopleEdit = require('./components/PeopleEdit');
var PeopleNew = require('./components/PeopleNew');

var Events = require('./components/Events');
var EventDetail = require('./components/EventDetail');
var EventOverview = require('./components/EventOverview');

var SetLists = require('./components/SetLists');
var SetListNew = require('./components/SetListNew');
var SetList = require('./components/SetList');
var Songs = require('./components/Songs');
var Song = require('./components/Song');
var SongView = require('./components/SongView');

var RunsheetList = require('./components/RunsheetList');
var Runsheet = require('./components/Runsheet');
var RunsheetTemplate = require('./components/RunsheetTemplate');
var RunsheetTemplateNew = require('./components/RunsheetTemplateNew');


render((
  <Router history={browserHistory}>
    <Route path="/rota" component={MyRota}/>
    <Route path="/rota/me" component={MyRota}/>
    <Route path="/rota/person/:id" component={MyRota}/>
    <Route path="/rota/people" component={People}/>
    <Route path="/rota/people/new" component={PeopleNew}/>
    <Route path="/rota/people/:id/edit" component={PeopleEdit}/>

    <Route path="/rota/events" component={Events} />
    <Route path="/rota/events/:id" component={EventDetail} />
    <Route path="/rota/events/:id/overview" component={EventOverview} />
    <Route path="/rota/events/:id/:onDate" component={EventDetail} />

    <Route path="/rota/setlists" component={SetLists}/>
    <Route path="/rota/events/:id/:onDate/setlist" component={SetList} />
    <Route path="/rota/setlists/new" component={SetListNew} />
    <Route path="/rota/songs" component={Songs} />
    <Route path="/rota/songs/:id" component={Song}/>
    <Route path="/rota/songs/:id/attachments/:attachment_id" component={SongView}/>

    <Route path="/rota/runsheets" component={RunsheetList} />
    <Route path="/rota/events/:id/:onDate/runsheet" component={Runsheet} />
    <Route path="/rota/runsheets/templates/new" component={RunsheetTemplateNew} />
    <Route path="/rota/runsheets/templates/:id" component={RunsheetTemplate} />
  </Router>
), document.getElementById('app'));
