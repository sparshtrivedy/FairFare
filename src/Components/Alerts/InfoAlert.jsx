import React from 'react';
import { Alert } from 'react-bootstrap';
import { GoInfo } from 'react-icons/go';

const InfoAlert = ({ message, altText, altLink }) => {
    return (
        <Alert variant={'primary'} className="d-flex align-items-center">
            <GoInfo size={30} style={{ marginRight: '10px' }} />
            {message}
            <Alert.Link href={altLink} style={{ marginLeft: '5px' }}>{altText}</Alert.Link>.
        </Alert>
    )
}

export default InfoAlert;
