import React from 'react';
import { Card, Spinner } from 'react-bootstrap';
import SummaryTable from '../../../Components/Tables/SummaryTable';
import CardHeader from '../../Forms/Components/CardHeader';

const DashboardCard = ({ id, title, itemList, isLoading }) => {
    return (
        <Card className='m-0 p-0'>
            <CardHeader title={title} />
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
