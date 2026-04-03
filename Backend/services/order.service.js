import Order from "../models/Order.js";
import Menu from "../models/Menu.js";
import ChefProfile from "../models/ChefProfile.js";
import Address from "../models/Address.js";
import Cart from "../models/Cart.js";

/**
 * Creates a new order.
 * Calculates totals, commission, and chef earnings based on current DB prices.
 */
export const createOrder = async (studentId, { chefId, items, addressId, paymentMethod = "cod", razorpayOrderId }) => {
  if (!items || items.length === 0) {
    const error = new Error("Cart is empty");
    error.statusCode = 400;
    throw error;
  }

  // 1. Verify Address exists and belongs to student
  const address = await Address.findOne({ _id: addressId, userId: studentId });
  if (!address) {
    const error = new Error("Delivery address not found or unauthorized");
    error.statusCode = 404;
    throw error;
  }

  // 2. Verify Chef User exists and is approved/available via profile
  const chefProfile = await ChefProfile.findOne({ userId: chefId });
  if (!chefProfile) {
    const error = new Error("Chef not found");
    error.statusCode = 404;
    throw error;
  }
  if (!chefProfile.isAvailable) {
    const error = new Error("Chef is not currently accepting orders");
    error.statusCode = 400;
    throw error;
  }
  if (!chefProfile.isApproved) {
    const error = new Error("Chef is not currently approved to accept orders");
    error.statusCode = 400;
    throw error;
  }

  let itemsTotal = 0;
  const processedItems = [];

  // 3. Validate items and calculate prices securely
  for (const item of items) {
    const menuItem = await Menu.findById(item.menuId);
    
    if (!menuItem) {
      const error = new Error(`Menu item ${item.menuId} not found`);
      error.statusCode = 404;
      throw error;
    }

    // Unified check: both should be User IDs
    if (menuItem.chefId.toString() !== chefId) {
      const error = new Error(`Menu item ${menuItem.name} does not belong to the selected chef`);
      error.statusCode = 400;
      throw error;
    }

    const itemPriceSum = menuItem.price * item.quantity;
    itemsTotal += itemPriceSum;

    processedItems.push({
      menuId: menuItem._id,
      name: menuItem.name,
      quantity: item.quantity,
      price: menuItem.price, // Snapshot current price
    });
  }

  // 4. Detailed Price Breakdown
  const deliveryFee = 20;
  const platformFee = itemsTotal * 0.05;
  const totalAmount = itemsTotal + deliveryFee + platformFee;

  // 5. Chef Commissions (15% of items total only)
  const commission = itemsTotal * 0.15;
  const chefEarning = itemsTotal - commission;

  // 6. Save order (chefId is now the User ID)
  const order = await Order.create({
    studentId,
    chefId,
    items: processedItems,
    itemsTotal,
    deliveryFee,
    platformFee,
    totalAmount,
    commission,
    chefEarning,
    addressId: address._id,
    addressSnapshot: {
      label: address.label,
      buildingType: address.buildingType,
      addressLine: address.addressLine,
      buildingName: address.buildingName,
      landmark: address.landmark,
      area: address.area,
      city: address.city,
      pincode: address.pincode,
      lat: address.lat,
      lng: address.lng,
      receiverName: address.receiverName,
      receiverPhone: address.receiverPhone,
    },
    status: "pending",
    paymentMethod,
    paymentStatus: paymentMethod === "online" ? "pending" : "pending", // Both start as pending, online updated later
    razorpayOrderId: razorpayOrderId || null,
  });

  // 7. Clear the cart after successful order creation
  await Cart.deleteOne({ userId: studentId });

  return order;
};

/**
 * Fetches all orders for a student.
 */
export const getStudentOrders = async (studentId) => {
  return await Order.find({ studentId })
    .populate("chefId", "name email") // Populates Chef User details
    .populate("items.menuId")
    .sort("-createdAt");
};

/**
 * Fetches all orders for a chef using their authenticated User ID.
 */
export const getChefOrders = async (userId) => {
  return await Order.find({ chefId: userId })
    .populate("studentId", "name email")
    .populate("items.menuId")
    .sort("-createdAt");
};

/**
 * Updates order status using the chef's authenticated User ID.
 */
export const updateOrderStatus = async (orderId, chefUserId, status) => {
  const order = await Order.findById(orderId);

  if (!order) {
    const error = new Error("Order not found");
    error.statusCode = 404;
    throw error;
  }

  // Unified check: both should be User IDs
  if (order.chefId.toString() !== chefUserId.toString()) {
    const error = new Error("Unauthorized to update this order");
    error.statusCode = 401;
    throw error;
  }

  order.status = status;

  // Auto-update paymentStatus for COD orders on delivery
  if (status === "delivered" && order.paymentMethod === "cod") {
    order.paymentStatus = "paid";
  }

  await order.save();
  return order;
};

