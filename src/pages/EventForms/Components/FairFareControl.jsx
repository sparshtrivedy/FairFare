import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';

const FairFareControl = ({ label, type, placeholder="", onChange=null, value=null, disabled=false, required=false }) => {
    return (
        <Form.Group as={Row} className="mb-3" controlId="formPlaintextEmail">
            <Form.Label column sm="2" className='d-flex align-items-center'>
                {label}
                {required && 
                    <span style={{ color: 'red', marginLeft: '5px' }}>
                        *
                    </span>}
            </Form.Label>
            <Col sm="10">
                <Form.Control 
                    type={type}
                    value={value}
                    placeholder={placeholder} 
                    onChange={onChange}
                    disabled={disabled}
                />
            </Col>
        </Form.Group>
    )
}

export default FairFareControl;
