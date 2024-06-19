import React from 'react';
import { Card, Table, Spinner } from 'react-bootstrap';
import { GoCheckCircle } from "react-icons/go";
import ViewButton from '../../../Components/Buttons/ViewButton';
import SettleButton from '../../../Components/Buttons/SettleButton';


const DashboardCard = ({ id, title, itemList, isLoading, icon }) => {
    return (
        <Card className='m-0 p-0'>
            <Card.Header
                style={{ backgroundColor: "#80b1b3" }}
                as="h4"
                className="d-flex align-items-center justify-content-center"
            >
                <div style={{ display: "flex", alignItems: "center" }}>
                    {icon}
                    <span>{title}</span>
                </div>
            </Card.Header>
            <Card.Body className="d-flex flex-wrap justify-content-center m-0 p-3" style={{ overflowX: "auto" }}>
                {isLoading ? (
                    <Spinner animation="border" size="lg" className="m-3" />
                ) : (
                    <Table striped bordered hover className='p-0 m-0'>
                        <thead>
                            <tr>
                                <th>Item name</th>
                                <th>Event name</th>
                                <th>Amount</th>
                                <th>{id === "you-owe" ? "To" : "From"}</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {!itemList.length ? (
                                <tr>
                                    <td colSpan={5}>
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: 'center' }} className='text-muted'>
                                            <GoCheckCircle size={20} />
                                            <span style={{marginLeft: "10px"}}>
                                                You are all caught up!
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                itemList.map((item, index) => (
                                    <tr key={`${id}_${index}`}>
                                        <td>{item.itemName}</td>
                                        <td>{item.eventName}</td>
                                        <td>{item.amount}</td>
                                        <td>{id === "you-owe" ? item.transferTo : item.unsettledMembers}</td>
                                        <td>
                                            <ViewButton id={id} path={item.eventId ? `/#/view-event/${item.eventId}` : `/#/view-item/${item.id}`} />
                                            <SettleButton item={item} />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </Table>
                )}
            </Card.Body>
        </Card>
    )
}

export default DashboardCard;
