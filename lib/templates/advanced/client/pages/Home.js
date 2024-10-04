import React from 'react';
import styled from 'styled-components';

const HomeWrapper = styled.div`
  h1 {
    color: ${props => props.theme.colors.primary};
  }
`;

function Home() {
  return (
    <HomeWrapper>
      <h1>Welcome to Dywo</h1>
      <p>This is an advanced SPA created with Dywo CLI.</p>
    </HomeWrapper>
  );
}

export default Home;