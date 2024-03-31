import React, { useState } from 'react';
import { 
    Form, 
    Row, 
    Col, 
    Button, 
    Alert, 
    Container,
    Card
} from 'react-bootstrap';
import { auth } from '../firebase-config';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');


    const handleRegister = async () => {
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            console.log('User registered');
            navigate('/login');
        } catch (error) {
            setError('An error occurred');
            console.error(error);
        }
    }

    return (
        <Container style={{height: '100%'}} className='py-3'>
            <Row className='justify-content-center'>
                <Col xs={6}>
                    <Card>
                        <Card.Header className='d-flex align-items-center justify-content-center p-3'>
                            <h4>Register</h4>
                        </Card.Header>
                        <Card.Body>
                            <Form>
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
                        <Card.Footer className='d-flex align-items-center justify-content-center flex-column'>
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