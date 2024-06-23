import React from 'react';
import { Card } from 'react-bootstrap';
import { GoInfo } from 'react-icons/go';

const IdTextMap = {
    "members": "No members to display. Add members to start sharing expenses.",
    "items": "No items to display. Add items to start sharing expenses.",
    "contacts": "No contacts to display. Add contacts to start sharing expenses.",
}

const EmptyListText = ({ id }) => {
    return (
        <Card.Text className='d-flex align-items-center text-muted'>
            <span>
                <GoInfo size={20} style={{ marginRight: '10px' }} />
            </span>
            <span>
               {IdTextMap[id]} 
            </span>
        </Card.Text>
    )
}

export default EmptyListText;
