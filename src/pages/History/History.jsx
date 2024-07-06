import React, {useContext, useEffect, useState} from 'react'
import { AuthContext } from '../../App';
import {
    Tabs,
    Tab,
    Container,
    Row,
    Col,
    Card,
    Breadcrumb,
} from 'react-bootstrap';
import { 
    GoFoldDown,
    GoFoldUp,
} from "react-icons/go";
import { getItemsYouOwe, getItemsOwedToYou } from '../../Utils';
import '../pages.css';
import SummaryTable from '../../Components/Tables/SummaryTable';
import FormHeader from '../Forms/Components/FormHeader';
import Skeleton from '@mui/material/Skeleton';

const History = () => {
    const {userEmail} = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(false);
    const [owedItems, setOwedItems] = useState([]);
    const [lentItems, setLentItems] = useState([]);

    useEffect(() => {
        const fetchOwedAndLent = async () => {
            setIsLoading(true);

            const eventsLentToMember = await getItemsYouOwe(userEmail, 'settled');
            setOwedItems(eventsLentToMember);

            const settledOwedItems = await getItemsOwedToYou(userEmail, 'settled');
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
                        <Card.Body style={{ backgroundColor: '#f7fafa' }}>
                            <Tabs
                                defaultActiveKey="paid-by-you"
                                id="uncontrolled-tab-example"
                                className="mb-3"
                                fill
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
                                            <Skeleton variant="rounded" width='100%' height={100} />
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
                                            <Skeleton variant="rounded" width='100%' height={100} />
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
