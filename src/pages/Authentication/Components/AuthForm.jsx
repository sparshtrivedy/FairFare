import React, { useState, useContext } from 'react';
import { 
    Form, 
    Row, 
    Col, 
    Button, 
    Container,
    Card,
    InputGroup
} from 'react-bootstrap';
import { 
    GoIssueClosed,
} from 'react-icons/go';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    sendPasswordResetEmail,
    sendEmailVerification,
} from "firebase/auth";
import { auth, db } from '../../../firebase-config';
import { GoLaw } from "react-icons/go";
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../App';
import { addDoc, collection } from 'firebase/firestore';
import ErrorAlert from '../../../Components/Alerts/ErrorAlert';
import SuccessAlert from '../../../Components/Alerts/SuccessAlert';

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
            const userCredentials = await signInWithEmailAndPassword(auth, email, password);
            localStorage.setItem('userEmail', email);
            localStorage.setItem('isLoggedIn', true);
            localStorage.setItem('isVerified', userCredentials.user.emailVerified);
            
            setSuccess('Signed in successfully. Redirecting...');
            setTimeout(() => {
                setSuccess('');
                setIsLoggedIn(true);
                setUserEmail(email);
                navigate('/home');
            }, 3000);
        } catch (error) {
            if (error.code === 'auth/invalid-credential') {
                setError('Invalid email or password');
                setTimeout(() => {
                    setError('');
                }, 3000);
            } else {
                setError('An error occurred');
                setTimeout(() => {
                    setError('');
                }, 3000);
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
                setError('Password must be at least 8 characters long');
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
            const userCredentials = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredentials.user;
            await addDoc(collection(db, 'users'), {
                uid: user.uid,
                email: user.email,
                contacts: [ user.email ],
                isVerified: user.emailVerified,
            });
            await sendEmailVerification(user);
            setSuccess('Sign-up successful. Verification email sent. Redirecting...');

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

    const handleForgotPassword = async () => {
        try {
            await sendPasswordResetEmail(auth, email);
            setSuccess('Password reset email sent successfully.');
            setTimeout(() => {
                setSuccess('');
            }, 3000);
        } catch (error) {
            setError('An error occurred. This email might not be registered.');
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
                            <ErrorAlert message={error} />
                            <SuccessAlert message={success} />
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
                                    <Form.Label className='d-flex justify-content-between align-items-center'>
                                        <span>Password</span>
                                        {buttonText === "Sign-in" &&
                                            <Button 
                                                variant='link' 
                                                onClick={handleForgotPassword}
                                                className='p-0'
                                            >
                                                Forgot password?
                                            </Button>}
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
                                                    setTimeout(() => {
                                                        setError('');
                                                    }, 3000);
                                                    setIsPasswordConfirmed(false);
                                                } else if (e.target.value === password
                                                    && e.target.value.length > 0) {
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