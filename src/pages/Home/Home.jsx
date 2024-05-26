import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../App";
import {
    collection,
    query,
    where,
    getDocs,
    doc,
    getDoc,
} from "firebase/firestore";
import { db } from "../../firebase-config";
import {
    Container,
    Row,
    Col,
    Card,
} from "react-bootstrap";
import {
    itemsWithTransferToMemberQuery,
    fetchEventsWithMember,
} from "../../Utils";
import DashboardCard from './Components/DashboardCard';
import ViewSummary from "./Components/ViewSummary";
import { 
    GoTable,
    GoFoldDown,
    GoFoldUp
} from "react-icons/go";

const Home = () => {
    const { userEmail } = useContext(AuthContext);

    const [eventsLentToUser, setEventsLentToUser] = useState([]);
    const [itemsOwedToUser, setItemsOwedToUser] = useState([]);

    const [showSettlementSummary, setShowSettlementSummary] = useState(false);
    const [showOwingBreakdown, setShowOwingBreakdown] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [selectedEventItems, setSelectedEventItems] = useState([]);
    const [selectedOwedItem, setSelectedOwedItem] = useState(null);

    useEffect(() => {
        const fetchOwedAndLent = async () => {
            setIsLoading(true);

            setEventsLentToUser([]);
            const eventsLentToMember = await fetchEventsWithMember(userEmail, false);
            setEventsLentToUser(eventsLentToMember);

            const itemsOwedToMember = await fetchItemsOwedToMember(userEmail);
            setItemsOwedToUser(itemsOwedToMember);

            setIsLoading(false);
        };

        fetchOwedAndLent();
    }, [userEmail]);

    const handleClickSettle = async (event) => {
        setSelectedEvent(event);

        const eventRef = doc(db, "events", event.eventId);

        const itemsQuery = query(
            collection(db, "items"),
            where("event", "==", eventRef)
        );

        const itemsSnapshot = await getDocs(itemsQuery);
        
        const items = itemsSnapshot.docs.map((doc) => {
            return {
                id: doc.id,
                name: doc.data().itemName,
                transferTo: doc.data().transferTo,
                price: doc.data().itemPrice,
                quantity: doc.data().itemQuantity,
                share: doc.data().splits.find((split) => split.email === userEmail).amount,
                splits: doc.data().splits,
            };
        });
        
        setSelectedEventItems(items);
        setShowSettlementSummary(true);
    };

    const handleClickBreakdown = async (item) => {
        setSelectedOwedItem(item);
        setShowOwingBreakdown(true);
    };

    return (
        <>
            <Container style={{ height: "100%" }}>
                <Row className="justify-content-center">
                    <Col xs={10}>
                        <Card style={{ border: 0 }} className="my-3">
                            <Card.Header
                                style={{ backgroundColor: "#80b1b3" }}
                                as="h4"
                                className="d-flex align-items-center justify-content-center"
                            >
                                <GoTable size={30} style={{ marginRight: "10px" }} />
                                Dashboard
                            </Card.Header>
                            <Card.Body>
                                <Card.Title as="h3">Welcome, {userEmail}!</Card.Title>
                                <Card.Subtitle className="mb-2 text-muted">
                                    Simplify your bill splitting with FairFare. Create an event
                                    and invite your friends to join.
                                </Card.Subtitle>
                                <DashboardCard 
                                    title="You owe"
                                    itemList={eventsLentToUser}
                                    headers={["Event name", "Event date", "To", "Balance", "Actions"]}
                                    values={["eventName", "eventDate", "email", "balance"]}
                                    isLoading={isLoading}
                                    settleHandler={handleClickSettle}
                                    icon={<GoFoldUp size={30} style={{ marginRight: "10px" }} />}
                                />
                                <br />
                                <DashboardCard
                                    title="You are owed"
                                    itemList={itemsOwedToUser}
                                    headers={["Item name", "Event name", "Amount", "From", "Actions"]}
                                    values={["itemName", "eventName", "youAreOwed", "unsettledMembers"]}
                                    isLoading={isLoading}
                                    settleHandler={handleClickBreakdown}
                                    icon={<GoFoldDown size={30} style={{ marginRight: "10px" }} />}
                                />
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
            <ViewSummary
                userEmail={userEmail}
                showSummary={showSettlementSummary}
                setShowSummary={setShowSettlementSummary}
                itemList={{
                    title: "name",
                    items: selectedEventItems,
                    labels: ["Item name", "Price", "Quantity", "Your share", "Transfer to"],
                    values: ["name", "price", "quantity", "share", "transferTo"],
                }}
                labels={["Event name", "Event date", "Your balance"]}
                values={[
                    selectedEvent?.eventName,
                    selectedEvent?.eventDate,
                    selectedEvent?.balance,
                ]}
                isSettled={isSettledYouOwe}
                settleUnsettle="youOwe"
                setSelectedOwedItem={setSelectedOwedItem}
                selectedOwedItem={selectedOwedItem}
                setSelectedEventItems={setSelectedEventItems}
                selectedEventItems={selectedEventItems}
            />
            <ViewSummary
                userEmail={userEmail}
                showSummary={showOwingBreakdown}
                setShowSummary={setShowOwingBreakdown}
                itemList={{
                    title: "email",
                    items: selectedOwedItem?.members,
                    labels: ["Amount owed"],
                    values: ["amount"],
                }}
                labels={["Event name", "Item name", "Price", "Quantity", "You are owed"]}
                values={[
                    selectedOwedItem?.eventName,
                    selectedOwedItem?.itemName,
                    selectedOwedItem?.itemPrice,
                    selectedOwedItem?.itemQuantity,
                    selectedOwedItem?.youAreOwed,
                ]}
                isSettled={isSettledOwedToYou}
                settleUnsettle="owedToYou"
                setSelectedOwedItem={setSelectedOwedItem}
                selectedOwedItem={selectedOwedItem}
                setSelectedEventItems={setSelectedEventItems}
                selectedEventItems={selectedEventItems}
            />
        </>
    );
};

export default Home;

const isSettledOwedToYou = (item, userEmail) => {
    return item.isSettled;
}

const isSettledYouOwe = (item, userEmail) => {
    return item.splits.find(split => split.email === userEmail).isSettled
}

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

        const unsettledItemTotal = calculateUnsettledTotal(
            itemSplits,
            itemOwedToMember
        );

        const unsettledMembers = itemSplits
            .filter(member => !member.isSettled)
            .map(member => member.email)
            .join(", ");

        if (unsettledItemTotal > 0) {
            owedItems.push({
                id: doc.id,
                eventId: itemOwedToMember.event.id,
                eventName: event.name,
                itemName: itemOwedToMember.itemName,
                itemPrice: itemOwedToMember.itemPrice,
                itemQuantity: itemOwedToMember.itemQuantity,
                youAreOwed: unsettledItemTotal.toFixed(2),
                members: itemSplits,
                unsettledMembers: unsettledMembers
            });
        }
    }

    return owedItems;
}

function calculateUnsettledTotal(itemSplits, itemOwedToMember) {
    const numUnSettled = itemSplits.filter((split) => !split.isSettled).length;
    const numMembers = itemSplits.length;

    const unsettledTotal = (parseFloat(itemOwedToMember.itemPrice) * itemOwedToMember.itemQuantity * numUnSettled) / numMembers;
    
    return unsettledTotal;
}
