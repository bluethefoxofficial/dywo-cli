import React from 'react';
import styled from 'styled-components';

const AboutWrapper = styled.div`
  h1 {
    color: ${props => props.theme.colors.secondary};
  }
`;

function About() {
  return (
    <AboutWrapper>
      <h1>About Dywo</h1>
      <p>Dywo is a powerful CLI tool for creating and managing single-page applications.</p>
    </AboutWrapper>
  );
}

export default About;