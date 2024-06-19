import React from 'react';
import { Alert } from 'react-bootstrap';
import { GoAlert } from 'react-icons/go';

const ErrorAlert = ({ message }) => {
    return (
        <Alert variant='danger' className="d-flex align-items-center" show={message.length !== 0}>
            <GoAlert size={20} style={{ marginRight: '10px' }} />
            {message}
        </Alert>
    )
}

export default ErrorAlert;
