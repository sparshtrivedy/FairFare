import React from "react";
import { 
    Card,
    Alert,
    Form,
    Row,
    Col,
    Button,
} from "react-bootstrap";
import {
    GoPeople,
    GoTrash,
    GoPersonAdd,
    GoAlert
} from "react-icons/go";
import { userWithEmailQuery } from "../../../Utils";
import { getDocs } from "firebase/firestore";
import { updateMemberSplits } from "../../../Utils";

const MembersCard = ({ members, memberError, setMemberError, event, setEvent, items, setItems, disabled=false }) => {
    const handleAddMember = () => {
        setEvent({ ...event, 
            members: [...event.members, {
                email: ''
            }] 
        });
        
        setItems((prevItems) => {
            return prevItems.map((item) => {
                return {
                    ...item,
                    splits: [...item.splits, {
                        email: '',
                        amount: 0,
                        isChecked: false,
                        isSettled: false
                    }]
                }
            });
        });
    }

    const handleUpdateMember = async (e, index) => {
        let copiedMembers = [...event.members];
        copiedMembers[index].email = e.target.value;
        setEvent({ ...event, members: copiedMembers });

        const memberQuery = userWithEmailQuery(e.target.value);
        const memberQuerySnapshot = await getDocs(memberQuery);

        if (memberQuerySnapshot.empty) {
            setMemberError('Member not found. Please make sure this user has signed-up.');
        } else {
            setMemberError('');
            for (let i = 0; i < items.length; i++) {
                let copiedItems = [...items];
                copiedItems[i].splits[index].email = e.target.value;
                setItems(copiedItems);
            }
        }
    }

    const handleDeleteMember = (index) => {
        let copiedMembers = [...event.members];
        copiedMembers.splice(index, 1);
        setEvent({ ...event, members: copiedMembers });

        let copiedItems = [...items];
        copiedItems.forEach((item, i) => {
            item.splits.splice(index, 1);
            updateMemberSplits(copiedMembers, copiedItems, i);
        });

        setItems(copiedItems);
    }

    return (
        <Card className='my-3'>
            <Card.Header style={{backgroundColor: '#80b1b3'}} as="h5" className='display-flex align-items-center'>
                <GoPeople size={25} />
                <span style={{marginLeft: '10px'}}>Members</span>
            </Card.Header>
            <Card.Body>
                {!disabled &&
                <Alert variant='danger' className="d-flex align-items-center" show={memberError.length !== 0}>
                    <GoAlert size={20} style={{ marginRight: '10px' }} />
                    {memberError}
                </Alert>}
                {members?.length? members.map((member, index) => (
                    <div key={`member-${index}`} className='my-2'>
                        <Form.Group as={Row} className="mb-3">
                            <Form.Label column sm="2" className='d-flex align-items-center'>
                                Member {index + 1}
                                <span style={{ color: 'red', marginLeft: '5px' }}>
                                    *
                                </span>
                            </Form.Label>
                            <Col xs={disabled? "12": "9"} sm={disabled? "10": "9"}>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter member email"
                                    onChange={(e) => handleUpdateMember(e, index)}
                                    value={member.email}
                                    disabled={disabled}
                                />
                            </Col>
                            {!disabled &&
                            <Col xs="1">
                                <Button variant='danger' onClick={() => handleDeleteMember(index)}>
                                    <GoTrash />
                                </Button>
                            </Col>}
                        </Form.Group>
                    </div>
                )):
                    <div>No members found</div>
                }
            </Card.Body>
            {!disabled &&
            <Card.Footer style={{backgroundColor: '#80b1b3'}}>
                <Button variant='primary' onClick={handleAddMember}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <GoPersonAdd size={20} />
                        <span style={{marginLeft: "10px"}}>Add member</span>
                    </div>
                </Button>
            </Card.Footer>}
        </Card>
    )
}

export default MembersCard;
