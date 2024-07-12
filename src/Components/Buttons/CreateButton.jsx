import React from "react";
import { Dropdown, DropdownButton, ButtonGroup, OverlayTrigger, Tooltip } from "react-bootstrap";
import { GoPlus } from "react-icons/go";

const CreateButton = () => {
    const renderTooltip = (props) => (
        <Tooltip id="button-tooltip" {...props}>
            Create
        </Tooltip>
    );

    return (
        <OverlayTrigger
            placement="top"
            delay={{ show: 250, hide: 400 }}
            overlay={renderTooltip}
        >
            <DropdownButton
                as={ButtonGroup}
                variant={'danger'}
                title={<GoPlus size={20} />}
                className='m-1'
            >
                <Dropdown.Item href="/#/create-event">
                    Event
                </Dropdown.Item>
                <Dropdown.Item href="/#/create-item">
                    Item
                </Dropdown.Item>
            </DropdownButton>
        </OverlayTrigger>
    );
}

export default CreateButton;
