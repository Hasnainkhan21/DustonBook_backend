const orderPlacedEmail = (orderId) => `
  <h2>Order Placed ✅</h2>
  <p>Your order <b>#${orderId}</b> has been placed.</p>
`;

module.exports = { orderPlacedEmail }; 
