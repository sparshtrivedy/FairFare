import React from 'react';
import SummaryTable from '../../../Components/Tables/SummaryTable';
import Skeleton from '@mui/material/Skeleton';

const DashboardCard = ({ id, title, itemList, isLoading }) => {
    return (
        <>
            {isLoading ? (
                <Skeleton variant="rounded" width='100%' height={70} />
            ) : (
                <SummaryTable items={itemList} id={id} title={title} />
            )}
        </>
    )
}

export default DashboardCard;
