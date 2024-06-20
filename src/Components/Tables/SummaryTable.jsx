import React from "react";
import { GoCheckCircle } from "react-icons/go";
import { ListGroup, Table } from "react-bootstrap";
import SettleButton from "../Buttons/SettleButton";
import ViewButton from "../Buttons/ViewButton";

const SummaryTable = ({ items, id }) => {
    return (
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
            {!items.length ? (
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
                items.map((item, index) => (
                    <tr key={`${id}_${index}`}>
                        <td>{item.itemName}</td>
                        <td>{item.eventName}</td>
                        <td>{item.amount}</td>
                        <td className="p-0">
                            <ListGroup variant="flush">
                            {item.members.map((member, index) => (
                                <ListGroup.Item key={index} style={{ background: 'transparent' }}>{member}</ListGroup.Item>
                            ))}
                            </ListGroup>
                        </td>
                        <td>
                            <ViewButton id={id} path={item.eventId ? `/#/view-event/${item.eventId}` : `/#/view-item/${item.id}`} />
                            <SettleButton item={item} />
                        </td>
                    </tr>
                ))
            )}
            </tbody>
        </Table>
    );
};

export default SummaryTable;
