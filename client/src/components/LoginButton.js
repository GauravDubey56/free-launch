import React from 'react';
import { Button } from 'antd';

const LoginButton = () => {
  const loginWithGitHub = () => {
    const clientId = 'your_github_client_id'; // Replace with your GitHub App Client ID
    const redirectUri = 'http://localhost:3000'; // Replace with your app URL
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}`;
  };

  return <Button type="primary" onClick={loginWithGitHub}>Login with GitHub</Button>;
};

export default LoginButton;
