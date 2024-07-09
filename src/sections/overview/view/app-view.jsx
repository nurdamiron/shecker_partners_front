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
import AppWidgetSummary from '../app-widget-summary';
import { refreshAccessToken } from '../../../utils/access-token';
import { verifyAccessToken } from '../../../utils/verify-token';
import { formatDateTime } from '../../../utils/format-date';
import { fetchAllOrders, fetchOrdersPage } from '../order-service';


function AppView() {
  const [state, setState] = useState({
    fridgeCount: 0,
    productSales: [],
    totalRevenue: 0,
    totalSales: 0,
    orders: [],
    loading: false,
    currentPage: 1,
    totalPages: 0
});

const navigate = useNavigate();

useEffect(() => {
  const initFetch = async () => {
      if (!await verifyAccessToken()) {
          if (!await refreshAccessToken()) {
              navigate('/login');
              return;
          }
      }

      setState(prev => ({ ...prev, loading: true }));
      try {
          const result = await fetchAllOrders();
          setState(prev => ({
              ...prev,
              fridgeCount: result.fridgeCount,
              orders: result.orders,
              totalPages: result.totalPages,
              totalRevenue: result.totalRevenue,
              totalSales: result.totalSales,
              loading: false
          }));
      } catch (error) {
          console.error('Error fetching initial data:', error);
          setState(prev => ({ ...prev, loading: false }));
      }
  };

  initFetch();
}, [navigate]);


const handlePageChange = async (event, value) => {
  setState(prev => ({ ...prev, loading: true }));
  try {
      const orders = await fetchOrdersPage(value);
      setState(prev => ({
          ...prev,
          currentPage: value,
          orders,
          loading: false
      }));
  } catch (error) {
      console.error('Error changing page:', error);
      setState(prev => ({ ...prev, loading: false }));
  }
};

return (
  <Container maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 5 }}>Привет, с возвращением 👋</Typography>
      <Grid container spacing={3}>
          {summaryWidgets.map((widget, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                  <AppWidgetSummary title={widget.title} total={state[widget.stateKey]} color={widget.color} icon={widget.icon} />
              </Grid>
          ))}
          <Grid item xs={12}>
              {state.loading ? <CircularProgress /> : renderTable(state.orders)}
          </Grid>
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Pagination count={state.totalPages} page={state.currentPage} onChange={handlePageChange} />
          </Grid>
      </Grid>
  </Container>
);
}

const summaryWidgets = [
  { title: "Общее количество холодильников", stateKey: "fridgeCount", color: "success", icon: <img alt="fridge icon" src="/assets/icons/fridge.svg" /> },
  { title: "Количество заказов", stateKey: "totalSales", color: "warning", icon: <img alt="sales icon" src="/assets/icons/sales.svg" /> },
  { title: "Сумма заработка в тенге", stateKey: "totalRevenue", color: "error", icon: <img alt="wallet icon" src="/assets/icons/wallet.svg" /> }
];

function renderTable(orders) {
  return (
      <TableContainer component={Paper}>
          <Table sx={{ minWidth: 350 }} aria-label="simple table">
              <TableHead>
                  <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Холодильник ID</TableCell>
                      <TableCell>Продукт</TableCell>
                      <TableCell align="right">К-во</TableCell>
                      <TableCell align="right">Сумма</TableCell>
                      <TableCell align="right">Дата заказа</TableCell>
                  </TableRow>
              </TableHead>
              <TableBody>
                  {orders && orders.length > 0 ? orders.map((order, index) => (
                      <TableRow key={index}>
                          <TableCell>{order.id}</TableCell>
                          <TableCell>{order.fridgeId}</TableCell>
                          <TableCell>{order.order_products?.map(product => `${product.product.name} (${product.amount})`).join(', ') || 'No products'}</TableCell>
                          <TableCell align="right">{order.order_products?.reduce((acc, product) => acc + product.amount, 0) || 0}</TableCell>
                          <TableCell align="right">{order.total_sum}</TableCell>
                          <TableCell align="right">{formatDateTime(order.date)}</TableCell>
                      </TableRow>
                  )) : <TableRow><TableCell colSpan={6}>Нет данных</TableCell></TableRow>}
              </TableBody>
          </Table>
      </TableContainer>
  );
}

export default AppView;
