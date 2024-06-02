import { faker } from '@faker-js/faker';
import axios from 'axios';
import { useState, useEffect } from 'react';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import Iconify from 'src/components/iconify';

import AppTasks from '../app-tasks';
import AppNewsUpdate from '../app-news-update';
import AppOrderTimeline from '../app-order-timeline';
import AppCurrentVisits from '../app-current-visits';
import AppWebsiteVisits from '../app-website-visits';
import AppWidgetSummary from '../app-widget-summary';
import AppTrafficBySite from '../app-traffic-by-site';
import AppCurrentSubject from '../app-current-subject';
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

export default function AppView() {
  const [fridgeCount, setFridgeCount] = useState(0);
  const [productSales, setProductSales] = useState([]);

  useEffect(() => {
    fetchFridgeCount(setFridgeCount);
    fetchProductSales(setProductSales);
  }, []);

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

        {/* <Grid xs={12} sm={6} md={3}>
          <AppWidgetSummary
            title="Подключенные партнеры"
            total={1}
            color="info"
            icon={<img alt="icon" src="/assets/icons/user.svg" />}
          />
        </Grid> */}

        <Grid xs={12} sm={6} md={3}>
          <AppWidgetSummary
            title="Количество заказов"
            total={234}
            color="warning"
            icon={<img alt="icon" src="/assets/icons/sales.svg" />}
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <AppWidgetSummary
            title="Сумма заработка"
            total={421200}
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

        {/* <Grid xs={12} md={6} lg={4}>
          <AppCurrentSubject
            title="Current Subject"
            chart={{
              categories: ['English', 'History', 'Physics', 'Geography', 'Chinese', 'Math'],
              series: [
                { name: 'Series 1', data: [80, 50, 30, 40, 100, 20] },
                { name: 'Series 2', data: [20, 30, 40, 80, 20, 80] },
                { name: 'Series 3', data: [44, 76, 78, 13, 43, 10] },
              ],
            }}
          />
        </Grid>

        <Grid xs={12} md={6} lg={8}>
          <AppNewsUpdate
            title="News Update"
            list={[...Array(5)].map((_, index) => ({
              id: faker.string.uuid(),
              title: faker.person.jobTitle(),
              description: faker.commerce.productDescription(),
              image: `/assets/images/covers/cover_${index + 1}.jpg`,
              postedAt: faker.date.recent(),
            }))}
          />
        </Grid>

        <Grid xs={12} md={6} lg={4}>
          <AppOrderTimeline
            title="Order Timeline"
            list={[...Array(5)].map((_, index) => ({
              id: faker.string.uuid(),
              title: [
                '1983, orders, $4220',
                '12 Invoices have been paid',
                'Order #37745 from September',
                'New order placed #XF-2356',
                'New order placed #XF-2346',
              ][index],
              type: `order${index + 1}`,
              time: faker.date.past(),
            }))}
          />
        </Grid> */}
      </Grid>
    </Container>
  );
}
