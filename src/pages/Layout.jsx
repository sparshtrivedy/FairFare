import React from 'react'
import { 
    Navbar, 
    Container,
    Nav
} from 'react-bootstrap'
import {
    Routes, 
    Route
} from 'react-router-dom'
import Home from './Home'
import CreateEvent from './CreateEvent'
import { MdOutlineBalance } from "react-icons/md";

const Layout = () => {
  return (
    <div style={{backgroundColor: '#2F4F4F', width: '100%', height: '100%'}}>
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
            </Container>
        </Navbar>
        <Routes>
            <Route path="/home" element={<Home />} />
            <Route path="/create-event" element={<CreateEvent />} />
        </Routes>
    </div>
  )
}

export default Layout