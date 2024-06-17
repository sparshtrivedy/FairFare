import React, { useEffect, useContext } from 'react'
import { 
    Navbar, 
    Container,
    Nav,
    Button
} from 'react-bootstrap'
import {
    Routes, 
    Route,
    Navigate
} from 'react-router-dom'
import Home from './Home/Home'
import SignIn from './Authentication/SignIn'
import SignUp from './Authentication/SignUp'
import EditEvent from './EventForms/EditEvent'
import ViewEvent from './EventForms/ViewEvent';
import History from './History/History'
import CreateEvent from './EventForms/CreateEvent';
import CreateItem from './EventForms/ItemForms/CreateItem'
import Contacts from './Contacts/Contacts'
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { 
    GoLaw, 
    GoSignOut,
    GoHome,
    GoPlusCircle,
    GoHistory,
    GoPerson
} from "react-icons/go";

const Layout = () => {
    const { setIsLoggedIn, setUserEmail, isLoggedIn, userEmail } = useContext(AuthContext);

    const navigate = useNavigate();

    useEffect(() => {
        const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const email = localStorage.getItem('userEmail') || '';
        setIsLoggedIn(loggedIn);
        setUserEmail(email);
    }, [setIsLoggedIn, setUserEmail]);

    const handleLogout = () => {
        setIsLoggedIn(false);
        setUserEmail('');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userEmail');
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
                                <span style={{ marginLeft: "5px" }}>Create Event</span>
                            </Nav.Link>
                            <Nav.Link href="/#/create-item" className='d-flex align-items-center'>
                                <GoPlusCircle size={20} />
                                <span style={{ marginLeft: "5px" }}>Create Item</span>
                            </Nav.Link>
                            <Nav.Link href="/#/history" className='d-flex align-items-center'>
                                <GoHistory size={20} />
                                <span style={{ marginLeft: "5px" }}>History</span>
                            </Nav.Link>
                            <Nav.Link href="/#/contacts" className='d-flex align-items-center'>
                                <GoPerson size={20} />
                                <span style={{ marginLeft: "5px" }}>Contacts</span>
                            </Nav.Link>
                        </Nav>
                        <Nav>
                            <Navbar.Text style={{marginRight: '15px'}}>
                                {isLoggedIn ? `Hello, ${userEmail}` : 
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
                    <Route path="/create-event" element={<CreateEvent />} />
                    <Route path="/create-item" element={<CreateItem />} />
                    <Route path="/view-event/:eventId" element={<ViewEvent />} />
                    <Route path="/view-item/:itemId" element={<CreateItem disabled={true} />} />
                    <Route path="/edit-event/:eventId" element={<EditEvent />} />
                    <Route path="/edit-item/:itemId" element={<CreateItem mode={'edit'} />} />
                    <Route path="/history" element={<History />} />
                    <Route path="/contacts" element={<Contacts />} />
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