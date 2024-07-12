import React, { useState } from "react";
import { GoCheckCircle } from "react-icons/go";
import { ListGroup, Pagination, Badge, Accordion, Card, Container, Col } from "react-bootstrap";
import SettleButton from "../Buttons/SettleButton";
import ViewButton from "../Buttons/ViewButton";
import { GoFoldUp, GoFoldDown } from "react-icons/go";
import Skeleton from "@mui/material/Skeleton";
import "../components.css";
import EditButton from "../Buttons/EditButton";
import CreateButton from "../Buttons/CreateButton";

const TitleIconMap = {
    "You owe": <GoFoldUp size={30} style={{ marginRight: "10px" }} />,
    "Owed to you": <GoFoldDown size={30} style={{ marginRight: "10px" }} />,
}

const SummaryTable = ({ items, id, isLoading, title = null }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedItem, setSelectedItem] = useState(null);
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
        <Card className="w-100">
            <Card.Header style={{backgroundColor: '#80b1b3'}} as="h5" className="p-2">
                <Container style={{ display: "flex", alignItems: "center", justifyContent: 'space-between', padding: 0, flexWrap: 'wrap' }}>
                    <Col md={6} xs={12} style={{ display: "flex", alignItems: "center" }}>
                        {TitleIconMap[title]}
                        {title}
                    </Col>
                    <Col md={6} xs={12} className="d-flex align-items-center p-0 responsive-justify">
                        <CreateButton id={id} />
                        <ViewButton id={id} disabled={selectedItem === null} path={selectedItem && (selectedItem.eventId ? `/#/view-event/${selectedItem.eventId}` : `/#/view-item/${selectedItem.id}`)} />
                        <EditButton id={id} disabled={selectedItem === null} path={selectedItem && (selectedItem.eventId ? `/#/edit-event/${selectedItem.eventId}` : `/#/edit-item/${selectedItem.id}`)} />
                        <SettleButton disabled={selectedItem === null} item={selectedItem} />
                    </Col>
                </Container>
            </Card.Header>
            <Card.Body className='w-100'>
                {isLoading ? (
                    <Skeleton variant="rounded" width='100%' height={70} />
                ) : (
                    <ListGroup as="ol">
                    {!items.length ? (
                                <div style={{ display: "flex", alignItems: "center", justifyContent: 'center' }} className='text-muted'>
                                    <GoCheckCircle size={20} />
                                    <span style={{marginLeft: "10px"}}>
                                        You are all caught up!
                                    </span>
                                </div>
                    ) : (
                        currentItems.map((item, index) => (
                            <ListGroup.Item
                                action
                                key={index}
                                as="li"
                                onClick={() => setSelectedItem(item)}
                                active={selectedItem === item}
                                style={{ backgroundColor: '#fafafa', margin: '5px 0', borderRadius: 7, border: '1px solid #cfd8dc' }}
                            >
                                <div className="d-flex justify-content-between align-items-start">
                                    <div className="ms-2 me-auto">
                                        <div className="fw-bold text-muted">{item.itemName}</div>
                                        {item.eventName}
                                    </div>
                                    <div className="d-flex justify-content-between align-items-end flex-column">
                                        <div className="fw-bold text-muted">$ {item.amount}</div>
                                        {item.eventName === "N/A"  ? (
                                            <Badge pill bg="primary">
                                                Standalone
                                            </Badge>
                                        ) : (
                                            <Badge pill bg="success">
                                                Associated
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                                <Accordion className="mt-2">
                                    <Accordion.Item eventKey="0">
                                        <Accordion.Header>
                                            Members
                                        </Accordion.Header>
                                        <Accordion.Body className="p-0">
                                            <ListGroup variant="flush" style={{ borderRadius: 7 }}>
                                            {item.members.map((member, index) => (
                                                <ListGroup.Item key={index}>{member}</ListGroup.Item>
                                            ))}
                                            </ListGroup>
                                        </Accordion.Body>
                                    </Accordion.Item>
                                </Accordion>
                            </ListGroup.Item>
                        ))
                    )}
                    </ListGroup>
                )}
            </Card.Body>
            <Card.Footer style={{backgroundColor: '#80b1b3'}} className="p-2">
                <Pagination className="m-0">
                    <Pagination.Prev onClick={handlePrev} disabled={currentPage === 1} />
                    {pageNumbers.map(number => (
                        <Pagination.Item key={number} active={number === currentPage} onClick={() => handleClick(number)}>
                            {number}
                        </Pagination.Item>
                    ))}
                    <Pagination.Next onClick={handleNext} disabled={currentPage === pageNumbers.length} />
                </Pagination>
            </Card.Footer>
        </Card>
    );
};

export default SummaryTable;
