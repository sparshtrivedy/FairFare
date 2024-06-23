import React, { useEffect, useContext, useState } from "react";
import { AuthContext } from "../../../../App";
import { Card } from "react-bootstrap";
import { getUserByEmail } from "../../../../Queries";
import { updateMemberSplits } from "../../../../Utils";
import CardHeader from "../../Components/CardHeader";
import CardFooter from "../../Components/CardFooter";
import MemberSelectControl from "../../../../Components/FormControls/MemberSelectControl";
import EmptyListText from "../../../../Components/CardText/EmptyListText";

const EventMembersCard = ({ members, event, setEvent, items, setItems, disabled=false }) => {
    const { userEmail } = useContext(AuthContext);
    const [contacts, setContacts] = useState([]);

    useEffect(() => {
        const fetchContacts = async () => {
            const member = await getUserByEmail(userEmail);
            if (member) {
                const memberContacts = member.data().contacts.sort();
                setContacts(memberContacts);
            }
        }

        fetchContacts();
    }, [userEmail]);

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
            updateMemberSplits(copiedItems, i);
        });

        setItems(copiedItems);
    }

    return (
        <Card className='my-3'>
            <CardHeader title={"Members"} />
            <Card.Body>
                <Card.Subtitle className="mb-2 text-muted">
                    Don't see a member? Add them to your <a href='/#/contacts'>contacts</a>
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
                    <EmptyListText id="members" />
                }
                
            </Card.Body>
            {!disabled && <CardFooter text={"Add member"} handler={handleAddMember} />}
        </Card>
    )
}

export default EventMembersCard;
