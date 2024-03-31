import React, { useState } from 'react';
import { 
    Form, 
    Row, 
    Col, 
    Button, 
    Alert, 
    Container,
    Card,
    Spinner
} from 'react-bootstrap';
import { auth } from '../firebase-config';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from 'react-router-dom';
import { IoMdPersonAdd } from "react-icons/io";
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase-config';

const Register = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');


    const handleRegister = async () => {
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            console.log('User registered');
            const addedUser = await addDoc(collection(db, 'users'), {
                email: email
            });
            console.log('Added document with ID: ', addedUser.id);
            setSuccess('User registered successfully. Redirecting to login...');
            setTimeout(() => {
                setSuccess('');
                navigate('/login');
            }, 3000);
        } catch (error) {
            setError('An error occurred');
            setTimeout(() => {
                setError('');
            }, 3000);
            console.error(error);
        }
    }

    return (
        <Container style={{height: '100%'}} className='py-3'>
            <Row className='justify-content-center'>
                <Col xs={6}>
                    <Card className='border-0'>
                    <Card.Header className='d-flex align-items-center justify-content-center p-3 flex-column' style={{backgroundColor: '#80b1b3'}}>
                            <IoMdPersonAdd size={50} className='my-2 rounded-circle p-2' style={{backgroundColor: '#f7fafa'}} />
                            <h4>
                                Register
                            </h4>
                        </Card.Header>
                        <Card.Body style={{backgroundColor: '#f7fafa'}}>
                            <Form>
                                {success &&
                                    <Alert variant='success' className='d-flex align-items-center justify-content-center'>
                                        <Spinner
                                            as="span"
                                            animation="border"
                                            size="sm"
                                            role="status"
                                            style={{marginRight: '5px'}}
                                        />
                                        {success}
                                    </Alert>
                                }
                                {error && 
                                    <Alert variant='danger'>
                                        {error}
                                    </Alert>
                                }
                                <Form.Group as={Row} className="mb-3" controlId="formPlaintextEmail">
                                    <Form.Label column sm="2">
                                        Email
                                    </Form.Label>
                                    <Col sm="10">
                                        <Form.Control 
                                            type="text" 
                                            placeholder="Enter your email here"
                                            onChange={(e) => setEmail(e.target.value)} 
                                        />
                                    </Col>
                                </Form.Group>
                                <Form.Group as={Row} className="mb-3" controlId="formPlaintextPassword">
                                    <Form.Label column sm="2">
                                        Password
                                    </Form.Label>
                                    <Col sm="10">
                                        <Form.Control 
                                            type="password" 
                                            placeholder="Enter your password here" 
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                    </Col>
                                </Form.Group>
                            </Form>
                        </Card.Body>
                        <Card.Footer className='d-flex align-items-center justify-content-center flex-column' style={{backgroundColor: '#80b1b3'}}>
                            <div className='mb-2'>
                                <Button onClick={handleRegister}>
                                    Register
                                </Button>
                            </div>
                            <div>
                                Already have an account? <Button variant='link' onClick={() => navigate('/login')} className='p-0'>Login</Button>
                            </div>
                        </Card.Footer>
                    </Card>
                </Col>
            </Row>
        </Container>
    )
}

export default Register;