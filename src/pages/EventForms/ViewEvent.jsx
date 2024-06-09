import React, { useEffect, useState } from "react";
import { 
    Container, 
    Row, 
    Col, 
    Card,
    Button,
    Spinner,
    Breadcrumb,
} from "react-bootstrap";
import { GoEye, GoPencil } from "react-icons/go";
import { useParams } from "react-router-dom";
import { getEventById, getItemsByEventId } from "../../Utils";
import ViewEventForm from "./Components/ViewEventForm";
import '../pages.css';

const ViewEvent = () => {
    const eventId = useParams().eventId;
    const [event, setEvent] = useState(null);
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [memberError, setMemberError] = useState('');

    useEffect(() => {
        const getEvent = async () => {
            setIsLoading(true);

            const eventForEventId = await getEventById(eventId);
            setEvent(eventForEventId);

            const itemsForEvent = await getItemsByEventId(eventId);
            setItems(itemsForEvent);

            setIsLoading(false);
        }

        getEvent();
    }, [eventId]);

    return (
        <Container style={{height: '100%'}}>
            <Row className='justify-content-center'>
                <Col sm={10} xs={12}>
                    <Breadcrumb className="my-2">
                        <Breadcrumb.Item href='/#/home'>Home</Breadcrumb.Item>
                        <Breadcrumb.Item active>View</Breadcrumb.Item>
                    </Breadcrumb>
                    <Card style={{border: 0}} className='my-3'>
                        <Card.Header
                            style={{ backgroundColor: "#80b1b3" }}
                            as="h4"
                            className="d-flex align-items-center justify-content-center"
                        >
                            <GoEye size={30} style={{ marginRight: "10px" }} />
                            View event
                        </Card.Header>
                        <Card.Body style={{backgroundColor: '#f7fafa', paddingBottom: 0}}>
                            {isLoading? 
                                <div className='d-flex justify-content-center my-3'>
                                    <Spinner animation="border" size='lg' />
                                </div>:
                                <ViewEventForm
                                    items={items}
                                    setItems={setItems}
                                    event={event}
                                    setEvent={setEvent}
                                    memberError={memberError}
                                    setMemberError={setMemberError}
                                />
                            }
                        </Card.Body>
                        <Card.Footer style={{backgroundColor: '#80b1b3'}}>
                            <Button 
                                variant="primary" 
                                type="submit"
                                onClick={() =>
                                    window.location.href = `/#/edit-event/${eventId}`
                                }
                            >
                                <div style={{ display: "flex", alignItems: "center" }}>
                                    <GoPencil size={20} />
                                    <span style={{marginLeft: "10px"}}>Edit event</span>
                                </div>
                            </Button>
                        </Card.Footer>
                    </Card>
                </Col>
            </Row>
        </Container>
    )
}

export default ViewEvent;
