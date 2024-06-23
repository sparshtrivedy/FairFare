import React from 'react';
import { Alert } from 'react-bootstrap';
import { GoInfo } from 'react-icons/go';

const InfoAlert = ({ message, altText, altLink }) => {
    return (
        <Alert variant={'primary'} className="d-flex align-items-center">
            <div>
                <GoInfo size={25} style={{ marginRight: '10px' }} />
            </div>
            <div>
                {message} <Alert.Link href={altLink}>{altText}</Alert.Link>.
            </div>
        </Alert>
    )
}

export default InfoAlert;
