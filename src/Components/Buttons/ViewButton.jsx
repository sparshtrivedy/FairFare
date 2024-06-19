import React from "react";
import { Button } from "react-bootstrap";
import { GoEye } from "react-icons/go";

const ViewButton = ({ path }) => {
    const handleClickView = () => {
        window.location.href = path;
    }

    return (
        <Button variant="primary" onClick={handleClickView} className='m-1'>
            <div style={{ display: "flex", alignItems: "center" }}>
                <GoEye size={20} />
                <span style={{ marginLeft: "10px" }}>View</span>
            </div>
        </Button>
    );
}

export default ViewButton;
