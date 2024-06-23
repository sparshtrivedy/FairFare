import React from "react";
import { Card, Button } from "react-bootstrap";
import {
    GoPersonAdd,
    GoWorkflow,
    GoPlus,
    GoFileDirectory,
    GoPencil,
    GoProjectSymlink
} from "react-icons/go";

const TextIconMap = {
    "Add member": <GoPersonAdd size={20} style={{ marginRight: "10px" }} />,
    "Add item": <GoWorkflow size={20} style={{ marginRight: "10px" }} />,
    "Add contact": <GoPlus size={20} style={{ marginRight: "10px" }} />,
    "Create event": <GoProjectSymlink size={20} style={{ marginRight: "10px" }} />,
    "Edit event": <GoPencil size={20} style={{ marginRight: "10px" }} />,
    "Save changes": <GoFileDirectory size={20} style={{ marginRight: "10px" }} />,
    "Create item": <GoProjectSymlink size={20} style={{ marginRight: "10px" }} />,
    "Edit item": <GoPencil size={20} style={{ marginRight: "10px" }} />,
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
