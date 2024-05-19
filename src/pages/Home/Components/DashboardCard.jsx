import React from 'react';
import { Card, Table, Button, Spinner } from 'react-bootstrap';
import { MdOutlineKeyboardDoubleArrowUp } from "react-icons/md";
import { GrView, GrMoney } from "react-icons/gr";

const DashboardCard = ({ title, itemList, headers, values, isLoading, settleHandler }) => {

    return (
        <Card>
            <Card.Header
                style={{ backgroundColor: "#80b1b3" }}
                as="h4"
                className="d-flex align-items-center justify-content-center"
            >
                <MdOutlineKeyboardDoubleArrowUp size={30} style={{ marginRight: "5px" }} />{" "}
                {title}
            </Card.Header>
            <Card.Body className="d-flex flex-wrap justify-content-center m-0 p-0">
                {isLoading ? (
                    <Spinner animation="border" size="lg" className="m-3" />
                ) : (
                    <Table striped bordered hover className="m-3">
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
                                    <td colSpan="5">No events found</td>
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
                                                    window.location.href = `/#view-event/${item.eventId}`
                                                }
                                                style={{ marginRight: "5px" }}
                                            >
                                                <GrView /> View
                                            </Button>
                                            <Button
                                                variant="info"
                                                onClick={() => settleHandler(item)}
                                            >
                                                <GrMoney /> Settle
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
