import React, { useEffect, useContext, useState } from "react";
import { AuthContext } from "../../../../App";
import { 
    Card,
    Button,
} from "react-bootstrap";
import {
    GoInfo,
} from "react-icons/go";
import { userWithEmailQuery } from "../../../../Utils";
import { getDocs } from "firebase/firestore";
import { updateMemberSplits } from "../../../../Utils";
import CardHeader from "../../Components/CardHeader";
import CardFooter from "../../Components/CardFooter";
import MemberSelectControl from "../../../../Components/FormControls/MemberSelectControl";

const EventMembersCard = ({ members, event, setEvent, items, setItems, disabled=false }) => {
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
        console.log(copiedMembers);
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
            <CardHeader title={"Members"} />
            <Card.Body>
                <Card.Subtitle className="mb-2 text-muted d-flex align-items-center">
                    Don't see a member? Add them to your 
                    <Button variant="link" className="px-1" onClick={() => window.location.href = '/#/contacts'}>
                        contacts
                    </Button>
                </Card.Subtitle>
                {members?.length ? 
                    members.map((member, index) => (
                        <MemberSelectControl
                            key={index}
                            index={index}
                            disabled={disabled}
                            handleChange={handleUpdateMember}
                            handleDelete={handleDeleteMember}
                            options={contacts}
                            value={member.email}
                            className={index === members.length - 1 ? 'mb-0' : 'mb-3'}
                        />
                    )) :
                    <Card.Text className='d-flex align-items-center text-muted'>
                        <GoInfo size={20} />
                        <span style={{marginLeft: "10px"}}>
                            No members to display. Add members to split the expenses.
                        </span>
                    </Card.Text>
                }
                
            </Card.Body>
            {!disabled && <CardFooter text={"Add member"} handler={handleAddMember} />}
        </Card>
    )
}

export default EventMembersCard;
