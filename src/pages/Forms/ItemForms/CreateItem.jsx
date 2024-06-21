import React, { useState, useEffect, useContext } from "react";
import {
    Container,
    Row,
    Col,
    Breadcrumb,
    Card,
    Button,
    Form,
    Spinner,
} from "react-bootstrap";
import { 
    GoPlusCircle, 
    GoProjectSymlink, 
    GoPeople, 
    GoPersonAdd, 
    GoTrash, 
    GoEye, 
    GoPencil, 
    GoFileDirectory, 
    GoInfo
} from "react-icons/go";
import FairFareControl from "../Components/FairFareControl";
import { AuthContext } from "../../../App";
import {
    getItemById,
    userWithEmailQuery,
    getItemRef,
    updateItem,
    
} from "../../../Utils";
import { addDoc, getDocs, collection } from "firebase/firestore";
import { db } from "../../../firebase-config";
import { useParams } from "react-router-dom";
import ErrorAlert from "../../../Components/Alerts/ErrorAlert";
import InfoAlert from "../../../Components/Alerts/InfoAlert";
import MembersCard from "../Components/MembersCard";

const CreateItem = ({ disabled = false, mode = '' }) => {
    const { userEmail } = useContext(AuthContext);
    const [contacts, setContacts] = useState([]);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [item, setItem] = useState({
        event: null,
        itemName: '',
        itemPrice: 0,
        itemQuantity: 0,
        transferTo: '',
        splits: []
    });
    const { itemId } = useParams();

    useEffect(() => {
        const fetchContacts = async () => {
            setIsLoading(true);
            const memberQuery = userWithEmailQuery(userEmail);
            const memberQuerySnapshot = await getDocs(memberQuery);

            if (!memberQuerySnapshot.empty) {
                const memberData = memberQuerySnapshot.docs[0].data().contacts.sort();
                if (memberData.length > 0) setContacts(memberData);
            }

            if (itemId) {
                const itemWithId = await getItemById(itemId);
                setItem(itemWithId);
            }
            setIsLoading(false);
        }
        
        fetchContacts();
    }, [itemId, userEmail]);

    const isValidated = () => {
        if (item.itemName === '' ||
            item.itemPrice === 0 ||
            item.itemQuantity === 0 ||
            item.transferTo === ''
        ) {
            setError('Please fill in all required fields.');
            return false;
        }

        if (item.splits.length === 0) {
            setError('Please add at least one member to the event.');
            return false;
        }

        for (const split of item.splits) {
            if (!split.email.length) {
                setError('Please provide valid member emails.');
                return false;
            }
        }

        return true;
    }

    const handleCreateItem = async () => {
        try {
            if (!isValidated()) {
                return;
            }
            const shareOfItem = (item.itemPrice * item.itemQuantity / item.splits.length).toFixed(2);
            let copiedItem = { ...item };
            copiedItem.splits = copiedItem.splits.map((split) => {
                return {
                    ...split,
                    amount: shareOfItem
                }
            });
            setItem(copiedItem);
            const itemRef = await addDoc(collection(db, 'items'), copiedItem);
            window.location.href = `/#/view-item/${itemRef.id}`;
        } catch (error) {
            setError(error.message);
        }
    }

    const handleUpdateItem = async () => {
        try {
            if (!isValidated()) {
                return;
            }
            const shareOfItem = (item.itemPrice * item.itemQuantity / item.splits.length).toFixed(2);
            let copiedItem = { ...item };
            copiedItem.splits = copiedItem.splits.map((split) => {
                return {
                    ...split,
                    amount: shareOfItem
                }
            });
            const itemRef = getItemRef(itemId);
            await updateItem(itemRef, copiedItem);
            window.location.href = `/#/view-item/${itemId}`;
        } catch (error) {
            setError(error.message);
        }
    }

    return (
        <Container style={{height: '100%'}}>
            <Row className='justify-content-center'>
                <Col sm={10} xs={12}>
                    <Breadcrumb className="my-2">
                        <Breadcrumb.Item href='/#/home'>Home</Breadcrumb.Item>
                        {mode === 'edit'?
                            <>
                                <Breadcrumb.Item href={`/#/view-item/${itemId}`}>View Item</Breadcrumb.Item>:
                                <Breadcrumb.Item active>Edit Item</Breadcrumb.Item>
                            </>:
                            (disabled ?
                                <Breadcrumb.Item active>View Item</Breadcrumb.Item>:
                                <Breadcrumb.Item active>Create Item</Breadcrumb.Item>)}
                    </Breadcrumb>
                    <Card style={{border: 0}} className='my-3'>
                        <Card.Header
                            style={{ backgroundColor: "#80b1b3" }}
                            as="h4"
                            className="d-flex align-items-center justify-content-center"
                        >
                            {mode === 'edit' ?
                                <>
                                    <GoPencil size={30} style={{ marginRight: "10px" }} />
                                    Edit item
                                </> :
                                (disabled ?
                                    <>
                                        <GoEye size={30} style={{ marginRight: "10px" }} />
                                        View item
                                    </> :
                                    <>
                                        <GoPlusCircle size={30} style={{ marginRight: "10px" }} />
                                        Create new item
                                    </>)}
                        </Card.Header>
                        <Card.Body style={{backgroundColor: '#f7fafa', paddingBottom: 0}}>
                            <ErrorAlert message={error} />
                            {
                                mode !== 'edit' && !disabled &&
                                <InfoAlert 
                                    message={"Recommended for stand-alone items that are not part of an event. If this item is part of an event,"} 
                                    altText={"create an event"}
                                    altLink={"/#/create-event"}
                                />
                            }
                            {isLoading? (
                            <div className='d-flex justify-content-center my-3'>
                                <Spinner animation="border" size='lg' />
                            </div>
                            ) : (
                                <>
                                    <FairFareControl
                                        label="Item name"
                                        type="text"
                                        placeholder="Enter item name"
                                        value={item.itemName}
                                        required={true}
                                        onChange={(e) => {
                                            setItem({
                                                ...item,
                                                itemName: e.target.value
                                            });
                                        }}
                                        disabled={disabled}
                                    />
                                    <FairFareControl
                                        label="Item price"
                                        type="number"
                                        placeholder="Enter item price"
                                        value={item.itemPrice}
                                        required={true}
                                        onChange={(e) => {
                                            setItem({
                                                ...item,
                                                itemPrice: e.target.value
                                            });
                                        }}
                                        disabled={disabled}
                                    />
                                    <FairFareControl
                                        label="Item quantity"
                                        type="number"
                                        placeholder="Enter item quantity"
                                        value={item.itemQuantity}
                                        required={true}
                                        onChange={(e) => {
                                            setItem({
                                                ...item,
                                                itemQuantity: e.target.value
                                            });
                                        }}
                                        disabled={disabled}
                                    />
                                    <Form.Group as={Row} className="mb-3">
                                        <Form.Label column sm="2" className='d-flex align-items-center'>
                                            Transfer to
                                            <span style={{ color: 'red', marginLeft: '5px' }}>
                                                *
                                            </span>
                                        </Form.Label>
                                        <Col sm="10">
                                            <Form.Select
                                                value={item.transferTo}
                                                required={true}
                                                onChange={(e) => {
                                                    setItem({
                                                        ...item,
                                                        transferTo: e.target.value
                                                    });
                                                }}
                                                disabled={disabled}
                                            >
                                                <option>Select a member</option>
                                                {contacts.map((member, i) => (
                                                    <option key={`member-${i}`} value={member}>{member}</option>
                                                ))}
                                            </Form.Select>
                                        </Col>
                                    </Form.Group>
                                    <MembersCard
                                        items={item}
                                        setItems={setItem}
                                        members={[]}
                                        disabled={disabled}
                                        event={null}
                                        setEvent={() => {}}
                                    />
                                    <Card className='my-3'>
                                        <Card.Header style={{backgroundColor: '#80b1b3'}} as="h5" className='display-flex align-items-center'>
                                            <GoPeople size={25} />
                                            <span style={{marginLeft: '10px'}}>
                                                Share among
                                            </span>
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
                                            {item.splits.length === 0 &&
                                            <Card.Text className='d-flex align-items-center text-muted'>
                                                <GoInfo size={20} />
                                                <span style={{marginLeft: "10px"}}>
                                                    No members to display. Add members to split the expenses.
                                                </span>
                                            </Card.Text>}
                                            {item.splits.map((split, index) => (
                                            <Form.Group key={`split-${index}`} as={Row} className={index === item.splits.length-1? "mb-1": "mb-3"}>
                                                <Form.Label column sm="2" className='d-flex align-items-center'>
                                                    Member {index + 1}
                                                    <span style={{ color: 'red', marginLeft: '5px' }}>
                                                        *
                                                    </span>
                                                </Form.Label>
                                                <Col xs={disabled? "12": "9"} sm={disabled? "10": "9"}>
                                                    <Form.Select
                                                        value={split.email}
                                                        required={true}
                                                        onChange={(e) => {
                                                            let copiedSplits = [...item.splits];
                                                            copiedSplits[index].email = e.target.value;
                                                            setItem({
                                                                ...item,
                                                                splits: copiedSplits
                                                            });
                                                        }}
                                                        disabled={disabled}
                                                    >
                                                        <option>Select a member</option>
                                                        {contacts.map((member, i) => (
                                                            <option key={`member-${i}`} value={member}>{member}</option>
                                                        ))}
                                                    </Form.Select>
                                                </Col>
                                                {!disabled &&
                                                <Col xs="1">
                                                    <Button 
                                                        variant='danger'
                                                        onClick={() => {
                                                            let copiedSplits = [...item.splits];
                                                            copiedSplits.splice(index, 1);
                                                            setItem({
                                                                ...item,
                                                                splits: copiedSplits
                                                            });
                                                        }}
                                                    >
                                                        <GoTrash />
                                                    </Button>
                                                </Col>}
                                            </Form.Group>
                                            ))}
                                        </Card.Body>
                                        {!disabled &&
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
                                        </Card.Footer>}
                                    </Card>
                            </>
                        )}
                        </Card.Body>
                        <Card.Footer style={{backgroundColor: '#80b1b3'}}>
                        {mode === 'edit' ?
                            <Button 
                                variant="primary" 
                                type="submit"
                                onClick={handleUpdateItem}
                            >
                                <div style={{ display: "flex", alignItems: "center" }}>
                                    <GoFileDirectory size={20} />
                                    <span style={{marginLeft: "10px"}}>Save edits</span>
                                </div>
                            </Button>:
                            (disabled ?
                                <Button 
                                    variant="primary" 
                                    type="submit"
                                    onClick={() =>
                                        window.location.href = `/#/edit-item/${itemId}`
                                    }
                                >
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <GoPencil size={20} />
                                        <span style={{marginLeft: "10px"}}>Edit item</span>
                                    </div>
                                </Button>:
                                <Button variant="primary" type="submit" onClick={handleCreateItem}>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <GoProjectSymlink size={20} />
                                        <span style={{marginLeft: "10px"}}>Create item</span>
                                    </div>
                                </Button>)
                        }
                        </Card.Footer>
                    </Card>
                </Col>
            </Row>
        </Container>
    )
}

export default CreateItem;
