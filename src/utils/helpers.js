// src/utils/helpers.js
const filterOrdersByTime = (orders, days) => {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - days);
    return orders.filter(order => new Date(order.date) >= threshold);
};

const calculateTotals = orders => orders.reduce((totals, order) => ({
    totalSum: totals.totalSum + order.total_sum,
    totalQuantity: totals.totalQuantity + order.total_quantity
}), { totalSum: 0, totalQuantity: 0 });

export { filterOrdersByTime, calculateTotals };
