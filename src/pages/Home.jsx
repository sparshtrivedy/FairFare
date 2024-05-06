import React, {useContext, useEffect, useState} from 'react'
import { AuthContext } from '../App'
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from '../firebase-config';
import { 
  MdOutlineDashboard,
  MdOutlineKeyboardDoubleArrowDown,
  MdOutlineKeyboardDoubleArrowUp,
} from "react-icons/md";
import { GrMoney, GrView } from "react-icons/gr";
import { PiTreeStructureBold } from "react-icons/pi";
import { 
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Offcanvas,
  Form,
  Accordion,
  Table
} from 'react-bootstrap';

const Home = () => {
  const { userEmail } = useContext(AuthContext);
  const [usersEvents, setUsersEvents] = useState([]);
  const [showSettlementSummary, setShowSettlementSummary] = useState(false);
  const [showOwingBreakdown, setShowOwingBreakdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedEventItems, setSelectedEventItems] = useState([]);
  const [owedItems, setOwedItems] = useState([]);
  const [selectedOwedItem, setSelectedOwedItem] = useState(null);

  useEffect(() => {
    const getEvents = async () => {
      setIsLoading(true);
      setUsersEvents([]);

      const q = query(collection(db, "events"), where("members", "array-contains", {
        email: userEmail
      }));
      const owedQuery = query(collection(db, "items"), where("transferTo", "==", userEmail));
      const usersEventsTemp = [];

      const querySnapshot = await getDocs(q);
      const owedQuerySnapshot = await getDocs(owedQuery);

      for (const doc of querySnapshot.docs) {
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
              if (user.email === userEmail && !user.isSettled) {
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

      const owedItems = [];

      for (const doc of owedQuerySnapshot.docs) {
        const item = doc.data();
        const eventRef = await getDoc(item.event);
        const event = eventRef.data();
        const tempSplits = [];
        for (const split of item.splits) {
          if (split.isChecked) {
            tempSplits.push({
              email: split.email,
              amount: split.amount,
              isChecked: split.isChecked,
              isSettled: split.isSettled
            });
          }
        }

        const numUnSettled = tempSplits.filter((split) => !split.isSettled).length;
        const numMembers = tempSplits.length;
        const amount = parseFloat(item.itemPrice) * item.itemQuantity * numUnSettled / numMembers;

        if (amount.toFixed(2) > 0) {
          owedItems.push({
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

      setOwedItems(owedItems);
      
      const tempUsersEvents = [];
      for (const event of usersEventsTemp) {
        if (event.balance > 0) {
          tempUsersEvents.push({
            eventId: event.eventId,
            eventName: event.eventName,
            eventDate: event.eventDate,
            balance: event.balance,
            email: event.email
          });
        }
      }
      setUsersEvents(tempUsersEvents);

      setIsLoading(false);
    }

    getEvents();
  }, [userEmail, selectedEventItems]);

  const handleClickSettle = async (event) => {
    setSelectedEvent(event);

    const eventRef = doc(db, "events", event.eventId);

    const itemsQuery = query(collection(db, "items"), where("event", "==", eventRef));
    const itemsSnapshot = await getDocs(itemsQuery);
    const items = itemsSnapshot.docs.map((doc) => {
      return {
        id: doc.id,
        name: doc.data().itemName,
        transferTo: doc.data().transferTo,
        price: doc.data().itemPrice,
        quantity: doc.data().itemQuantity,
        share: doc.data().splits.find((split) => split.email === userEmail).amount,
        splits: doc.data().splits
      }
    });
    setSelectedEventItems(items);
    setShowSettlementSummary(true);
  }

  const handleClickBreakdown = async (item) => {
    setSelectedOwedItem(item);
    setShowOwingBreakdown(true);
  }

  return (
    <>
      <Container style={{height: '100%'}}>
        <Row className='justify-content-center'>
          <Col xs={10}>
            <Card style={{border: 0}} className='my-3'>
              <Card.Header style={{backgroundColor: '#80b1b3'}} as="h4" className='d-flex align-items-center justify-content-center'>
                <MdOutlineDashboard size={30} style={{marginRight: '5px'}}/> Dashboard
              </Card.Header>
              <Card.Body>
                <Card.Title as="h3">Welcome, {userEmail}!</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">
                  Simplify your bill splitting with FairFare. Create an event and invite your friends to join.
                </Card.Subtitle>
              </Card.Body>
              <Card className='mx-3 mb-3'>
                <Card.Header style={{backgroundColor: '#80b1b3'}} as="h4" className='d-flex align-items-center justify-content-center'>
                  <MdOutlineKeyboardDoubleArrowUp size={30} style={{marginRight: '5px'}}/> You owe
                </Card.Header>
                <Card.Body className='d-flex flex-wrap justify-content-center m-0 p-0'>
                  {isLoading? 
                    <Spinner animation="border" size='lg' className='m-3' /> : 
                    <Table striped bordered hover className='m-3'>
                      <thead>
                        <tr>
                          <th>Event name</th>
                          <th>Event date</th>
                          <th>To</th>
                          <th>Balance</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {!usersEvents.length?
                          <tr>
                            <td colSpan='5'>No events found</td>
                          </tr>:
                          usersEvents.map((event, index) => (
                            <tr key={index}>
                              <td>{event.eventName}</td>
                              <td>{event.eventDate}</td>
                              <td>{event.email}</td>
                              <td>{event.balance.toFixed(2)}</td>
                              <td>
                                <Button 
                                  variant='primary' 
                                  onClick={() => window.location.href = `/#view-event/${event.eventId}`}
                                  style={{marginRight: '5px'}}
                                >
                                  <GrView /> View
                                </Button>
                                <Button 
                                  variant='info'
                                  onClick={() => handleClickSettle(event)}
                                >
                                  <GrMoney /> Settle
                                </Button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </Table>}
                </Card.Body>
              </Card>
              <Card className='mx-3 mb-3'>
                <Card.Header style={{backgroundColor: '#80b1b3'}} as="h4" className='d-flex align-items-center justify-content-center'>
                  <MdOutlineKeyboardDoubleArrowDown size={30} style={{marginRight: '5px'}}/> You are owed
                </Card.Header>
                <Card.Body className='d-flex flex-wrap justify-content-center p-0'>
                  {isLoading? 
                    <Spinner animation="border" size='lg' className='m-3' />:
                    <Table striped bordered hover className='m-3'>
                      <thead>
                        <tr>
                          <th>Item name</th>
                          <th>Event name</th>
                          <th>Amount</th>
                          <th>From</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                      {!owedItems.length? 
                        <tr>
                          <td colSpan='5'>No events found</td>
                        </tr>:
                        owedItems.map((item, index) => (
                          <tr key={index}>
                            <td>{item.itemName}</td>
                            <td>{item.eventName}</td>
                            <td>{item.youAreOwed}</td>
                            <td>{item.members && item.members.filter((member) => !member.isSettled).map((member) => member.email).join(', ')}</td>
                            <td>
                              <Button 
                                variant='primary' 
                                onClick={() => window.location.href = `/#view-event/${item.eventId}`}
                                style={{marginRight: '5px'}}
                              >
                                <GrView /> View
                              </Button>
                              <Button 
                                variant='info' 
                                onClick={() => handleClickBreakdown(item)}
                              >
                                <GrMoney /> Breakdown
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                  </Table>}
                </Card.Body>
              </Card>
            </Card>
          </Col>
        </Row>
      </Container>
      <Offcanvas show={showSettlementSummary} placement='end' onHide={() => setShowSettlementSummary(false)}>
        <Offcanvas.Header style={{backgroundColor: '#80b1b3'}} closeButton>
          <Offcanvas.Title as="h5">
            <GrMoney size={25} style={{marginRight: '5px'}} /> Settlement Summary
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className='p-0'>
          <div className='p-3'>
            <Form.Group as={Row} className="mb-3" controlId="formPlaintextEmail">
              <Form.Label column sm="4">
                  Event name
              </Form.Label>
              <Col sm="8">
                  <Form.Control 
                      type="text" 
                      disabled={true}
                      value={selectedEvent?.eventName}
                  />
              </Col>
            </Form.Group>
            <Form.Group as={Row} className="mb-3" controlId="formPlaintextEmail">
              <Form.Label column sm="4">
                  Event date
              </Form.Label>
              <Col sm="8">
                  <Form.Control 
                      type="date" 
                      disabled={true}
                      value={selectedEvent?.eventDate}
                  />
              </Col>
            </Form.Group>
            <Form.Group as={Row} className="mb-0" controlId="formPlaintextEmail">
              <Form.Label column sm="4">
                  Your balance
              </Form.Label>
              <Col sm="8">
                  <Form.Control 
                      type="text" 
                      disabled={true}
                      value={selectedEvent?.balance}
                  />
              </Col>
            </Form.Group>
          </div>
          <Card style={{border: 0}} className='my-3'>
            <Card.Header style={{backgroundColor: '#80b1b3', border: 0, borderRadius: 0}} as="h5" className='d-flex align-items-center justify-content-center'>
              <PiTreeStructureBold size={25} style={{ marginRight: '5px' }} /> Detailed breakdown
            </Card.Header>
            <Accordion>
              {selectedEventItems.map((item, index) => (
                <Accordion.Item eventKey={index} key={index}>
                  <Accordion.Header>
                    {item.name}
                  </Accordion.Header>
                  <Accordion.Body>
                    <Form.Group as={Row} className="mb-3">
                      <Form.Label column sm="4">
                        Item name
                      </Form.Label>
                      <Col sm="8">
                        <Form.Control 
                          type="text" 
                          disabled={true}
                          value={item.name}
                        />
                      </Col>
                    </Form.Group>
                    <Form.Group as={Row} className="mb-3">
                      <Form.Label column sm="4">
                        Price
                      </Form.Label>
                      <Col sm="8">
                        <Form.Control
                          type='number'
                          disabled={true}
                          value={item.price}
                        />
                      </Col>
                    </Form.Group>
                    <Form.Group as={Row} className="mb-3">
                      <Form.Label column sm="4">
                        Quantity
                      </Form.Label>
                      <Col sm="8">
                        <Form.Control 
                          type="number" 
                          disabled={true}
                          value={item.quantity}
                        />
                      </Col>
                    </Form.Group>
                    <Form.Group as={Row} className="mb-3">
                      <Form.Label column sm="4">
                        Your share
                      </Form.Label>
                      <Col sm="8">
                        <Form.Control 
                          type="number" 
                          disabled={true}
                          value={item.share}
                        />
                      </Col>
                    </Form.Group>
                    <Form.Group as={Row} className="mb-3">
                      <Form.Label column sm="4">
                        Transfer to
                      </Form.Label>
                      <Col sm="8">
                        <Form.Control 
                          type="text" 
                          disabled={true}
                          value={item.transferTo}
                        />
                      </Col>
                    </Form.Group>
                    <Button 
                      variant={item.splits && item.splits.find((split) => split.email === userEmail).isSettled? 'danger': 'success'} 
                      className='mt-3' 
                      onClick={async (e) => {
                      if (item.splits) {
                        for (const split of item.splits) {
                          if (split.email === userEmail) {
                            setSelectedEventItems(selectedEventItems.map((i) => {
                              if (i.id === item.id) {
                                console.log(i.splits);
                                i.splits = i.splits.map((s) => {
                                  if (s.email === userEmail) {
                                    s.isSettled = !s.isSettled;
                                  }
                                  return s;
                                });
                              }
                              return i;
                            }));
                            const itemRef = doc(db, "items", item.id);
                            updateDoc(itemRef, {
                              splits: item.splits
                            });
                          }
                        }
                      }
                    }}>
                      {item.splits && item.splits.find((split) => split.email === userEmail).isSettled? 'Mark as unsettled': 'Mark as settled'}
                    </Button>
                  </Accordion.Body>
                </Accordion.Item>
              ))}
            </Accordion>
          </Card>
        </Offcanvas.Body>
      </Offcanvas>
      <Offcanvas show={showOwingBreakdown} placement='end' onHide={() => setShowOwingBreakdown(false)}>
        <Offcanvas.Header closeButton style={{backgroundColor: '#80b1b3'}}>
          <Offcanvas.Title as="h5">Breakdown of owing</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className='p-0'>
          <div className='p-3'>
            <Form.Group as={Row} className="mb-3" controlId="formPlaintextEmail">
              <Form.Label column sm="4">
                  Event name
              </Form.Label>
              <Col sm="8">
                  <Form.Control 
                      type="text" 
                      disabled={true}
                      value={selectedOwedItem?.eventName}
                  />
              </Col>
            </Form.Group>
            <Form.Group as={Row} className="mb-3" controlId="formPlaintextEmail">
              <Form.Label column sm="4">
                  Item name
              </Form.Label>
              <Col sm="8">
                  <Form.Control 
                      type="text" 
                      disabled={true}
                      value={selectedOwedItem?.itemName}
                  />
              </Col>
            </Form.Group>
            <Form.Group as={Row} className="mb-3" controlId="formPlaintextEmail">
              <Form.Label column sm="4">
                  Price
              </Form.Label>
              <Col sm="8">
                  <Form.Control 
                      type="text" 
                      disabled={true}
                      value={selectedOwedItem?.itemPrice}
                  />
              </Col>
            </Form.Group>
            <Form.Group as={Row} className="mb-3" controlId="formPlaintextEmail">
              <Form.Label column sm="4">
                  Quantity
              </Form.Label>
              <Col sm="8">
                  <Form.Control 
                      type="text" 
                      disabled={true}
                      value={selectedOwedItem?.itemQuantity}
                  />
              </Col>
            </Form.Group>
            <Form.Group as={Row} controlId="formPlaintextEmail">
              <Form.Label column sm="4">
                  You are owed
              </Form.Label>
              <Col sm="8">
                  <Form.Control 
                      type="text" 
                      disabled={true}
                      value={selectedOwedItem?.youAreOwed}
                  />
              </Col>
            </Form.Group>
          </div>
          <Card style={{border: 0}} className='my-3'>
            <Card.Header style={{backgroundColor: '#80b1b3', border: 0, borderRadius: 0}} as="h5" className='d-flex align-items-center justify-content-center'>
              <PiTreeStructureBold size={25} style={{ marginRight: '5px' }} /> Who owes you?
            </Card.Header>
            <Accordion>
              {selectedOwedItem?.members.map((member, index) => (
                <Accordion.Item eventKey={index} key={index}>
                  <Accordion.Header>
                    {member.email}
                  </Accordion.Header>
                  <Accordion.Body>
                    <Form.Group as={Row}>
                      <Form.Label column sm="4">
                        Amount owed
                      </Form.Label>
                      <Col sm="8">
                        <Form.Control 
                          type="text" 
                          disabled={true}
                          value={member.amount}
                        />
                      </Col>
                    </Form.Group>
                    <Button 
                      variant={member.isSettled? 'danger': 'success'} 
                      className='mt-3'
                      onClick={(e) => {
                        setSelectedOwedItem({
                          ...selectedOwedItem,
                          members: selectedOwedItem.members.map((m) => {
                            if (m.email === member.email) {
                              m.isSettled = !m.isSettled;
                            }
                            return m;
                          })
                        });

                        const itemRef = doc(db, "items", selectedOwedItem.id);
                        updateDoc(itemRef, {
                          splits: selectedOwedItem.members
                        });
                      }}
                    >
                      {member.isSettled? 'Mark as unsettled': 'Mark as settled'}
                    </Button>
                  </Accordion.Body>
                </Accordion.Item>
              ))}
            </Accordion>
          </Card>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  )
}

export default Home