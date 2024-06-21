import React from "react";
import { Form, Row, Col, Button } from "react-bootstrap";
import { GoTrash } from "react-icons/go";

const MemberSelectControl = ({ index, disabled, handleChange, handleDelete, value, options, className, noDelete=false }) => {
    return (
        <Form.Group key={`member-${index}`} as={Row} className={className}>
            <Form.Label column sm="2" className='d-flex align-items-center'>
                {noDelete ? 'Transfer to' : `Member ${index + 1}`}
                <span className="text-danger" style={{ marginLeft: '5px' }}>*</span>
            </Form.Label>
            <Col xs={(!disabled && !noDelete) ? "9" : "12"} sm={(!disabled && !noDelete) ? "9" : "10"}>
                <Form.Select
                    onChange={(e) => handleChange(e, index)}
                    value={value}
                    disabled={disabled}
                    required={true}
                >
                    <option>Select a member</option>
                    {options.map((member, i) => (
                        <option key={`member-${index}-option-${i}`} value={member}>{member}</option>
                    ))}
                </Form.Select>
            </Col>
            {(!disabled && !noDelete) &&
                <Col xs="1">
                    <Button variant='danger' onClick={() => handleDelete(index)}>
                        <GoTrash />
                    </Button>
                </Col>
            }
        </Form.Group>
    );
}

export default MemberSelectControl;
