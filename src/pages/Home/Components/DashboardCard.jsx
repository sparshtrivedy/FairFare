import React from 'react';
import { Card, Spinner } from 'react-bootstrap';
import SummaryTable from '../../../Components/Tables/SummaryTable';

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
                    <SummaryTable items={itemList} id={id} />
                )}
            </Card.Body>
        </Card>
    )
}

export default DashboardCard;
