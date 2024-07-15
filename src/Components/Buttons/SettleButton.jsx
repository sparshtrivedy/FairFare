import React, { useState, useContext } from "react";
import { Button, Tooltip, OverlayTrigger } from "react-bootstrap";
import { GoCodeOfConduct } from "react-icons/go";
import ViewSummary from "../../pages/Home/Components/ViewSummary";
import { AuthContext } from "../../App";

const SettleButton = ({ item, disabled, refresh, setRefresh }) => {
    const { userEmail } = useContext(AuthContext);

    const [selectedItem, setSelectedItem] = useState(null);
    const [showSettlementSummary, setShowSettlementSummary] = useState(false);

    const handleClickSettle = () => {
        setSelectedItem(item);
        setShowSettlementSummary(true);
    }

    const renderTooltip = (props) => (
        <Tooltip id="button-tooltip" {...props}>
            Settle
        </Tooltip>
    );

    return (
        <>
            <OverlayTrigger
                placement="top"
                delay={{ show: 250, hide: 400 }}
                overlay={renderTooltip}
            >
                <Button variant="success" onClick={handleClickSettle} className='m-1' disabled={disabled}>
                    <GoCodeOfConduct size={20} rounded />
                </Button>
            </OverlayTrigger>
            <ViewSummary
                userEmail={userEmail}
                showSummary={showSettlementSummary}
                setShowSummary={setShowSettlementSummary}
                splits={item?.splits}
                transferTo={item?.transferTo}
                selectedItem={selectedItem}
                setSelectedItem={setSelectedItem}
                refresh={refresh}
                setRefresh={setRefresh}
            />
        </>
    );
}

export default SettleButton;
