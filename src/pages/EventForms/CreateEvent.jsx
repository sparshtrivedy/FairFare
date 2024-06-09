import React, { useState } from "react";
import { 
    Container, 
    Row, 
    Col, 
    Card,
    Button,
    Alert,
} from "react-bootstrap";
import { 
    GoPlusCircle,
    GoProjectSymlink,
    GoAlert
} from "react-icons/go";
import { addEvent, addItem } from "../../Utils";
import CreateEventForm from "./Components/CreateEventForm";

const CreateEvent = () => {
    const [memberError, setMemberError] = useState('');
    const [error, setError] = useState('');

    const [items, setItems] = useState([{ 
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
        if (!isValidated()) {
            return;
        }
        setError('');
        const eventRef = await addEvent(event);

        for (const item of items) {
            await addItem(item, eventRef);
        }

        window.location.href = `/#view-event/${eventRef.id}`;
    }

    return (
        <Container style={{height: '100%'}}>
            <Row className='justify-content-center'>
                <Col sm={10} xs={12}>
                    <Card style={{border: 0}} className='my-3'>
                        <Card.Header
                            style={{ backgroundColor: "#80b1b3" }}
                            as="h4"
                            className="d-flex align-items-center justify-content-center"
                        >
                            <GoPlusCircle size={30} style={{ marginRight: "10px" }} />
                            Create new event
                        </Card.Header>
                        <Card.Body style={{backgroundColor: '#f7fafa', paddingBottom: 0}}>
                            {error && 
                                <Alert variant='danger' className="d-flex align-items-center">
                                    <GoAlert size={20} style={{ marginRight: '10px' }} />
                                    {error}
                                </Alert>
                            }
                            <CreateEventForm
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
