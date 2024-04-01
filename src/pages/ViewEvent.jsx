import React, {useState, useEffect} from 'react'
import { 
    Form, 
    Button,
    Card,
    Col,
    Row,
    Container,
    Accordion
} from 'react-bootstrap'
import { BsDatabaseFill, BsPersonFillAdd, BsDatabaseFillAdd } from "react-icons/bs";
import { MdOutlineSafetyDivider, MdModeEditOutline, MdDelete } from "react-icons/md";
import { FaPeopleGroup } from "react-icons/fa6";
import { FaSave } from "react-icons/fa";
import { collection, getDocs, getDoc, doc, updateDoc, where, query, deleteDoc, addDoc } from 'firebase/firestore';
import { db } from '../firebase-config';

const ViewEvent = () => {
    

    return (
        <>
            hullo
        </>
    )
}

export default ViewEvent