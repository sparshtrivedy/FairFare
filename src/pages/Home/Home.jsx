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

const Home = () => {
    const { userEmail, setIsVerified } = useContext(AuthContext);

    const [isLoading, setIsLoading] = useState(false);
    const [eventsLentToUser, setEventsLentToUser] = useState([]);
    const [itemsOwedToUser, setItemsOwedToUser] = useState([]);

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
                            <Card.Subtitle className="mb-2 text-muted">
                                Simplify your bill splitting with FairFare. Create an event
                                and invite your friends to join.
                            </Card.Subtitle>
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
