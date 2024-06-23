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
    Breadcrumb,
    Spinner
} from 'react-bootstrap';
import { 
    GoFoldDown,
    GoFoldUp,
} from "react-icons/go";
import {
    itemsWithTransferToMemberQuery,
    fetchItemsSettledByMember
} from '../../Utils';
import '../pages.css';
import SummaryTable from '../../Components/Tables/SummaryTable';
import FormHeader from '../Forms/Components/FormHeader';

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
        <Container style={{ height: "100%" }}>
            <Row className="justify-content-center">
                <Col sm={10} xs={12}>
                    <Breadcrumb className="my-2">
                        <Breadcrumb.Item href='/#/home'>Home</Breadcrumb.Item>
                        <Breadcrumb.Item active>History</Breadcrumb.Item>
                    </Breadcrumb>
                    <Card style={{ border: 0 }} className="my-3">
                        <FormHeader title="History" />
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
                                    <div className='d-flex justify-content-center overflow-auto'>
                                        {isLoading ? (
                                            <Spinner animation="border" size="lg" className="m-3" />
                                        ) : (
                                            <SummaryTable items={owedItems} id="you-owe" />
                                        )}
                                    </div>
                                </Tab>
                                <Tab 
                                    eventKey="paid-to-you" 
                                    title={
                                    <>
                                        <GoFoldDown size={30} style={{ marginRight: "10px" }} /> 
                                        Paid to you
                                    </>}
                                >
                                    <div className='d-flex justify-content-center overflow-auto'>
                                        {isLoading ? (
                                            <Spinner animation="border" size="lg" className="m-3" />
                                        ) : (
                                            <SummaryTable items={lentItems} id="owed-to-you" />
                                        )}
                                    </div>
                                </Tab>
                            </Tabs>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
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
        let event = '';

        if (itemOwedToMember.event !== null) {
            const eventRef = await getDoc(itemOwedToMember.event);
            event = eventRef.data();
        }

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
            .map(member => member.email);

        settledItemTotal && owedItems.push({
            id: doc.id,
            eventId: itemOwedToMember.event?.id || '',
            eventName: event?.name || 'N/A',
            itemName: itemOwedToMember.itemName,
            itemPrice: itemOwedToMember.itemPrice,
            itemQuantity: itemOwedToMember.itemQuantity,
            amount: settledItemTotal.toFixed(2),
            members: settledMembers,
            splits: itemSplits.filter(split => split.isChecked)
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
