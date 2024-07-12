import React from "react";
import { Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import { GoPencil } from "react-icons/go";

const EditButton = ({ path, disabled }) => {
    const handleClickView = () => {
        window.location.href = path;
    }

    const renderTooltip = (props) => (
        <Tooltip id="button-tooltip" {...props}>
            Edit
        </Tooltip>
    );

    return (
        <OverlayTrigger
            placement="top"
            delay={{ show: 250, hide: 400 }}
            overlay={renderTooltip}
        >
            <Button variant="info" onClick={handleClickView} className='m-1' disabled={disabled}>
                <GoPencil size={20} />
            </Button>
        </OverlayTrigger>
    );
}

export default EditButton;
