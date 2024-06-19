import React from "react";
import { Form, Row, Col } from "react-bootstrap";

const OffcanvasControl = ({ label, type, value }) => {
    return (
        <Form.Group as={Row} className="mb-3">
            <Form.Label column sm="4">
                {label}
            </Form.Label>
            <Col sm="8">
                <Form.Control type={type} disabled={true} value={value} />
            </Col>
        </Form.Group>
    );
}

export default OffcanvasControl;
