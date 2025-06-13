import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AppProvider as PolarisProvider } from '@shopify/polaris';

// Initialize App Bridge only when in Shopify admin context
const AppWrapper = () => {
  const params = new URLSearchParams(window.location.search);
  const host = params.get('host');
  const apiKey = process.env.REACT_APP_SHOPIFY_API_KEY;

  if (!host) {
    return (
      <PolarisProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </PolarisProvider>
    );
  }

  const config = {
    apiKey,
    host,
    forceRedirect: true,
  };

  return (
    <PolarisProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
    </PolarisProvider>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <AppWrapper />
  </React.StrictMode>,
  document.getElementById('root')
);