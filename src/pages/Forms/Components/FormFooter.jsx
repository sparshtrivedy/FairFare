import React from "react";
import { Card, Button } from "react-bootstrap";
import { GoFileDirectory, GoPencil, GoProjectSymlink } from "react-icons/go";

const TextIconMap = {
    "Create event": <GoProjectSymlink size={20} style={{ marginRight: "10px" }} />,
    "Edit event": <GoPencil size={20} style={{ marginRight: "10px" }} />,
    "Save changes": <GoFileDirectory size={20} style={{ marginRight: "10px" }} />,
}

const FormFooter = ({ text, handler }) => {
    return (
        <Card.Footer style={{backgroundColor: '#80b1b3'}}>
            <Button variant="primary" type="submit" onClick={handler}>
                <div style={{ display: "flex", alignItems: "center" }}>
                    {TextIconMap[text]}
                    {text}
                </div>
            </Button>
        </Card.Footer>
    );
}

export default FormFooter;
