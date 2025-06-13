import { Page, Card, Button, TextField, Banner, Layout, Spinner } from '@shopify/polaris';
import { getSessionToken } from '@shopify/app-bridge-utils';
import axios from 'axios';
import createApp from '@shopify/app-bridge';
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const App = () => {
  const [shopName, setShopName] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const config = {
    apiKey: process.env.REACT_APP_SHOPIFY_API_KEY,
    host: new URLSearchParams(window.location.search).get("host"),
    forceRedirect: true
};

const app = createApp(config);

  const isEmbedded = !!app;

  // Handle auth success redirect
  useEffect(() => {
    const shop = searchParams.get('shop');
    const host = searchParams.get('host');
    
    if (shop && host) {
      // Store session in localStorage (for demo only - use cookies in production)
      localStorage.setItem('shopify_session', JSON.stringify({ shop, host }));
      navigate('/', { replace: true });
    }
  }, [searchParams, navigate]);

  const handleConnect = async () => {
    if (!shopName) {
      setError('Please enter your shop name');
      return;
    }

    setIsConnecting(true);
    setError('');

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/auth`, 
        { shop: `${shopName}.myshopify.com` }
      );
      window.location.href = response.data.authUrl;
    } catch (err) {
      console.error('Connection error:', err);
      setError(err.response?.data?.error || 'Failed to connect to Shopify');
      setIsConnecting(false);
    }
  };

  const fetchProducts = async () => {
    if (!isEmbedded) {
      setError('App must be loaded in Shopify admin');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const token = await getSessionToken(app);
      const session = JSON.parse(localStorage.getItem('shopify_session'));
      
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/products`,
        {
          params: { shop: session?.shop },
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      setProducts(response.data.products || []);
    } catch (err) {
      console.error('API Error:', err);
      setError(err.response?.data?.error || 'Failed to fetch products');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Page title="Shopify App">
      <Layout>
        <Layout.Section>
          <Card sectioned>
            {!isEmbedded ? (
              <>
                <Banner status="warning" title="Not in Shopify Admin">
                  <p>For full functionality, please access this app through your Shopify admin.</p>
                </Banner>
                <TextField
                  label="Shop Name"
                  value={shopName}
                  onChange={setShopName}
                  placeholder="your-shop-name"
                  helpText="Enter your Shopify store name without .myshopify.com"
                  error={error}
                />
                <Button primary loading={isConnecting} onClick={handleConnect}>
                  Connect to Shopify
                </Button>
              </>
            ) : (
              <>
                <Banner status="success" title="Connected to Shopify Admin">
                  <p>You're now in the Shopify admin environment.</p>
                </Banner>
                <Button primary loading={isLoading} onClick={fetchProducts}>
                  Fetch Products
                </Button>
              </>
            )}
          </Card>
        </Layout.Section>

        {isLoading && (
          <Layout.Section>
            <Spinner accessibilityLabel="Loading products" size="large" />
          </Layout.Section>
        )}

        {products.length > 0 && (
          <Layout.Section>
            <Card title="Products" sectioned>
              <ul>
                {products.map(product => (
                  <li key={product.id}>
                    <h3>{product.title}</h3>
                    <p>{product.variants?.length} variants</p>
                  </li>
                ))}
              </ul>
            </Card>
          </Layout.Section>
        )}
      </Layout>
    </Page>
  );
};

export default App;