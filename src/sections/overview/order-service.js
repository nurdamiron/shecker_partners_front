import axios from 'axios';
import { refreshAccessToken } from '../../utils/access-token';
import { verifyAccessToken } from '../../utils/verify-token';

const ITEMS_PER_PAGE = 10;

const api = axios.create({
    baseURL: 'https://www.shecker-admin.com/api',
});

async function getValidToken() {
    let token = localStorage.getItem('accessToken');
    if (!await verifyAccessToken(token)) {
        token = await refreshAccessToken();
        if (token) {
            localStorage.setItem('accessToken', token);
        } else {
            throw new Error('Failed to refresh token');
        }
    }
    return token;
}

async function fetchOrderDetails(orderId) {
    const accessToken = await getValidToken();
    try {
        const { data } = await api.get(`/order/detail/${orderId}/`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        return data;
    } catch (error) {
        console.error('Error fetching order details:', error);
        throw error;
    }
}

async function fetchFridgeDetails(orderId) {
    const accessToken = await getValidToken();
    try {
        const { data } = await api.get(`/order/detail/${orderId}`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        return data.fridge_id;
    } catch (error) {
        console.error('Error fetching fridge details:', error);
        return null;
    }
}

async function fetchAllOrders(setOrders, setLoading, setTotalPages, setTotalRevenue, setTotalSales) {
    if (typeof setLoading === 'function') setLoading(true);
    const accessToken = await getValidToken();
    let totalRevenue = 0;
    let totalSales = 0;
    let totalOrders = 0;

    async function loadOrders(page = 1) {
        try {
            const { data } = await api.get(`/order/admin/?page=${page}&status=SUCCESS`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            const detailedOrders = await Promise.all(data.results.map(async order => {
                const fridgeId = await fetchFridgeDetails(order.id);
                totalRevenue += parseFloat(order.total_sum);
                totalSales += parseInt(order.total_quantity, 10);
                return { ...order, fridgeId };
            }));

            totalOrders += detailedOrders.length;

            if (typeof setOrders === 'function') {
                setOrders(orders => [...orders, ...detailedOrders]);
            }

            if (data.next) {
                await loadOrders(page + 1);
            }
        } catch (error) {
            console.error(`Error loading orders on page ${page}:`, error);
        }
    }

    try {
        await loadOrders();
        if (typeof setTotalRevenue === 'function') setTotalRevenue(totalRevenue);
        if (typeof setTotalSales === 'function') setTotalSales(totalSales);
        if (typeof setTotalPages === 'function') setTotalPages(Math.ceil(totalOrders / ITEMS_PER_PAGE));
    } finally {
        if (typeof setLoading === 'function') setLoading(false);
    }
}

async function fetchOrdersPage(page, setOrders, setLoading, setTotalPages, setCurrentPage) {
    setLoading(true);
    const accessToken = await getValidToken();
    try {
        const response = await axios.get(`https://shecker-admin.com/api/order/admin/?status=SUCCESS&page=${page}`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });

        const detailedOrders = await Promise.all(response.data.results.map(async order => {
            const fridgeId = await fetchFridgeDetails(order.id);
            return { ...order, fridgeId };
        }));

        setOrders(detailedOrders);
        setTotalPages(Math.ceil(response.data.count / 10));
        setCurrentPage(page);
    } catch (error) {
        console.error(`Error fetching orders page ${page}:`, error);
    } finally {
        setLoading(false);
    }
}

async function fetchInitialOrders(setOrders, setLoading, setTotalPages, setTotalRevenue, setTotalSales, setCurrentPage) {
    if (typeof setLoading === 'function') setLoading(true);
    const accessToken = await getValidToken();
    try {
        const { data } = await api.get(`/order/admin/?page=1&status=SUCCESS`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (data && data.results.length > 0) {
            const totalPages = Math.ceil(data.count / ITEMS_PER_PAGE);
            if (typeof setTotalPages === 'function') setTotalPages(totalPages);
            if (typeof setCurrentPage === 'function') setCurrentPage(1);
            await fetchAllOrders(setOrders, setLoading, setTotalPages, setTotalRevenue, setTotalSales);
        }
    } catch (error) {
        console.error('Error fetching initial orders:', error);
    } finally {
        if (typeof setLoading === 'function') setLoading(false);
    }
}

const fetchOrderData = async (setTotalRevenue, setTotalSales, filter) => {
    let accessToken = localStorage.getItem('accessToken');
    const isTokenValid = await verifyAccessToken(accessToken);

    if (!isTokenValid) {
        accessToken = await refreshAccessToken();
        if (!accessToken) {
            throw new Error('Unable to refresh access token');
        }
    }

    const orders = await fetchAllOrders(accessToken, filter);

    const orderDetailsPromises = orders.map(order =>
        axios.get(`https://shecker-admin.com/api/order/admin/${order.id}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        })
    );

    const orderDetailsResponses = await Promise.all(orderDetailsPromises);
    const totalRevenue = orderDetailsResponses.reduce((sum, res) => sum + parseFloat(res.data.total_sum), 0);
    const totalSales = orderDetailsResponses.reduce((sum, res) => sum + parseInt(res.data.total_quantity, 10), 0);

    setTotalRevenue(totalRevenue);
    setTotalSales(totalSales);
};

export { fetchAllOrders, fetchInitialOrders, fetchOrderData, fetchOrderDetails, fetchFridgeDetails, fetchOrdersPage };
