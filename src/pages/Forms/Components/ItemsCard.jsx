import React from 'react';
import { 
    Card,
    Button,
    Accordion
} from 'react-bootstrap';
import { GoRows, GoWorkflow, GoTrash, GoInfo } from 'react-icons/go';
import { updateMemberSplits } from '../../../Utils';
import ItemBody from './ItemBody';

const ItemsCard = ({ event, items, setItems, disabled=false }) => {
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
                                <ItemBody
                                    index={index}
                                    items={items}
                                    setItems={setItems}
                                    disabled={disabled}
                                    options={event.members}
                                    handleItemSplitChange={handleItemSplitChange}
                                />
                                {!disabled &&
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
                                }
                            </Accordion.Body>
                        </Accordion.Item>
                    ))}
                </Accordion> :
                <div style={{ display: "flex", alignItems: "center" }} className='text-muted'>
                    <GoInfo size={20} />
                    <span style={{marginLeft: "10px"}}>
                        No items to display. Add items to split the expenses.
                    </span>
                </div>
            }
            </Card.Body>
            {!disabled &&
                <Card.Footer style={{backgroundColor: '#80b1b3'}}>
                    <Button variant='primary' onClick={handleAddItems}>   
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <GoWorkflow size={20} />
                            <span style={{marginLeft: "10px"}}>Add item</span>
                        </div>
                    </Button>
                </Card.Footer>
            }
        </Card>
    )
}

export default ItemsCard;