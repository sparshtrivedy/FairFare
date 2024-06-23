import React from 'react';
import { Button, Alert, Modal } from 'react-bootstrap';
import {
    GoCircleSlash,
    GoCheckCircle,
    GoAlert,
} from 'react-icons/go';

const ConfirmationModal = ({ show, setShow, handleRemove, contact }) => {
    return (
        <Modal show={show} onHide={() => setShow(false)}>
            <Alert variant="danger" className='m-0'>
                <Alert.Heading className='d-flex align-items-center'>
                    <GoAlert size={30} style={{ marginRight: "10px" }} />
                    Remove {contact}?
                </Alert.Heading>
                <p>
                    This action cannot be undone. Are you sure you want to remove this contact?
                </p>
                <Button 
                    variant="outline-secondary"
                    onClick={() => setShow(false)}
                >
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <GoCircleSlash size={20} />
                        <span style={{marginLeft: "10px"}}>Cancel</span>
                    </div>
                </Button>{' '}
                <Button 
                    variant="outline-danger"
                    onClick={() => {
                        handleRemove(contact);
                        setShow(false);
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <GoCheckCircle size={20} />
                        <span style={{marginLeft: "10px"}}>Remove</span>
                    </div>
                </Button>
            </Alert>
        </Modal>
    );
}

export default ConfirmationModal;
