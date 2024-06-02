import React from 'react';
import AuthForm from './Components/AuthForm';

const SignUp = () => {
    return (
        <AuthForm
            title='Sign-up for FairFare'
            buttonText='Sign-up'
            footerText='Already have an account?'
            footerButtonText='Sign-in'
        />
    )
}

export default SignUp;