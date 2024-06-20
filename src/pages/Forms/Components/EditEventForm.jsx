import React from "react";
import { 
    Form
} from "react-bootstrap";
import FairFareControl from "./FairFareControl";
import MembersCard from "./MembersCard";
import ItemsCard from "./ItemsCard";

const EditEventForm = ({ memberError, setMemberError, items, setItems, event, setEvent }) => {
    return (
        <Form>
            <FairFareControl
                label="Event name"
                type="text"
                placeholder="Enter event name"
                onChange={(e) => setEvent({ ...event, name: e.target.value })}
                value={event.name}
                required={true}
            />
            <FairFareControl
                label="Event date"
                type="date"
                placeholder="Enter event date"
                onChange={(e) => setEvent({ ...event, date: e.target.value })}
                value={event.date}
                required={true}
            />
            <FairFareControl
                label="Event description"
                type="text"
                placeholder="Enter event description"
                onChange={(e) => setEvent({ ...event, description: e.target.value })}
                value={event.description}
            />
            <MembersCard
                members={event.members}
                memberError={memberError}
                setMemberError={setMemberError}
                event={event}
                setEvent={setEvent}
                items={items}
                setItems={setItems}
            />
            <ItemsCard
                event={event}
                items={items}
                setItems={setItems}
            /> 
        </Form>
    )
}

export default EditEventForm;
