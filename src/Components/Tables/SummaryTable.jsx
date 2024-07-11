import React, { useState } from "react";
import { GoCheckCircle } from "react-icons/go";
import { ListGroup, Table, Pagination, Badge } from "react-bootstrap";
import SettleButton from "../Buttons/SettleButton";
import ViewButton from "../Buttons/ViewButton";

const SummaryTable = ({ items, id }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const handleClick = (number) => {
        setCurrentPage(number);
    };

    const handleNext = () => {
        if (currentPage < Math.ceil(items.length / itemsPerPage)) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePrev = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = items.slice(indexOfFirstItem, indexOfLastItem);

    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(items.length / itemsPerPage); i++) {
        pageNumbers.push(i);
    }

    return (
        <>
            <Table striped bordered hover className='p-0 m-0 w-100'>
                <thead>
                    <tr>
                        <th>Item</th>
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
                    currentItems.map((item, index) => (
                        <tr key={`${id}_${index}`}>
                            <td>
                                <div className="d-flex justify-content-between">
                                    <div className="d-flex flex-column" style={{ paddingRight: '10px' }}>
                                        <span className="fw-bold text-muted text-nowrap">
                                        {item.itemName}
                                        </span>
                                        <p className="text-muted fw-light text-nowrap">{item.eventName}</p>
                                    </div>
                                    <div className="d-flex flex-column align-items-end" style={{ paddingLeft: '10px' }}>
                                        <span className="fw-bold text-muted">$ {item.amount}</span>
                                        {item.eventName === "N/A"  ? (
                                            <Badge bg="warning" text="dark">
                                                Standalone
                                            </Badge>
                                        ) : (
                                            <Badge bg="info" text="dark">
                                                Associated
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </td>
                            <td style={{ width: '10px', padding: 0 }}>
                                <ListGroup variant="flush">
                                {item.members.map((member, index) => (
                                    <ListGroup.Item key={index} style={{ background: 'transparent' }}>{member}</ListGroup.Item>
                                ))}
                                </ListGroup>
                            </td>
                            <td className="text-nowrap display-inline-block" style={{ width: '225px' }}>
                                <ViewButton id={id} path={item.eventId ? `/#/view-event/${item.eventId}` : `/#/view-item/${item.id}`} />
                                <SettleButton item={item} />
                            </td>
                        </tr>
                    ))
                )}
                </tbody>
            </Table>
            {items.length > 0 &&
                <Pagination className="mt-3 mb-0">
                    <Pagination.Prev onClick={handlePrev} disabled={currentPage === 1} />
                    {pageNumbers.map(number => (
                        <Pagination.Item key={number} active={number === currentPage} onClick={() => handleClick(number)}>
                            {number}
                        </Pagination.Item>
                    ))}
                    <Pagination.Next onClick={handleNext} disabled={currentPage === pageNumbers.length} />
                </Pagination>
            }
        </>
    );
};

export default SummaryTable;
