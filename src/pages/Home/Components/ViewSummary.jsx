import React from "react";
import { Offcanvas, Button, Card, Accordion } from "react-bootstrap";
import { 
    GoReply, 
    GoCheckCircle,
    GoBook,
    GoCircleSlash,
} from "react-icons/go";
import {
    doc,
    updateDoc,
} from "firebase/firestore";
import { db } from "../../../firebase-config";
import OffcanvasControl from "../../../Components/FormControls/OffcanvasControl";
import CardHeader from "../../Forms/Components/CardHeader";

const ViewSummary = ({
    userEmail, 
    showSummary, 
    setShowSummary, 
    splits,
    transferTo,
    selectedItem,
    setSelectedItem,
}) => {
    const handleSettleUnsettle = (setSelectedOweItem, selectedOweItem, member) => {
        const copiedItem = { 
            ...selectedOweItem,
            lastUpdated: new Date().toISOString(),
        };
        copiedItem.splits = selectedOweItem?.splits.map((m) => {
            if (m.email === member.email) {
                m.isSettled = !m.isSettled;
                m.settledAt = new Date().toISOString();
            }
            return m;
        });
        setSelectedOweItem(copiedItem);
        
        const itemRef = doc(db, "items", copiedItem.id);
        updateDoc(itemRef, copiedItem);
    }

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
                <div className="m-3">
                    <OffcanvasControl label="Item name" type="text" value={selectedItem?.itemName} />
                    <OffcanvasControl label="Event name" type="text" value={selectedItem?.eventName} />
                    <OffcanvasControl label="Item price" type="number" value={selectedItem?.itemPrice} />
                    <OffcanvasControl label="Item quantity" type="number" value={selectedItem?.itemQuantity} />
                    <OffcanvasControl label="Pending" type="number" value={selectedItem?.amount} />
                </div>
                <Card style={{ border: 0 }} className="my-3">
                    <CardHeader title="Detailed breakdown" />
                    <Accordion>
                        {splits?.map((split, index) => (
                            <Accordion.Item eventKey={index} key={index}>
                                <Accordion.Header>
                                    {split.email}
                                </Accordion.Header>
                                <Accordion.Body className="p-0">
                                    <div className="my-3 mx-3">
                                        <OffcanvasControl label="Share" type="number" value={split?.amount} />
                                    </div>
                                    <div className="d-flex justify-content-center p-2" style={{ backgroundColor: "#CFE2FF" }} >
                                        {split.email === transferTo || split.amount === 0 ?
                                        <Button variant="secondary" disabled>
                                            <div style={{ display: "flex", alignItems: "center" }}>
                                                <GoCircleSlash size={20} />
                                                <span style={{marginLeft: "10px"}}>No action required</span>
                                            </div>
                                        </Button>:
                                        <Button
                                            variant={split?.isSettled? "danger": "success"}
                                            onClick={() => handleSettleUnsettle(setSelectedItem, selectedItem, split)}
                                        >
                                            {split?.isSettled? 
                                            <div style={{ display: "flex", alignItems: "center" }}>
                                                <GoReply size={20} />
                                                <span style={{marginLeft: "10px"}}>Unsettle</span>
                                            </div>:
                                            <div style={{ display: "flex", alignItems: "center" }}>
                                                <GoCheckCircle size={20} />
                                                <span style={{marginLeft: "10px"}}>Settle</span>
                                            </div>}
                                        </Button>}
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

export default ViewSummary;
