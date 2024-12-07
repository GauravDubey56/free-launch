import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from 'antd';
import Repositories from './pages/Repositories';
import RepoDetails from './pages/RepoDetails';
import ComingSoon from './pages/ComingSoon';
import GithubRedirect from './pages/GithubRedirect';
import AuthRedirect from './pages/AuthSucess';

const { Header, Content } = Layout;

const App = () => {
  return (
    <Router>
      <Layout>
        <Header style={{ color: '#fff', fontSize: '20px' }}>GitHub Deployment Manager</Header>
        <Content style={{ padding: '20px' }}>
          <Routes>
            <Route path="/" element={<Repositories />} />
            <Route path="/repo/:name" element={<RepoDetails />} />
            <Route path="/coming-soon" element={<ComingSoon />} />
            <Route path="/GithubRedirect" element={<GithubRedirect />} />
            <Route path="/authSuccess" element={<AuthRedirect />} />
          </Routes>
        </Content>
      </Layout>
    </Router>
  );
};

export default App;
