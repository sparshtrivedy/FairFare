import React, { useEffect, useContext, useState } from "react";
import { AuthContext } from "../../../App";
import { 
    Card,
    Form,
    Row,
    Col,
    Button,
} from "react-bootstrap";
import {
    GoPeople,
    GoTrash,
    GoPersonAdd,
    GoInfo,
} from "react-icons/go";
import { userWithEmailQuery } from "../../../Utils";
import { getDocs } from "firebase/firestore";
import { updateMemberSplits } from "../../../Utils";

const MembersCard = ({ members, memberError, setMemberError, event, setEvent, items, setItems, disabled=false }) => {
    const { userEmail } = useContext(AuthContext);
    const [contacts, setContacts] = useState([]);

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

        for (let i = 0; i < items.length; i++) {
            let copiedItems = [...items];
            copiedItems[i].splits[index].email = e.target.value;
            setItems(copiedItems);
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

    useEffect(() => {
        const fetchContacts = async () => {
            const memberQuery = userWithEmailQuery(userEmail);
            const memberQuerySnapshot = await getDocs(memberQuery);

            if (!memberQuerySnapshot.empty) {
                const memberData = memberQuerySnapshot.docs[0].data().contacts.sort();
                if (memberData.length > 0) setContacts(memberData);
            }
        }
        fetchContacts();
    }, [userEmail]);

    return (
        <Card className='my-3'>
            <Card.Header style={{backgroundColor: '#80b1b3'}} as="h5" className='display-flex align-items-center'>
                <GoPeople size={25} />
                <span style={{marginLeft: '10px'}}>Members</span>
            </Card.Header>
            <Card.Body>
                <Card.Subtitle className="mb-2 text-muted d-flex align-items-center">
                    Don't see a member? Add them to your 
                    <Button 
                        variant="link" 
                        className="px-1" 
                        onClick={() => {
                            window.location.href = '/#/contacts';
                        }}
                    >
                        contacts
                    </Button>
                </Card.Subtitle>
                {members?.length? members.map((member, index) => (
                    <Form.Group key={`member-${index}`} as={Row} className={index === members.length-1? "mb-1": "mb-3"}>
                        <Form.Label column sm="2" className='d-flex align-items-center'>
                            Member {index + 1}
                            <span style={{ color: 'red', marginLeft: '5px' }}>
                                *
                            </span>
                        </Form.Label>
                        <Col xs={disabled? "12": "9"} sm={disabled? "10": "9"}>
                            <Form.Select
                                onChange={(e) => handleUpdateMember(e, index)}
                                value={member.email}
                                disabled={disabled}
                                required={true}
                            >
                                <option>Select a member</option>
                                {contacts.map((member, i) => (
                                    <option key={`item-${index}-member-${i}`} value={member}>{member}</option>
                                ))}
                            </Form.Select>
                        </Col>
                        {!disabled &&
                        <Col xs="1">
                            <Button variant='danger' onClick={() => handleDeleteMember(index)}>
                                <GoTrash />
                            </Button>
                        </Col>}
                    </Form.Group>
                )):
                    <Card.Text className='d-flex align-items-center text-muted'>
                        <GoInfo size={20} />
                        <span style={{marginLeft: "10px"}}>
                            No members to display. Add members to split the expenses.
                        </span>
                    </Card.Text>
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
