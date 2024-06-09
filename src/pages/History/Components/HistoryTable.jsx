import React, { useState } from "react";
import { 
    Table, 
    Button, 
    Spinner,
    Pagination,
} from "react-bootstrap";
import { GoEye } from "react-icons/go";

const HistoryTable = ({isLoading, headers, values, items}) => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    console.log(items);
    // Calculate the indices of the first and last items on the current page
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = items.slice(indexOfFirstItem, indexOfLastItem);

    // Calculate total number of pages
    const totalPages = Math.ceil(items.length / itemsPerPage);

    // Function to handle page change
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    return (
        <>
        {isLoading?
            <div className='d-flex justify-content-center'>
                <Spinner animation="border" size='lg' className='m-3' />
            </div>:
            <div>
                <div style={{ overflowX: "auto" }}>
                    <Table striped bordered hover className='p-0 m-0'>
                        <thead>
                            <tr>
                                {headers.map((header, index) => (
                                    <th key={index}>{header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.map((item) => (
                                <tr key={item.eventId}>
                                    {values.map((value, index) => (
                                        <td key={index}>{item[value]}</td>
                                    ))}
                                    <td>
                                        <Button
                                            variant="primary"
                                            onClick={() =>
                                                window.location.href = `/#/view-event/${item.eventId}`
                                            }
                                            style={{ marginRight: "5px" }}
                                        >
                                            <div style={{ display: "flex", alignItems: "center" }}>
                                                <GoEye size={20} />
                                                <span style={{marginLeft: "10px"}}>View</span>
                                            </div>
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
                <div className='d-flex justify-content-center'>
                    <Pagination className="mt-3 mb-0">
                        <Pagination.First onClick={() => handlePageChange(1)} disabled={currentPage === 1} />
                        <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
                        {Array.from({ length: totalPages }, (_, index) => (
                            <Pagination.Item
                                key={index + 1}
                                active={index + 1 === currentPage}
                                onClick={() => handlePageChange(index + 1)}
                            >
                                {index + 1}
                            </Pagination.Item>
                        ))}
                        <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
                        <Pagination.Last onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} />
                    </Pagination>
                </div>
            </div>
        }
        </>
    );
};

export default HistoryTable;
