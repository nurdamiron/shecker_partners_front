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
import Box from '@mui/material/Box';
import AppWidgetSummary from '../app-widget-summary';
import { refreshAccessToken } from '../../../utils/access-token';
import { verifyAccessToken } from '../../../utils/verify-token';
import { formatDateTime } from '../../../utils/format-date';
import { fetchAllOrders, fetchOrdersPage, fetchFridgeDetails } from '../order-service';

function AppView() {
  const [state, setState] = useState({
    fridgeCount: 0,
    totalRevenue: 0,
    totalSales: 0,
    orders: [],
    fridgeDetails: [],
    loading: false,
    currentPage: 1,
    totalPages: 0,
  });

  const navigate = useNavigate();

  useEffect(() => {
    const initFetch = async () => {
      console.log('Проверка доступа пользователя...');
      if (!await verifyAccessToken()) {
        console.log('Доступ не подтвержден, обновление токена...');
        if (!await refreshAccessToken()) {
          console.log('Не удалось обновить токен, перенаправление на страницу входа...');
          navigate('/login');
          return;
        }
      }

      setState(prev => ({ ...prev, loading: true }));
      try {
        console.log('Запрос данных о заказах...');
        const result = await fetchAllOrders();
        console.log('Получены данные:', result);
        const fridgeDetails = await fetchFridgeDetails();
        console.log('Фриз детали:', fridgeDetails);
        setState(prev => ({
          ...prev,
          fridgeCount: result.fridgeCount,
          orders: result.orders.slice(0, 10),
          totalPages: result.totalPages,
          totalRevenue: result.totalRevenue,
          totalSales: result.totalSales,
          fridgeDetails,
          loading: false
        }));
      } catch (error) {
        console.error('Ошибка при получении данных:', error);
        setState(prev => ({ ...prev, loading: false }));
      }
    };

    initFetch();
  }, [navigate]);

  const handlePageChange = async (event, value) => {
    console.log(`Переход на страницу ${value}...`);
    setState(prev => ({ ...prev, loading: true }));
    try {
      const orders = await fetchOrdersPage(value);
      console.log('Получены данные для страницы:', orders);
      setState(prev => ({
        ...prev,
        currentPage: value,
        orders: orders.orders,
        totalPages: orders.totalPages,
        loading: false
      }));
    } catch (error) {
      console.error('Ошибка при смене страницы:', error);
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  console.log('Orders state:', state.orders);

  return (
    <Container maxWidth="xl">
      {state.loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 5 }}>
          <Typography variant="h6">Загружаем данные...</Typography>
          <CircularProgress sx={{ mt: 2 }} />
        </Box>
      ) : (
        <>
          <Typography variant="h4" sx={{ mb: 5 }}>Привет, с возвращением 👋</Typography>
          <Grid container spacing={3}>
            {summaryWidgets.map((widget, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <AppWidgetSummary title={widget.title} total={state[widget.stateKey]} color={widget.color} icon={widget.icon} />
              </Grid>
            ))}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, mt: 5 }}>Данные о заказах холодильников</Typography>
              {renderFridgeDetails(state.fridgeDetails)}
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2 }}>Все заказы</Typography>
              {renderTable(state.orders)}
            </Grid>
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Pagination count={state.totalPages} page={state.currentPage} onChange={handlePageChange} />
            </Grid>
          </Grid>
        </>
      )}
    </Container>
  );
}

const summaryWidgets = [
  { title: "Общее количество холодильников", stateKey: "fridgeCount", color: "success", icon: <img alt="fridge icon" src="/assets/icons/fridge.svg" /> },
  { title: "Количество заказов", stateKey: "totalSales", color: "warning", icon: <img alt="sales icon" src="/assets/icons/sales.svg" /> },
  { title: "Сумма заработка в тенге", stateKey: "totalRevenue", color: "error", icon: <img alt="wallet icon" src="/assets/icons/wallet.svg" /> }
];

function renderTable(orders) {
  console.log('Rendering table with orders:', orders);
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 350 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>ID холодильника</TableCell>
            <TableCell>Продукт</TableCell>
            <TableCell align="right">К-во</TableCell>
            <TableCell align="right">Сумма</TableCell>
            <TableCell align="right">Дата</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders && orders.length > 0 ? orders.map((order, index) => (
            <TableRow key={index}>
              <TableCell>{order.fridgeId}</TableCell>
              <TableCell>{order.order_products?.map(product => product.name).join(', ') || 'Нет продуктов'}</TableCell>
              <TableCell align="right">{order.order_products?.reduce((acc, product) => acc + product.amount, 0) || 0}</TableCell>
              <TableCell align="right">{order.total_sum}</TableCell>
              <TableCell align="right">{formatDateTime(order.date)}</TableCell>
            </TableRow>
          )) : <TableRow><TableCell colSpan={5}>Нет данных</TableCell></TableRow>}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function renderFridgeDetails(fridgeDetails) {
  console.log('Rendering fridge details with:', fridgeDetails);
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 350 }} aria-label="fridge details table">
        <TableHead>
          <TableRow>
            <TableCell>Номер холодильника</TableCell>
            <TableCell align="right">Количество успешных заказов</TableCell>
            <TableCell align="right">Сумма заработка</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {fridgeDetails && fridgeDetails.length > 0 ? fridgeDetails.map((detail, index) => (
            <TableRow key={index}>
              <TableCell>{detail.fridgeId}</TableCell>
              <TableCell align="right">{detail.successfulOrders}</TableCell>
              <TableCell align="right">{detail.totalRevenue}</TableCell>
            </TableRow>
          )) : <TableRow><TableCell colSpan={3}>Нет данных</TableCell></TableRow>}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default AppView;
