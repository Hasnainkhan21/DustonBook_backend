const orderPlacedEmail = (order) => `
  <h2>Order Confirmed</h2>
  <p>Your order <b>#${order._id}</b> has been placed.</p>
  <p>Total: Rs ${order.totalAmount}</p>
`;

module.exports = { orderPlacedEmail }; 


