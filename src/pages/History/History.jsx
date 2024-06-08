import React, {useContext, useEffect, useState} from 'react'
import { AuthContext } from '../../App';
import { getDocs, getDoc } from "firebase/firestore";
import {
    Tabs,
    Tab,
    Container,
    Row,
    Col,
    Card,
} from 'react-bootstrap';
import { 
    GoHistory,
    GoFoldDown,
    GoFoldUp,
} from "react-icons/go";
import HistoryTable from './Components/HistoryTable';
import {
    itemsWithTransferToMemberQuery,
    fetchItemsSettledByMember
} from '../../Utils';

const History = () => {
    const {userEmail} = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(false);
    const [owedItems, setOwedItems] = useState([]);
    const [lentItems, setLentItems] = useState([]);

    useEffect(() => {
        const fetchOwedAndLent = async () => {
            setIsLoading(true);

            const eventsLentToMember = await fetchItemsSettledByMember(userEmail);
            setOwedItems(eventsLentToMember);

            const settledOwedItems = await fetchItemsOwedToMember(userEmail);
            setLentItems(settledOwedItems);

            setIsLoading(false);
        };

        fetchOwedAndLent();
    }, [userEmail]);

    return (
        <>
            <Container style={{ height: "100%" }}>
                <Row className="justify-content-center">
                    <Col sm={10} xs={12}>
                        <Card style={{ border: 0 }} className="my-3">
                            <Card.Header
                                style={{ backgroundColor: "#80b1b3" }}
                                as="h4"
                                className="d-flex align-items-center justify-content-center"
                            >
                                <GoHistory size={30} style={{ marginRight: "10px" }} />
                                History
                            </Card.Header>
                            <Card.Body>
                                <Tabs
                                    defaultActiveKey="paid-by-you"
                                    id="uncontrolled-tab-example"
                                    className="mb-3"
                                >
                                    <Tab 
                                        eventKey="paid-by-you" 
                                        title={
                                            <>
                                                <GoFoldUp size={30} style={{ marginRight: "10px" }} /> 
                                                Paid by you
                                            </>}
                                    >
                                        <HistoryTable 
                                            isLoading={isLoading} 
                                            headers={['Event name', 'Item name', 'To', 'Amount', "Actions"]} 
                                            values={['eventName', 'itemName', 'transferTo', 'youPaid']} 
                                            items={owedItems} 
                                        />
                                    </Tab>
                                    <Tab 
                                        eventKey="paid-to-you" 
                                        title={
                                        <>
                                            <GoFoldDown size={30} style={{ marginRight: "10px" }} /> 
                                            Paid to you
                                        </>}
                                    >
                                        <HistoryTable 
                                            isLoading={isLoading} 
                                            headers={['Event name', 'Item name', 'From', 'Amount', "Actions"]} 
                                            values={['eventName', 'itemName', 'members', 'youAreOwed']} 
                                            items={lentItems} 
                                        />
                                    </Tab>
                                </Tabs>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    )
}

export default History;

async function fetchItemsOwedToMember(userEmail) {
    const itemsOwedToMemberQuery = itemsWithTransferToMemberQuery(userEmail);
    const itemsOwedToMemberSnapshot = await getDocs(itemsOwedToMemberQuery);
    const itemsOwedToMemberDocs = itemsOwedToMemberSnapshot.docs;

    const owedItems = [];

    for (const doc of itemsOwedToMemberDocs) {
        const itemOwedToMember = doc.data();

        const eventRef = await getDoc(itemOwedToMember.event);
        const event = eventRef.data();

        const itemSplits = itemOwedToMember.splits.filter(
            split => split.isChecked
        );

        const settledItemTotal = calculateSettledTotal(
            itemSplits,
            itemOwedToMember,
            userEmail
        );

        const settledMembers = itemSplits
            .filter(member => member.isSettled && member.email !== userEmail)
            .map(member => member.email)
            .join(", ");

        settledItemTotal && owedItems.push({
            id: doc.id,
            eventId: itemOwedToMember.event.id,
            eventName: event.name,
            itemName: itemOwedToMember.itemName,
            itemPrice: itemOwedToMember.itemPrice,
            itemQuantity: itemOwedToMember.itemQuantity,
            youAreOwed: settledItemTotal.toFixed(2),
            members: settledMembers
        });
    }

    return owedItems;
}

function calculateSettledTotal(itemSplits, itemOwedToMember, userEmail) {
    const numSettled = itemSplits.filter((split) => split.isSettled && split.email !== userEmail).length;
    const numMembers = itemSplits.length;

    const settledTotal = (parseFloat(itemOwedToMember.itemPrice) * itemOwedToMember.itemQuantity * numSettled) / numMembers;
    
    return settledTotal;
}
