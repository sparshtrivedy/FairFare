import React from "react";
import FairFareControl from "../../Components/FairFareControl";
import MemberSelectControl from "../../../../Components/FormControls/MemberSelectControl";
import {
    Form,
    Col,
    Row,
} from "react-bootstrap";
import { GoInfo } from "react-icons/go";

const ItemBody = ({ index, items, setItems, disabled, options, handleItemSplitChange }) => {
    return (
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
                value={items[index].itemName}
                disabled={disabled}
                required={true}
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
                value={items[index].itemPrice}
                disabled={disabled}
                required={true}
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
                value={items[index].itemQuantity}
                disabled={disabled}
                required={true}
            />
            <MemberSelectControl
                index={index}
                disabled={disabled}
                handleChange={(e, i) => {
                    let copiedItems = [...items];
                    copiedItems[i].transferTo = e.target.value;
                    setItems(copiedItems);
                }}
                handleDelete={() => {}}
                value={items[index].transferTo}
                options={options.map((member) => member.email)}
                className="mb-3"
                noDelete={true}
            />
            <Form.Group as={Row} className="mb-3">
                <Form.Label column sm="2" className='d-flex align-items-start'>
                    Shared among
                    <span style={{ color: 'red', marginLeft: '5px' }}>
                        *
                    </span>
                </Form.Label>
                <Col sm="10">
                {options.length?
                    (
                        options.map((member, i) => (
                            <Form.Check 
                                key={`item-${index}-member-${i}`}
                                type="checkbox" 
                                label={member.email}
                                onChange={() => handleItemSplitChange(index, i)}
                                checked={items[index].splits[i]?.isChecked}
                                disabled={disabled}
                            />
                        ))
                    ) : (
                        <div style={{ display: "flex", alignItems: "center" }} className='text-muted'>
                            <GoInfo size={20} />
                            <span style={{marginLeft: "10px"}}>
                                No members to display. Add members to split the expenses.
                            </span>
                        </div>
                    )
                }
                </Col>
            </Form.Group>
        </div>
    );
}

export default ItemBody;
