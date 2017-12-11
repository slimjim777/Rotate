import React, { Component } from 'react';
import moment from 'moment';
import PeopleFilter from '../components/PeopleFilter';


class PeopleList extends Component {

    constructor(props) {
        super(props)
        this.state = {isEditing: false, personId: null, isAdmin: false};
    }

    handleEditClick(e) {
        e.preventDefault();
        this.setState({personId: parseInt(e.target.getAttribute('data-key'), 10), isEditing: true});
    }

    renderActive(active) {
        if (active) {
            return (
                <span className="glyphicon glyphicon-ok"></span>
            );
        }
    }

    renderHeader () {
        if (this.state.isAdmin) {
            return (
                <thead>
                    <tr>
                        <th></th><th className="left-align">Name</th><th>Active</th><th>Guest</th><th>Permissions</th><th>Last Login</th>
                    </tr>
                </thead>
            );
        } else {
            return (
                <thead>
                    <tr>
                        <th className="left-align">Name</th><th>Active</th><th>Guest</th><th>Last Login</th>
                    </tr>
                </thead>
            );
        }
    }

    renderEditAction(person) {
        if (this.state.isAdmin) {
            return (
                <td>
                    <a href={'/people/' + person.id + '/edit'} className="btn btn-default">Edit</a>
                </td>
            );
        }
    }

    renderPermissions(person) {
        if (this.state.isAdmin) {
            return (
                <td>{person.user_role}{person.music_role ? ' | ' + person.music_role : ''}</td>
            );
        }
    }

    render() {
        var self = this;

        return (
            <div className="panel panel-default">
                <div className="panel-heading">
                    <h3 className="panel-title">People</h3>
                </div>
                <div className="panel-body table-responsive">
                    <div>
                        <PeopleFilter onFilterChange={this.props.onFilterChange} />
                    </div>

                    <div className="table-responsive">
                        <div className="col-xs-12 col-md-12 col-lg-12"><p>{this.props.people.length} records.</p></div>
                        <table className="table table-striped">
                            {this.renderHeader()}
                            <tbody>
                            {this.props.people.map(function(p) {
                                return (
                                    <tr key={p.id}>
                                        {self.renderEditAction(p)}
                                        <td className="left-align"><a href={'/person/' + p.id}>{p.firstname} {p.lastname}</a></td>
                                        <td>{self.renderActive(p.active)}</td>
                                        <td>{self.renderActive(p.guest)}</td>
                                        {self.renderPermissions(p)}
                                        <td>{p.last_login ? moment(p.last_login).format('DD/MM/YYYY HH:mm') : ''}</td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }
}

export default PeopleList;
