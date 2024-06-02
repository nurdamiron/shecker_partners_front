import axios from 'axios';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

import AppWebsiteVisits from '../app-website-visits';
import AppWidgetSummary from '../app-widget-summary';
import AppCurrentVisits from '../app-current-visits';
import AppConversionRates from '../app-conversion-rates';

// Function to refresh access token
const refreshAccessToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await axios.post('https://shecker-admin.com/api/auth/sign-in/refresh', {
      refresh: refreshToken,
    });
    const { access } = response.data;
    localStorage.setItem('accessToken', access);
    return access;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return null;
  }
};

// Function to verify access token
const verifyAccessToken = async (token) => {
  try {
    await axios.post('https://shecker-admin.com/api/auth/sign-in/verify', {
      token,
    });
    return true;
  } catch (error) {
    console.error('Error verifying token:', error);
    return false;
  }
};

// Function to fetch fridge count
const fetchFridgeCount = async (setFridgeCount) => {
  try {
    let accessToken = localStorage.getItem('accessToken');
    const isTokenValid = await verifyAccessToken(accessToken);

    if (!isTokenValid) {
      accessToken = await refreshAccessToken();
      if (!accessToken) {
        throw new Error('Unable to refresh access token');
      }
    }

    const response = await axios.get('https://www.shecker-admin.com/api/fridge/admin/', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    setFridgeCount(response.data.length); // Assuming the response is an array of fridges
  } catch (error) {
    console.error('Error fetching fridge data:', error);
  }
};

// Function to fetch product sales data
const fetchProductSales = async (setProductSales) => {
  try {
    let accessToken = localStorage.getItem('accessToken');
    const isTokenValid = await verifyAccessToken(accessToken);

    if (!isTokenValid) {
      accessToken = await refreshAccessToken();
      if (!accessToken) {
        throw new Error('Unable to refresh access token');
      }
    }

    const response = await axios.get('https://shecker-admin.com/api/product/admin/', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (response.data) {
      const productSales = response.data.map((product) => ({
        label: product.name,
        value: product.sales || 1, // Use 0 if sales data is missing
      }));

      setProductSales(productSales);
    } else {
      console.error('No data received from product API');
    }
  } catch (error) {
    console.error('Error fetching product sales data:', error);
  }
};

// Recursive function to fetch all pages of orders with the status "SUCCESS"
const fetchAllSuccessOrders = async (accessToken, filter, orders = [], nextPageUrl = 'https://shecker-admin.com/api/order/admin/') => {
  try {
    const response = await axios.get(nextPageUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      params: filter,
    });

    if (response.data && response.data.results) {
      orders = orders.concat(response.data.results.filter(order => order.status === 'PENDING'));
      if (response.data.next) {
        return fetchAllSuccessOrders(accessToken, filter, orders, response.data.next);
      }
    }
  } catch (error) {
    console.error('Error fetching orders:', error);
  }

  return orders;
};

// Function to fetch order data and calculate totals
const fetchOrderData = async (setTotalRevenue, setTotalSales, filter) => {
  try {
    let accessToken = localStorage.getItem('accessToken');
    const isTokenValid = await verifyAccessToken(accessToken);

    if (!isTokenValid) {
      accessToken = await refreshAccessToken();
      if (!accessToken) {
        throw new Error('Unable to refresh access token');
      }
    }

    const orders = await fetchAllSuccessOrders(accessToken, filter);

    const orderDetailsPromises = orders.map(order =>
      axios.get(`https://shecker-admin.com/api/order/admin/${order.id}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      })
    );

    const orderDetailsResponses = await Promise.all(orderDetailsPromises);

    let totalRevenue = 0;
    let totalSales = 0;

    orderDetailsResponses.forEach(orderResponse => {
      if (orderResponse.data) {
        totalRevenue += parseFloat(orderResponse.data.total_sum);
        totalSales += parseInt(orderResponse.data.total_quantity, 10);
      }
    });

    setTotalRevenue(totalRevenue);
    setTotalSales(totalSales);
  } catch (error) {
    console.error('Error fetching order data:', error);
  }
};

export default function AppView() {
  const [fridgeCount, setFridgeCount] = useState(0);
  const [productSales, setProductSales] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const navigate = useNavigate(); // Initialize useNavigate for navigation

  const fetchOrderDataWithFilter = (filter) => {
    fetchOrderData(setTotalRevenue, setTotalSales, filter);
  };

  useEffect(() => {
    const checkAuthorization = async () => {
      let accessToken = localStorage.getItem('accessToken');
      const isTokenValid = await verifyAccessToken(accessToken);

      if (!isTokenValid) {
        accessToken = await refreshAccessToken();
        if (!accessToken) {
          navigate('/login'); // Redirect to login page if unable to refresh access token
          return;
        }
      }

      fetchFridgeCount(setFridgeCount);
      fetchProductSales(setProductSales);
      fetchOrderData(setTotalRevenue, setTotalSales, {}); // Fetch initial order data without filters
    };

    checkAuthorization();
  }, [navigate]);

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 5 }}>
        Привет, с возвращением 👋
      </Typography>

      <Grid container spacing={3}>
        <Grid xs={12} sm={6} md={3}>
          <AppWidgetSummary
            title="Общее количество холодильников"
            total={fridgeCount}
            color="success"
            icon={<img alt="icon" src="/assets/icons/fridge.svg" />}
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <AppWidgetSummary
            title="Количество заказов"
            total={totalSales}
            color="warning"
            icon={<img alt="icon" src="/assets/icons/sales.svg" />}
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <AppWidgetSummary
            title="Сумма заработка"
            total={totalRevenue}
            color="error"
            icon={<img alt="icon" src="/assets/icons/wallet.svg" />}
          />
        </Grid>

        <Grid xs={12} md={6} lg={8}>
          <AppWebsiteVisits
            title="Количество продаж"
            subheader="(0%) чем в прошлой неделе"
            chart={{
              labels: [
                '22/05/2024',
                '23/05/2024',
                '24/05/2024',
                '25/05/2024',
                '26/05/2024',
                '27/05/2024',
                '28/05/2024',
                '29/05/2024',
              ],
              series: [
                {
                  name: 'Манго мюсли',
                  type: 'column',
                  fill: 'solid',
                  data: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                },
                {
                  name: 'Oreo Shake',
                  type: 'area',
                  fill: 'gradient',
                  data: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                },
                {
                  name: 'Шоколадный',
                  type: 'line',
                  fill: 'solid',
                  data: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                },
              ],
            }}
          />
        </Grid>

        <Grid xs={12} md={6} lg={4}>
          <AppCurrentVisits
            title="Продажи продуктов"
            chart={{
              series: productSales,
            }}
          />
        </Grid>

        <Grid xs={12} md={6} lg={8}>
          <AppConversionRates
            title="Конверсия продаж"
            subheader="(0%) чем в прошлой неделе"
            chart={{
              series: productSales,
            }}
          />
        </Grid>

        <Grid xs={12} md={12}>
          <Button variant="contained" onClick={() => fetchOrderDataWithFilter({ period: 'day' })}>
            За последний день
          </Button>
          <Button variant="contained" onClick={() => fetchOrderDataWithFilter({ period: 'week' })}>
            За последнюю неделю
          </Button>
          <Button variant="contained" onClick={() => fetchOrderDataWithFilter({ period: 'month' })}>
            За последний месяц
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
}
