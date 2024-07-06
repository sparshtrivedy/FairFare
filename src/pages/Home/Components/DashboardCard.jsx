import React from 'react';
import { Card } from 'react-bootstrap';
import SummaryTable from '../../../Components/Tables/SummaryTable';
import CardHeader from '../../Forms/Components/CardHeader';
import Skeleton from '@mui/material/Skeleton';

const DashboardCard = ({ id, title, itemList, isLoading }) => {
    return (
        <Card className='m-0 p-0'>
            <CardHeader title={title} />
            <Card.Body className="d-flex flex-wrap justify-content-center m-0 p-3" style={{ overflowX: "auto" }}>
                {isLoading ? (
                    <Skeleton variant="rounded" width='100%' height={70} />
                ) : (
                    <SummaryTable items={itemList} id={id} />
                )}
            </Card.Body>
        </Card>
    )
}

export default DashboardCard;
