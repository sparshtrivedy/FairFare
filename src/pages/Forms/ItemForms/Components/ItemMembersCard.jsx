import React from "react";
import { Card, Button } from "react-bootstrap";
import { GoPersonAdd } from "react-icons/go";
import MemberSelectControl from "../../../../Components/FormControls/MemberSelectControl";
import CardHeader from "../../Components/CardHeader";
import EmptyListText from "../../../../Components/CardText/EmptyListText";

const ItemMembersCard = ({ item, setItem, contacts, mode }) => {
    return (
        <Card className='my-3'>
            <CardHeader title="Members" />
            <Card.Body>
                <Card.Subtitle className="mb-2 text-muted">
                    Don't see a member? Add them to your <a href='/#/contacts'>contacts</a>
                </Card.Subtitle>
                {item.splits.length ? (
                    item.splits.map((split, index) => (
                        <MemberSelectControl
                            key={index}
                            index={index}
                            disabled={mode === 'view'}
                            handleChange={(e) => {
                                let copiedSplits = [...item.splits];
                                copiedSplits[index].email = e.target.value;
                                setItem({
                                    ...item,
                                    splits: copiedSplits
                                });
                            }}
                            handleDelete={() => {
                                let copiedSplits = [...item.splits];
                                copiedSplits.splice(index, 1);
                                setItem({
                                    ...item,
                                    splits: copiedSplits
                                });
                            }}
                            value={split.email}
                            options={contacts}
                            className={index === item.splits.length-1? 'mb-0': 'mb-3'}
                        />
                    ))
                ) : (
                    <EmptyListText id="members" />
                )}
            </Card.Body>
            {mode !== 'view' &&
                <Card.Footer style={{backgroundColor: '#80b1b3'}}>
                    <Button variant='primary' onClick={() => {
                        setItem({
                            ...item,
                            splits: [
                                ...item.splits,
                                {
                                    email: '',
                                    amount: 0,
                                    isChecked: true,
                                    isSettled: false
                                }
                            ]
                        });
                    }}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <GoPersonAdd size={20} />
                            <span style={{marginLeft: "10px"}}>Add member</span>
                        </div>
                    </Button>
                </Card.Footer>
            }
        </Card>
    );
}

export default ItemMembersCard;
