import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import styled from 'styled-components';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import About from './pages/About';

const AppWrapper = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

function App() {
  return (
    <Router>
      <AppWrapper>
        <Navigation />
        <Switch>
          <Route path="/" exact component={Home} />
          <Route path="/about" component={About} />
        </Switch>
      </AppWrapper>
    </Router>
  );
}

export default App;