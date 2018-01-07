import React, { Component } from 'react';
import {Modal} from "react-bootstrap";
import {Button} from "react-bootstrap";


class DialogConfirm extends Component {

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
            <Button onClick={this.props.onClickSave} bsStyle="primary">OK</Button>
            <Button onClick={this.props.onClickCancel} bsStyle="default">Cancel</Button>
          </Modal.Footer>

        </Modal.Dialog>
      </div>
    )
  }
};

export default DialogConfirm;
