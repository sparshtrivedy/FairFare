import React from "react";
import { Card } from "react-bootstrap";
import {
    GoPeople,
    GoRows,
    GoTasklist,
    GoPersonAdd,
    GoFoldUp,
    GoFoldDown
} from "react-icons/go";

const TitleIconMap = {
    "Members": <GoPeople size={25} style={{ marginRight: "10px" }} />,
    "Shared among": <GoPeople size={25} style={{ marginRight: "10px" }} />,
    "Items": <GoRows size={25} style={{ marginRight: "10px" }} />,
    "Detailed breakdown": <GoTasklist size={25} style={{ marginRight: "10px" }} />,
    "Add contact": <GoPersonAdd size={25} style={{ marginRight: "10px" }} />,
    "Added contacts": <GoPeople size={25} style={{ marginRight: "10px" }} />,
    "You owe": <GoFoldUp size={30} style={{ marginRight: "10px" }} />,
    "Owed to you": <GoFoldDown size={30} style={{ marginRight: "10px" }} />,
}

const CardHeader = ({ title }) => {
    return (
        <Card.Header style={{backgroundColor: '#80b1b3'}} as="h5" className='display-flex align-items-center'>
            {TitleIconMap[title]}
            {title}
        </Card.Header>
    );
}

export default CardHeader;
