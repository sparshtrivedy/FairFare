import React, { useState } from 'react'
import { 
    Form, 
    Button,
    Card,
    Col,
    Row,
    Container,
    Accordion
} from 'react-bootstrap'
import { 
    BsPersonFillAdd,
    BsDatabaseFillAdd,
    BsDatabaseFill
} from "react-icons/bs";
import { MdOutlineSafetyDivider, MdDelete, MdAddCircle } from "react-icons/md";
import { FaPeopleGroup } from "react-icons/fa6";

const CreateEvent = () => {
    const [event, setEvent] = useState({
        name: '',
        date: '',
        description: '',
        members: [],
        items: []
    });

    const handleAddMembers = () => {
        setEvent({
            ...event,
            members: [...event.members, ''],
            items: event.items.map(item => {
                return {
                    ...item,
                    itemMembers: [...item.itemMembers, {
                        email: '',
                        isSharing: false,
                        share: 0
                    }]
                }
            })
        });
    }

    const handleRemoveMembers = (index) => {
        const newMembers = [...event.members];

        for (let i = 0; i < event.items.length; i++) {
            if (event.items[i].itemMembers[index].isSharing) {
                event.items[i].itemMembers[index].isSharing = false;
                event.items[i].itemMembers[index].share = 0;
            }

            const sharingMembers = event.items[i].itemMembers.filter(member => member.isSharing);

            for (let j = 0; j < event.items[i].itemMembers.length; j++) {
                if (event.items[i].itemMembers[j].isSharing) {
                    event.items[i].itemMembers[j].share = event.items[i].itemPrice * event.items[i].itemQuantity / sharingMembers.length;
                }
            }
        }

        newMembers.splice(index, 1);

        setEvent({
            ...event,
            members: newMembers,
            items: event.items.map(item => {
                return {
                    ...item,
                    itemMembers: item.itemMembers.filter((member, idx) => idx !== index)
                }
            })
        });
    }

    const handleAddItems = () => {
        setEvent({
            ...event,
            items: [...event.items, {
                itemName: '',
                itemQuantity: 0,
                itemPrice: 0,
                itemMembers: event.members.map(member => {
                    return {
                        email: member,
                        isSharing: false,
                        share: 0
                    }
                })
            }]
        });
    }

    const handleRemoveItems = (index) => {
        const newItems = [...event.items];
        newItems.splice(index, 1);
        setEvent({
            ...event,
            items: newItems
        });
    }

    return (
        <Container style={{height: '100%'}}>
            <Row className='justify-content-center'>
                <Col xs={10}>
                    <Card style={{borderRadius: 0, border: 0}}>
                        <Card.Header style={{backgroundColor: '#80b1b3', borderRadius: 0}}>
                            <h4 className='my-2'>
                                <MdOutlineSafetyDivider size={40} /> Create new event
                            </h4>
                        </Card.Header>
                        <Card.Body style={{backgroundColor: '#f7fafa'}}>
                            <Form>
                                <Form.Group className="mb-3" controlId="formBasicEmail">
                                    <Form.Label>Event name</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        placeholder="Enter event name" 
                                        onChange={(e) => setEvent({ ...event, name: e.target.value })} 
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="formBasicPassword">
                                    <Form.Label>Event date</Form.Label>
                                    <Form.Control 
                                        type="date" 
                                        placeholder="Enter event date" 
                                        onChange={(e) => setEvent({ ...event, date: e.target.value })} 
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="formBasicPassword">
                                    <Form.Label>Event description</Form.Label>
                                    <Form.Control 
                                        as="textarea" 
                                        rows={3} 
                                        placeholder="Enter event description" 
                                        onChange={(e) => setEvent({ ...event, description: e.target.value })} 
                                    />
                                </Form.Group>
                                <Card className='mb-3'>
                                    <Card.Header style={{backgroundColor: '#dae7f1'}}>
                                        <h5 className='my-2'>
                                            <FaPeopleGroup /> Members
                                        </h5>
                                    </Card.Header>
                                    <Card.Body style={{backgroundColor: '#f8f8f8'}}>
                                        {event.members.length? event.members.map((member, index) => {
                                            return (
                                                <Form.Group className="mb-3" controlId="formBasicPassword" key={index}>
                                                    <Form.Label>Member {index + 1}</Form.Label>
                                                    <div className="d-flex justify-content-end">
                                                        <Form.Control 
                                                            type="email" 
                                                            placeholder="Enter member email" 
                                                            onChange={(e) => {
                                                                const newMembers = [...event.members];
                                                                const newItems = [...event.items];
                                                                newMembers[index] = e.target.value;
                                                                newItems.forEach(item => {
                                                                    item.itemMembers[index].email = e.target.value;
                                                                });
                                                                setEvent({ ...event, members: newMembers });
                                                            }}
                                                        />
                                                        <Button variant="danger" className="ms-2 d-flex align-items-center" onClick={() => handleRemoveMembers(index)}>
                                                            <MdDelete style={{ marginRight: 2 }}/> Remove
                                                        </Button>
                                                    </div>
                                                </Form.Group>
                                            )
                                        }) : <p>No members added</p>}
                                    </Card.Body>
                                    <Card.Footer style={{backgroundColor: '#dae7f1'}}>
                                        <Button onClick={handleAddMembers} className='my-2'>
                                            <BsPersonFillAdd /> Add member
                                        </Button>
                                    </Card.Footer>
                                </Card>
                                <Card>
                                    <Card.Header style={{backgroundColor: '#dae7f1'}}>
                                        <h5 className='my-2'>
                                            <BsDatabaseFill /> Items
                                        </h5>
                                    </Card.Header>
                                    <Card.Body style={{backgroundColor: '#f8f8f8'}}>
                                        <Accordion alwaysOpen>
                                        {event.items.length? event.items.map((item, index) => {
                                            return (
                                                <Accordion.Item eventKey={index} key={index}>
                                                    <Accordion.Header>
                                                        <h6>Item {index + 1}</h6>
                                                    </Accordion.Header>
                                                    <Accordion.Body>
                                                        <Form.Group className="mb-3" controlId="formBasicPassword" key={index}>
                                                            <Form.Label>Item name</Form.Label>
                                                            <Form.Control 
                                                                type="text" 
                                                                placeholder="Enter item" 
                                                                onChange={(e) => {
                                                                    const newItems = [...event.items];
                                                                    newItems[index].itemName = e.target.value;
                                                                    setEvent({ ...event, items: newItems });
                                                                }}
                                                            />
                                                        </Form.Group>
                                                        <Form.Group className="mb-3" controlId="formBasicPassword" key={index}>
                                                            <Form.Label>Item quantity</Form.Label>
                                                            <Form.Control 
                                                                type="number" 
                                                                placeholder="Enter item quantity" 
                                                                onChange={(e) => {
                                                                    const newItems = [...event.items];
                                                                    newItems[index].itemQuantity = e.target.value;
                                                                    setEvent({ ...event, items: newItems });
                                                                }}
                                                            />
                                                        </Form.Group>
                                                        <Form.Group className="mb-3" controlId="formBasicPassword" key={index}>
                                                            <Form.Label>Item price</Form.Label>
                                                            <Form.Control
                                                                type="number" 
                                                                placeholder="Enter item price" 
                                                                onChange={(e) => {
                                                                    const newItems = [...event.items];
                                                                    newItems[index].itemPrice = e.target.value;
                                                                    setEvent({ ...event, items: newItems });
                                                                }}
                                                            />
                                                        </Form.Group>
                                                        <Card className='mb-3'>
                                                            <Card.Header>
                                                                Share the blame
                                                            </Card.Header>
                                                            <Card.Body>
                                                                {item.itemMembers.length? item.itemMembers.map((member, idx) => {
                                                                    return (
                                                                        <Form.Check
                                                                            key={idx}
                                                                            inline
                                                                            label={member.email}
                                                                            name="group1"
                                                                            type='checkbox'
                                                                            id={`member-${idx + 1}`}
                                                                            onChange={(e) => {
                                                                                const newItems = [...event.items];
                                                                                newItems[index].itemMembers[idx].isSharing = e.target.checked;
                                                                                const sharingMembers = newItems[index].itemMembers.filter(member => member.isSharing);
                                                                                for (let i = 0; i < newItems[index].itemMembers.length; i++) {
                                                                                    if (newItems[index].itemMembers[i].isSharing) {
                                                                                        newItems[index].itemMembers[i].share = newItems[index].itemPrice * newItems[index].itemQuantity / sharingMembers.length;
                                                                                    } else {
                                                                                        newItems[index].itemMembers[i].share = 0;
                                                                                    }
                                                                                }
                                                                                setEvent({ ...event, items: newItems });
                                                                            }}
                                                                        />
                                                                    )
                                                                }) : <p>No members added</p>}
                                                            </Card.Body>
                                                        </Card>
                                                        <Button variant="danger" onClick={() => handleRemoveItems(index)}>
                                                            <MdDelete style={{ marginRight: 2 }}/> Remove
                                                        </Button>
                                                    </Accordion.Body>
                                                </Accordion.Item>
                                            )
                                        }): <p>No items added</p>}
                                        </Accordion>
                                    </Card.Body>
                                    <Card.Footer style={{backgroundColor: '#dae7f1'}}>
                                        <Button onClick={handleAddItems} className='my-2'>
                                            <BsDatabaseFillAdd /> Add item
                                        </Button>
                                    </Card.Footer>
                                </Card>
                            </Form>
                        </Card.Body>
                        <Card.Footer style={{backgroundColor: '#80b1b3', borderRadius: 0}}>
                            <Button variant="primary" type="submit" className='my-2'>
                                <MdAddCircle /> Create event
                            </Button>
                        </Card.Footer>
                    </Card>
                </Col>
            </Row>
        </Container>
    )
}

export default CreateEvent