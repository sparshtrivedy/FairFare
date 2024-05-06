import React, { useState, useEffect } from 'react'
import { 
    Form, 
    Button,
    Card,
    Col,
    Row,
    Container,
    Accordion,
    Alert,
    Spinner
} from 'react-bootstrap'
import { 
    BsPersonFillAdd,
    BsDatabaseFillAdd,
    BsDatabaseFill
} from "react-icons/bs";
import { MdEdit, MdOutlineSaveAs } from "react-icons/md";
import { FaPeopleGroup } from "react-icons/fa6";
import { collection, query, where, getDocs, addDoc, getDoc, doc, updateDoc } from "firebase/firestore";
import { db } from '../firebase-config';
import { useParams } from 'react-router-dom';

const EditEvent = () => {
    const eventId = useParams().eventId;
    const [memberError, setMemberError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

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
            setItems(querySnapshot.docs.map((doc) => {
                return {
                    id: doc.id,
                    ...doc.data()
                }
            }));
            setIsLoading(false);
        }

        getEvent();
    }, [eventId]);

    const handleAddItems = () => {
        setItems([...items, {
            id: '',
            itemName: '',
            itemPrice: 0,
            itemQuantity: 0,
            transferTo: '',
            splits: event.members.map(member => ({
                email: member.email,
                amount: 0,
                isChecked: false,
                isSettled: false
            }))
        }]);
    }

    const handleItemSplitChange = (index, i) => {
        let copiedItems = [...items];
        copiedItems[index].splits[i].isChecked = !copiedItems[index].splits[i].isChecked;
        updateMemberSplits(event.members, copiedItems, index);
        setItems(copiedItems);
    }

    function updateMemberSplits(members, copiedItems, index) {
        const totalChecked = copiedItems[index].splits.reduce((acc, split) => {
            if (split.isChecked) {
                return acc + 1;
            }
            return acc;
        }, 0);

        for (let j = 0; j < members.length; j++) {
            if (copiedItems[index].splits[j].isChecked) {
                copiedItems[index].splits[j].amount = (copiedItems[index].itemPrice * copiedItems[index].itemQuantity) / totalChecked;
            } else {
                copiedItems[index].splits[j].amount = 0;
            }
        }
    }
    
    const handleChangeMemberEmail = async (e, index) => {
        let copiedMembers = [...event.members];
        copiedMembers[index].email = e.target.value;
        setEvent({ ...event, members: copiedMembers });

        const memberQuery = query(collection(db, 'users'), where('email', '==', e.target.value));
        const memberSnapshot = await getDocs(memberQuery);
        if (memberSnapshot.empty) {
            setMemberError('User not found. Please make sure this user is registered.');
        } else {
            setMemberError('');
            const numItems = items.length;
            for (let i = 0; i < numItems; i++) {
                let copiedItems = [...items];
                copiedItems[i].splits[index].email = e.target.value;
                setItems(copiedItems);
            }
        }
    }

    const handleUpdateEvent = async (e) => {
        e.preventDefault();
        const eventRef = doc(db, 'events', eventId);
        await updateDoc(eventRef, {
            name: event.name,
            date: event.date,
            description: event.description,
            members: event.members,
        });

        for (const item of items) {
            if (item.id === '') {
                const itemRef = await addDoc(collection(db, 'items'), {
                    itemName: item.itemName,
                    itemPrice: item.itemPrice,
                    itemQuantity: item.itemQuantity,
                    transferTo: item.transferTo,
                    splits: item.splits,
                    event: eventRef
                });
                item.id = itemRef.id;
            } else {
                const itemRef = doc(db, 'items', item.id);
                await updateDoc(itemRef, {
                    itemName: item.itemName,
                    itemPrice: item.itemPrice,
                    itemQuantity: item.itemQuantity,
                    transferTo: item.transferTo,
                    splits: item.splits,
                });
            }

            window.location.href = `/#view-event/${eventId}`;
        }
    }

    return (
        <Container style={{height: '100%'}}>
            <Row className='justify-content-center'>
                <Col xs={10}>
                    <Card style={{border: 0}} className='my-3'>
                        <Card.Header style={{backgroundColor: '#80b1b3'}} as="h4">
                            <MdEdit size={30} /> Edit event
                        </Card.Header>
                        <Card.Body style={{backgroundColor: '#f7fafa'}}>
                        {isLoading?
                            <div className='d-flex justify-content-center my-3'>
                                <Spinner animation="border" size='lg' />
                            </div>:
                            <>
                                <Form>
                                    <Form.Group as={Row} className="mb-3" controlId="formPlaintextEmail">
                                        <Form.Label column sm="2">
                                            Event name
                                        </Form.Label>
                                        <Col sm="10">
                                            <Form.Control 
                                                type="text" 
                                                placeholder="Enter event name" 
                                                onChange={(e) => setEvent({ ...event, name: e.target.value })}
                                                value={event.name}
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
                                                placeholder="Enter event date" 
                                                onChange={(e) => setEvent({ ...event, date: e.target.value })}
                                                value={event.date}
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
                                                placeholder="Enter event description"
                                                onChange={(e) => setEvent({ ...event, description: e.target.value })}
                                                value={event.description}
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
                                            <Alert variant='danger' show={memberError.length !== 0}>
                                                {memberError}
                                            </Alert>
                                            {event.members.length?
                                                event.members.map((member, index) => (
                                                    <div key={`member-${index}`} className='my-2'>
                                                        <Form.Group as={Row} className="mb-3">
                                                            <Form.Label column sm="2">
                                                                Member {index + 1}
                                                            </Form.Label>
                                                            <Col sm="10">
                                                                <Form.Control
                                                                    type="text"
                                                                    placeholder="Enter member email"
                                                                    onChange={(e) => handleChangeMemberEmail(e, index)}
                                                                    value={member.email}
                                                                />
                                                            </Col>
                                                        </Form.Group>
                                                    </div>
                                                )):
                                                <p>No members added</p>
                                            }
                                        </Card.Body>
                                        <Card.Footer style={{backgroundColor: '#80b1b3'}}>
                                            <Button variant='primary' onClick={() => {
                                                let copiedMembers = [...event.members];
                                                copiedMembers.push({ email: '' });
                                                setEvent({ ...event, members: copiedMembers });
                                                let copiedItems = [...items];
                                                copiedItems.forEach(item => {
                                                    item.splits.push({
                                                        email: '', 
                                                        amount: 0, 
                                                        isChecked: false,
                                                        isSettled: false
                                                    });
                                                });
                                            }}>
                                                <BsPersonFillAdd /> Add member
                                            </Button>
                                        </Card.Footer>
                                    </Card>
                                    <Card>
                                        <Card.Header style={{backgroundColor: '#80b1b3'}}>
                                            <h5 className='my-1'>
                                                <BsDatabaseFill size={25} /> Items
                                            </h5>
                                        </Card.Header>
                                        <Card.Body>
                                            {items.length?
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
                                                                            placeholder="Enter item name" 
                                                                            onChange={(e) => {
                                                                                let copiedItems = [...items];
                                                                                copiedItems[index].itemName = e.target.value;
                                                                                setItems(copiedItems);
                                                                            }}
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
                                                                            placeholder="Enter item price" 
                                                                            onChange={(e) => {
                                                                                let copiedItems = [...items];
                                                                                copiedItems[index].itemPrice = e.target.value;
                                                                                updateMemberSplits(event.members, copiedItems, index);
                                                                                setItems(copiedItems);
                                                                            }}
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
                                                                            placeholder="Enter item quantity" 
                                                                            onChange={(e) => {
                                                                                let copiedItems = [...items];
                                                                                copiedItems[index].itemQuantity = e.target.value;
                                                                                updateMemberSplits(event.members, copiedItems, index);
                                                                                setItems(copiedItems);
                                                                            }}
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
                                                                            placeholder="Enter transfer details of person to e-transfer to" 
                                                                            onChange={(e) => {
                                                                                let copiedItems = [...items];
                                                                                copiedItems[index].transferTo = e.target.value;
                                                                                setItems(copiedItems);
                                                                            }}
                                                                            value={item.transferTo}
                                                                        />
                                                                    </Col>
                                                                </Form.Group>
                                                                <Form.Group as={Row} className="mb-3">
                                                                    <Form.Label column sm="2">
                                                                        Shared among
                                                                    </Form.Label>
                                                                    <Col sm="10">
                                                                    {item.splits.length?
                                                                        item.splits.map((member, i) => (
                                                                            <Form.Check 
                                                                                key={`item-${index}-member-${i}`}
                                                                                type="checkbox" 
                                                                                label={member.email}
                                                                                onChange={() => handleItemSplitChange(index, i)}
                                                                                checked={item.splits[i].isChecked}
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
                                                : 
                                                <p>No items added</p>
                                            }
                                        </Card.Body>
                                        <Card.Footer style={{backgroundColor: '#80b1b3'}}>
                                            <Button variant='primary' onClick={handleAddItems}>
                                                <BsDatabaseFillAdd /> Add item
                                            </Button>
                                        </Card.Footer>
                                    </Card>
                                </Form>
                            </>
                        }
                        </Card.Body>
                        <Card.Footer style={{backgroundColor: '#80b1b3'}}>
                            <Button variant="primary" type="submit" onClick={handleUpdateEvent}>
                                <MdOutlineSaveAs /> Save changes
                            </Button>
                        </Card.Footer>
                    </Card>
                </Col>
            </Row>
        </Container>
    )
}

export default EditEvent;
