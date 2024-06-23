import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../App";
import { Alert } from "react-bootstrap";
import { GoStop } from "react-icons/go";
import { auth } from "../../firebase-config";
import { sendEmailVerification } from "firebase/auth";
import ProgressBarCustom from "../Progress/ProgressBarCustom";

const EmailVerificationAlert = () => {
    const { isVerified } = useContext(AuthContext);
    const [currentUser, setCurrentUser] = useState(null);
    const [disableButton, setDisableButton] = useState(false);

    useEffect(() => {
        const user = auth.currentUser;
        setCurrentUser(user);
    }, []);

    const handleSendEmailVerification = async () => {
        try {
            await sendEmailVerification(currentUser);

            setDisableButton(true);
            setTimeout(() => {
                setDisableButton(false);
            }, 30000);
        } catch (error) {
            console.error(error);
            setDisableButton(false);
        }
    }
    
    return (
        <Alert variant={'danger'} className="my-3" show={!isVerified}>
            <Alert.Heading className="d-flex align-items-center">
                <GoStop size={30} style={{ marginRight: '10px' }} />
                Email verification required
            </Alert.Heading>
            <p>Please verify your email address to start using FairFare. You are currently using the app in read-only mode.</p>
            <hr />
            {disableButton ?
                <p className="mb-0">
                    Email verification sent. Please check your inbox. You can resend the email in 30 seconds.
                </p> :
                <p className="mb-0">
                    Didn't receive an email? <Alert.Link className="p-0" onClick={handleSendEmailVerification} disabled={disableButton}>Resend verification email</Alert.Link>
                </p>
            }
            {disableButton && <ProgressBarCustom />}
        </Alert>
    )
}

export default EmailVerificationAlert;
