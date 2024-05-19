import React, { useEffect, useContext } from 'react'
import { 
    Navbar, 
    Container,
    Nav,
    Button
} from 'react-bootstrap'
import {
    Routes, 
    Route
} from 'react-router-dom'
import Home from './Home/Home'
import Login from './Login'
import Register from './Register'
import CreateEvent from './CreateEvent'
import EditEvent from './EditEvent'
import History from './History'
import { MdOutlineBalance, MdLogout } from "react-icons/md";
import ViewEvent from './ViewEvent';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';

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
        navigate('/login');
    }

    return (
        <div style={{ backgroundColor: '#2F4F4F', minHeight: '100vh' }}>
            {isLoggedIn &&
                <Navbar bg="dark" data-bs-theme="dark">
                    <Container>
                        <Navbar.Brand href="#home">
                            <MdOutlineBalance size={25} /> FairFare
                        </Navbar.Brand>
                        <Nav className="me-auto">
                            <Nav.Link href="#home">Home</Nav.Link>
                            <Nav.Link href="#create-event">Create Event</Nav.Link>
                            <Nav.Link href="#history">History</Nav.Link>
                        </Nav>
                        <Navbar.Text style={{marginRight: '15px'}}>
                            {isLoggedIn ? `Hello, ${userEmail}` : 
                                <Button variant='primary' href='#login'>Login</Button>
                            }
                        </Navbar.Text>
                        <Button variant='danger' onClick={handleLogout}>
                            <MdLogout size={20} /> Logout
                        </Button>
                    </Container>
                </Navbar>
            }
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                {isLoggedIn &&
                    <>
                        <Route path="/home" element={<Home />} />
                        <Route path="/create-event" element={<CreateEvent />} />
                        <Route path="/view-event/:eventId" element={<ViewEvent />} />
                        <Route path="/edit-event/:eventId" element={<EditEvent />} />
                        <Route path="/history" element={<History />} />
                    </>
                }
            </Routes>
        </div>
    )
}

export default Layout