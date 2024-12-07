import React from 'react';
import { useParams } from 'react-router-dom';
import { Tabs } from 'antd';
import DeployTab from '../components/DeployTab';
import LogsTab from '../components/LogsTab';

const { TabPane } = Tabs;

const RepoDetails = () => {
  const { name } = useParams();

  return (
    <div>
      <h2>{name}</h2>
      <Tabs defaultActiveKey="1">
        <TabPane tab="Deployment Jobs" key="1">
          <DeployTab repoName={name} />
        </TabPane>
        <TabPane tab="Logs" key="2">
          <LogsTab />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default RepoDetails;
