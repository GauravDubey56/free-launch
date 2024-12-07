import React from 'react';
import { Typography, Row, Col } from 'antd';


const { Title, Text } = Typography;

const ComingSoon = () => {
    return (
        <Row justify="center" align="middle" style={{ height: '100vh' }}>
            <Col>
                <Title level={1}>Coming Soon</Title>
                <Text>We are working hard to bring you something amazing. Stay tuned!</Text>
            </Col>
        </Row>
    );
};

export default ComingSoon;