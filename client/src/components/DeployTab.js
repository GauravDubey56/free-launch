import React, { useEffect, useState } from 'react';
import { List, Spin } from 'antd';
import { fetchDeploymentJobs } from '../api';

const DeployTab = ({ repoName }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeploymentJobs(repoName)
      .then((data) => {
        setJobs(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [repoName]);

  return loading ? (
    <Spin />
  ) : (
    <List
      bordered
      dataSource={jobs}
      renderItem={(job) => <List.Item>{job.name}</List.Item>}
    />
  );
};

export default DeployTab;
