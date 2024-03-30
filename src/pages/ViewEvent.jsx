import React, {useState, useEffect} from 'react'
import { 
    Form, 
    Button,
    Card,
    Col,
    Row,
    Container,
    Accordion
} from 'react-bootstrap'
import { BsDatabaseFill, BsPersonFillAdd, BsDatabaseFillAdd } from "react-icons/bs";
import { MdOutlineSafetyDivider, MdModeEditOutline, MdDelete } from "react-icons/md";
import { FaPeopleGroup } from "react-icons/fa6";
import { FaSave } from "react-icons/fa";
import { collection, getDocs, getDoc, doc, updateDoc, where, query, deleteDoc, addDoc } from 'firebase/firestore';
import { db } from '../firebase-config';

const ViewEvent = () => {
    const eventsCollectionRef = collection(db, 'events');
    const itemMemberShareCollectionRef = collection(db, 'item-member-shares');
    const [events, setEvents] = useState([]);
    const [editable, setEditable] = useState({
        eventName: false,
        eventDate: false,
        eventDescription: false
    });

    const updateEvent = async (eventName, eventDate, eventDescription, eventId) => {
        const eventDoc = doc(db, 'events', eventId);
        const newFields = {
            eventName: eventName,
            eventDate: eventDate,
            eventDescription: eventDescription
        }
        await updateDoc(eventDoc, newFields);
    }

    const updateMember = async (email, memberId) => {
        console.log(memberId);
        const memberDoc = doc(db, 'members', memberId);
        const newFields = {
            email: email
        }
        for (const event of events) {
            for (const item of event.eventItems) {
                for (const member of item.members) {
                    if (member.id === memberId) {
                        member.email = email;
                    }
                }
            }
        }
        await updateDoc(memberDoc, newFields);
    }

    const updateItem = async (itemName, itemQuantity, itemPrice, itemId) => {
        const itemDoc = doc(db, 'items', itemId);
        const newFields = {
            itemName: itemName,
            itemQuantity: itemQuantity,
            itemPrice: itemPrice
        }
        const memberQuery = query(collection(db, 'item-member-shares'), where('item', '==', itemDoc));
        const memberSnapshot = await getDocs(memberQuery);
        for (const docRef of memberSnapshot.docs) {
            const shareDoc = doc(db, 'item-member-shares', docRef.id);
            const newShare = (itemQuantity * itemPrice) / memberSnapshot.docs.length;
            console.log(newShare);
            const newFields = {
                share: newShare
            }
            await updateDoc(shareDoc, newFields);
        }

        setEvents(prevEvents => {
            const updatedEvents = [...prevEvents];
            for (const event of updatedEvents) {
                for (const item of event.eventItems) {
                    if (item.id === itemId) {
                        for (const member of item.members) {
                            member.share = (itemQuantity * itemPrice) / item.members.length;
                        }
                        break;
                    }
                }
            }
            return updatedEvents;
        });

        await updateDoc(itemDoc, newFields);
    }

    const deleteMember = async (memberId, eventId) => {
        const eventDoc = doc(db, 'events', eventId);
        const eventSnapshot = await getDoc(eventDoc);

        if (eventSnapshot.exists()) {
            const eventData = eventSnapshot.data();
            const newMembers = eventData.eventMembers.filter(member => member.id !== memberId);
            const newFields = {
                eventMembers: newMembers
            }
            await updateDoc(eventDoc, newFields);

            for (const itemRef of eventData.eventItems) {
                const itemMemberShareQuery = query(collection(db, 'item-member-shares'), where('item', '==', itemRef), where('member', '==', doc(db, 'members', memberId)));
                const itemMemberShareSnapshot = await getDocs(itemMemberShareQuery);
                for (const docRef of itemMemberShareSnapshot.docs) {
                    await deleteDoc(docRef.ref);
                }
            }
        }
    }

    const deleteItem = async (itemId, eventId) => {
        const eventDoc = doc(db, 'events', eventId);
        const eventSnapshot = await getDoc(eventDoc);

        if (eventSnapshot.exists()) {
            const eventData = eventSnapshot.data();
            const newItems = eventData.eventItems.filter(item => item.id !== itemId);
            const newFields = {
                eventItems: newItems
            }
            await updateDoc(eventDoc, newFields);

            for (const itemRef of eventData.eventItems) {
                const itemMemberShareQuery = query(collection(db, 'item-member-shares'), where('item', '==', itemRef), where('item', '==', doc(db, 'items', itemId)));
                const itemMemberShareSnapshot = await getDocs(itemMemberShareQuery);
                for (const docRef of itemMemberShareSnapshot.docs) {
                    await deleteDoc(docRef.ref);
                }
            }

            const itemDoc = doc(db, 'items', itemId);
            await deleteDoc(itemDoc);
        }
    }

    const addMember = async (email, eventId, index) => {
        const memberDoc = await addDoc(collection(db, 'members'), {
            email: email
        });

        for (const event of events) {
            if (event.id === eventId) {
                for (const item of event.eventItems) {
                    const itemDocRef = doc(db, 'items', item.id);
                    await addDoc(collection(db, 'item-member-shares'), {
                        isSharing: false,
                        item: itemDocRef,
                        member: memberDoc,
                        share: 0
                    });
                }
            }
        }

        const updatedEvents = [...events];
        updatedEvents[index].eventMembers = [...updatedEvents[index].eventMembers, {email: 'example@example.com', share: 0, id: memberDoc.id, isSharing: false}];
        setEvents(updatedEvents);
        const updatedEditable = { ...editable };
        updatedEditable[updatedEvents[index].eventMembers[updatedEvents[index].eventMembers.length - 1].id] = false;
        setEditable(updatedEditable);
    }

    const addItem = async (itemName, itemQuantity, itemPrice, eventId, index) => {
        const itemDoc = await addDoc(collection(db, 'items'), {
            itemName: itemName,
            itemQuantity: itemQuantity,
            itemPrice: itemPrice
        });

        // add item references to event
        const eventDoc = doc(db, 'events', eventId);
        const eventSnapshot = await getDoc(eventDoc);
        if (eventSnapshot.exists()) {
            const eventData = eventSnapshot.data();
            const newFields = {
                eventItems: [...eventData.eventItems, itemDoc]
            }
            await updateDoc(eventDoc, newFields);
        }

        for (const event of events) {
            if (event.id === eventId) {
                for (const member of event.eventMembers) {
                    const memberDocRef = doc(db, 'members', member.id);
                    await addDoc(collection(db, 'item-member-shares'), {
                        isSharing: false,
                        item: itemDoc,
                        member: memberDocRef,
                        share: 0
                    });
                }
            }
        }

        const updatedEvents = [...events];
        updatedEvents[index].eventItems = [...updatedEvents[index].eventItems, {itemName: 'example', itemQuantity: 0, itemPrice: 0, members: updatedEvents[index].eventMembers.map(member => ({email: member.email, share: 0, id: member.id, isSharing: false}))}];
        setEvents(updatedEvents);
        const updatedEditable = { ...editable };
        updatedEditable[updatedEvents[index].eventItems[updatedEvents[index].eventItems.length - 1].id] = false;
        setEditable(updatedEditable);
    }

    const updateSharingMembers = async (itemId, memberId, isSharing) => {
        const itemDoc = doc(db, 'items', itemId);
        const memberDoc = doc(db, 'members', memberId);
        const itemMemberShareQuery = query(collection(db, 'item-member-shares'), where('item', '==', itemDoc), where('member', '==', memberDoc));
        const itemMemberShareSnapshot = await getDocs(itemMemberShareQuery);
        for (const docRef of itemMemberShareSnapshot.docs) {
            const shareDoc = doc(db, 'item-member-shares', docRef.id);
            const newFields = {
                isSharing: isSharing
            }
            await updateDoc(shareDoc, newFields);
        }
    }

    useEffect(() => {
        const getTest = async () => {
            const eventsSnapshot = await getDocs(eventsCollectionRef);
            const itemMemberShareSnapshot = await getDocs(itemMemberShareCollectionRef);
            const eventsData = [];

            for (const docRef of eventsSnapshot.docs) {
                const eventData = docRef.data();

                const eventItems = [];

                for (const itemRef of eventData.eventItems) {
                    const itemDoc = await getDoc(itemRef);

                    const itemMembers = [];

                    for (const itemMemberShareRef of itemMemberShareSnapshot.docs) {
                        const itemMemberShareData = itemMemberShareRef.data();
                        if (itemMemberShareData.item.id === itemDoc.id) {
                            const memberDoc = await getDoc(itemMemberShareData.member);
                            const memberData = memberDoc.data();

                            itemMembers.push({
                                ...memberData,
                                id: memberDoc.id,
                                share: itemMemberShareData.share,
                                isSharing: itemMemberShareData.isSharing
                            });

                            setEditable(prevEditable => ({
                                ...prevEditable,
                                [memberDoc.id]: false
                            }));
                        }
                    }

                    if (itemDoc.exists()) {
                        const itemData = itemDoc.data();
                        eventItems.push({
                            ...itemData,
                            id: itemDoc.id,
                            members: itemMembers
                        });
                        
                        setEditable(prevEditable => ({
                            ...prevEditable,
                            [itemDoc.id]: {
                                ...prevEditable[itemDoc.id],
                                itemName: false,
                                itemQuantity: false,
                                itemPrice: false
                            }
                        }));

                    } else {
                        console.error(`Item document ${itemRef.id} does not exist`);
                    }  
                }

                eventsData.push({
                    ...eventData,
                    id: docRef.id,
                    eventMembers: eventItems[0].members,
                    eventItems: eventItems
                });
            }

            setEvents(eventsData);
        }

        getTest();
    }, []);

    return (
        (events.map((event, index) => {
            return (<Container style={{height: '100%'}} className='py-3' key={index}>
                <Row className='justify-content-center'>
                    <Col xs={10}>
                        <Card style={{borderRadius: 0, border: 0}}>
                            <Card.Header style={{backgroundColor: '#80b1b3', borderRadius: 0}}>
                                <h4 className='my-2'>
                                    <MdOutlineSafetyDivider size={40} /> View event
                                </h4>
                            </Card.Header>
                            <Card.Body style={{backgroundColor: '#f7fafa'}}>
                                <Form>
                                    <Form.Group className="mb-3" controlId="formBasicEmail">
                                        <Form.Label>Event name</Form.Label>
                                        <div className='d-flex justify-content-end'>
                                            <Form.Control
                                                disabled = {!editable.eventName}
                                                type="text" 
                                                placeholder="Enter event name" 
                                                value={event.eventName}
                                                onChange={(e) => {
                                                    const updatedEvents = [...events];
                                                    updatedEvents[index] = { ...updatedEvents[index], eventName: e.target.value };
                                                    setEvents(updatedEvents);
                                                }}
                                            />
                                            {editable.eventName === false ?
                                                <Button variant="info" className="ms-2 d-flex align-items-center" onClick={(e) => {
                                                    setEditable({...editable, eventName: true});
                                                }}>
                                                    <MdModeEditOutline style={{ marginRight: 2 }}/> Edit
                                                </Button>:
                                                <Button variant="info" className="ms-2 d-flex align-items-center" onClick={(e) => {
                                                    setEditable({...editable, eventName: false});
                                                    updateEvent(event.eventName, event.eventDate, event.eventDescription, event.id);
                                                }}>
                                                    <FaSave style={{ marginRight: 2 }}/> Save
                                                </Button>
                                            }
                                        </div>
                                    </Form.Group>
                                    <Form.Group className="mb-3" controlId="formBasicPassword">
                                        <Form.Label>Event date</Form.Label>
                                        <div className='d-flex justify-content-end'>
                                            <Form.Control 
                                                disabled = {!editable.eventDate}
                                                type="date" 
                                                placeholder="Enter event date" 
                                                value={event.eventDate}
                                                onChange={(e) => {
                                                    const updatedEvents = [...events];
                                                    updatedEvents[index] = { ...updatedEvents[index], eventDate: e.target.value };
                                                    setEvents(updatedEvents);
                                                }}
                                            />
                                            {editable.eventDate === false ?
                                                <Button variant="info" className="ms-2 d-flex align-items-center" onClick={(e) => {
                                                    setEditable({...editable, eventDate: true});
                                                }}>
                                                    <MdModeEditOutline style={{ marginRight: 2 }}/> Edit
                                                </Button>:
                                                <Button variant="info" className="ms-2 d-flex align-items-center" onClick={(e) => {
                                                    setEditable({...editable, eventDate: false});
                                                    updateEvent(event.eventName, event.eventDate, event.eventDescription, event.id);
                                                }}>
                                                    <FaSave style={{ marginRight: 2 }}/> Save
                                                </Button>
                                            }
                                        </div>
                                    </Form.Group>
                                    <Form.Group className="mb-3" controlId="formBasicPassword">
                                        <Form.Label>Event description</Form.Label>
                                        <div className='d-flex justify-content-end'>
                                            <Form.Control 
                                                disabled = {!editable.eventDescription}
                                                type="text" 
                                                placeholder="Enter event date" 
                                                value={event.eventDescription}
                                                onChange={(e) => {
                                                    const updatedEvents = [...events];
                                                    updatedEvents[index] = { ...updatedEvents[index], eventDescription: e.target.value };
                                                    setEvents(updatedEvents);
                                                }}
                                            />
                                            {editable.eventDescription === false ?
                                                <Button variant="info" className="ms-2 d-flex align-items-center" onClick={(e) => {
                                                    setEditable({...editable, eventDescription: true});
                                                }}>
                                                    <MdModeEditOutline style={{ marginRight: 2 }}/> Edit
                                                </Button>:
                                                <Button variant="info" className="ms-2 d-flex align-items-center" onClick={(e) => {
                                                    setEditable({...editable, eventDescription: false});
                                                    updateEvent(event.eventName, event.eventDate, event.eventDescription, event.id);
                                                }}>
                                                    <FaSave style={{ marginRight: 2 }}/> Save
                                                </Button>
                                            }
                                        </div>
                                    </Form.Group>
                                    <Card className='mb-3'>
                                        <Card.Header style={{backgroundColor: '#dae7f1'}}>
                                            <h5 className='my-2'>
                                                <FaPeopleGroup /> Members
                                            </h5>
                                        </Card.Header>
                                        <Card.Body style={{backgroundColor: '#f8f8f8'}}>
                                            {event.eventMembers.length? event.eventMembers.map((member, idx) => {
                                                return (
                                                    <Form.Group className="mb-3" controlId="formBasicPassword" key={idx}>
                                                        <Form.Label>Member {idx + 1}</Form.Label>
                                                        <div className='d-flex justify-content-end'>
                                                            <Form.Control
                                                                disabled = {!editable[member.id]}
                                                                type="email" 
                                                                placeholder="Enter member email" 
                                                                value={member.email}
                                                                onChange={(e) => {
                                                                    const updatedEvents = [...events];
                                                                    updatedEvents[index].eventMembers = [...updatedEvents[index].eventMembers];
                                                                    updatedEvents[index].eventMembers[idx] = {
                                                                        ...updatedEvents[index].eventMembers[idx],
                                                                        email: e.target.value
                                                                    };
                                                                    setEvents(updatedEvents);
                                                                }}
                                                            />
                                                            {editable[member.id] === false ?
                                                                <Button variant="info" className="ms-2 d-flex align-items-center" onClick={(e) => {
                                                                    const updatedEditable = { ...editable };
                                                                    updatedEditable[member.id] = true;
                                                                    setEditable(updatedEditable);
                                                                }}>
                                                                    <MdModeEditOutline style={{ marginRight: 2 }}/> Edit
                                                                </Button>:
                                                                <Button variant="info" className="ms-2 d-flex align-items-center" onClick={(e) => {
                                                                    const updatedEditable = { ...editable };
                                                                    console.log(member);
                                                                    updatedEditable[member.id] = false;
                                                        
                                                                    setEditable(updatedEditable);
                                                                    updateMember(member.email, member.id);
                                                                }}>
                                                                    <FaSave style={{ marginRight: 2 }}/> Save
                                                                </Button>
                                                            }
                                                            <Button variant='danger' className="ms-2 d-flex align-items-center" onClick={(e) => {
                                                                const updatedEvents = [...events];
                                                                updatedEvents[index].eventMembers = updatedEvents[index].eventMembers.filter(m => m.id !== member.id);
                                                                const updatedEditable = { ...editable };
                                                                delete updatedEditable[member.id];
                                                                setEvents(updatedEvents);
                                                                setEditable(updatedEditable);
                                                                deleteMember(member.id, event.id);
                                                            }}>
                                                                <MdDelete style={{ marginRight: 2 }}/> Remove
                                                            </Button>
                                                        </div>
                                                    </Form.Group>
                                                )
                                            }) : <p>No members added</p>}
                                            <Button variant='primary'
                                                onClick={(e) => {
                                                    addMember('example@example.com', event.id, index);
                                                }}
                                            >
                                                <BsPersonFillAdd /> Add member
                                            </Button>
                                        </Card.Body>
                                    </Card>
                                    <Card>
                                        <Card.Header style={{backgroundColor: '#dae7f1'}}>
                                            <h5 className='my-2'>
                                                <BsDatabaseFill /> Items
                                            </h5>
                                        </Card.Header>
                                        <Card.Body style={{backgroundColor: '#f8f8f8'}}>
                                            <Accordion alwaysOpen>
                                                {event.eventItems.length? event.eventItems.map((item, idx) => {
                                                    return (
                                                        <Accordion.Item eventKey={idx} key={idx}>
                                                            <Accordion.Header>
                                                                <h6>Item {idx + 1}</h6>
                                                            </Accordion.Header>
                                                            <Accordion.Body>
                                                                <Form.Group className="mb-3" controlId="formBasicPassword" key={index}>
                                                                    <Form.Label>Item name</Form.Label>
                                                                    <div className='d-flex justify-content-end'>
                                                                        <Form.Control 
                                                                            disabled = {!editable[item.id].itemName}
                                                                            type="text" 
                                                                            placeholder="Enter item" 
                                                                            value={item.itemName}
                                                                            onChange={(e) => {
                                                                                const updatedEvents = [...events];
                                                                                updatedEvents[index].eventItems = [...updatedEvents[index].eventItems];
                                                                                updatedEvents[index].eventItems[idx] = {...updatedEvents[index].eventItems[idx]}
                                                                                updatedEvents[index].eventItems[idx].itemName = e.target.value;
                                                                                setEvents(updatedEvents);
                                                                            }}
                                                                        />
                                                                        {editable[item.id] && editable[item.id].itemName === false ?
                                                                            <Button variant="info" className="ms-2 d-flex align-items-center" onClick={(e) => {
                                                                                const updatedEditable = { ...editable };
                                                                                updatedEditable[item.id] = updatedEditable[item.id] || {};
                                                                                updatedEditable[item.id].itemName = true;
                                                                                setEditable(updatedEditable);
                                                                            }}>
                                                                                <MdModeEditOutline style={{ marginRight: 2 }}/> Edit
                                                                            </Button>:
                                                                            <Button variant="info" className="ms-2 d-flex align-items-center" onClick={(e) => {
                                                                                const updatedEditable = { ...editable };
                                                                                updatedEditable[item.id] = updatedEditable[item.id] || {};
                                                                                updatedEditable[item.id].itemName = false;
                                                                                setEditable(updatedEditable);
                                                                                updateItem(item.itemName, item.itemQuantity, item.itemPrice, item.id);
                                                                            }}>
                                                                                <FaSave style={{ marginRight: 2 }}/> Save
                                                                            </Button>
                                                                        }
                                                                    </div>
                                                                </Form.Group>
                                                                <Form.Group className="mb-3" controlId="formBasicPassword" key={index}>
                                                                    <Form.Label>Item quantity</Form.Label>
                                                                    <div className='d-flex justify-content-end'>
                                                                        <Form.Control 
                                                                            disabled = {!editable[item.id]?.itemQuantity}
                                                                            type="number" 
                                                                            placeholder="Enter item quantity" 
                                                                            value={item.itemQuantity}
                                                                            onChange={(e) => {
                                                                                const updatedEvents = [...events];
                                                                                updatedEvents[index].eventItems = [...updatedEvents[index].eventItems];
                                                                                updatedEvents[index].eventItems[idx] = {...updatedEvents[index].eventItems[idx]}
                                                                                updatedEvents[index].eventItems[idx].itemQuantity = e.target.value;
                                                                                setEvents(updatedEvents);
                                                                            }}
                                                                        />
                                                                        {editable[item.id] && editable[item.id].itemQuantity === false ?
                                                                            <Button variant="info" className="ms-2 d-flex align-items-center" onClick={(e) => {
                                                                                const updatedEditable = { ...editable };
                                                                                updatedEditable[item.id] = updatedEditable[item.id] || {};
                                                                                updatedEditable[item.id].itemQuantity = true;
                                                                                setEditable(updatedEditable);
                                                                            }}>
                                                                                <MdModeEditOutline style={{ marginRight: 2 }}/> Edit
                                                                            </Button>:
                                                                            <Button variant="info" className="ms-2 d-flex align-items-center" onClick={(e) => {
                                                                                const updatedEditable = { ...editable };
                                                                                updatedEditable[item.id] = updatedEditable[item.id] || {};
                                                                                updatedEditable[item.id].itemQuantity = false;
                                                                                setEditable(updatedEditable);
                                                                                updateItem(item.itemName, item.itemQuantity, item.itemPrice, item.id);
                                                                            }}>
                                                                                <FaSave style={{ marginRight: 2 }}/> Save
                                                                            </Button>
                                                                        }
                                                                    </div>
                                                                </Form.Group>
                                                                <Form.Group className="mb-3" controlId="formBasicPassword" key={index}>
                                                                    <Form.Label>Item price</Form.Label>
                                                                    <div className='d-flex justify-content-end'>
                                                                        <Form.Control 
                                                                            disabled = {!editable[item.id]?.itemPrice}
                                                                            type="number" 
                                                                            placeholder="Enter item price" 
                                                                            value={item.itemPrice}
                                                                            onChange={(e) => {
                                                                                const updatedEvents = [...events];
                                                                                updatedEvents[index].eventItems = [...updatedEvents[index].eventItems];
                                                                                updatedEvents[index].eventItems[idx] = {...updatedEvents[index].eventItems[idx]}
                                                                                updatedEvents[index].eventItems[idx].itemPrice = e.target.value;
                                                                                setEvents(updatedEvents);
                                                                            }}
                                                                        />
                                                                        {editable[item.id] && editable[item.id].itemPrice === false ?
                                                                            <Button variant="info" className="ms-2 d-flex align-items-center" onClick={(e) => {
                                                                                const updatedEditable = { ...editable };
                                                                                updatedEditable[item.id] = { ...editable[item.id]}
                                                                                updatedEditable[item.id].itemPrice = true;
                                                                                setEditable(updatedEditable);
                                                                            }}>
                                                                                <MdModeEditOutline style={{ marginRight: 2 }}/> Edit
                                                                            </Button>:
                                                                            <Button variant="info" className="ms-2 d-flex align-items-center" onClick={(e) => {
                                                                                const updatedEditable = { ...editable };
                                                                                updatedEditable[item.id] = updatedEditable[item.id] || {};
                                                                                updatedEditable[item.id].itemPrice = false;
                                                                                setEditable(updatedEditable);
                                                                                updateItem(item.itemName, item.itemQuantity, item.itemPrice, item.id);
                                                                            }}>
                                                                                <FaSave style={{ marginRight: 2 }}/> Save
                                                                            </Button>
                                                                        }
                                                                    </div>
                                                                </Form.Group>
                                                                <Card className='mb-3' style={{backgroundColor: '#F5F5F5'}}>
                                                                    <Card.Header>
                                                                        Share the blame
                                                                    </Card.Header>
                                                                    <Card.Body>
                                                                        <Card className='mb-3'>
                                                                            <Card.Header>
                                                                                Split between
                                                                            </Card.Header>
                                                                            <Card.Body>
                                                                                {item.members.length? item.members.map((member, i) => {
                                                                                    return (
                                                                                        <Form.Check
                                                                                            key={idx}
                                                                                            inline
                                                                                            label={member.email}
                                                                                            name="group1"
                                                                                            type='checkbox'
                                                                                            id={`member-${idx + 1}`}
                                                                                            checked={member.isSharing}
                                                                                            onChange={(e) => {
                                                                                                const updatedEvents = [...events];
                                                                                                updatedEvents[index].eventItems = [...updatedEvents[index].eventItems];
                                                                                                updatedEvents[index].eventItems[idx] = {...updatedEvents[index].eventItems[idx]}
                                                                                                updatedEvents[index].eventItems[idx].members = [...updatedEvents[index].eventItems[idx].members];
                                                                                                updatedEvents[index].eventItems[idx].members[i] = {...updatedEvents[index].eventItems[idx].members[i]};
                                                                                                updatedEvents[index].eventItems[idx].members[i].isSharing = e.target.checked;
                                                                                                setEvents(updatedEvents);
                                                                                            }}
                                                                                        />
                                                                                    )
                                                                                }) : <p>No members added</p>}
                                                                            </Card.Body>
                                                                            <Card.Footer>
                                                                                <Button variant='info' onClick={(e) => {
                                                                                    for (const member of item.members) {
                                                                                        updateSharingMembers(item.id, member.id, member.isSharing);
                                                                                    }
                                                                                }}>
                                                                                    <FaSave style={{ marginRight: 2 }}/> Save changes
                                                                                </Button>
                                                                            </Card.Footer>
                                                                        </Card>
                                                                        {item.members.length? item.members.map((member, i) => {
                                                                            return (
                                                                                <Card className="mb-3" key={i}>
                                                                                    <Card.Body>
                                                                                        <Form.Group className="mb-3" controlId="formBasicPassword" key={index}>
                                                                                            <Form.Label>Email</Form.Label>
                                                                                            <Form.Control
                                                                                                disabled
                                                                                                type="text" 
                                                                                                value={member.email}
                                                                                            />
                                                                                        </Form.Group>
                                                                                        <Form.Group className="mb-3" controlId="formBasicPassword" key={index}>
                                                                                            <Form.Label>Share</Form.Label>
                                                                                            <Form.Control
                                                                                                disabled
                                                                                                type="text" 
                                                                                                value={member.share}
                                                                                            />
                                                                                        </Form.Group>
                                                                                    </Card.Body>
                                                                                </Card>
                                                                            )
                                                                        }) : <p>No members added</p>}
                                                                    </Card.Body>
                                                                </Card>
                                                                <Button variant='danger' className="d-flex align-items-center"
                                                                    onClick={(e) => {
                                                                        const updatedEvents = [...events];
                                                                        updatedEvents[index].eventItems = updatedEvents[index].eventItems.filter(i => i.id !== item.id);
                                                                        const updatedEditable = { ...editable };
                                                                        delete updatedEditable[item.id];
                                                                        setEvents(updatedEvents);
                                                                        setEditable(updatedEditable);
                                                                        deleteItem(item.id, event.id);
                                                                    }}
                                                                >
                                                                    <MdDelete style={{ marginRight: 2 }}/> Remove
                                                                </Button>
                                                            </Accordion.Body>
                                                        </Accordion.Item>
                                                    )
                                                }): <p>No items added</p>}
                                            </Accordion>
                                            <Button className='mt-3' onClick={(e) => {
                                                addItem('example', 0, 0, event.id, index);
                                            }}>
                                                <BsDatabaseFillAdd /> Add item
                                            </Button>
                                        </Card.Body>
                                    </Card>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>)
        }))
    )
}

export default ViewEvent