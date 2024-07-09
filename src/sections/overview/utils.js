// utils.js
const filterOrdersByTime = (orders, days) => {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - days);
    return orders.filter(order => new Date(order.date) >= threshold);
  };
  
  const calculateTotals = orders => orders.reduce((totals, order) => {
    totals.totalSum += order.total_sum;
    totals.totalQuantity += order.total_quantity;
    return totals;
  }, { totalSum: 0, totalQuantity: 0 });
  
  export { filterOrdersByTime, calculateTotals };
  