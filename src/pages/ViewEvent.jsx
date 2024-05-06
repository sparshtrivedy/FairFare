import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { collection, query, where, getDoc, getDocs, doc } from "firebase/firestore";
import { 
    MdOutlineEventNote,
    MdEdit
} from "react-icons/md";
import { 
    BsDatabaseFill
} from "react-icons/bs";
import { FaPeopleGroup } from "react-icons/fa6";
import { db } from '../firebase-config';
import {
    Container,
    Row,
    Col,
    Card,
    Form,
    Button,
    Accordion,
    Spinner
} from 'react-bootstrap';

const ViewEvent = () => {
    const eventId = useParams().eventId;
    const [event, setEvent] = useState(null);
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const getEvent = async () => {
            setIsLoading(true);
            const docRef = await getDoc(doc(db, "events", eventId));
            if (docRef.exists()) {
                setEvent(docRef.data());
            } else {
                console.log("No such document!");
            }

            const q = query(collection(db, "items"), where("event", "==", docRef.ref));
            const querySnapshot = await getDocs(q);
            setItems(querySnapshot.docs.map((doc) => doc.data()));
            setIsLoading(false);
        }

        getEvent();
    }, [eventId]);

    return (
        <Container style={{height: '100%'}}>
            <Row className='justify-content-center'>
                <Col xs={10}>
                    <Card style={{border: 0}} className='my-3'>
                        <Card.Header style={{backgroundColor: '#80b1b3'}} as="h4">
                            <MdOutlineEventNote /> View event
                        </Card.Header>
                        <Card.Body style={{backgroundColor: '#f7fafa'}}>
                        {isLoading?
                            <div className='d-flex justify-content-center my-3'>
                                <Spinner animation="border" size='lg' />
                            </div>:
                            <>
                                <Form.Group as={Row} className="mb-3" controlId="formPlaintextEmail">
                                    <Form.Label column sm="2">
                                        Event name
                                    </Form.Label>
                                    <Col sm="10">
                                        <Form.Control 
                                            type="text" 
                                            disabled={true}
                                            value={event?.name}
                                        />
                                    </Col>
                                </Form.Group>
                                <Form.Group as={Row} className="mb-3" controlId="formPlaintextEmail">
                                    <Form.Label column sm="2">
                                        Event date
                                    </Form.Label>
                                    <Col sm="10">
                                        <Form.Control 
                                            type="date" 
                                            disabled={true}
                                            value={event?.date}
                                        />
                                    </Col>
                                </Form.Group>
                                <Form.Group as={Row} className="mb-3" controlId="formPlaintextEmail">
                                    <Form.Label column sm="2">
                                        Event description
                                    </Form.Label>
                                    <Col sm="10">
                                        <Form.Control 
                                            as="textarea" 
                                            disabled={true}
                                            value={event?.description}
                                        />
                                    </Col>
                                </Form.Group>
                                <Card className='my-3'>
                                    <Card.Header style={{backgroundColor: '#80b1b3'}}>
                                        <h5 className='my-1'>
                                            <FaPeopleGroup size={25} /> Members
                                        </h5>
                                    </Card.Header>
                                    <Card.Body>
                                        {event?.members.map((member, index) => (
                                            <Form.Group key={`member-${index}`} as={Row}>
                                                <Form.Label column sm="2" className='mb-3'>
                                                    Member {index + 1}
                                                </Form.Label>
                                                <Col sm="10">
                                                    <Form.Control
                                                        type="text"
                                                        disabled={true}
                                                        value={member.email}
                                                    />
                                                </Col>
                                            </Form.Group>
                                        ))}
                                    </Card.Body>
                                </Card>
                                <Card className='my-3'>
                                    <Card.Header style={{backgroundColor: '#80b1b3'}}>
                                        <h5 className='my-1'>
                                            <BsDatabaseFill size={25} /> Items
                                        </h5>
                                    </Card.Header>
                                    <Card.Body>
                                        <Accordion>
                                            {items.map((item, index) => (
                                                <Accordion.Item eventKey={index} key={`item-${index}`}>
                                                    <Accordion.Header>
                                                        <h6>{item.itemName}</h6>
                                                    </Accordion.Header>
                                                    <Accordion.Body>
                                                        <Form.Group as={Row} className="mb-3">
                                                            <Form.Label column sm="2">
                                                                Item name
                                                            </Form.Label>
                                                            <Col sm="10">
                                                                <Form.Control 
                                                                    type="text" 
                                                                    disabled={true}
                                                                    value={item.itemName}
                                                                />
                                                            </Col>
                                                        </Form.Group>
                                                        <Form.Group as={Row} className="mb-3">
                                                            <Form.Label column sm="2">
                                                                Item price
                                                            </Form.Label>
                                                            <Col sm="10">
                                                                <Form.Control 
                                                                    type="number" 
                                                                    disabled={true}
                                                                    value={item.itemPrice}
                                                                />
                                                            </Col>
                                                        </Form.Group>
                                                        <Form.Group as={Row} className="mb-3">
                                                            <Form.Label column sm="2">
                                                                Item quantity
                                                            </Form.Label>
                                                            <Col sm="10">
                                                                <Form.Control 
                                                                    type="number" 
                                                                    disabled={true}
                                                                    value={item.itemQuantity}
                                                                />
                                                            </Col>
                                                        </Form.Group>
                                                        <Form.Group as={Row} className="mb-3">
                                                            <Form.Label column sm="2">
                                                                Transfer to
                                                            </Form.Label>
                                                            <Col sm="10">
                                                                <Form.Control 
                                                                    type="text" 
                                                                    disabled={true}
                                                                    value={item.transferTo}
                                                                />
                                                            </Col>
                                                        </Form.Group>
                                                        <Form.Group as={Row} className="mb-3">
                                                            <Form.Label column sm="2">
                                                                Shared among
                                                            </Form.Label>
                                                            <Col sm="10">
                                                            {item.splits.length > 0 ?
                                                                item.splits.map((member, i) => (
                                                                    <Form.Check 
                                                                        key={`item-${index}-member-${i}`}
                                                                        type="checkbox" 
                                                                        label={member.email}
                                                                        disabled={true}
                                                                        checked={member.isChecked}
                                                                    />
                                                                )):
                                                                <p>No members added</p>
                                                            }
                                                            </Col>
                                                        </Form.Group>
                                                    </Accordion.Body>
                                                </Accordion.Item>
                                            ))}
                                        </Accordion>
                                    </Card.Body>
                                </Card>
                            </>
                        }
                        </Card.Body>
                        <Card.Footer style={{backgroundColor: '#80b1b3'}}>
                            <Button variant="primary" type="submit" onClick={() => window.location.href=`/#edit-event/${eventId}`}>
                                <MdEdit /> Edit event
                            </Button>
                        </Card.Footer>
                    </Card>
                </Col>
            </Row>
        </Container>
    )
}

export default ViewEvent