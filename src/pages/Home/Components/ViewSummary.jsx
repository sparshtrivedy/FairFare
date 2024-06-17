import React from "react";
import { Offcanvas, Form, Row, Col, Button, Card, Accordion } from "react-bootstrap";
import { 
    GoReply, 
    GoCheckCircle,
    GoTasklist,
    GoBook,
    GoCircleSlash,
} from "react-icons/go";
import {
    doc,
    updateDoc,
} from "firebase/firestore";
import { db } from "../../../firebase-config";

const ViewSummary = ({
    userEmail, 
    showSummary, 
    setShowSummary, 
    itemList, 
    labels, 
    values, 
    isSettled,
    settleUnsettle,
    setSelectedOweItem,
    selectedOweItem,
    setSelectedOwedItem,
    selectedOwedItem
}) => {
    return (
        <Offcanvas
            show={showSummary}
            placement="end"
            onHide={() => setShowSummary(false)}
        >
            <Offcanvas.Header style={{ backgroundColor: "#80b1b3" }} closeButton>
                <Offcanvas.Title as="h5" className="d-flex align-items-center">
                    <GoBook size={25} style={{ marginRight: "10px" }} /> 
                    <span>Settlement summary</span>
                </Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body className="p-0">
                <div className="p-3">
                    {labels.map((label, index) => (
                        <Form.Group
                            as={Row}
                            className="mb-3"
                            key={index}
                        >
                            <Form.Label column sm="4">
                                {label}
                            </Form.Label>
                            <Col sm="8">
                                <Form.Control
                                    type="text"
                                    disabled={true}
                                    value={values[index]}
                                />
                            </Col>
                        </Form.Group>
                    ))}
                </div>
                <Card style={{ border: 0 }} className="my-3">
                    <Card.Header
                        style={{ backgroundColor: "#80b1b3", border: 0, borderRadius: 0, padding: "15px" }}
                        as="h5"
                        className="d-flex align-items-center"
                    >
                        <GoTasklist size={25} style={{ marginRight: "10px" }} />{" "}
                        <span>Detailed breakdown</span>
                    </Card.Header>
                    <Accordion>
                        {itemList.items && itemList.items.map((item, index) => (
                            <Accordion.Item eventKey={index} key={index}>
                                <Accordion.Header>
                                    {item[itemList.title]}
                                </Accordion.Header>
                                <Accordion.Body className="p-0">
                                    <div style={{ padding: "15px", paddingBottom: "0px" }}>
                                        {itemList.labels.map((label, index) => (
                                            <Form.Group
                                                as={Row}
                                                className="mb-3"
                                                key={index}
                                            >
                                                <Form.Label column sm="4">
                                                    {label}
                                                </Form.Label>
                                                <Col sm="8">
                                                    <Form.Control
                                                        type="text"
                                                        disabled={true}
                                                        value={item[itemList.values[index]]}
                                                    />
                                                </Col>
                                            </Form.Group>
                                        ))}
                                    </div>
                                    <div className="d-flex justify-content-center p-2" style={{ backgroundColor: "#CFE2FF" }} >
                                        {
                                        // itemList.transferTo === userEmail || 
                                        (settleUnsettle !== "youOwe" && item[itemList.title] === userEmail) || 
                                        item.share === 0 ||
                                        itemList.transferTo === item[itemList.title]?
                                            <Button variant="secondary" disabled>
                                                <div style={{ display: "flex", alignItems: "center" }}>
                                                    <GoCircleSlash size={20} />
                                                    <span style={{marginLeft: "10px"}}>No action required</span>
                                                </div>
                                            </Button>:
                                            <Button
                                                variant={
                                                    isSettled(item, userEmail)? "danger": "success"
                                                }
                                                onClick={() =>
                                                    settleUnsettle === "youOwe"?
                                                    settleUnsettleYouOwe(setSelectedOweItem, selectedOweItem, item):
                                                    settleUnsettleOwedToYou(setSelectedOwedItem, selectedOwedItem, item)
                                                }
                                            >
                                                {isSettled(item, userEmail)? 
                                                    <div style={{ display: "flex", alignItems: "center" }}>
                                                        <GoReply size={20} />
                                                        <span style={{marginLeft: "10px"}}>Unsettle</span>
                                                    </div>:
                                                    <div style={{ display: "flex", alignItems: "center" }}>
                                                        <GoCheckCircle size={20} />
                                                        <span style={{marginLeft: "10px"}}>Settle</span>
                                                    </div>}
                                            </Button>
                                        }
                                    </div>
                                </Accordion.Body>
                            </Accordion.Item>
                        ))}
                    </Accordion>
                </Card>
            </Offcanvas.Body>
        </Offcanvas>
    );
}

function settleUnsettleOwedToYou(setSelectedOwedItem, selectedOwedItem, member) {
    setSelectedOwedItem({
        ...selectedOwedItem,
        members: selectedOwedItem?.members.map((m) => {
            if (m.email === member.email) {
                m.isSettled = !m.isSettled;
            }
            return m;
        })
    });

    const itemRef = doc(db, "items", selectedOwedItem.id);
    updateDoc(itemRef, {
        splits: selectedOwedItem?.members,
    });
}

function settleUnsettleYouOwe(setSelectedOweItem, selectedOweItem, member) {
    setSelectedOweItem({
        ...selectedOweItem,
        members: selectedOweItem?.members.map((m) => {
            if (m.email === member.email) {
                m.isSettled = !m.isSettled;
            }
            return m;
        })
    });

    const itemRef = doc(db, "items", selectedOweItem.id);
    updateDoc(itemRef, {
        splits: selectedOweItem?.members,
    });
}

export default ViewSummary;
