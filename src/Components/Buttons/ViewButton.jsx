import React from "react";
import { Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import { GoEye } from "react-icons/go";

const ViewButton = ({ path, disabled }) => {
    const handleClickView = () => {
        window.location.href = path;
    }

    const renderTooltip = (props) => (
        <Tooltip id="button-tooltip" {...props}>
            View
        </Tooltip>
    );

    return (
        <OverlayTrigger
            placement="top"
            delay={{ show: 250, hide: 400 }}
            overlay={renderTooltip}
        >
            <Button variant="primary" onClick={handleClickView} className='m-1' disabled={disabled}>
                <GoEye size={20} />
            </Button>
        </OverlayTrigger>
    );
}

export default ViewButton;
