import React, { useState, useContext } from 'react';
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
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';

const Login = () => {
    const navigate = useNavigate();
    const { setIsLoggedIn, setUserEmail } = useContext(AuthContext);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSignIn = async () => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            console.log('Signed in');
            setSuccess('Signed in successfully');
            setIsLoggedIn(true);
            setUserEmail(email);
            localStorage.setItem('userEmail', email);
            localStorage.setItem('isLoggedIn', true);
            navigate('/home');
        } catch (error) {
            if (error.code === 'auth/invalid-credential') {
                setError('Invalid email or password');
            } else {
                setError('An error occurred');
            }
            console.error(error);
        }
    }

    return (
        <Container className='py-3'>
            <Row className='justify-content-center'>
                <Col xs={6}>
                    <Card>
                        <Card.Header className='d-flex align-items-center justify-content-center p-3'>
                            <h4>Login</h4>
                        </Card.Header>
                        <Card.Body>
                            {error && 
                                <Alert variant='danger'>
                                    {error}
                                </Alert>
                            }
                            {success && 
                                <Alert variant='success'>
                                    {success}
                                </Alert>
                            }
                            <Form>
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
                                <Button onClick={handleSignIn}>
                                    Login
                                </Button>
                            </div>
                            <div>
                                Don't have an account? <Button variant='link' onClick={() => navigate('/register')} className='p-0'>Register</Button>
                            </div>
                        </Card.Footer>
                    </Card>
                </Col>
            </Row>
        </Container>
    )
}

export default Login;