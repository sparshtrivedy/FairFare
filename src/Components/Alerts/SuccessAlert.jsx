import React from 'react';
import { Alert } from 'react-bootstrap';
import { GoCheckCircle } from 'react-icons/go';

const SuccessAlert = ({ message }) => {
    return (
        <Alert variant='success' className="d-flex align-items-center" show={message.length !== 0}>
            <GoCheckCircle size={20} style={{ marginRight: '10px' }} />
            {message}
        </Alert>
    )
}

export default SuccessAlert;
