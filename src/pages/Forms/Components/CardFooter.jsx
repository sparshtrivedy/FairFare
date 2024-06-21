import React from "react";
import { Card, Button } from "react-bootstrap";
import { GoPersonAdd } from "react-icons/go";

const TextIconMap = {
    "Add member": <GoPersonAdd size={20} style={{ marginRight: "10px" }} />,
}

const CardFooter = ({ text, handler }) => {
    return (
        <Card.Footer style={{backgroundColor: '#80b1b3'}}>
            <Button variant='primary' onClick={handler}>
                <div style={{ display: "flex", alignItems: "center" }}>
                    {TextIconMap[text]}
                    {text}
                </div>
            </Button>
        </Card.Footer>
    );
}

export default CardFooter;
