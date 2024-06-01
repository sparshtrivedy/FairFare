import React from "react";
import { 
    Form
} from "react-bootstrap";
import FairFareControl from "./FairFareControl";
import ItemsCard from "./ItemsCard";
import MembersCard from "./MembersCard";

const ViewEventForm = ({ items, setItems, event, setEvent, memberError, setMemberError }) => {

    return (
        <Form>
            <FairFareControl
                label="Event name"
                type="text"
                value={event?.name}
                disabled={true}
            />
            <FairFareControl
                label="Event date"
                type="date"
                value={event?.date}
                disabled={true}
            />
            <FairFareControl
                label="Event description"
                type="text"
                value={event?.description}
                disabled={true}
            />
            <MembersCard
                members={event?.members}
                memberError={memberError}
                setMemberError={setMemberError}
                event={event}
                setEvent={setEvent}
                items={items}
                setItems={setItems}
                disabled={true}
            />
            <ItemsCard
                event={event}
                items={items}
                setItems={setItems}
                disabled={true}
            />
        </Form>
    )
}

export default ViewEventForm;
