import React, { Component } from 'react';
import {Modal, Button} from 'react-bootstrap'
//var Modal = require("react-bootstrap").Modal;
//var Button = require("react-bootstrap").Button;

class Dialog extends Component {

  render() {
    var index = 0;
    return (
      <div className="static-modal">
        <Modal.Dialog>
          <Modal.Header>
            <Modal.Title>{this.props.title}</Modal.Title>
          </Modal.Header>

          <Modal.Body>
          {this.props.messages.map(function(m) {
            index += 1;
            return (
              <span key={index}>{m}<br /></span>
            );
          })}
          </Modal.Body>

          <Modal.Footer>
            <Button onClick={this.props.onClick} bsStyle="primary">Close</Button>
          </Modal.Footer>

        </Modal.Dialog>
      </div>
    )
  }
};

export default Dialog;
