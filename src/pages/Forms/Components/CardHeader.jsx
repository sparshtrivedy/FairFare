import React from "react";
import { Card } from "react-bootstrap";
import { GoPeople } from "react-icons/go";

const TitleIconMap = {
    "Members": <GoPeople size={25} style={{ marginRight: "10px" }} />,
    "Shared among": <GoPeople size={25} style={{ marginRight: "10px" }} />,
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
