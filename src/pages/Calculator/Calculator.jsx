import React, { useState } from "react";
import {
    Container,
    Row,
    Col,
    Breadcrumb,
    Card,
    Form,
    InputGroup
} from "react-bootstrap";
import FormHeader from "../Forms/Components/FormHeader";
import FairFareControl from "../Forms/Components/FairFareControl";
import CardFooter from "../Forms/Components/CardFooter";
import CardHeader from "../Forms/Components/CardHeader";

const Calculator = () => {
    const [showResult, setShowResult] = useState(false);
    const [data, setData] = useState({
        tip: 0,
        people: 0,
        tax: 0,
        shares: [],
        result: []
    });

    return (
        <Container style={{ height: "100%" }}>
            <Row className="justify-content-center">
                <Col sm={10} xs={12}>
                    <Breadcrumb className="my-2">
                        <Breadcrumb.Item href='/#/home'>Home</Breadcrumb.Item>
                        <Breadcrumb.Item active>Calculator</Breadcrumb.Item>
                    </Breadcrumb>
                    <Card style={{ border: 0 }} className="my-3">
                        <FormHeader title="Calculator" />
                        <Card.Body style={{ backgroundColor: '#f7fafa' }}>
                            <FairFareControl
                                label="Number of people"
                                type="number"
                                placeholder="Enter number of people"
                                onChange={(e) => {
                                    setShowResult(false);
                                    setData({ 
                                        ...data, 
                                        people: parseFloat(e.target.value),
                                        shares: Array.from({ length: parseFloat(e.target.value) }).map(() => 0)
                                    });
                                }}
                                value={data.people}
                                required={true}
                            />
                            {data.people !== 0 && Array.from({ length: data.people }).map((_, index) => (
                                <Form.Group as={Row} key={index} className="mb-3">
                                    <Form.Label column sm="2">
                                        Person {index + 1}
                                    </Form.Label>
                                    <Col sm={10}>
                                        <InputGroup>
                                            <InputGroup.Text id="basic-addon1">$</InputGroup.Text>
                                            <Form.Control
                                                placeholder={`Enter share for person ${index + 1}`}
                                                value={data.shares[index].toFixed(2)}
                                                type="number"
                                                onChange={(e) => {
                                                    setShowResult(false);

                                                    const newShares = [...data.shares];
                                                    newShares[index] = parseFloat(e.target.value);
                                                    setData({ ...data, shares: newShares });
                                                }}
                                            />
                                        </InputGroup>
                                    </Col>
                                </Form.Group>
                            ))}
                            <FairFareControl
                                label="Tax"
                                type="number"
                                placeholder="Enter tax"
                                onChange={(e) => {
                                    setShowResult(false);
                                    setData({...data, tax: parseFloat(e.target.value)});
                                }}
                                value={data.tax}
                                required={true}
                            />
                            <FairFareControl
                                label="Tip"
                                type="number"
                                placeholder="Enter tip"
                                onChange={(e) => {
                                    setShowResult(false);
                                    setData({ ...data, tip: parseFloat(e.target.value)});
                                }}
                                value={data.tip}
                                required={true}
                            />
                            {showResult && 
                                <Card>
                                    <CardHeader title="Results" />
                                    <Card.Body>
                                        {data.result.map((result, index) => (
                                            <Form.Group as={Row} key={index} className={index === data.people - 1 ? "" : "mb-3"}>
                                                <Form.Label column sm="2">
                                                    Person {index + 1}
                                                </Form.Label>
                                                <Col sm={10}>
                                                    <InputGroup>
                                                        <InputGroup.Text id="basic-addon1">$</InputGroup.Text>
                                                        <Form.Control
                                                            placeholder={`Person ${index + 1} owes $${result.toFixed(2)}`}
                                                            value={result.toFixed(2)}
                                                            type="text"
                                                            disabled
                                                        />
                                                    </InputGroup>
                                                </Col>
                                            </Form.Group>
                                        ))}
                                    </Card.Body>
                                </Card>
                            }
                        </Card.Body>
                        <CardFooter text="Calculate" handler={() => {
                            const totalNoTaxTip = data.shares.reduce((acc, share) => acc + share, 0);
                            
                            let copiedResult = [];    

                            for (let i = 0; i < data.people; i++) {
                                const share = data.shares[i] / totalNoTaxTip;
                                const tax = data.tax * share;
                                const tip = data.tip * share;

                                copiedResult.push(data.shares[i] + tax + tip);
                            }

                            setData({ ...data, result: copiedResult });
                            setShowResult(true);
                        }} />
                    </Card>
                </Col>
            </Row>
        </Container>
    )
}

export default Calculator;
