import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../App";
import { getUserByEmail } from "../../Queries";
import { updateDoc } from "firebase/firestore";
import { 
    Card, 
    Row,
    Col,
    Container,
    Breadcrumb,
    ListGroup,
    Form,
    Button,
    Spinner,
} from "react-bootstrap";
import { GoTrash } from "react-icons/go";
import ConfirmationModal from "./Components/ConfirmationModal";
import SuccessAlert from "../../Components/Alerts/SuccessAlert";
import ErrorAlert from "../../Components/Alerts/ErrorAlert";
import CardFooter from "../Forms/Components/CardFooter";
import FormHeader from "../Forms/Components/FormHeader";
import CardHeader from "../Forms/Components/CardHeader";
import EmptyListText from "../../Components/CardText/EmptyListText";

const Contacts = () => {
    const { userEmail } = useContext(AuthContext);
    const [contacts, setContacts] = useState([]);
    const [memberError, setMemberError] = useState('');
    const [success, setSuccess] = useState('');
    const [newContact, setNewContact] = useState('');
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [removeContact, setRemoveContact] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchContacts = async () => {
            setIsLoading(true);

            const member = await getUserByEmail(userEmail);
            member && setContacts(member.data().contacts);

            setIsLoading(false);
        }
        fetchContacts();
    }, [userEmail, success]);

    const isValidEmail = () => {
        if (memberError.length !== 0) return;

        if (newContact.trim().length === 0) {
            setMemberError('Please provide a valid email.');
            return;
        }

        if (contacts.includes(newContact)) {
            setMemberError('Contact already exists.');
            return;
        }
    }

    const handleUpdateMember = async (e) => {
        const member = await getUserByEmail(e.target.value);

        if (!member) {
            setMemberError('Member not found. Please make sure this user has signed-up.');
            setSuccess('');
        } else {
            setMemberError('');
            setNewContact(e.target.value);
        }
    }

    const handleAddContact = async () => {
        if (!isValidEmail()) {
            return;
        }
        setMemberError('');

        const member = await getUserByEmail(userEmail);
        await updateDoc(member.ref, {
            contacts: [...contacts, newContact]
        });

        setNewContact('');
        setSuccess('Contact added successfully.');
        setTimeout(() => {
            setSuccess('');
        }, 3000);

        const addedContact = await getUserByEmail(newContact);
        if (!addedContact.data().contacts.includes(userEmail)) {
            await updateDoc(addedContact.ref, {
                contacts: [...addedContact.data().contacts, userEmail]
            });
        }
    }

    const handleRemoveContact = async (contactToRemove) => {
        const member = await getUserByEmail(userEmail);
        await updateDoc(member.ref, {
            contacts: contacts.filter(contact => contact !== contactToRemove)
        });

        setSuccess('Contact removed successfully.');
        setTimeout(() => {
            setSuccess('');
        }, 3000);
    }

    return (
        <Container style={{ height: "100%" }}>
            <Row className="justify-content-center">
                <Col sm={10} xs={12}>
                    <Breadcrumb className="my-2">
                        <Breadcrumb.Item href='/#/home'>Home</Breadcrumb.Item>
                        <Breadcrumb.Item active>Contacts</Breadcrumb.Item>
                    </Breadcrumb>
                    <Card style={{ border: 0 }} className="my-3">
                        <FormHeader title="Contacts" />
                        <Card.Body style={{ backgroundColor: '#f7fafa' }}>
                            <Card.Title as="h3">
                                Manage your contacts
                            </Card.Title>
                            <Card.Subtitle className="mb-2 text-muted">
                                Add contacts here and start sharing expenses! Invite your friends and family to join to start splitting bills.
                            </Card.Subtitle>
                            <ConfirmationModal show={showConfirmation} setShow={setShowConfirmation} handleRemove={handleRemoveContact} contact={removeContact} />
                            <Card>
                                <CardHeader title={"Add contact"} />
                                <Card.Body>
                                    <ErrorAlert message={memberError} />
                                    <SuccessAlert message={success} />
                                    <Form.Group as={Row} controlId="formPlaintextEmail">
                                        <Form.Label column sm="2">
                                            User email
                                        </Form.Label>
                                        <Col sm="10">
                                            <Form.Control type="text" onChange={(e) => handleUpdateMember(e)} />
                                            <Form.Text className="text-muted">
                                                The email must be registered with FairFare to be added as a contact.
                                            </Form.Text>
                                        </Col>
                                    </Form.Group>
                                </Card.Body>
                                <CardFooter text="Add contact" handler={handleAddContact} />
                            </Card>
                            <br />
                            <Card>
                                <CardHeader title="Added contacts" />
                                {isLoading ? (
                                    <Card.Body>
                                        <div className='d-flex justify-content-center'>
                                            <Spinner animation="border" size='lg' className='m-3' />
                                        </div>
                                    </Card.Body>
                                    ) : (
                                    <Card.Body className="p-0">
                                    {contacts.length ? (
                                        <div style={{ overflowX: "auto", width: '100%' }}>
                                            <ListGroup variant="flush" className='border-0 rounded'>
                                                {contacts.map((contact, index) => (
                                                    <ListGroup.Item key={index} className='d-flex justify-content-between align-items-center'>
                                                        <span>{contact}</span>
                                                        <Button variant='danger' onClick={() => {
                                                            setRemoveContact(contact);
                                                            setShowConfirmation(true);
                                                        }}>
                                                            <div style={{ display: "flex", alignItems: "center" }}>
                                                                <GoTrash size={20} />
                                                            </div>
                                                        </Button>
                                                    </ListGroup.Item>
                                                ))}
                                            </ListGroup>
                                        </div>
                                    ) : (
                                        <EmptyListText id="contacts" />
                                    )}
                                    </Card.Body>
                                )}
                            </Card>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default Contacts;
