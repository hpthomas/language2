import React from 'react';
import {BrowserRouter as Router} from 'react-router-dom';
//import logo from './logo.svg';
import './App.css';
import TopBar from './TopBar';

class App extends React.Component {
  render() {
    return (
      <Router>
        <TopBar/>
      </Router>
    );
  }
}
export default App;
