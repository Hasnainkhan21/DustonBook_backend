const orderStatusEmail = (order) => {
  return `
    <h2>Order Status Updated</h2>
    <p><b>Order ID:</b> #${order._id.toString().slice(-6)}</p>
    <p><b>New Status:</b> ${order.status}</p>

    <p>If you have questions, contact support.</p>
  
  `;
};

module.exports = { orderStatusEmail };
