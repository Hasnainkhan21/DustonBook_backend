const orderPlacedEmail = (order) => {
  return `
    <h2>Order Placed Successfully</h2>
    <p><b>Order ID:</b> #${order._id.toString().slice(-6)}</p>
    <p><b>Total:</b> Rs ${order.totalAmount} + 200</p>

    <h3>Items:</h3>
    <ul>
      ${order.items
        .map(
          (item) =>
            `<li>${item.quantity} × ${item.book.title}</li>`
        )
        .join("")}
    </ul>

    <p>Thank you for shopping with us.</p>
  `;
};

module.exports = { orderPlacedEmail };
