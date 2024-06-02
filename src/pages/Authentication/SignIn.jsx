import React from 'react';
import AuthForm from './Components/AuthForm';

const SignIn = () => {
    return (
        <AuthForm
            title='Sign-in to FairFare'
            buttonText='Sign-in'
            footerText='New to FairFare?'
            footerButtonText='Create an account'
        />
    )
}

export default SignIn;