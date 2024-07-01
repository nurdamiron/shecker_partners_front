import axios from 'axios';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import AppWebsiteVisits from '../app-website-visits';
import AppWidgetSummary from '../app-widget-summary';
import AppCurrentVisits from '../app-current-visits';
import AppConversionRates from '../app-conversion-rates';
import { storage } from '../../../firebase_config';

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

    setFridgeCount(response.data.length);
  } catch (error) {
    console.error('Error fetching fridge data:', error);
  }
};

const ITEMS_PER_PAGE = 10; // Количество заказов на одной странице

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
        value: product.sales || 1,
      }));

      setProductSales(productSales);
    } else {
      console.error('No data received from product API');
    }
  } catch (error) {
    console.error('Error fetching product sales data:', error);
  }
};

const fetchOrderDetails = async (accessToken, orderId) => {
  try {
    const response = await axios.get(`https://shecker-admin.com/api/order/admin/${orderId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching order details:', error);
    return null;
  }
};

const fetchOrders = async (accessToken, page, setOrders, setLoading) => {
  setLoading(true);
  try {
    const response = await axios.get('https://shecker-admin.com/api/order/admin/', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      params: {
        page,
      },
    });

    if (response.data && response.data.results) {
      const successOrders = response.data.results.filter(order => order.status === 'SUCCESS');
      
      const detailedOrdersPromises = successOrders.map(order => fetchOrderDetails(accessToken, order.id));
      const detailedOrders = await Promise.all(detailedOrdersPromises);
      
      // Sort orders by date in descending order
      detailedOrders.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      setOrders(detailedOrders);  // Replace previous orders with new data
    }
  } catch (error) {
    console.error('Error fetching orders:', error);
  } finally {
    setLoading(false);
  }
};

const fetchInitialOrders = async (setOrders, setTotalPages, setLoading, setCurrentPage) => {
  setLoading(true);
  try {
    let accessToken = localStorage.getItem('accessToken');
    const isTokenValid = await verifyAccessToken(accessToken);

    if (!isTokenValid) {
      accessToken = await refreshAccessToken();
      if (!accessToken) {
        throw new Error('Unable to refresh access token');
      }
    }

    const response = await axios.get('https://shecker-admin.com/api/order/admin/', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (response.data && response.data.results) {
      const successOrders = response.data.results.filter(order => order.status === 'SUCCESS');
      const totalPages = Math.ceil(successOrders.length / ITEMS_PER_PAGE);
      setTotalPages(totalPages);
      setCurrentPage(1);  // Устанавливаем первую страницу
      await fetchOrders(accessToken, 1, setOrders, setLoading);  // Получаем данные с первой страницы
    }
  } catch (error) {
    console.error('Error fetching initial orders:', error);
    setLoading(false);
  }
};

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

    const orders = await fetchOrders(accessToken, filter);

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

const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}.${month}.${year} ${hours}:${minutes}`;
};

export default function AppView() {
  const [fridgeCount, setFridgeCount] = useState(0);
  const [productSales, setProductSales] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);  // Начинаем с первой страницы
  const [totalPages, setTotalPages] = useState(0);
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);  // Определим setUploadProgress
  const [isAuthorized, setIsAuthorized] = useState(true);  // Определим setIsAuthorized

  const navigate = useNavigate();

  const fetchOrderDataWithFilter = (filter) => {
    fetchOrderData(setTotalRevenue, setTotalSales, filter);
  };

  const handleFileUpload = () => {
    if (!file) {
      console.error('No file selected');
      return;
    }

    const storageRef = ref(storage, `uploads/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error('Error uploading file:', error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          console.log('File available at', downloadURL);
        });
      }
    );
  };

  useEffect(() => {
    const checkAuthorization = async () => {
      let accessToken = localStorage.getItem('accessToken');
      const isTokenValid = await verifyAccessToken(accessToken);

      if (!isTokenValid) {
        accessToken = await refreshAccessToken();
        if (!accessToken) {
          navigate('/login');
          return;
        }
      }

      try {
        await axios.get('https://shecker-admin.com/api/staff/', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });
      } catch (error) {
        setIsAuthorized(false);
      }

      fetchFridgeCount(setFridgeCount);
      fetchProductSales(setProductSales);
      fetchInitialOrders(setOrders, setTotalPages, setLoading, setCurrentPage);
      fetchOrderData(setTotalRevenue, setTotalSales, {});
    };

    checkAuthorization();
  }, [navigate]);

  const handlePageChange = async (event, value) => {
    setCurrentPage(value);
    // Fetch orders for the new page
    const accessToken = localStorage.getItem('accessToken');
    await fetchOrders(accessToken, value, setOrders, setLoading);  // Fetch orders for the new page
  };

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 5 }}>
        Привет, с возвращением 👋
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <AppWidgetSummary
            title="Общее количество холодильников"
            total={fridgeCount}
            color="success"
            icon={<img alt="icon" src="/assets/icons/fridge.svg" />}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <AppWidgetSummary
            title="Количество заказов"
            total={totalSales}
            color="warning"
            icon={<img alt="icon" src="/assets/icons/sales.svg" />}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <AppWidgetSummary
            title="Сумма заработка"
            total={totalRevenue}
            color="error"
            icon={<img alt="icon" src="/assets/icons/wallet.svg" />}
          />
        </Grid>

        

        {/* <Grid item xs={12} md={12}>
          <Button variant="contained" onClick={() => fetchOrderDataWithFilter({ period: 'day' })}>
            За последний день
          </Button>
          <Button variant="contained" onClick={() => fetchOrderDataWithFilter({ period: 'week' })}>
            За последнюю неделю
          </Button>
          <Button variant="contained" onClick={() => fetchOrderDataWithFilter({ period: 'month' })}>
            За последний месяц
          </Button>
        </Grid> */}

        <Grid item xs={12}>
          {loading ? (
            <CircularProgress />
          ) : (
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 350 }} aria-label="simple table">
                <TableHead>
                  <TableRow>
                    {/* <TableCell>Число успешных заказов</TableCell> */}
                    {/* <TableCell>ID Холодильника</TableCell> */}
                    <TableCell>Имя продукта</TableCell>
                    <TableCell align="right">Количество</TableCell>
                    <TableCell align="right">Сумма</TableCell>
                    <TableCell align="right">Дата заказа</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.map((order, index) => (
                    <TableRow key={order.id}>
                      {/* <TableCell>"{order.order_products.map(product => product.product.name).join(', ')}"</TableCell> */}
                      <TableCell>{order.order_products.map(product => product.product.name).join(', ')}</TableCell>
                      <TableCell align="right">{order.order_products.map(product => product.amount).reduce((acc, amount) => acc + amount, 0)}</TableCell>
                      <TableCell align="right">{order.total_sum}</TableCell>
                      <TableCell align="right">{formatDateTime(order.date)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Grid>
        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Stack spacing={2}>
            <Pagination count={totalPages} page={currentPage} onChange={handlePageChange} />
          </Stack>
        </Grid>

        <Grid item xs={12} md={6} lg={8}>
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

        <Grid item xs={12} md={6} lg={4}>
          <AppCurrentVisits
            title="Продажи продуктов"
            chart={{
              series: productSales,
            }}
          />
        </Grid>

        <Grid item xs={12} md={6} lg={8}>
          <AppConversionRates
            title="Конверсия продаж"
            subheader="(0%) чем в прошлой неделе"
            chart={{
              series: productSales,
            }}
          />
        </Grid>
      </Grid>
    </Container>
  );
}
