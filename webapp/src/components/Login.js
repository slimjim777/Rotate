import React, { Component } from 'react';
import LoginHeader from './LoginHeader';
import Person from '../models/person';

class Login extends Component {

    constructor(props) {
        super(props)
        
        this.state = {
            email: '',
            password: '',
            message: null,
        }
    }

    handleEmail = (e) => {
        this.setState({email: e.target.value});
    }
    
    handlePassword = (e) => {
        this.setState({password: e.target.value});
    }

    handleSubmit = (e) => {
        e.preventDefault()
        console.log('Submit');
        Person.login(this.state.email, this.state.password).then((response) => {
            var resp = JSON.parse(response.body);
            if (resp.response === 'Success') {
                window.location = '/rota/songs'
            } else {
                this.setState({message: resp.message})
            }
        });
    }

    renderMessage() {
        if (this.state.message) {
          return (
            <div className="alert alert-danger">
              {this.state.message}
            </div>
          )
        }
    }

    render() {
        return (
          <div>
            <LoginHeader />
            <div className="jumbotron">
                <div className="container">
                    <h1>Life Church Music</h1>
                    {this.renderMessage()}
                    <div>
                      <form action="/login/authorized" method="POST">
                        <div className="form-group">
                          <label for="email">Email address</label>
                          <input type="email" value={this.state.email} onChange={this.handleEmail} className="form-control" name="email" placeholder="Email" />
                        </div>
                        <div className="form-group">
                          <label for="password">Password</label>
                          <input type="password" value={this.state.password} onChange={this.handlePassword} className="form-control" name="password" placeholder="Password" />
                        </div>

                        <button type="submit" onClick={this.handleSubmit} className="btn btn-default">Login</button>
                      </form>

                    </div>
                </div>
            </div>
          </div>
        )
    }
}

export default Login