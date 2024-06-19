import React, { useState, useEffect } from "react";
import { Alert, Button } from "react-bootstrap";
import { GoStop } from "react-icons/go";
import { auth } from "../../firebase-config";
import { sendEmailVerification } from "firebase/auth";

const EmailVerificationAlert = () => {
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
            }, 10000);
        } catch (error) {
            console.error(error);
            setDisableButton(false);
        }
    }
    
    return (
        <Alert variant={'danger'} className="my-3" show={currentUser && !currentUser.emailVerified}>
            <Alert.Heading className="d-flex align-items-center">
                <GoStop size={30} style={{ marginRight: '10px' }} />
                Email verification required
            </Alert.Heading>
            Please verify your email address to start using FairFare. You are currently using the app in read-only mode.
            <hr />
            <div className="d-flex align-items-center">
                <div style={{ marginRight: '5px'}}>Didn't receive an email?</div>
                <Button variant="link" className="p-0" onClick={handleSendEmailVerification} disabled={disableButton}>
                    Resend verification email
                </Button>
            </div>
        </Alert>
    )
}

export default EmailVerificationAlert;
