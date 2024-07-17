import axios from 'axios';
import { refreshAccessToken } from '../../utils/access-token';
import { verifyAccessToken } from '../../utils/verify-token';

const ITEMS_PER_PAGE = 10;
const BASE_URL = 'https://www.shecker-admin.com/api';
const api = axios.create({ baseURL: BASE_URL });

async function getValidToken() {
  let token = localStorage.getItem('accessToken');
  if (!await verifyAccessToken(token)) {
    token = await refreshAccessToken();
    if (!token) throw new Error('Failed to refresh token');
    localStorage.setItem('accessToken', token);
  }
  return token;
}

async function fetchAPI(url, options = {}) {
  const accessToken = await getValidToken();
  return api.get(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
    ...options
  }).then(response => response.data);
}

async function fetchFridgeCount() {
  try {
    const fridges = await fetchAPI('/fridge/admin/');
    return fridges.length;
  } catch (error) {
    console.error('Error fetching fridge count:', error);
    return 0;
  }
}

async function fetchAllOrders() {
  let page = 1;
  let allOrders = [];
  let totalRevenue = 0;
  let totalSales = 0;
  let data;

  do {
    // eslint-disable-next-line no-await-in-loop
    data = await fetchAPI(`/order/admin/?page=${page}&status=SUCCESS`);
    totalRevenue += data.results.reduce((acc, order) => acc + order.total_sum, 0);
    totalSales += data.results.reduce((acc, order) => acc + order.total_quantity, 0);
    allOrders = [...allOrders, ...data.results];
    page += 1;
  } while (data.next);

  const fridgeCount = await fetchFridgeCount();

  // Fetch order details for all orders
  const detailedOrders = await Promise.all(allOrders.map(async order => {
    const detailResponse = await fetchOrderDetails(order.id);
    if (!detailResponse) {
      return { ...order, fridgeId: null, order_products: [] };
    }
    const fridgeId = await fetchAPI(`/order/detail/${order.id}`).then(detail => detail.fridge_id);
    const products = detailResponse.order_products.map(product => ({
      name: product.product.name,
      amount: product.amount,
      price: product.product.price
    }));
    return { ...order, fridgeId, order_products: products };
  }));

  return { orders: detailedOrders, totalPages: Math.ceil(data.count / ITEMS_PER_PAGE), totalRevenue, totalSales, fridgeCount };
}

async function fetchOrderDetails(orderId) {
  try {
    const orderDetails = await fetchAPI(`/order/admin/${orderId}`);
    console.log(`Order details for ${orderId}:`, orderDetails);
    return orderDetails;
  } catch (error) {
    console.error(`Error fetching order details for ${orderId}:`, error);
    return null;
  }
}

async function fetchOrdersPage(page) {
  try {
    const data = await fetchAPI(`/order/admin/?status=SUCCESS&page=${page}`);
    console.log('Order data:', data);
    const detailedOrders = await Promise.all(data.results.map(async order => {
      const detailResponse = await fetchOrderDetails(order.id);
      if (!detailResponse) {
        return { ...order, fridgeId: null, order_products: [] };
      }
      const fridgeId = await fetchAPI(`/order/detail/${order.id}`).then(detail => detail.fridge_id);
      const products = detailResponse.order_products.map(product => ({
        name: product.product.name,
        amount: product.amount,
        price: product.product.price
      }));
      return { ...order, fridgeId, order_products: products };
    }));

    console.log('Detailed orders:', detailedOrders);

    const totalRevenue = detailedOrders.reduce((acc, order) => acc + order.total_sum, 0);
    const totalSales = detailedOrders.reduce((acc, order) => acc + order.total_quantity, 0);
    const fridgeCount = await fetchFridgeCount();

    return { orders: detailedOrders, totalPages: Math.ceil(data.count / ITEMS_PER_PAGE), currentPage: page, totalRevenue, totalSales, fridgeCount };
  } catch (error) {
    console.error(`Error fetching orders page ${page}:`, error);
    throw error;
  }
}

async function fetchFridgeDetails() {
  const allOrders = await fetchAllOrders();
  const fridgeDetails = {};

  await Promise.all(allOrders.orders.map(async (order) => {
    const fridgeId = await fetchAPI(`/order/detail/${order.id}`).then(detail => detail.fridge_id);
    if (fridgeId !== null) {
      if (!fridgeDetails[fridgeId]) {
        fridgeDetails[fridgeId] = { successfulOrders: 0, totalRevenue: 0 };
      }
      fridgeDetails[fridgeId].successfulOrders += 1;
      fridgeDetails[fridgeId].totalRevenue += order.total_sum;
    }
  }));

  return Object.keys(fridgeDetails).map(fridgeId => ({
    fridgeId,
    successfulOrders: fridgeDetails[fridgeId].successfulOrders,
    totalRevenue: fridgeDetails[fridgeId].totalRevenue
  }));
}

export { fetchAllOrders, fetchOrdersPage, fetchAPI, fetchFridgeDetails };
