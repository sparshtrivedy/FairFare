import React from 'react';
import { Card, Table, Button, Spinner } from 'react-bootstrap';
import { GoEye, GoCodeOfConduct, GoCheckCircle } from "react-icons/go";


const DashboardCard = ({ title, itemList, headers, values, isLoading, settleHandler, icon }) => {

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
                                {headers.map((header, index) => (
                                    <th key={index}>{header}</th>
                                ))}
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
                                    <tr key={index}>
                                        {values.map((value, index) => (
                                            <td key={index}>{item[value]}</td>
                                        ))}
                                        <td>
                                            <Button
                                                variant="primary"
                                                onClick={() =>
                                                    window.location.href = `/#/view-event/${item.eventId}`
                                                }
                                                className='m-1'
                                            >
                                                <div style={{ display: "flex", alignItems: "center" }}>
                                                    <GoEye size={20} />
                                                    <span style={{marginLeft: "10px"}}>View</span>
                                                </div>
                                            </Button>
                                            <Button
                                                variant="info"
                                                onClick={() => settleHandler(item)}
                                                className='m-1'
                                            >
                                                <div style={{ display: "flex", alignItems: "center" }}>
                                                    <GoCodeOfConduct size={20} />
                                                    <span style={{marginLeft: "10px"}}>Settle</span>
                                                </div>
                                            </Button>
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
