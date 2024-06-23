import React from "react";
import { Card } from "react-bootstrap";
import {
    GoEye,
    GoPencil,
    GoPlusCircle,
    GoHistory,
    GoTable,
    GoPerson,
} from "react-icons/go";

const TitleIconMap = {
    "Create Event": <GoPlusCircle size={30} style={{ marginRight: "10px" }} />,
    "View Event": <GoEye size={30} style={{ marginRight: "10px" }} />,  
    "Edit Event": <GoPencil size={30} style={{ marginRight: "10px" }} />,
    "Create Item": <GoPlusCircle size={30} style={{ marginRight: "10px" }} />,
    "View Item": <GoEye size={30} style={{ marginRight: "10px" }} />,
    "Edit Item": <GoPencil size={30} style={{ marginRight: "10px" }} />,
    "History": <GoHistory size={30} style={{ marginRight: "10px" }} />,
    "Dashboard": <GoTable size={30} style={{ marginRight: "10px" }} />,
    "Contacts": <GoPerson size={30} style={{ marginRight: "10px" }} />,
}

const FormHeader = ({ title }) => {
    return (
        <Card.Header style={{ backgroundColor: "#80b1b3" }} as="h4" className="d-flex align-items-center justify-content-center">
            {TitleIconMap[title]}
            {title}
        </Card.Header>
    );
}

export default FormHeader;
