import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { util } from './utils/util';

const root = ReactDOM.createRoot(document.getElementById('root'));


util.init()
.then(() => {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
})
.catch(console.error)

// root.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>
// );

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
