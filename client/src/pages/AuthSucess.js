import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as ApiHandlers from '../api';
const AuthRedirect = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('successToken');
        if (code) {
            ApiHandlers.setLocalStoreItem("accessToken", code);
        } else {
            console.error('No code found in URL');
        }
        navigate('/');
    }, [navigate]);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <h1>Please wait...</h1>
        </div>
    );
};

export default AuthRedirect;