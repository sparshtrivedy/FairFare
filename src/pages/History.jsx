import React, {useContext, useEffect, useState} from 'react'
import { AuthContext } from '../App'
import { collection, query, where, getDocs, getDoc } from "firebase/firestore";
import { db } from '../firebase-config';
import { 
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Table
} from 'react-bootstrap';
import { 
    GiPayMoney,
    GiReceiveMoney,
} from "react-icons/gi";

const History = () => {
    const {userEmail} = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(false);
    const [owedItems, setOwedItems] = useState([]);
    const [lentItems, setLentItems] = useState([]);

    useEffect(() => {
        const fetchOwedItems = async () => {
            setIsLoading(true);
            
            const owedQuery = query(collection(db, "events"), where("members", "array-contains", {
                email: userEmail
            }));

            const owedSnapshot = await getDocs(owedQuery);
            const settledOwedItems = [];
            const usersEventsTemp = [];

            for (const doc of owedSnapshot.docs) {
                const itemSplits = [];
                const eventRef = doc.ref;

                const itemsQuery = query(collection(db, "items"), where("event", "==", eventRef));
                const itemsSnapshot = await getDocs(itemsQuery);
                if (!itemsSnapshot.empty) {
                    itemsSnapshot.forEach((doc) => {
                        itemSplits.push(doc.data().splits);
                    });
                      
                    let total = 0;
                    for (const split of itemSplits) {
                        for (const user of split) {
                            if (user.email === userEmail && user.isSettled) {
                                total += user.amount;
                            }
                        }
                    }

                    usersEventsTemp.push({
                        eventId: doc.id,
                        eventName: doc.data().name,
                        eventDate: doc.data().date,
                        balance: total,
                        email: userEmail
                    });
                }
            }

            const lentQuery = query(collection(db, "items"), where("transferTo", "==", userEmail));
            const lentSnapshot = await getDocs(lentQuery);

            for (const doc of lentSnapshot.docs) {
                const item = doc.data();
                console.log(item);
                const eventRef = await getDoc(item.event);
                const event = eventRef.data();

                const tempSplits = [];
                let amount = 0;

                for (const split of item.splits) {
                    if (split.isSettled) {
                        tempSplits.push({
                            email: split.email,
                            amount: split.amount,
                            isChecked: split.isChecked,
                            isSettled: split.isSettled
                        });
                        amount += split.amount;
                    }
                }

                if (amount) {
                    settledOwedItems.push({
                        id: doc.id,
                        eventId: item.event.id,
                        eventName: event.name,
                        itemName: item.itemName,
                        itemPrice: item.itemPrice,
                        itemQuantity: item.itemQuantity,
                        youAreOwed: amount.toFixed(2),
                        members: tempSplits
                    });
                }
            }

            setLentItems(settledOwedItems);

            const tempUsersEvents = [];
            for (const event of usersEventsTemp) {
                tempUsersEvents.push({
                    eventId: event.eventId,
                    eventName: event.eventName,
                    eventDate: event.eventDate,
                    balance: event.balance.toFixed(2),
                    email: event.email
                });
            }

            setOwedItems(tempUsersEvents);

            setIsLoading(false);
        }

        fetchOwedItems();
    }, [])

    return (
        <>
            <Container style={{height: '100%'}}>
                <Row className='justify-content-center d-flex' xs={12}>
                    <Col xs={6}>
                        <Card style={{border: 0}} className='my-3'>
                            <Card.Header style={{backgroundColor: '#80b1b3'}} as="h4" className='d-flex align-items-center justify-content-center'>
                                <GiPayMoney size={30} style={{marginRight: '5px'}}/> Paid by you
                            </Card.Header>
                            <Card.Body className='d-flex flex-wrap justify-content-center m-0 p-3'>
                                {isLoading?
                                    <Spinner animation="border" size='lg' className='m-3' />:
                                    <Table striped bordered hover className='mb-0'>
                                        <thead>
                                            <tr>
                                                <th>Event name</th>
                                                <th>Event date</th>
                                                <th>Amount</th>
                                                <th>To</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {owedItems.map((item, index) => (
                                                <tr key={item.eventId}>
                                                    <td>{item.eventName}</td>
                                                    <td>{item.eventDate}</td>
                                                    <td>{item.balance}</td>
                                                    <td>{item.email}</td>
                                                    <td>
                                                        <Button variant='primary'>View</Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                }
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col xs={6}>
                        <Card style={{border: 0}} className='my-3'>
                            <Card.Header style={{backgroundColor: '#80b1b3'}} as="h4" className='d-flex align-items-center justify-content-center'>
                                <GiReceiveMoney size={30} style={{marginRight: '5px'}}/> Paid to you
                            </Card.Header>
                            <Card.Body className='d-flex flex-wrap justify-content-center m-0 p-3'>
                                {isLoading?
                                    <Spinner animation="border" size='lg' className='m-3' />:
                                    <Table striped bordered hover className='mb-0'>
                                        <thead>
                                            <tr>
                                                <th>Event Name</th>
                                                <th>Item Name</th>
                                                <th>From</th>
                                                <th>Amount</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {lentItems.map((item, index) => (
                                                <tr key={item.id}>
                                                    <td>{item.eventName}</td>
                                                    <td>{item.itemName}</td>
                                                    <td>
                                                        {item.members && item.members.map((member) => member.email).join(', ')}
                                                    </td>
                                                    <td>{item.youAreOwed}</td>
                                                    <td>
                                                        <Button variant='primary'>View</Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                }
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    )
}

export default History