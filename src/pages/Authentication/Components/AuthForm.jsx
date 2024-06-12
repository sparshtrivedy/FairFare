import React, { useState, useContext } from 'react';
import { 
    Form, 
    Row, 
    Col, 
    Button, 
    Alert, 
    Container,
    Card,
    Spinner,
    InputGroup
} from 'react-bootstrap';
import { 
    GoAlert,
    GoIssueClosed,
} from 'react-icons/go';
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
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isPasswordConfirmed, setIsPasswordConfirmed] = useState(false);

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
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            setEmail(email.trim().toLowerCase());
            if (!emailRegex.test(email)) {
                setError('Invalid email');
                setTimeout(() => {
                    setError('');
                }, 3000);
                return;
            }
            if (password.length < 8) {
                setError('Password must be at least 6 characters long');
                setTimeout(() => {
                    setError('');
                }, 3000);
                return;
            }
            if (password !== confirmPassword) {
                setError('Passwords do not match');
                setTimeout(() => {
                    setError('');
                }, 3000);
                return;
            }
            await createUserWithEmailAndPassword(auth, email, password);
            await addDoc(collection(db, 'users'), {
                email: email
            });
            setSuccess('User signed-up successfully. Redirecting to sign-in page...');

            setTimeout(() => {
                setSuccess('');
                navigate('/sign-in');
            }, 3000);
        } catch (error) {
            setError('An error occurred. This email might already be in use.');

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
                                <Alert variant='danger' className="d-flex align-items-center">
                                    <GoAlert size={20} style={{ marginRight: '10px' }} />
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
                                        style={{ marginRight: '10px' }}
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
                                {buttonText === "Sign-up" &&
                                <Form.Group className="mb-3" controlId="formPlaintextConfirmPassword">
                                    <Form.Label>
                                        Confirm Password
                                    </Form.Label>
                                    <InputGroup>
                                        <Form.Control 
                                            type="password" 
                                            placeholder="Re-enter your password here"
                                            onChange={(e) => {
                                                setConfirmPassword(e.target.value);
                                                if (e.target.value !== password) {
                                                    setError('Passwords do not match');
                                                    setIsPasswordConfirmed(false);
                                                } else if (e.target.value === password
                                                    && e.target.value.length > 0) {
                                                    setError('');
                                                    setIsPasswordConfirmed(true);
                                                }
                                            }}
                                        />
                                        {isPasswordConfirmed && 
                                        <InputGroup.Text className='bg-success'>
                                            <GoIssueClosed size={20} className='text-light'/>
                                        </InputGroup.Text>}
                                    </InputGroup>
                                </Form.Group>}
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