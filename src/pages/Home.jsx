import React, {useContext, useEffect, useState} from 'react'
import { AuthContext } from '../App'
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
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
  Accordion
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
              if (user.email === userEmail) {
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

        owedItems.push({
          eventId: item.event.id,
          eventName: event.name,
          itemName: item.itemName,
          itemPrice: item.itemPrice,
          itemQuantity: item.itemQuantity,
          youAreOwed: (parseFloat(item.itemPrice) * item.itemQuantity).toFixed(2),
          members: item.splits.map((split) => {
            if (split.isChecked) {
              return {
                email: split.email,
                amount: split.amount
              }
            }
          }),
        });
      }

      console.log(owedItems);
      setOwedItems(owedItems);
      
      setUsersEvents(usersEventsTemp.map((event) => {
        return {
          eventId: event.eventId,
          eventName: event.eventName,
          eventDate: event.eventDate,
          balance: event.balance,
          email: userEmail
        }
      }));

      setIsLoading(false);
    }

    getEvents();
  }, [userEmail]);

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
        share: doc.data().splits.find((split) => split.email === userEmail).amount
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
                <Card.Body className='d-flex flex-wrap justify-content-center'>
                  {isLoading? 
                    <Spinner animation="border" size='lg' /> : 
                    <>
                      {usersEvents.map((event, index) => (
                        <Card key={index} className='text-align-center m-2' style={{width: '25%'}}>
                          <Card.Body className='d-flex flex-column align-items-center'>
                            <Card.Title as='h5'>
                              {event.eventName}
                            </Card.Title>
                            <Card.Subtitle className="mb-2 text-muted">
                              {event.eventDate}
                            </Card.Subtitle>
                            <Card.Text>
                              You owe: {event.balance}
                            </Card.Text>
                          </Card.Body>
                          <Card.Footer>
                            <Button 
                              variant='primary' 
                              onClick={() => window.location.href = `/#view-event/${event.eventId}`}
                              style={{marginRight: '5px'}}
                            >
                              <GrView /> View
                            </Button>
                            <Button 
                              variant='danger' 
                              onClick={() => handleClickSettle(event)}
                            >
                              <GrMoney /> Settle
                            </Button>
                          </Card.Footer>
                        </Card>
                      ))}
                    </>}
                </Card.Body>
              </Card>
              <Card className='mx-3 mb-3'>
                <Card.Header style={{backgroundColor: '#80b1b3'}} as="h4" className='d-flex align-items-center justify-content-center'>
                  <MdOutlineKeyboardDoubleArrowDown size={30} style={{marginRight: '5px'}}/> You are owed
                </Card.Header>
                <Card.Body className='d-flex flex-wrap justify-content-center'>
                  {isLoading? 
                    <Spinner animation="border" size='lg' />:
                    <>
                      {owedItems.map((item, index) => (
                        <Card key={index} className='text-align-center m-2' style={{width: '25%'}}>
                          <Card.Body className='d-flex flex-column align-items-center'>
                            <Card.Title as='h5'>
                              {item.itemName}
                            </Card.Title>
                            <Card.Subtitle className="mb-2 text-muted">
                              {item.eventName}
                            </Card.Subtitle>
                            <Card.Text>
                              Owed to you: {item.youAreOwed}
                            </Card.Text>
                          </Card.Body>
                          <Card.Footer>
                            <Button 
                              variant='primary' 
                              onClick={() => window.location.href = `/#view-event/${item.eventId}`}
                              style={{marginRight: '5px'}}
                            >
                              <GrView /> View
                            </Button>
                            <Button 
                              variant='danger' 
                              onClick={() => handleClickBreakdown(item)}
                            >
                              <GrMoney /> Breakdown
                            </Button>
                          </Card.Footer>
                        </Card>
                      ))}
                    </>}
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
                    <Button variant='primary' className='mt-3'>
                      Mark as settled
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
                    <Button variant='primary' className='mt-3'>
                      Mark as settled
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