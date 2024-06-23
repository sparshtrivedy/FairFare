import React, { useState, useEffect, useContext } from "react";
import {
    Container,
    Row,
    Col,
    Breadcrumb,
    Card,
    Spinner,
} from "react-bootstrap";
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
import FormHeader from "../Components/FormHeader";
import CardFooter from "../Components/CardFooter";
import ItemMembersCard from "./Components/ItemMembersCard";
import MemberSelectControl from "../../../Components/FormControls/MemberSelectControl";

const ItemForm = ({ mode }) => {
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
                        {mode === 'create' && <Breadcrumb.Item active>Create Item</Breadcrumb.Item>}
                        {mode === 'edit' && 
                            <>
                                <Breadcrumb.Item href={`/#/view-item/${itemId}`}>View Item</Breadcrumb.Item>
                                <Breadcrumb.Item active>Edit Item</Breadcrumb.Item>
                            </>
                        }
                        {mode === 'view' && <Breadcrumb.Item active>View Item</Breadcrumb.Item>}
                    </Breadcrumb>
                    <Card style={{border: 0}} className='my-3'>
                        {mode === 'view' && <FormHeader title={"View Item"} />}
                        {mode === 'create' && <FormHeader title={"Create Item"} />}
                        {mode === 'edit' && <FormHeader title={"Edit Item"} />}
                        <Card.Body style={{backgroundColor: '#f7fafa', paddingBottom: 0}}>
                            <ErrorAlert message={error} />
                            {mode === 'create' &&
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
                                        disabled={mode === 'view'}
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
                                        disabled={mode === 'view'}
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
                                        disabled={mode === 'view'}
                                    />
                                    <MemberSelectControl
                                        index={0}
                                        disabled={mode === 'view'}
                                        handleChange={(e) => {
                                            setItem({
                                                ...item,
                                                transferTo: e.target.value
                                            });
                                        }}
                                        handleDelete={() => {}}
                                        value={item.transferTo}
                                        options={contacts}
                                        className="mb-3"
                                        noDelete={true}
                                    />
                                    <ItemMembersCard
                                        item={item}
                                        setItem={setItem}
                                        contacts={contacts}
                                        mode={mode}
                                    />
                                </>
                            )}
                        </Card.Body>
                        {mode === "create" && <CardFooter text={"Create item"} handler={handleCreateItem} />}
                        {mode === "view" && <CardFooter text={"Edit item"} handler={() => window.location.href = `/#/edit-item/${itemId}`} />}
                        {mode === "edit" && <CardFooter text={"Save changes"} handler={handleUpdateItem}/>}
                    </Card>
                </Col>
            </Row>
        </Container>
    )
}

export default ItemForm;
