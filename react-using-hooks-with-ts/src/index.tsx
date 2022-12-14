import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { App } from './app/App';
// import { WebSocketDemo } from './component/WebSocketDemo';

ReactDOM.render(
  <React.StrictMode>
    <App />
    {/* <WebSocketDemo /> */}
  </React.StrictMode>,
  document.getElementById('root')
);