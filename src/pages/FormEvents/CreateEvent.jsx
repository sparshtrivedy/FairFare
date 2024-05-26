import React, { useState } from "react";
import { 
    Container, 
    Row, 
    Col, 
    Card,
    Button,
} from "react-bootstrap";
import { 
    GoPlusCircle,
    GoProjectSymlink,
} from "react-icons/go";
import EventForm from "./Components/EventForm";
import { addEvent, addItem } from "../../Utils";

const CreateEvent = () => {
    const [memberError, setMemberError] = useState('');

    const [items, setItems] = useState([{ 
        itemName: '', 
        itemQuantity: 0, 
        itemPrice: 0, 
        splits: []
    }]);

    const [event, setEvent] = useState({
        name: '',
        date: '',
        description: '',
        members: [],
    });

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        const eventRef = await addEvent(event);

        for (const item of items) {
            await addItem(item, eventRef);
        }

        window.location.href = `/#view-event/${eventRef.id}`;
    }

    return (
        <Container style={{height: '100%'}}>
            <Row className='justify-content-center'>
                <Col xs={10}>
                    <Card style={{border: 0}} className='my-3'>
                        <Card.Header
                            style={{ backgroundColor: "#80b1b3" }}
                            as="h4"
                            className="d-flex align-items-center justify-content-center"
                        >
                            <GoPlusCircle size={30} style={{ marginRight: "10px" }} />
                            Create new event
                        </Card.Header>
                        <Card.Body style={{backgroundColor: '#f7fafa'}}>
                            <EventForm
                                memberError={memberError}
                                setMemberError={setMemberError}
                                items={items}
                                setItems={setItems}
                                event={event}
                                setEvent={setEvent}
                            />
                        </Card.Body>
                        <Card.Footer style={{backgroundColor: '#80b1b3'}}>
                            <Button variant="primary" type="submit" onClick={handleCreateEvent}>
                                <div style={{ display: "flex", alignItems: "center" }}>
                                    <GoProjectSymlink size={20} />
                                    <span style={{marginLeft: "10px"}}>Create event</span>
                                </div>
                            </Button>
                        </Card.Footer>
                    </Card>
                </Col>
            </Row>
        </Container>
    )
}

export default CreateEvent;
