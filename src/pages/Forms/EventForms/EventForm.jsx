import React, { useEffect, useState } from "react";
import { 
    Container, 
    Row, 
    Col, 
    Card,
    Breadcrumb,
    Spinner
} from "react-bootstrap";
import { addEvent, addItem } from "../../../Utils";
import '../../pages.css';
import ErrorAlert from "../../../Components/Alerts/ErrorAlert";
import InfoAlert from "../../../Components/Alerts/InfoAlert";
import FormHeader from "../Components/FormHeader";
import CardFooter from "../Components/CardFooter";
import FairFareControl from "../Components/FairFareControl";
import EventMembersCard from "./Components/EventMembersCard";
import ItemsCard from "./Components/ItemsCard";
import { useParams } from "react-router-dom";
import {
    getEventById,
    getItemsByEventId,
    updateEvent,
    getEventRef,
    getItemRef,
    updateItem
} from "../../../Utils";

const EventForm = ({ mode }) => {
    const eventId = useParams().eventId;

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [items, setItems] = useState([]);
    const [event, setEvent] = useState({
        name: '',
        date: '',
        description: '',
        members: [],
    });

    useEffect(() => {
        const getEvent = async () => {
            setIsLoading(true);
            const eventForEventId = await getEventById(eventId);
            setEvent(eventForEventId);

            const itemsForEvent = await getItemsByEventId(eventId);
            setItems(itemsForEvent);
            setIsLoading(false);
        }

        if (mode === 'view' || mode === 'edit') {
            getEvent();
        } else {
            setEvent({
                name: '',
                date: '',
                description: '',
                members: [],
            });
            setItems([]);
        }
    }, [eventId, mode]);

    const isValidated = () => {
        if (event.name === '' ||
            event.date === '' ||
            items.length === 0
        ) {
            setError('Please fill in all required event fields.');
            return false;
        }

        if (event.members.length === 0) {
            setError('Please add at least one member to the event.');
            return false;
        }

        for (const member of event.members) {
            if (!member.email.length) {
                setError('Please provide valid member emails.');
                return false;
            }
        }

        for (const item of items) {
            if (item.itemName === '' ||
                item.itemQuantity === 0 ||
                item.itemPrice === 0 ||
                item.transferTo === ''
            ) {
                setError('Please fill in all required item fields.');
                return false;
            }

            const numChecked = item.splits.filter(split => split.isChecked).length;
            if (numChecked === 0) {
                setError('Please select at least one member to split the item with.');
                return false;
            }
        }

        return true;
    }

    const handleCreateEvent = async (e) => {
        try {
            if (!isValidated()) {
                return;
            }
            setError('');
            const eventRef = await addEvent(event);

            for (const item of items) {
                await addItem(item, eventRef);
            }

            window.location.href = `/#/view-event/${eventRef.id}`;
        } catch (error) {
            setError(error.message);
        }
    }

    const handleUpdateEvent = async (e) => {
        try {
            if (!isValidated()) {
                return;
            }
            setError('');
            
            const eventRef = getEventRef(eventId);
            await updateEvent(eventRef, event);
            for (const item of items) {
                const shareOfItem = (item.itemPrice * item.itemQuantity) / item.splits.filter(split => split.isChecked && !split.isSettled).length;
                let copiedItem = { ...item };
                copiedItem.splits = copiedItem.splits.map((split) => {
                    return {
                        ...split,
                        amount: shareOfItem.toFixed(2)
                    }
                });
                if (!item.id) {
                    const itemRef = await addItem(copiedItem, eventRef);
                    item.id = itemRef.id;
                } else {
                    const itemRef = getItemRef(item.id);
                    await updateItem(itemRef, copiedItem);
                }

                window.location.href = `/#/view-event/${eventId}`;
            }
        } catch (error) {
            setError(error.message);
        }
    }

    return (
        <Container style={{height: '100%'}}>
            <Row className='justify-content-center'>
                <Col sm={10} xs={12}>
                    <Breadcrumb className="my-2">
                        <Breadcrumb.Item href='/#/home'>Home</Breadcrumb.Item>
                        {mode === 'create' && <Breadcrumb.Item active>Create event</Breadcrumb.Item>}
                        {mode === 'edit' && 
                            <>
                                <Breadcrumb.Item href={`/#/view-event/${eventId}`}>View event</Breadcrumb.Item>
                                <Breadcrumb.Item active>Edit event</Breadcrumb.Item>
                            </>
                        }
                        {mode === 'view' && <Breadcrumb.Item active>View event</Breadcrumb.Item>}
                    </Breadcrumb>
                    <Card style={{border: 0}} className='my-3'>
                        {mode === 'view' && <FormHeader title={"View event"} />}
                        {mode === 'create' && <FormHeader title={"Create event"} />}
                        {mode === 'edit' && <FormHeader title={"Edit event"} />}
                        <Card.Body style={{backgroundColor: '#f7fafa', paddingBottom: 0}}>
                            <ErrorAlert message={error} />
                            {mode === 'create' &&
                                <InfoAlert 
                                    message={"Recommended for events with multiple items. If this is a stand-alone item,"} 
                                    altText={"create an item"}
                                    altLink={"/#/create-item"}
                                />
                            }
                            {isLoading? (
                                <div className='d-flex justify-content-center my-3'>
                                    <Spinner animation="border" size='lg' />
                                </div>
                            ) : (
                                <>
                                    <FairFareControl
                                        label="Event name"
                                        type="text"
                                        placeholder="Enter event name"
                                        onChange={(e) => setEvent({ ...event, name: e.target.value })}
                                        value={event.name}
                                        required={true}
                                        disabled={mode === 'view'}
                                    />
                                    <FairFareControl
                                        label="Event date"
                                        type="date"
                                        placeholder="Enter event date"
                                        onChange={(e) => setEvent({ ...event, date: e.target.value })}
                                        value={event.date}
                                        required={true}
                                        disabled={mode === 'view'}
                                    />
                                    <FairFareControl
                                        label="Event description"
                                        type="text"
                                        placeholder="Enter event description"
                                        onChange={(e) => setEvent({ ...event, description: e.target.value })}
                                        value={event.description}
                                        required={false}
                                        disabled={mode === 'view'}
                                    />
                                    <EventMembersCard
                                        members={event.members}
                                        event={event}
                                        setEvent={setEvent}
                                        items={items}
                                        setItems={setItems}
                                        disabled={mode === 'view'}
                                    />
                                    <ItemsCard
                                        event={event}
                                        items={items}
                                        setItems={setItems}
                                        disabled={mode === 'view'}
                                    />
                                </>
                            )}
                        </Card.Body>
                        {mode === "create" && <CardFooter text={"Create event"} handler={handleCreateEvent} />}
                        {mode === "view" && <CardFooter text={"Edit event"} handler={() => window.location.href = `/#/edit-event/${eventId}`} />}
                        {mode === "edit" && <CardFooter text={"Save changes"} handler={handleUpdateEvent}/>}
                    </Card>
                </Col>
            </Row>
        </Container>
    )
}

export default EventForm;
