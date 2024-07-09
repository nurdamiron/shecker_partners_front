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
import { fetchAllOrders, fetchInitialOrders, fetchOrderData, fetchOrderDetails, fetchOrdersPage, fetchFridgeDetails } from '../order-service';
import { fetchFridgeCount } from '../fridge-count';

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

export default function AppView() {
    const [fridgeCount, setFridgeCount] = useState(0);
    const [productSales, setProductSales] = useState([]);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [totalSales, setTotalSales] = useState(0);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [file, setFile] = useState(null);
    const [isAuthorized, setIsAuthorized] = useState(true);

    const navigate = useNavigate();

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };

    useEffect(() => {
        const checkAuthorization = async () => {
            const accessToken = localStorage.getItem('accessToken') || '';
            const isTokenValid = await verifyAccessToken(accessToken);

            if (!isTokenValid) {
                const newAccessToken = await refreshAccessToken();
                if (!newAccessToken) {
                    navigate('/login');
                    return;
                }
                localStorage.setItem('accessToken', newAccessToken);
            }

            try {
                await fetchInitialOrders(setOrders, setLoading, setTotalPages, setTotalRevenue, setTotalSales, setCurrentPage);
                console.log(setCurrentPage); // Проверка, что setCurrentPage - это функция
                await fetchOrdersPage(currentPage, setOrders, setLoading, setTotalPages, setCurrentPage);
                                
                await fetchFridgeCount(setFridgeCount);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        checkAuthorization();
    }, [navigate, currentPage]);

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
                <Grid item xs={12}>
                    {loading ? (
                        <CircularProgress />
                    ) : (
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
                                            <TableCell>
                                              {order.order_products && order.order_products.length > 0
                                              ? order.order_products.map(product => `${product.product.name} (${product.amount})`).join(', ')
                                              : 'No products'}
                                              </TableCell>
                                              <TableCell align="right">
                                                {order.order_products && order.order_products.length > 0
                                                ? order.order_products.reduce((acc, product) => acc + product.amount, 0)
                                                : 0}
                                                </TableCell>
                                            <TableCell align="right">{order.total_sum}</TableCell>
                                            <TableCell align="right">{formatDateTime(order.date)}</TableCell>
                                        </TableRow>
                                    )) :
                                        <TableRow>
                                            <TableCell colSpan={6}>Нет данных</TableCell>
                                        </TableRow>}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Grid>
                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    <Pagination count={totalPages} page={currentPage} onChange={handlePageChange} />
                </Grid>
            </Grid>
        </Container>
    );
}
