import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../App";
import { userWithEmailQuery } from "../../Utils";
import { getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../../firebase-config";
import { 
    Card, 
    Row,
    Col,
    Container,
    Breadcrumb,
    Table,
    Form,
    Button,
    Alert,
} from "react-bootstrap";
import {
    GoPerson,
    GoInfo,
    GoPersonAdd,
    GoAlert,
    GoCheckCircle,
    GoPeople,
    GoTrash,
} from "react-icons/go";
import ConfirmationModal from "./Components/ConfirmationModal";

const Contacts = () => {
    const { userEmail } = useContext(AuthContext);
    const [contacts, setContacts] = useState([]);
    const [memberError, setMemberError] = useState('');
    const [success, setSuccess] = useState('');
    const [newContact, setNewContact] = useState('');
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [removeContact, setRemoveContact] = useState('');

    useEffect(() => {
        const fetchContacts = async () => {
            const memberQuery = userWithEmailQuery(userEmail);
            const memberQuerySnapshot = await getDocs(memberQuery);

            if (!memberQuerySnapshot.empty) {
                const memberData = memberQuerySnapshot.docs[0].data().contacts;
                if (memberData.length > 0) setContacts(memberData);
            }
        }
        fetchContacts();
    }, [userEmail, success]);

    const handleUpdateMember = async (e) => {
        const memberQuery = userWithEmailQuery(e.target.value);
        const memberQuerySnapshot = await getDocs(memberQuery);
        if (memberQuerySnapshot.empty) {
            setMemberError('Member not found. Please make sure this user has signed-up.');
            setSuccess('');
        } else {
            setMemberError('');
            setNewContact(e.target.value);
        }
    }

    const handleAddContact = async () => {
        // Add contact to user's contacts and add user to new contact's contacts
        if (memberError.length !== 0) return;
        if (contacts.includes(newContact)) {
            setMemberError('Contact already exists.');
            return;
        }
        const memberQuery = userWithEmailQuery(userEmail);
        const memberQuerySnapshot = await getDocs(memberQuery);
        const memberDoc = memberQuerySnapshot.docs[0];
        const memberRef = doc(db, 'users', memberDoc.id);
        await updateDoc(memberRef, {
            contacts: [...contacts, newContact]
        });

        setNewContact('');
        setSuccess('Contact added successfully.');
        setTimeout(() => {
            setSuccess('');
        }, 3000);

        const newContactQuery = userWithEmailQuery(newContact);
        const newContactQuerySnapshot = await getDocs(newContactQuery);
        const newContactDoc = newContactQuerySnapshot.docs[0];
        const newContactRef = doc(db, 'users', newContactDoc.id);
        // Prevent adding duplicate contacts
        if (newContactDoc.data().contacts.includes(userEmail)) return;
        await updateDoc(newContactRef, {
            contacts: [...newContactDoc.data().contacts, userEmail]
        });
    }

    const handleRemoveContact = async (contactToRemove) => {
        // Remove contact from user's contacts only
        const memberQuery = userWithEmailQuery(userEmail);
        const memberQuerySnapshot = await getDocs(memberQuery);
        const memberDoc = memberQuerySnapshot.docs[0];
        const memberRef = doc(db, 'users', memberDoc.id);
        await updateDoc(memberRef, {
            contacts: contacts.filter(contact => contact !== contactToRemove)
        });

        setSuccess('Contact removed successfully.');
        setTimeout(() => {
            setSuccess('');
        }, 3000);
    }

    return (
        <>
            <Container style={{ height: "100%" }}>
                <Row className="justify-content-center">
                    <Col sm={10} xs={12}>
                        <Breadcrumb className="my-2">
                            <Breadcrumb.Item href='/#/home'>Home</Breadcrumb.Item>
                            <Breadcrumb.Item active>Contacts</Breadcrumb.Item>
                        </Breadcrumb>
                        <Card style={{ border: 0 }} className="my-3">
                            <Card.Header
                                style={{ backgroundColor: "#80b1b3" }}
                                as="h4"
                                className="d-flex align-items-center justify-content-center"
                            >
                                <GoPerson size={30} style={{ marginRight: "10px" }} />
                                Contacts
                            </Card.Header>
                            <Card.Body>
                                <Card.Title as="h3">
                                    Manage your contacts
                                </Card.Title>
                                <Card.Subtitle className="mb-2 text-muted">
                                    Add contacts here and start sharing expenses! Invite your friends and family to join to start splitting bills.
                                </Card.Subtitle>
                                <Card>
                                    <Card.Header
                                        style={{ backgroundColor: "#80b1b3" }}
                                        as="h4"
                                        className="d-flex align-items-center justify-content-center"
                                    >
                                        <div style={{ display: "flex", alignItems: "center" }}>
                                            <GoPersonAdd size={25} style={{ marginRight: "10px" }} />
                                            <span>Add contact</span>
                                        </div>
                                    </Card.Header>
                                    <Card.Body>
                                        <Alert variant='danger' className="d-flex align-items-center" show={memberError.length !== 0}>
                                            <GoAlert size={20} style={{ marginRight: '10px' }} />
                                            {memberError}
                                        </Alert>
                                        <Alert variant='success' className="d-flex align-items-center" show={success.length !== 0}>
                                            <GoCheckCircle size={20} style={{ marginRight: '10px' }} />
                                            {success}
                                        </Alert>
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
                                    <Card.Footer style={{ backgroundColor: "#80b1b3" }}>
                                        <Button variant='primary' onClick={handleAddContact}>
                                            <div style={{ display: "flex", alignItems: "center" }}>
                                                <GoPersonAdd size={20} />
                                                <span style={{marginLeft: "10px"}}>Add contact</span>
                                            </div>
                                        </Button>
                                    </Card.Footer>
                                </Card>
                                <br />
                                <Card>
                                    <Card.Header
                                        style={{ backgroundColor: "#80b1b3" }}
                                        as="h4"
                                        className="d-flex align-items-center justify-content-center"
                                    >
                                        <div style={{ display: "flex", alignItems: "center" }}>
                                            <GoPeople size={25} style={{ marginRight: "10px" }} />
                                            <span>Added contacts</span>
                                        </div>
                                    </Card.Header>
                                    <Card.Body>
                                        <div style={{ overflowX: "auto" }}>
                                            <Table striped bordered hover className='p-0 m-0'>
                                                <thead>
                                                    <tr>
                                                        <th class="col-md-1">#</th>
                                                        <th class="col-md-10">Email</th>
                                                        <th class="col-md-1">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {!contacts.length ? (
                                                        <tr>
                                                            <td colSpan={5}>
                                                                <div style={{ display: "flex", alignItems: "center", justifyContent: 'center' }} className='text-muted'>
                                                                    <GoInfo size={20} />
                                                                    <span style={{marginLeft: "10px"}}>
                                                                        You have no contacts. Add some to get started!
                                                                    </span>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        contacts.map((email, index) => (
                                                            <tr key={index}>
                                                                <td>{index + 1}</td>
                                                                <td>{email}</td>
                                                                <td>
                                                                    <Button variant='danger' onClick={() => {
                                                                        setRemoveContact(email);
                                                                        setShowConfirmation(true);
                                                                    }}>
                                                                        <div style={{ display: "flex", alignItems: "center" }}>
                                                                            <GoTrash size={20} />
                                                                            <span style={{marginLeft: "10px"}}>Remove</span>
                                                                        </div>
                                                                    </Button>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </Table>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
            <ConfirmationModal show={showConfirmation} setShow={setShowConfirmation} handleRemove={handleRemoveContact} contact={removeContact} />
        </>
    );
}

export default Contacts;
