import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import path from "path";
import { fileURLToPath } from "url";

// Models
import User from "../models/User.js";
import ChefProfile from "../models/ChefProfile.js";
import Menu from "../models/Menu.js";
import Order from "../models/Order.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected for Seeding");
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

const seedData = async () => {
  try {
    console.log("🚀 Seeding started...");

    // 1. Cleanup
    await User.deleteMany({});
    await ChefProfile.deleteMany({});
    await Menu.deleteMany({});
    await Order.deleteMany({});
    console.log("🧹 Existing data cleared");

    const commonPassword = await hashPassword("123456");

    // 2. Insert Students
    const students = await User.insertMany([
      { name: "Rahul Sharma", email: "rahul@student.com", password: commonPassword, role: "student" },
      { name: "Priya Patel", email: "priya@student.com", password: commonPassword, role: "student" },
      { name: "Amit Verma", email: "amit@student.com", password: commonPassword, role: "student" },
      { name: "Sneha Joshi", email: "sneha@student.com", password: commonPassword, role: "student" },
      { name: "Arjun Singh", email: "arjun@student.com", password: commonPassword, role: "student" },
    ]);
    console.log("👨🎓 Students created");

    // 3. Insert Chefs
    const chefUsers = await User.insertMany([
      { name: "Sunita Aunty", email: "sunita@chef.com", password: commonPassword, role: "chef" },
      { name: "Rajesh Kumar", email: "rajesh@chef.com", password: commonPassword, role: "chef" },
      { name: "Meena Joshi", email: "meena@chef.com", password: commonPassword, role: "chef" },
      { name: "Prakash Sharma", email: "sharma@chef.com", password: commonPassword, role: "chef" },
      { name: "Imran Khan", email: "khan@chef.com", password: commonPassword, role: "chef" },
    ]);
    console.log("👩🍳 Chef users created");

    // 4. Create Chef Profiles
    const college = "Thakur College Of Engineering";
    const chefProfiles = await ChefProfile.insertMany([
      { userId: chefUsers[0]._id, bio: "Ghar jaisa khana, pure veg, fresh daily", rating: 4.8, college, isApproved: true, isAvailable: true },
      { userId: chefUsers[1]._id, bio: "Affordable student meals with full thali", rating: 4.2, college, isApproved: true, isAvailable: true },
      { userId: chefUsers[2]._id, bio: "Healthy and hygienic homemade food", rating: 4.5, college, isApproved: true, isAvailable: true },
      { userId: chefUsers[3]._id, bio: "North Indian special thali and combos", rating: 4.0, college, isApproved: true, isAvailable: true },
      { userId: chefUsers[4]._id, bio: "Delicious non-veg dishes and biryani", rating: 4.7, college, isApproved: true, isAvailable: true },
    ]);
    console.log("👩🍳 Chef profiles created");

    // 5. Insert Menus
    const menuData = [
      // Sunita Aunty (Veg)
      { chefId: chefUsers[0]._id, name: "Ghar Wali Roti Sabzi", description: "4 Soft Phulkas with seasonal dry sabzi and pickle. Just like home!", price: 50, category: "Main Course", isVeg: true, isAvailable: true, image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400" },
      { chefId: chefUsers[0]._id, name: "Dal Tadka Rice", description: "Yellow dal with jeera rice and papad. Comfort food at its best.", price: 60, category: "Main Course", isVeg: true, isAvailable: true, image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400" },
      { chefId: chefUsers[0]._id, name: "Special Veg Thali", description: "Dal, Sabzi, 3 Roti, Rice, Raita & Gulab Jamun.", price: 80, category: "Thali", isVeg: true, isAvailable: true, image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97eb4?w=400" },

      // Rajesh Kumar (Budget)
      { chefId: chefUsers[1]._id, name: "Student Budget Thali", description: "2 Roti, Rice, Dal, and Aloo Jeera. Value for money.", price: 70, category: "Thali", isVeg: true, isAvailable: true, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400" },
      { chefId: chefUsers[1]._id, name: "Pindi Chhole Rice", description: "Spicy Amritsari Chhole with steamed basmati rice.", price: 60, category: "Main Course", isVeg: true, isAvailable: true, image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400" },
      { chefId: chefUsers[1]._id, name: "Aloo Paratha Combo", description: "2 Large Parathas served with dahi and amul butter.", price: 50, category: "Breakfast", isVeg: true, isAvailable: true, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400" },

      // Meena Joshi (Healthy)
      { chefId: chefUsers[2]._id, name: "Zero Oil Veg Meal", description: "Steamed veggies, brown rice and boiled sprouts dal.", price: 90, category: "Healthy", isVeg: true, isAvailable: true, image: "https://images.unsplash.com/photo-1543332164-6e82f355badc?w=400" },
      { chefId: chefUsers[2]._id, name: "Shahi Paneer Thali", description: "Creamy paneer, laccha paratha, and pulao.", price: 120, category: "Premium", isVeg: true, isAvailable: true, image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400" },
      { chefId: chefUsers[2]._id, name: "Moong Dal Khichdi", description: "Light and digestible, topped with pure desi ghee.", price: 70, category: "Main Course", isVeg: true, isAvailable: true, image: "https://images.unsplash.com/photo-1606491956689-2ea8c5119c85?w=400" },

      // Prakash Sharma (North Indian)
      { chefId: chefUsers[3]._id, name: "North Indian Deluxe Thali", description: "Paneer, Dal Makhani, 2 Butter Naan, Rice, Salad & Sweet.", price: 100, category: "Thali", isVeg: true, isAvailable: true, image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400" },
      { chefId: chefUsers[3]._id, name: "Paneer Chole Bhature", description: "2 Paneer stuffed bhature with spicy pindi chole.", price: 80, category: "Breakfast", isVeg: true, isAvailable: true, image: "https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=400" },
      { chefId: chefUsers[3]._id, name: "Mix Veg Paratha", description: "Stuffed with gobi, aloo, and paneer. Served with chutney.", price: 40, category: "Breakfast", isVeg: true, isAvailable: true, image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400" },

      // Imran Khan (Non-Veg)
      { chefId: chefUsers[4]._id, name: "Home Style Chicken Curry", description: "3 pieces of chicken in spicy brown gravy with 2 rotis.", price: 150, category: "Main Course", isVeg: false, isAvailable: true, image: "https://images.unsplash.com/photo-1588166524941-3bf61a7c4aeb?w=400" },
      { chefId: chefUsers[4]._id, name: "Dhaba Style Egg Curry", description: "2 Boiled eggs in onion-tomato masala with rice.", price: 100, category: "Main Course", isVeg: false, isAvailable: true, image: "https://images.unsplash.com/photo-1596797038558-b82b82870c51?w=400" },
      { chefId: chefUsers[4]._id, name: "Dum Chicken Biryani", description: "Fragrant basmati rice with juicy chicken and raita.", price: 130, category: "Main Course", isVeg: false, isAvailable: true, image: "https://images.unsplash.com/photo-1563379091339-03b21bc4a4f8?w=400" },
    ];

    await Menu.insertMany(menuData);
    console.log("🍛 Menu items created");

    console.log("✨ Indian demo data inserted successfully");
    process.exit();
  } catch (error) {
    console.error(`❌ Error during seeding: ${error.message}`);
    process.exit(1);
  }
};

connectDB().then(() => {
  seedData();
});
