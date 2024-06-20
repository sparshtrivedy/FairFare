import React, { useState, useContext } from "react";
import { Button } from "react-bootstrap";
import { GoCodeOfConduct } from "react-icons/go";
import ViewSummary from "../../pages/Home/Components/ViewSummary";
import { AuthContext } from "../../App";

const SettleButton = ({ item }) => {
    const { userEmail } = useContext(AuthContext);

    const [selectedItem, setSelectedItem] = useState(null);
    const [showSettlementSummary, setShowSettlementSummary] = useState(false);

    const handleClickSettle = () => {
        setSelectedItem(item);
        setShowSettlementSummary(true);
    }

    return (
        <>
            <Button variant="success" onClick={handleClickSettle} className='m-1'>
                <div style={{ display: "flex", alignItems: "center" }}>
                    <GoCodeOfConduct size={20} />
                    <span style={{marginLeft: "10px"}}>Settle</span>
                </div>
            </Button>
            <ViewSummary
                userEmail={userEmail}
                showSummary={showSettlementSummary}
                setShowSummary={setShowSettlementSummary}
                splits={item?.splits}
                transferTo={item?.transferTo}
                selectedItem={selectedItem}
                setSelectedItem={setSelectedItem}
            />
        </>
    );
}

export default SettleButton;
