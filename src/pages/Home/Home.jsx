import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../App";
import {
    getDocs,
    getDoc,
    updateDoc,
} from "firebase/firestore";
import {
    Container,
    Row,
    Col,
    Card,
    Breadcrumb,
} from "react-bootstrap";
import {
    itemsWithTransferToMemberQuery,
    fetchEventsWithMember,
    userWithEmailQuery,
} from "../../Utils";
import DashboardCard from './Components/DashboardCard';
import ViewSummary from "./Components/ViewSummary";
import { 
    GoTable,
    GoFoldDown,
    GoFoldUp,
} from "react-icons/go";
import '../pages.css';
import { auth } from "../../firebase-config";
import EmailVerificationAlert from "../../Components/Alerts/EmailVerificationAlert";

const Home = () => {
    const { userEmail } = useContext(AuthContext);

    const [eventsLentToUser, setEventsLentToUser] = useState([]);
    const [itemsOwedToUser, setItemsOwedToUser] = useState([]);

    const [showSettlementSummary, setShowSettlementSummary] = useState(false);
    const [showOwingBreakdown, setShowOwingBreakdown] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedOweItem, setSelectedOweItem] = useState(null);
    const [selectedOwedItem, setSelectedOwedItem] = useState(null);

    useEffect(() => {
        const fetchOwedAndLent = async () => {
            setIsLoading(true);

            setEventsLentToUser([]);
            const eventsLentToMember = await fetchEventsWithMember(userEmail, false);
            setEventsLentToUser(eventsLentToMember);

            const itemsOwedToMember = await fetchItemsOwedToMember(userEmail);
            setItemsOwedToUser(itemsOwedToMember);

            const user = auth.currentUser;

            const memberQuery = userWithEmailQuery(userEmail);
            const memberQuerySnapshot = await getDocs(memberQuery);
            const memberDoc = memberQuerySnapshot.docs[0];
            const memberData = memberDoc.data();
            if (memberData && !memberData.isVerified) {
                await updateDoc(memberDoc.ref, {
                    isVerified: user.emailVerified
                });
            }
            if (memberData && !memberData.uid) {
                await updateDoc(memberDoc.ref, {
                    uid: user.uid
                });
            }

            setIsLoading(false);
        };

        fetchOwedAndLent();
    }, [userEmail]);

    const handleClickSettle = async (item) => {
        setSelectedOweItem(item);
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
                    <Col sm={10} xs={12}>
                        <EmailVerificationAlert />
                        <Breadcrumb className="my-2">
                            <Breadcrumb.Item active>Home</Breadcrumb.Item>
                        </Breadcrumb>
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
                                    headers={["Item name", "Event name", "Amount", "To", "Actions"]}
                                    values={["itemName", "eventName", "youOwe", "transferTo"]}
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
                    title: "email",
                    items: selectedOweItem?.members,
                    labels: ["Owes"],
                    values: ["amount"],
                    transferTo: selectedOweItem?.transferTo,
                }}
                labels={["Event name", "Item name", "Price", "Quantity", "You owe"]}
                values={[
                    selectedOweItem?.eventName,
                    selectedOweItem?.itemName,
                    selectedOweItem?.itemPrice,
                    selectedOweItem?.itemQuantity,
                    selectedOweItem?.youOwe,
                ]}
                isSettled={isSettled}
                settleUnsettle="youOwe"
                setSelectedOwedItem={setSelectedOwedItem}
                selectedOwedItem={selectedOwedItem}
                setSelectedOweItem={setSelectedOweItem}
                selectedOweItem={selectedOweItem}
            />
            <ViewSummary
                userEmail={userEmail}
                showSummary={showOwingBreakdown}
                setShowSummary={setShowOwingBreakdown}
                itemList={{
                    title: "email",
                    items: selectedOwedItem?.members,
                    labels: ["Owes"],
                    values: ["amount"],
                    transferTo: selectedOwedItem?.transferTo,
                }}
                labels={["Event name", "Item name", "Price", "Quantity", "You are owed"]}
                values={[
                    selectedOwedItem?.eventName,
                    selectedOwedItem?.itemName,
                    selectedOwedItem?.itemPrice,
                    selectedOwedItem?.itemQuantity,
                    selectedOwedItem?.youAreOwed,
                ]}
                isSettled={isSettled}
                settleUnsettle="owedToYou"
                setSelectedOwedItem={setSelectedOwedItem}
                selectedOwedItem={selectedOwedItem}
                setSelectedOweItem={setSelectedOweItem}
                selectedOweItem={selectedOweItem}
            />
        </>
    );
};

export default Home;

const isSettled = (item) => {
    return item.isSettled;
}

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

        const unsettledItemTotal = calculateUnsettledTotal(
            itemSplits,
            itemOwedToMember,
            userEmail
        );

        const unsettledMembers = itemSplits
            .filter(member => !member.isSettled && member.email !== userEmail)
            .map(member => member.email)
            .join(", ");

        if (unsettledItemTotal > 0 && unsettledMembers.length > 0) {
            owedItems.push({
                id: doc.id,
                eventId: itemOwedToMember.event?.id || '',
                eventName: event?.name || 'N/A',
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

function calculateUnsettledTotal(itemSplits, itemOwedToMember, userEmail) {
    const numUnSettled = itemSplits.filter((split) => !split.isSettled && split.email !== userEmail).length;
    const numMembers = itemSplits.length;

    const unsettledTotal = (parseFloat(itemOwedToMember.itemPrice) * itemOwedToMember.itemQuantity * numUnSettled) / numMembers;
    
    return unsettledTotal;
}
