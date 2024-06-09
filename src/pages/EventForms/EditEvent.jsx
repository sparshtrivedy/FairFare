import React, { useState, useEffect } from "react";
import {
    Card,
    Container,
    Row,
    Col,
    Spinner,
    Button,
    Alert,
    Breadcrumb,
} from "react-bootstrap";
import { GoPencil, GoFileDirectory, GoAlert } from "react-icons/go";
import EditEventForm from "./Components/EditEventForm";
import { 
    addItem, 
    getEventById, 
    getItemsByEventId, 
    updateEvent,
    getEventRef,
    getItemRef,
    updateItem,
} from "../../Utils";
import { useParams } from "react-router-dom";
import '../pages.css';

const EditEvent = () => {
    const eventId = useParams().eventId;

    const [isLoading, setIsLoading] = useState(true);
    const [memberError, setMemberError] = useState('');
    const [error, setError] = useState('');

    const [items, setItems] = useState([{
        id: '',
        itemName: '', 
        itemQuantity: 0, 
        itemPrice: 0,
        transferTo: '',
        splits: []
    }]);

    const [event, setEvent] = useState({
        name: '',
        date: '',
        description: '',
        members: [],
    });

    const handleUpdateEvent = async (e) => {
        if (!isValidated()) {
            return;
        }
        setError('');
        
        const eventRef = getEventRef(eventId);
        await updateEvent(eventRef, event);
        for (const item of items) {
            if (!item.id) {
                const itemRef = await addItem(item, eventRef);
                item.id = itemRef.id;
            } else {
                const itemRef = getItemRef(item.id);
                await updateItem(itemRef, item);
            }

            window.location.href = `/#/view-event/${eventId}`;
        }
    }

    useEffect(() => {
        const getEvent = async () => {
            setIsLoading(true);

            const eventForEventId = await getEventById(eventId);
            setEvent(eventForEventId);

            const itemsForEvent = await getItemsByEventId(eventId);
            setItems(itemsForEvent);

            setIsLoading(false);
        }

        getEvent();
    }, [eventId]);

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

    return (
        <Container style={{height: '100%'}}>
            <Row className='justify-content-center'>
                <Col sm={10} xs={12}>
                    <Breadcrumb className="my-2">
                        <Breadcrumb.Item href='/#/home'>Home</Breadcrumb.Item>
                        <Breadcrumb.Item href={`/#/view-event/${eventId}`}>View</Breadcrumb.Item>
                        <Breadcrumb.Item active className="text-white">Edit</Breadcrumb.Item>
                    </Breadcrumb>
                    <Card style={{border: 0}} className='my-3'>
                        <Card.Header
                            style={{ backgroundColor: "#80b1b3" }}
                            as="h4"
                            className="d-flex align-items-center justify-content-center"
                        >
                            <GoPencil size={30} style={{ marginRight: "10px" }} />
                            Edit event
                        </Card.Header>
                        <Card.Body style={{backgroundColor: '#f7fafa', paddingBottom: 0 }}>
                            {error && 
                                <Alert variant='danger' className="d-flex align-items-center">
                                    <GoAlert size={20} style={{ marginRight: '10px' }} />
                                    {error}
                                </Alert>
                            }
                            {isLoading? 
                                <div className='d-flex justify-content-center my-3'>
                                    <Spinner animation="border" size='lg' />
                                </div>:
                                <EditEventForm 
                                    memberError={memberError}
                                    setMemberError={setMemberError}
                                    items={items}
                                    setItems={setItems}
                                    event={event}
                                    setEvent={setEvent}
                                />
                            }
                        </Card.Body>
                        <Card.Footer style={{backgroundColor: '#80b1b3'}}>
                            <Button 
                                variant="primary" 
                                type="submit"
                                onClick={handleUpdateEvent}
                            >
                                <div style={{ display: "flex", alignItems: "center" }}>
                                    <GoFileDirectory size={20} />
                                    <span style={{marginLeft: "10px"}}>Save edits</span>
                                </div>
                            </Button>
                        </Card.Footer>
                    </Card>
                </Col>
            </Row>
        </Container>
    )
}

export default EditEvent;
