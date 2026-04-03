import { Link } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { Search, ShoppingCart, User, MapPin, Star } from "lucide-react";
import heroImg from "../assets/hero-food.jpg";

export default function Index() {

  const { currentUser } = useApp();

  const dashboardPath = currentUser
    ? currentUser.role === "student"
      ? "/student-dashboard"
      : currentUser.role === "chef"
      ? "/chef-dashboard"
      : "/admin-dashboard"
    : null;

  return (
    <div className="bg-[#f8f9fb] min-h-screen">

      {/* NAVBAR */}
      <div className="flex items-center justify-between px-8 py-4 bg-white shadow-sm">

        <h1 className="text-2xl font-bold text-orange-500">
          Campus <span className="text-black">Thali</span>
        </h1>

        <div className="flex items-center gap-3 bg-gray-100 px-5 py-2 rounded-full w-[500px]">
          <Search size={18} />
          <input
            placeholder="Search for dishes, cuisines, or chef names..."
            className="bg-transparent outline-none w-full text-sm"
          />
        </div>

        <div className="flex items-center gap-6 text-gray-600">

          <div className="flex items-center gap-1 text-sm">
            <MapPin size={18} />
            Near Campus
          </div>

          <ShoppingCart />

          {currentUser ? (
            <>
              <Link to={dashboardPath!}>
                <button className="bg-orange-500 text-white px-4 py-2 rounded-full text-sm">
                  Dashboard
                </button>
              </Link>

              <Link to={dashboardPath!}>
                <User className="cursor-pointer" />
              </Link>
            </>
          ) : (
            <>
              <Link to="/login">
                <button className="text-sm border px-3 py-1.5 rounded-full">
                  Sign In
                </button>
              </Link>

              <Link to="/register">
                <button className="bg-orange-500 text-white px-4 py-1.5 rounded-full text-sm">
                  Get Started
                </button>
              </Link>

              <Link to="/login">
                <User className="cursor-pointer" />
              </Link>
            </>
          )}
        </div>
      </div>

      {/* HERO */}
      <section className="relative h-[400px] flex items-center px-10 text-white">
        <img src={heroImg} className="absolute w-full h-full object-cover top-0 left-0" />
        <div className="absolute inset-0 bg-black/50" />

        <div className="relative z-10 max-w-xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            Delicious Home-Cooked Meals from Campus Chefs
          </h1>
          <p className="text-lg opacity-90">
            Fresh, affordable, and made with love by students like you
          </p>
        </div>
      </section>

      {/* FILTERS */}
      <div className="flex justify-between px-8 py-4">
        <div className="flex gap-3 flex-wrap">
          {["Dietary", "Price Range", "Rating", "Delivery Time"].map((f) => (
            <button key={f} className="px-4 py-2 bg-white border rounded-full text-sm shadow-sm">
              {f}
            </button>
          ))}
        </div>

        <button className="px-4 py-2 bg-white border rounded-full text-sm shadow-sm">
          Sort by: Popularity
        </button>
      </div>

      {/* CHEFS */}
      <section className="px-8">
        <h2 className="text-2xl font-semibold mb-6">Campus Chefs Near You</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {[
            {
              name: "Anita Sharma",
              image: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092",
              dishes: [
                { name: "Paneer Butter Masala", price: 120 },
                { name: "Jeera Rice", price: 80 },
              ],
            },
            {
              name: "Rahul Verma",
              image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f",
              dishes: [
                { name: "Chicken Biryani", price: 150 },
                { name: "Tandoori Roti", price: 40 },
              ],
            },
            {
              name: "Sneha Patel",
              image: "https://images.unsplash.com/photo-1498654896293-37aacf113fd9",
              dishes: [
                { name: "Masala Dosa", price: 90 },
                { name: "Idli Sambar", price: 70 },
              ],
            },
          ].map((chef, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-md overflow-hidden">

              <div className="h-[140px] overflow-hidden">
                <img src={chef.image} className="w-full h-full object-cover" />
              </div>

              <div className="p-4">

                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                    <User size={16} />
                  </div>
                  <div>
                    <p className="font-semibold">{chef.name}</p>
                    <p className="text-xs text-gray-500">Verified Student Chef</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                  <span className="text-green-600 flex items-center gap-1">
                    <Star size={14}/> 4.8
                  </span>
                  <span>320 orders</span>
                  <span>• 0.5 km</span>
                </div>

                <p className="text-sm font-medium mb-2">Today's Specials</p>

                <div className="text-sm text-gray-700">
                  {chef.dishes.map((dish, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>{dish.name}</span>
                      <span>₹{dish.price}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center mt-4">
                  <span className="text-sm text-gray-500">25 min</span>
                  <button className="bg-orange-500 text-white px-4 py-1.5 rounded-full text-sm">
                    Order Now
                  </button>
                </div>

              </div>
            </div>
          ))}

        </div>
      </section>

      {/* TOP RATED */}
      <section className="px-8 py-10">
        <h2 className="text-2xl font-semibold mb-6">Top Rated Chefs</h2>

        <div className="flex gap-4 flex-wrap">

          {[
            { name: "Priya Mehta", dish: "Rajma Chawal" },
            { name: "Arjun Singh", dish: "Butter Chicken" },
            { name: "Kavya Nair", dish: "Veg Thali" },
          ].map((chef, i) => (
            <div key={i} className="bg-white p-4 rounded-xl shadow-sm w-[220px]">

              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center mb-3">
                <User size={18}/>
              </div>

              <p className="font-semibold">{chef.name}</p>
              <p className="text-sm text-gray-500">{chef.dish}</p>

              <p className="text-green-600 text-sm mt-1">★ 4.8</p>
            </div>
          ))}

        </div>
      </section>

      {/* TRENDING */}
      <section className="px-8 pb-10">
        <h2 className="text-2xl font-semibold mb-6">Trending Dishes</h2>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">

          {[
            { name: "Chole Bhature", chef: "Anita Sharma", price: 100, img: "https://tse2.mm.bing.net/th/id/OIP.SyHA9n0c13q1m9scTWNnkwHaE7?pid=Api&P=0&h=180" },
            { name: "Pav Bhaji", chef: "Rahul Verma", price: 80, img: "https://tse3.mm.bing.net/th/id/OIP.9VaH5NBpl4Z9gN-xDaK4rgHaE7?pid=Api&P=0&h=180" },
            { name: "Fried Rice", chef: "Sneha Patel", price: 90, img: "https://images.unsplash.com/photo-1603133872878-684f208fb84b" },
            { name: "Dal Tadka", chef: "Priya Mehta", price: 70, img: "https://tse4.mm.bing.net/th/id/OIP.dkMSAfIB56j5IB9QPWIEIAHaHa?pid=Api&P=0&h=180" },
            { name: "Paneer Roll", chef: "Arjun Singh", price: 110, img: "https://tse3.mm.bing.net/th/id/OIP.aFwUyCPzYeLa8PXseEjxNgHaHa?pid=Api&P=0&h=180" },
          ].map((dish, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden">

              <div className="h-[100px] overflow-hidden">
                <img src={dish.img} className="w-full h-full object-cover" />
              </div>

              <div className="p-3">
                <p className="font-medium text-sm">{dish.name}</p>
                <p className="text-xs text-gray-500">{dish.chef}</p>

                <div className="flex justify-between items-center mt-2">
                  <p className="font-semibold">₹{dish.price}</p>
                  <button className="bg-orange-100 p-1 rounded-full">🛒</button>
                </div>
              </div>

            </div>
          ))}

        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="px-8 pb-16">
        <h2 className="text-2xl font-semibold mb-6">What Students Say</h2>

        <div className="grid md:grid-cols-3 gap-6">

          {["Rohit Jain","Ayesha Khan","Karan Shah"].map((name, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl shadow-sm">
              <div className="text-orange-500 mb-2">★★★★★</div>
              <p className="text-gray-600 text-sm mb-4">
                "Amazing home-cooked food! Tastes just like mom's cooking."
              </p>
              <p className="font-semibold text-sm">{name}</p>
            </div>
          ))}

        </div>
      </section>

      {/* FOOTER (unchanged) */}
      <footer className="bg-[#0f172a] text-white px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h2 className="text-xl font-bold text-orange-500">
              Campus<span className="text-white">Thali</span>
            </h2>
            <p className="text-sm mt-3 text-gray-400">
              Homemade meals from campus chefs, delivered to your door.
            </p>
          </div>
          <div>
            <p className="font-semibold mb-3">For Students</p>
            <ul className="text-sm text-gray-400 space-y-2">
              <li>Browse Chefs</li>
              <li>My Orders</li>
              <li>Favourites</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold mb-3">For Chefs</p>
            <ul className="text-sm text-gray-400 space-y-2">
              <li>Register as Chef</li>
              <li>Chef Dashboard</li>
              <li>Earnings</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold mb-3">Connect With Us</p>
            <ul className="text-sm text-gray-400 space-y-2">
              <li>Instagram</li>
              <li>Twitter</li>
              <li>Support</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-sm text-gray-400">
          © 2026 CampusThali. All rights reserved.
        </div>
      </footer>

    </div>
  );
}
