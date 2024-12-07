import React, { useEffect, useState } from "react";
import { List, Button } from "antd";
import { useNavigate } from "react-router-dom";

import { fetchRepositories } from "../api";

const Repositories = () => {
  const [repos, setRepos] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    fetchRepositories()
      .then((response) => {
        console.log(response);
        if (response?.data?.length) {
          setRepos(response.data);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  return (
    <div>
      {repos.length === 0 ? (
        <p>No repositories available.</p>
      ) : (
        <List
          bordered
          dataSource={repos}
          renderItem={(repo) => (
            <List.Item
              actions={[
                <Button
                  type="primary"
                  onClick={() => navigate(`/repo/${repo.RepositoryId}`)}
                >
                  View Details
                </Button>,
                <Button
                  type="default"
                  onClick={() => console.log("Deploy API Here")}
                >
                  Deploy
                </Button>,
              ]}
            >
              {repo.name}
            </List.Item>
          )}
        />
      )}
    </div>
  );
};

export default Repositories;
