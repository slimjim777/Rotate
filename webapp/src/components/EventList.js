import React, { Component } from 'react';


class EventList extends Component {

    render() {
        return (
            <div className="panel panel-default">
                <div className="panel-heading">
                    <h3 className="panel-title">Events</h3>
                </div>
                <div className="panel-body table-responsive">
                    <table className="table table-striped">
                        <thead>
                        <tr>
                            <th>Name</th><th></th>
                        </tr>
                        </thead>
                        <tbody>
                        {this.props.events.map(function(ev) {
                            return (
                                <tr key={ev.id}>
                                    <td><a href={'/events/' + ev.id}>{ev.name}</a></td><td><a href={'/events/'.concat(ev.id, '/overview')}>Overview</a></td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

}

export default EventList;
