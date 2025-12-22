import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

if (typeof window !== 'undefined') {
  window.addEventListener('error', function (e) {
    if (e.target && e.target.tagName === 'IMG') {
      // eslint-disable-next-line no-console
      console.error('Image load error:', e.target.src, e.target);
      // Print the outerHTML for context
      console.error('Offending <img> element:', e.target.outerHTML);
      // Print a stack trace
      console.trace();
    }
  }, true);
}
