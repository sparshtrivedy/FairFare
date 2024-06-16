import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import {
    GoCircleSlash,
    GoCheckCircle,
    GoAlert,
} from 'react-icons/go';

const ConfirmationModal = ({ show, setShow, handleRemove, contact }) => {
    return (
        <Modal show={show} onHide={() => setShow(false)}>
            <Modal.Header style={{ backgroundColor: "#80b1b3" }} closeButton>
                <Modal.Title className="d-flex align-items-center justify-content-center">
                    <GoAlert size={30} style={{ marginRight: "10px" }} />
                    Remove <span className='text-secondary' style={{ marginLeft: "5px"}}>{contact}</span>?
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                This action cannot be undone.
            </Modal.Body>
            <Modal.Footer style={{ backgroundColor: "#80b1b3" }}>
                <Button variant="primary" onClick={() => setShow(false)}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <GoCircleSlash size={20} />
                        <span style={{marginLeft: "10px"}}>Cancel</span>
                    </div>
                </Button>
                <Button variant="danger" onClick={() => {
                    handleRemove(contact);
                    setShow(false);
                }}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <GoCheckCircle size={20} />
                        <span style={{marginLeft: "10px"}}>Remove</span>
                    </div>
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default ConfirmationModal;
