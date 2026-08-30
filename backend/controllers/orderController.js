import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder");

const DELIVERY_CHARGE = 2;
const CURRENCY = "usd";

// Place order with Cash on Delivery (COD) / Direct Order
const placeOrderCod = async (req, res) => {
  try {
    const { userId, items, amount, address } = req.body;
    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: "No items in order" });
    }

    const newOrder = new orderModel({
      userId,
      items,
      amount,
      address,
      payment: true, // COD order accepted
      status: "Food Processing",
      date: Date.now(),
    });
    await newOrder.save();

    // Clear user cart after placing order
    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    res.json({ success: true, message: "Order placed successfully!", orderId: newOrder._id });
  } catch (error) {
    console.error("Error placing COD order:", error);
    res.status(500).json({ success: false, message: "Error placing order: " + error.message });
  }
};

// Place a new order and create Stripe checkout session
const placeOrder = async (req, res) => {
  const frontend_url = process.env.FRONTEND_URL || "http://localhost:5173";
  try {
    const { userId, items, amount, address } = req.body;
    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: "No items in order" });
    }

    const newOrder = new orderModel({
      userId,
      items,
      amount,
      address,
      payment: false,
      status: "Food Processing",
      date: Date.now(),
    });
    await newOrder.save();

    // Clear user cart after placing order
    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    // Check if Stripe key is placeholder
    const isStripeConfigured = process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes("your_stripe_secret_key");

    if (!isStripeConfigured) {
      // Mock Stripe success for testing when secret key is placeholder
      await orderModel.findByIdAndUpdate(newOrder._id, { payment: true });
      return res.json({
        success: true,
        session_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
      });
    }

    // Build Stripe line items
    const line_items = items.map((item) => ({
      price_data: {
        currency: CURRENCY,
        product_data: { name: item.name },
        unit_amount: Math.round(item.price * 100), // Stripe uses cents
      },
      quantity: item.quantity,
    }));

    // Add delivery charge as a line item
    line_items.push({
      price_data: {
        currency: CURRENCY,
        product_data: { name: "Delivery Charges" },
        unit_amount: DELIVERY_CHARGE * 100,
      },
      quantity: 1,
    });

    const session = await stripe.checkout.sessions.create({
      line_items,
      mode: "payment",
      success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`,
    });

    res.json({ success: true, session_url: session.url });
  } catch (error) {
    console.error("Error in Stripe checkout:", error);
    res.status(500).json({ success: false, message: "Error initiating payment: " + error.message });
  }
};

// Verify Stripe payment result
const verifyOrder = async (req, res) => {
  const { orderId, success } = req.body;
  try {
    if (success === "true" || success === true) {
      await orderModel.findByIdAndUpdate(orderId, { payment: true });
      res.json({ success: true, message: "Paid" });
    } else {
      await orderModel.findByIdAndDelete(orderId);
      res.json({ success: false, message: "Not Paid" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error verifying order" });
  }
};

// Get orders for a specific user (frontend: My Orders)
const userOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({ userId: req.body.userId }).sort({ date: -1, _id: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error fetching user orders" });
  }
};

// Admin: list all orders
const listOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({}).sort({ date: -1, _id: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error fetching orders" });
  }
};

// Admin: update order status
const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    if (!orderId || !status) {
      return res.status(400).json({ success: false, message: "orderId and status are required" });
    }
    await orderModel.findByIdAndUpdate(orderId, { status });
    res.json({ success: true, message: "Status updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error updating status" });
  }
};

export { placeOrder, placeOrderCod, verifyOrder, userOrders, listOrders, updateStatus };
