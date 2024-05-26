import React from 'react';
import { 
    Card,
    Row,
    Col,
    Button,
    Form,
    Accordion
} from 'react-bootstrap';
import { GoRows, GoWorkflow, GoTrash } from 'react-icons/go';
import FairFareControl from './FairFareControl';
import { updateMemberSplits } from '../../../Utils';

const ItemsCard = ({ event, items, setItems }) => {
    const handleAddItems = () => {
        setItems([...items, {
            itemName: '',
            itemPrice: 0,
            itemQuantity: 0,
            transferTo: '',
            splits: event.members.map(member => ({
                email: member.email,
                amount: 0,
                isChecked: false,
                isSettled: false
            }))
        }]);
    }

    const handleItemSplitChange = (index, i) => {
        let copiedItems = [...items];
        copiedItems[index].splits[i].isChecked = !copiedItems[index].splits[i].isChecked;
        updateMemberSplits(event.members, copiedItems, index);
        setItems(copiedItems);
    }

    return (
        <Card className='my-3'>
            <Card.Header style={{backgroundColor: '#80b1b3'}} as="h5" className='display-flex align-items-center'>
                <GoRows size={25} />
                <span style={{marginLeft: '10px'}}>Items</span>
            </Card.Header>
            <Card.Body>
            {items.length? 
                <Accordion>
                    {items.map((item, index) => (
                        <Accordion.Item eventKey={index} key={`item-${index}`}>
                            <Accordion.Header>
                                <h6>{item.itemName}</h6>
                            </Accordion.Header>
                            <Accordion.Body className='p-0'>
                                <div style={{ padding: "15px", paddingBottom: "0px" }}>
                                    <FairFareControl
                                        label="Item name"
                                        type="text"
                                        placeholder="Enter item name"
                                        onChange={(e) => {
                                            let copiedItems = [...items];
                                            copiedItems[index].itemName = e.target.value;
                                            setItems(copiedItems);
                                        }}
                                    />
                                    <FairFareControl
                                        label="Item price"
                                        type="number"
                                        placeholder="Enter item price"
                                        onChange={(e) => {
                                            let copiedItems = [...items];
                                            copiedItems[index].itemPrice = e.target.value;
                                            setItems(copiedItems);
                                        }}
                                    />
                                    <FairFareControl
                                        label="Item quantity"
                                        type="number"
                                        placeholder="Enter item quantity"
                                        onChange={(e) => {
                                            let copiedItems = [...items];
                                            copiedItems[index].itemQuantity = e.target.value;
                                            setItems(copiedItems);
                                        }}
                                    />
                                    <FairFareControl
                                        label="Transfer to"
                                        type="text"
                                        placeholder="Enter transfer details of person to e-transfer to"
                                        onChange={(e) => {
                                            let copiedItems = [...items];
                                            copiedItems[index].transferTo = e.target.value;
                                            setItems(copiedItems);
                                        }}
                                    />
                                    <Form.Group as={Row} className="mb-3">
                                        <Form.Label column sm="2">
                                            Shared among
                                        </Form.Label>
                                        <Col sm="10">
                                        {event.members.length?
                                            event.members.map((member, i) => (
                                                <Form.Check 
                                                    key={`item-${index}-member-${i}`}
                                                    type="checkbox" 
                                                    label={member.email}
                                                    onChange={() => handleItemSplitChange(index, i)}
                                                />
                                            )):
                                            <p>No members added</p>
                                        }
                                        </Col>
                                    </Form.Group>
                                </div>
                                <div className="d-flex p-2" style={{ backgroundColor: "#CFE2FF" }} >
                                    <Button variant='danger' onClick={() => {
                                        let copiedItems = [...items];
                                        copiedItems.splice(index, 1);
                                        setItems(copiedItems);
                                    }}>
                                        <div style={{ display: "flex", alignItems: "center" }}>
                                            <GoTrash size={20} />
                                            <span style={{marginLeft: "10px"}}>Remove item</span>
                                        </div>
                                    </Button>
                                </div>
                            </Accordion.Body>
                        </Accordion.Item>
                    ))}
                </Accordion>:
                <p>No items added</p>
            }
            </Card.Body>
            <Card.Footer style={{backgroundColor: '#80b1b3'}}>
                <Button variant='primary' onClick={handleAddItems}>   
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <GoWorkflow size={20} />
                        <span style={{marginLeft: "10px"}}>Add item</span>
                    </div>
                </Button>
            </Card.Footer>
        </Card>
    )
}

export default ItemsCard;