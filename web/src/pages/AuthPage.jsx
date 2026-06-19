import React, { useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import LoginPage from './LoginPage';
import VerifyPage from './VerifyPage';

const AuthPage = () => {
    const { currentUser, authView } = useAppContext();
    const navigate = useNavigate();

    useEffect(() => {
        if (currentUser) {
            navigate('/dashboard');
        }
    }, [currentUser, navigate]);

    if (authView === 'login') return <LoginPage />;
    if (authView === 'verify') return <VerifyPage />;
    
    return null;
};

export default AuthPage;
