import React, { useEffect, useState } from 'react'
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
import Home from './Home'
import Login from './Login'
import Register from './Register'
import CreateEvent from './CreateEvent'
import { MdOutlineBalance } from "react-icons/md";
import ViewEvent from './ViewEvent';
import { useNavigate } from 'react-router-dom';

const Layout = () => {
    const navigate = useNavigate();

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userEmail, setUserEmail] = useState('');

    useEffect(() => {
        if (localStorage.getItem('isLoggedIn')) {
            console.log('User is logged in');
            setIsLoggedIn(true);
            setUserEmail(localStorage.getItem('userEmail'));
        }
    }, [])

    const handleLogout = () => {
        setIsLoggedIn(false);
        setUserEmail('');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userEmail');
        navigate('/login');
    }

    return (
        <div style={{ backgroundColor: '#2F4F4F', minHeight: '100vh' }}>
            <Navbar bg="dark" data-bs-theme="dark">
                <Container>
                    <Navbar.Brand href="#home">
                        <MdOutlineBalance size={25} /> FairFare
                    </Navbar.Brand>
                    <Nav className="me-auto">
                        <Nav.Link href="#home">Home</Nav.Link>
                        <Nav.Link href="#create-event">Create Event</Nav.Link>
                        <Nav.Link href="#join-event">Join Event</Nav.Link>
                    </Nav>
                    <Navbar.Text className='m-2'>
                        {isLoggedIn ? `Welcome, ${userEmail}` : 
                            <Button variant='primary' href='#login'>Login</Button>
                        }
                    </Navbar.Text>
                    <Button variant='danger' onClick={handleLogout}>Logout</Button>
                </Container>
            </Navbar>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/home" element={<Home />} />
                <Route path="/create-event" element={<CreateEvent />} />
                <Route path="/join-event" element={<ViewEvent />} />
            </Routes>
        </div>
    )
}

export default Layout