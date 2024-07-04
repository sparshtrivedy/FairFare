import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../App";
import { updateDoc } from "firebase/firestore";
import {
    Container,
    Row,
    Col,
    Card,
    Breadcrumb,
} from "react-bootstrap";
import { getUserByEmail } from "../../Queries";
import { getItemsYouOwe, getItemsOwedToYou } from "../../Utils";
import DashboardCard from './Components/DashboardCard';
import '../pages.css';
import { auth } from "../../firebase-config";
import EmailVerificationAlert from "../../Components/Alerts/EmailVerificationAlert";
import FormHeader from "../Forms/Components/FormHeader";
import { GoInfo, GoIssueOpened, GoHourglass } from "react-icons/go";

const Home = () => {
    const { userEmail, setIsVerified } = useContext(AuthContext);

    const [isLoading, setIsLoading] = useState(false);
    const [eventsLentToUser, setEventsLentToUser] = useState([]);
    const [itemsOwedToUser, setItemsOwedToUser] = useState([]);
    const [totalOwedToUser, setTotalOwedToUser] = useState(0);
    const [totalOwedByUser, setTotalOwedByUser] = useState(0);
    const [averageSettlementTime, setAverageSettlementTime] = useState(0);

    useEffect(() => {
        const fetchOwedAndLent = async () => {
            setIsLoading(true);

            setEventsLentToUser([]);
            const eventsLentToMember = await getItemsYouOwe(userEmail, 'unsettled');
            setEventsLentToUser(eventsLentToMember);

            const itemsOwedToMember = await getItemsOwedToYou(userEmail, 'unsettled');
            setItemsOwedToUser(itemsOwedToMember);

            const user = auth.currentUser;

            const member = await getUserByEmail(userEmail);
            if (member && !member.data().isVerified) {
                setIsVerified(user.emailVerified);
                await updateDoc(member.ref, {
                    isVerified: user.emailVerified
                });
            }
            if (member && !member.data().uid) {
                await updateDoc(member.ref, {
                    uid: user.uid
                });
            }

            const totalOwedToMember = itemsOwedToMember.reduce((acc, item) => acc + parseFloat(item.amount), 0);
            const totalOwedByMember = eventsLentToMember.reduce((acc, event) => acc + parseFloat(event.amount), 0);

            setTotalOwedToUser(totalOwedToMember);
            setTotalOwedByUser(totalOwedByMember);

            const itemsSettledByMember = (await getItemsYouOwe(userEmail, 'settled')).filter(item => item.createdAt && item.settledAt);
            const timeToSettle = itemsSettledByMember.reduce((acc, item) => 
                acc 
                + ((Date.parse(item.settledAt) - Date.parse(item.createdAt)) / (1000 * 60 * 60 * 24))
                , 0);
            setAverageSettlementTime(itemsSettledByMember.length > 0 ? timeToSettle / itemsSettledByMember.length : 0);

            setIsLoading(false);
        };

        fetchOwedAndLent();
    }, [userEmail, setIsVerified]);

    return (
        <Container style={{ height: "100%" }}>
            <Row className="justify-content-center">
                <Col sm={10} xs={12}>
                    <EmailVerificationAlert />
                    <Breadcrumb className="my-2">
                        <Breadcrumb.Item active>Home</Breadcrumb.Item>
                    </Breadcrumb>
                    <Card style={{ border: 0 }} className="my-3">
                        <FormHeader title="Dashboard" />
                        <Card.Body>
                            <Card.Title as="h3">Welcome, {userEmail}!</Card.Title>
                            <Card.Subtitle className="text-muted">
                                Simplify your bill splitting with FairFare. Create an event
                                and invite your friends to join.
                            </Card.Subtitle>
                            <br/>
                            <Row>
                                <Col md={4} sm={6} xs={12} className="mb-4">
                                    <Card bg="primary" className="bg-opacity-50 border-2 h-100" border="primary">
                                        <Card.Body>
                                            <Card.Title className="d-flex align-items-center">
                                                <GoIssueOpened size={30} style={{ marginRight: "10px" }} />
                                                Total owed to you
                                            </Card.Title>
                                            <Card.Subtitle className="mb-2 text-muted">
                                                Unsettled dues owed to you
                                            </Card.Subtitle>
                                            <Card.Text>
                                                <span style={{ fontSize: "1.5rem", fontWeight: 500 }}>
                                                    $ {totalOwedToUser.toFixed(2) || 0}
                                                </span>
                                            </Card.Text>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col md={4} sm={6} xs={12} className="mb-4">
                                    <Card bg="danger" className="bg-opacity-50 border-2 h-100" border="danger">
                                        <Card.Body>
                                            <Card.Title className="d-flex align-items-center">
                                                <GoHourglass size={30} style={{ marginRight: "10px" }} />
                                                Total you owe
                                            </Card.Title>
                                            <Card.Subtitle className="mb-2 text-muted">
                                                Unsettled dues you owe
                                            </Card.Subtitle>
                                            <Card.Text>
                                                <span style={{ fontSize: "1.5rem", fontWeight: 500 }}>
                                                    $ {totalOwedByUser.toFixed(2) || 0}
                                                </span>
                                            </Card.Text>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col md={4} sm={12} className="mb-4">
                                    <Card bg="success" className="bg-opacity-50 border-2 h-100" border="success">
                                        <Card.Body>
                                            <Card.Title className="d-flex align-items-center">
                                                <GoInfo size={30} style={{ marginRight: "10px" }} />
                                                Typically settle in
                                            </Card.Title>
                                            <Card.Subtitle className="mb-2 text-muted">
                                                Average time to settle dues
                                            </Card.Subtitle>
                                            <Card.Text>
                                                <span style={{ fontSize: "1.5rem", fontWeight: 500 }}>
                                                    {averageSettlementTime.toFixed(2) || 0} days
                                                </span>
                                            </Card.Text>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                            <DashboardCard
                                id="you-owe"
                                title="You owe"
                                itemList={eventsLentToUser}
                                isLoading={isLoading}
                            />
                            <br />
                            <DashboardCard
                                id="owed-to-you"
                                title="Owed to you"
                                itemList={itemsOwedToUser}
                                isLoading={isLoading}
                            />
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Home;
