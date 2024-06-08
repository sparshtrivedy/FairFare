import React, { useState, useContext } from 'react';
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
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from '../../../firebase-config';
import { GoLaw } from "react-icons/go";
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../App';
import { addDoc, collection } from 'firebase/firestore';

const SignIn = ({ title, buttonText, footerText, footerButtonText }) => {
    const navigate = useNavigate();
    const { setIsLoggedIn, setUserEmail } = useContext(AuthContext);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSignIn = async () => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            setSuccess('Signed in successfully. Redirecting...');
            setTimeout(() => {
                setSuccess('');
                setIsLoggedIn(true);
                setUserEmail(email);
                localStorage.setItem('userEmail', email);
                localStorage.setItem('isLoggedIn', true);
                navigate('/home');
            }, 3000);
        } catch (error) {
            if (error.code === 'auth/invalid-credential') {
                setError('Invalid email or password');
            } else {
                setError('An error occurred');
            }
            setTimeout(() => {
                setError('');
            }, 3000);
            console.error(error);
        }
    }

    const handleSignUp = async () => {
        try {
            console.log('signing up')
            await addDoc(collection(db, 'users'), {
                email: email
            });
            console.log('user added')
            await createUserWithEmailAndPassword(auth, email, password);
            console.log('user signed up')
            setSuccess('User signed-up successfully. Redirecting to sign-in page...');

            setTimeout(() => {
                setSuccess('');
                navigate('/sign-in');
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
        <Container className='py-3'>
            <Row className='justify-content-center'>
                <Col xs={12} sm={4}>
                    <Card className='border-0'>
                        <Card.Header className='d-flex align-items-center justify-content-center p-3 flex-column' style={{backgroundColor: '#80b1b3'}}>
                            <GoLaw size={50} className='my-2 rounded-circle p-2' style={{backgroundColor: '#f7fafa'}} />
                            <h4>
                                {title}
                            </h4>
                        </Card.Header>
                        <Card.Body style={{backgroundColor: '#f7fafa'}}>
                            {error && 
                                <Alert variant='danger'>
                                    {error}
                                </Alert>
                            }
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
                            <Form>
                                <Form.Group className="mb-3" controlId="formPlaintextEmail">
                                    <Form.Label>
                                        Email
                                    </Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        placeholder="Enter your email here"
                                        onChange={(e) => setEmail(e.target.value)} 
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="formPlaintextPassword">
                                    <Form.Label>
                                        Password
                                    </Form.Label>
                                    <Form.Control 
                                        type="password" 
                                        placeholder="Enter your password here" 
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </Form.Group>
                            </Form>
                        </Card.Body>
                        <Card.Footer className='d-flex align-items-center justify-content-center flex-column' style={{backgroundColor: '#80b1b3'}}>
                            <div className='m-2 w-100'>
                                <Button onClick={buttonText === "Sign-in"? handleSignIn: handleSignUp} className='w-100' variant='success'>
                                    {buttonText}
                                </Button>
                            </div>
                            <div style={{ display: "flex", alignItems: "center" }}>
                                <span>{footerText}</span> 
                                <Button 
                                    variant='link' 
                                    onClick={() => navigate(footerButtonText === "Sign-in"? '/sign-in': '/sign-up')}
                                    style={{ paddingLeft: '5px' }}
                                >
                                    {footerButtonText}
                                </Button>
                            </div>
                        </Card.Footer>
                    </Card>
                </Col>
            </Row>
        </Container>
    )
}

export default SignIn;