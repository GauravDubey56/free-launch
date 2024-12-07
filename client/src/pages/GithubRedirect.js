import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleApiCall } from '../utils';
import * as ApiHandlers from '../api';
const GithubRedirect = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        if (code) {
            // Simulate an API call to exchange the code for a token
            handleApiCall(ApiHandlers.fetchAuthToken, code).then((data) => {
                console.log('Token fetched successfully', data);
                navigate('/');
            }).catch  (error => {
                console.error(error);
            });
        } else {
            console.error('No code found in URL');
        }
    }, [navigate]);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <h1>Please wait...</h1>
        </div>
    );
};

export default GithubRedirect;