import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

function App() {
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/about">About</a></li>
          </ul>
        </nav>

        <Switch>
          <Route path="/" exact>
            <h1>Home</h1>
          </Route>
          <Route path="/about">
            <h1>About</h1>
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;