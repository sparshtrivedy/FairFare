import React, {useContext, useEffect, useState} from 'react'
import { AuthContext } from '../App'
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from '../firebase-config';
import { 
  MdOutlineDashboard,
  MdAccessTime,
} from "react-icons/md";
import { 
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner
} from 'react-bootstrap';

const Home = () => {
  const { userEmail } = useContext(AuthContext);
  const [usersEvents, setUsersEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const getEvents = async () => {
      setIsLoading(true);
      setUsersEvents([]);

      const q = query(collection(db, "events"), where("members", "array-contains", {
        email: userEmail
      }));
      const usersEventsTemp = [];

      const querySnapshot = await getDocs(q);

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

  return (
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
                <MdAccessTime size={30} style={{marginRight: '5px'}}/> Outstanding Balances
              </Card.Header>
              <Card.Body className='d-flex flex-wrap justify-content-center'>
                {isLoading && <Spinner animation="border" size='lg' />}
                {usersEvents.map((event, index) => (
                  <Card key={index} className='text-align-center mx-2' style={{width: '20%'}}>
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
                        style={{marginRight: '5px'}} 
                        onClick={() => window.location.href = `/#view-event/${event.eventId}`}
                      >
                        View
                      </Button>
                      <Button variant='danger' >Settle</Button>
                    </Card.Footer>
                  </Card>
                ))}
              </Card.Body>
            </Card>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default Home