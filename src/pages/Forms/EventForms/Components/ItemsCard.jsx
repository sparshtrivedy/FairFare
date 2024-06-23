import React from 'react';
import { 
    Card,
    Button,
    Accordion
} from 'react-bootstrap';
import { GoTrash } from 'react-icons/go';
import { updateMemberSplits } from '../../../../Utils';
import ItemBody from './ItemBody';
import CardFooter from '../../Components/CardFooter';
import CardHeader from '../../Components/CardHeader';
import EmptyListText from '../../../../Components/CardText/EmptyListText';

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
        updateMemberSplits(copiedItems, index);
        setItems(copiedItems);
    }

    return (
        <Card className='my-3'>
            <CardHeader title="Items" />
            <Card.Body>
            {items.length? (
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
                </Accordion> 
            ) : (
                <EmptyListText id="items" />
            )}
            </Card.Body>
            {!disabled &&
                <CardFooter text={"Add item"} handler={handleAddItems} />
            }
        </Card>
    )
}

export default ItemsCard;