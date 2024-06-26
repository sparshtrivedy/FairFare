import React, { useEffect, useContext } from 'react'
import { 
    Navbar, 
    Container,
    Nav,
    Button,
    OverlayTrigger,
    Tooltip
} from 'react-bootstrap'
import {
    Routes, 
    Route,
    Navigate
} from 'react-router-dom'
import Home from './Home/Home'
import SignIn from './Authentication/SignIn'
import SignUp from './Authentication/SignUp'
import History from './History/History'
import EventForm from './Forms/EventForms/EventForm';
import ItemForm from './Forms/ItemForms/ItemForm'
import Contacts from './Contacts/Contacts'
import Calculator from './Calculator/Calculator'
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { 
    GoLaw, 
    GoSignOut,
    GoHome,
    GoPlusCircle,
    GoHistory,
    GoPerson,
    GoVerified,
    GoUnverified,
    GoDiff
} from "react-icons/go";

const Layout = () => {
    const { setIsLoggedIn, setUserEmail, isLoggedIn, userEmail, isVerified, setIsVerified } = useContext(AuthContext);

    const navigate = useNavigate();

    useEffect(() => {
        const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const email = localStorage.getItem('userEmail') || '';
        const verified = localStorage.getItem('isVerified') === 'true';

        setIsLoggedIn(loggedIn);
        setUserEmail(email);
        setIsVerified(verified);
    }, [setIsLoggedIn, setUserEmail, setIsVerified, userEmail]);

    const handleLogout = () => {
        setIsLoggedIn(false);
        setUserEmail('');

        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('isVerified');

        navigate('/sign-in');
    }

    return (
        <div style={{ backgroundColor: '#2F4F4F', minHeight: '100vh', width: '100%' }}>
            {isLoggedIn &&
            <Navbar collapseOnSelect expand="lg" bg="dark" data-bs-theme="dark">
                <Container>
                    <Navbar.Brand style={{ display: 'flex', alignItems: 'center' }}>
                        <GoLaw size={25} /> 
                        <span style={{ marginLeft: "10px" }}>FairFare</span>
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                    <Navbar.Collapse id="responsive-navbar-nav">
                        <Nav className="me-auto">
                            <Nav.Link href="/#/home" className='d-flex align-items-center'>
                                <GoHome size={20} />
                                <span style={{ marginLeft: "5px" }}>Home</span>
                            </Nav.Link>
                            <Nav.Link href="/#/create-event" className='d-flex align-items-center'>
                                <GoPlusCircle size={20} />
                                <span style={{ marginLeft: "5px" }}>Event</span>
                            </Nav.Link>
                            <Nav.Link href="/#/create-item" className='d-flex align-items-center'>
                                <GoPlusCircle size={20} />
                                <span style={{ marginLeft: "5px" }}>Item</span>
                            </Nav.Link>
                            <Nav.Link href="/#/history" className='d-flex align-items-center'>
                                <GoHistory size={20} />
                                <span style={{ marginLeft: "5px" }}>History</span>
                            </Nav.Link>
                            <Nav.Link href="/#/contacts" className='d-flex align-items-center'>
                                <GoPerson size={20} />
                                <span style={{ marginLeft: "5px" }}>Contacts</span>
                            </Nav.Link>
                            <Nav.Link href="/#/calculator" className='d-flex align-items-center'>
                                <GoDiff size={20} />
                                <span style={{ marginLeft: "5px" }}>Calculator</span>
                            </Nav.Link>
                        </Nav>
                        <Nav>
                            <Navbar.Text style={{marginRight: '15px'}}>
                                {isLoggedIn ?
                                    <Container className='d-flex align-items-center'>
                                        {isVerified ? 
                                            <OverlayTrigger placement="bottom" overlay={<Tooltip>Verified</Tooltip>}>
                                                <span>
                                                    <GoVerified size={20} className='text-success' />
                                                </span>
                                            </OverlayTrigger> :
                                            <OverlayTrigger placement="bottom" overlay={<Tooltip>Un-verified</Tooltip>}>
                                                <span>
                                                    <GoUnverified size={20} className='text-warning' />
                                                </span>
                                            </OverlayTrigger>
                                        }
                                        <span style={{marginLeft: '10px'}}>
                                            {userEmail}
                                        </span>
                                    </Container> :
                                    <Button variant='primary' href='#sign-in'>Sign-in</Button>
                                }
                            </Navbar.Text>
                            <Button variant='danger' onClick={handleLogout}>
                                <GoSignOut size={20} /> Logout
                            </Button>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>}
            {isLoggedIn ? (
                <Routes>
                    <Route path="/home" element={<Home />} />

                    <Route path="/create-event" element={<EventForm mode={'create'} />} />
                    <Route path="/view-event/:eventId" element={<EventForm mode={'view'} />} />
                    <Route path="/edit-event/:eventId" element={<EventForm mode={'edit'} />} />

                    <Route path="/create-item" element={<ItemForm mode={'create'} />} />
                    <Route path="/view-item/:itemId" element={<ItemForm mode={'view'} />} />
                    <Route path="/edit-item/:itemId" element={<ItemForm mode={'edit'} />} />

                    <Route path="/history" element={<History />} />
                    <Route path="/contacts" element={<Contacts />} />
                    <Route path="/calculator" element={<Calculator />} />
                    <Route path="*" element={<Navigate to="/home" />} />
                </Routes>
            ) : (
                <Routes>
                    <Route path="/sign-in" element={<SignIn />} />
                    <Route path="/sign-up" element={<SignUp />} />
                    <Route path="*" element={<Navigate to="/sign-in" />} />
                </Routes>)}
        </div>
    )
}

export default Layout