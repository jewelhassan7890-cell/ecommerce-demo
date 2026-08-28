// import React from "react";
// import { BrowserRouter, Routes, Route, Outlet, Navigate, Link } from "react-router-dom";

// // Pages Import
// import Home from "./pages/Home";
// import ProductDetails from "./pages/ProductDetails";
// import Checkout from "./pages/Checkout";
// import CategoryPage from "./pages/CategoryPage";
// import ShopPage from "./pages/ShopPage";
// import Login from "./pages/Login";
// import Profile from "./pages/Profile";
// import Register from "./pages/Register";
// import Navbar from "./components/Navbar";
// import Footer from "./components/Footer";
// import CategoryList from "./components/user/CategoryList";


// // Admin Imports
// import AllUsers from "./adimin/AllUsers"; // (আপনার ফোল্ডারের নাম অনুযায়ী)

// // Auth Provider Import
// import { AuthProvider } from "./context/AuthContext";
// import CategoryManagement from "./adimin/CategoryManagement";
// import AdminHeroConfig from "./adimin/AdminHeroConfig";
// import ProductCreate from "./adimin/ProductCreate";
// import ProductList from "./adimin/ProductList";
// import ProductEdit from "./adimin/ProductEdit";
// import CartPage from "./pages/CartPage";
// import MyOrders from "./pages/MyOrders";
// import OrderDetails from "./pages/OrderDetails";
// import AllOrders from "./adimin/AllOrders";
// import AdminProtect from "./adimin/AdminProtect";
// import CreateCoupon from "./adimin/CreateCoupon";
// import AllCoupon from "./adimin/AllCoupon";
// import SubmitContact from "./pages/SubmitContact";
// import AdminContactManager from "./adimin/AdminContactManager";



// // ==========================================
// // 1. Public Layout (Navbar + Page Content + Footer)
// // ==========================================
// const PublicLayout = () => {
//   return (
//     <div className="flex flex-col min-h-screen">
//       {/* 1. Navbar */}
//       <Navbar />

//       {/* 2. Global Category List */}
//       <CategoryList />

//       {/* 3. Main Content Area */}
//       <main className="flex-1">
//         <Outlet />
//       </main>

//       {/* 4. Footer */}
//       <Footer />
//     </div>
//   );
// };

// // ==========================================
// // 2. Admin Layout (Sidebar + Admin Content)
// // ==========================================
// const AdminLayout = () => {
//   return (
//     <div className="min-h-screen flex bg-gray-100">
//       {/* Admin Sidebar */}
//       <aside className="w-64 bg-gray-900 text-gray-200 flex flex-col border-r border-gray-800">
//         <div className="p-5 text-lg font-bold text-white border-b border-gray-800 flex items-center gap-2">
//           ⚙️ Admin Panel
//         </div>
//         <nav className="flex-1 p-4 space-y-2 text-sm font-medium">
//           <Link
//             to="/admin/categories"
//             className="flex items-center gap-3 px-3 py-2.5 rounded-md bg-blue-600 text-white transition hover:bg-blue-700"
//           >
//             📂 Manage Categories
//           </Link>
//           <Link
//             to="/admin/allusers"
//             className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-gray-800 text-gray-300 transition"
//           >
//             👥 Manage Users
//           </Link>
//           <Link
//             to="/admin/hero"
//             className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-gray-800 text-gray-300 transition"
//           >
//             🛍️ Hero banners create
//           </Link>

//           <Link
//             to="/admin/productupload"
//             className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-gray-800 text-gray-300 transition"
//           >
//             🖼️ Product Upload
//           </Link>
//           <Link
//             to="/admin/productlist"
//             className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-gray-800 text-gray-300 transition"
//           >
//             📦 Product List
//           </Link>

//           <Link
//             to="/admin/allorders"
//             className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-gray-800 text-gray-300 transition"
//           >
//             � All Orders
//           </Link>
//           <Link
//             to="/admin/createcoupon"
//             className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-gray-800 text-gray-300 transition"
//           >
//             📦 Create Coupon
//           </Link>
//           <Link
//             to="/admin/allcoupons"
//             className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-gray-800 text-gray-300 transition"
//           >
//             📦 All Coupons
//           </Link>

//           <Link
//             to="/admin/contactmanage"
//             className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-gray-800 text-gray-300 transition"
//           >
//             📦 Contact Management
//           </Link>


//           <hr className="border-gray-800 my-4" />
//           <Link
//             to="/"
//             className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-gray-800 text-gray-400 transition"
//           >
//             ⬅️ Back to Store
//           </Link>
//         </nav>
//       </aside>

//       {/* Admin Content Area */}
//       <div className="flex-1 flex flex-col">
//         <header className="bg-white border-b px-6 py-4 shadow-xs flex justify-between items-center">
//           <h1 className="text-md font-semibold text-gray-800">Admin Dashboard</h1>
//         </header>
//         <main className="flex-1 p-6 overflow-y-auto">
//           <Outlet />
//         </main>
//       </div>
//     </div>
//   );
// };

// // ==========================================
// // Main App Component
// // ==========================================
// function App() {
//   return (
//     <AuthProvider>
//       <BrowserRouter>
//         <Routes>
//           {/* ========================================== */}
//           {/* PUBLIC ROUTES (With Navbar and Footer)      */}
//           {/* ========================================== */}
//           <Route element={<PublicLayout />}>
//             <Route path="/" element={<Home />} />
//             <Route path="/shop" element={<ShopPage />} />
//             <Route path="/categories" element={<CategoryList />} />
//             <Route path="/category/:slug" element={<CategoryPage />} />
//             <Route path="/product/:slug" element={<ProductDetails />} />
//             <Route path="/cart" element={<CartPage />} />

//             {/* সাধারণ Cart Checkout-এর জন্য (Optional) */}
//             <Route path="/checkout" element={<Checkout />} />
//             <Route path="/orders" element={<MyOrders />} />
//             <Route path="/orderdetails/:id" element={<OrderDetails />} />

//             {/* User Auth & Profile */}
//             <Route path="/login" element={<Login />} />
//             <Route path="/register" element={<Register />} />
//             <Route path="/profile" element={<Profile />} />
//             <Route path="/contact" element={<SubmitContact />} />


//           </Route>

//           {/* ========================================== */}
//           {/* ADMIN ROUTES (With Admin Sidebar Layout)   */}
//           {/* ========================================== */}

//           {/* <Route path="/admin" element={<AdminLayout />}> */}

//           <Route
//             path="/admin"
//             element={
//               <AdminProtect>
//                 <AdminLayout />
//               </AdminProtect>
//             }
//           >
//             <Route index element={<Navigate to="/admin/categories" replace />} />
//             <Route path="categories" element={<CategoryManagement />} />
//             <Route path="allusers" element={<AllUsers />} />
//             <Route path="hero" element={<AdminHeroConfig />} />
//             <Route path="productupload" element={<ProductCreate />} />
//             <Route path="productlist" element={<ProductList />} />
//             <Route path="productedit/:id" element={<ProductEdit />} />
//             <Route path="allorders" element={<AllOrders />} />
//             <Route path="createcoupon" element={<CreateCoupon />} />
//             <Route path="allcoupons" element={<AllCoupon />} />
//             <Route path="contactmanage" element={<AdminContactManager />} />


//           </Route>

//           {/* Legacy route fallback for /allusers */}
//           <Route path="/allusers" element={<Navigate to="/admin/allusers" replace />} />
//         </Routes>
//       </BrowserRouter>
//     </AuthProvider>
//   );
// }

// export default App;




import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Outlet, Navigate, Link, useLocation } from "react-router-dom";

// Pages Import
import Home from "./pages/Home";
import ProductDetails from "./pages/ProductDetails";
import Checkout from "./pages/Checkout";
import CategoryPage from "./pages/CategoryPage";
import ShopPage from "./pages/ShopPage";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CategoryList from "./components/user/CategoryList";

// Admin Imports
import AllUsers from "./adimin/AllUsers"; // (আপনার ফোল্ডারের নাম অনুযায়ী)

// Auth Provider Import
import { AuthProvider } from "./context/AuthContext";
import CategoryManagement from "./adimin/CategoryManagement";
import AdminHeroConfig from "./adimin/AdminHeroConfig";
import ProductCreate from "./adimin/ProductCreate";
import ProductList from "./adimin/ProductList";
import ProductEdit from "./adimin/ProductEdit";
import CartPage from "./pages/CartPage";
import MyOrders from "./pages/MyOrders";
import OrderDetails from "./pages/OrderDetails";
import AllOrders from "./adimin/AllOrders";
import AdminProtect from "./adimin/AdminProtect";
import CreateCoupon from "./adimin/CreateCoupon";
import AllCoupon from "./adimin/AllCoupon";
import SubmitContact from "./pages/SubmitContact";
import AdminContactManager from "./adimin/AdminContactManager";
import Complaint from "./pages/Complaint";
import AdminComplaints from "./adimin/AdminComplaints";
import FaqSection from "./pages/FaqSection";
import AdminFaqManager from "./adimin/AdminFaqManager";
import AdminSiteManager from "./adimin/AdminSiteManager";
import RestockAlertForm from "./pages/RestockAlertForm";
import AdminRestockAlerts from "./adimin/AdminRestockAlerts";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import AdminPrivacyPolicy from "./adimin/AdminPrivacyPolicy";
import ReviewCarousel from "./pages/ReviewCarousel";
import AdminCarousel from "./adimin/AdminCarousel";

// Helper component to check active route in sidebar
const NavItem = ({ to, icon, label, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
        ? "bg-blue-600 text-white shadow-sm shadow-blue-500/30 font-semibold"
        : "text-slate-300 hover:bg-slate-800 hover:text-white"
        }`}
    >
      <span className="text-base">{icon}</span>
      <span>{label}</span>
    </Link>
  );
};

// ==========================================
// 1. Public Layout (Navbar + Page Content + Footer)
// ==========================================
const PublicLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800 antialiased selection:bg-blue-500 selection:text-white">
      {/* 1. Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
        <Navbar />
      </header>

      {/* 2. Global Category List */}
      <section className="bg-white border-b border-slate-200/80 shadow-2xs">
        <CategoryList />
      </section>

      {/* 3. Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>

      {/* 4. Footer */}
      <Footer />
    </div>
  );
};

// ==========================================
// 2. Admin Layout (Sidebar + Admin Content)
// ==========================================
const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-slate-100 font-sans antialiased text-slate-800">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Admin Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-200 flex flex-col border-r border-slate-800 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
      >
        {/* Sidebar Header */}
        <div className="p-5 text-lg font-bold text-white border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="bg-blue-600/20 text-blue-400 p-1.5 rounded-lg border border-blue-500/30 text-base">
              ⚙️
            </span>
            <span className="tracking-wide">Admin Panel</span>
          </div>
          <button
            className="lg:hidden text-slate-400 hover:text-white p-1"
            onClick={() => setSidebarOpen(false)}
          >
            ✕
          </button>
        </div>

        {/* Sidebar Navigation Links */}
        <nav className="flex-1 p-4 space-y-1.5 text-sm font-medium overflow-y-auto custom-scrollbar">
          <NavItem to="/admin/categories" icon="📂" label="Manage Categories" onClick={() => setSidebarOpen(false)} />
          <NavItem to="/admin/allusers" icon="👥" label="Manage Users" onClick={() => setSidebarOpen(false)} />
          <NavItem to="/admin/hero" icon="🛍️" label="Hero Banners Create" onClick={() => setSidebarOpen(false)} />
          <NavItem to="/admin/productupload" icon="🖼️" label="Product Upload" onClick={() => setSidebarOpen(false)} />
          <NavItem to="/admin/productlist" icon="📦" label="Product List" onClick={() => setSidebarOpen(false)} />
          <NavItem to="/admin/allorders" icon="📋" label="All Orders" onClick={() => setSidebarOpen(false)} />
          <NavItem to="/admin/createcoupon" icon="🎟️" label="Create Coupon" onClick={() => setSidebarOpen(false)} />
          <NavItem to="/admin/allcoupons" icon="🏷️" label="All Coupons" onClick={() => setSidebarOpen(false)} />
          <NavItem to="/admin/contactmanage" icon="💬" label="Contact Management" onClick={() => setSidebarOpen(false)} />
          <NavItem to="/admin/complaints" icon="⚠️" label="Complaints" onClick={() => setSidebarOpen(false)} />
          <NavItem to="/admin/sitesetting" icon="💬" label="Site Setting" onClick={() => setSidebarOpen(false)} />

          <NavItem to="/admin/restockmanage" icon="💬" label="Restock Manage" onClick={() => setSidebarOpen(false)} />

          <NavItem to="/admin/privacypolicy" icon="💬" label="Privacy Policy Manage" onClick={() => setSidebarOpen(false)} />

          <NavItem to="/admin/customerfeedback" icon="💬" label="Customer Feedback" onClick={() => setSidebarOpen(false)} />

          <hr className="border-slate-800/80 my-4" />

          <Link
            to="/"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-all duration-200"
          >
            <span className="text-base">⬅️</span>
            <span>Back to Store</span>
          </Link>
        </nav>
      </aside>

      {/* Admin Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Dashboard Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 sm:px-6 py-3.5 shadow-xs flex justify-between items-center">
          <div className="flex items-center gap-3">
            {/* Mobile Sidebar Toggle Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-hidden"
              aria-label="Open sidebar"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-lg font-bold text-slate-800 tracking-tight">Admin Dashboard</h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              System Live
            </span>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

// ==========================================
// Main App Component
// ==========================================
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ========================================== */}
          {/* PUBLIC ROUTES (With Navbar and Footer)      */}
          {/* ========================================== */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/categories" element={<CategoryList />} />
            <Route path="/category/:slug" element={<CategoryPage />} />
            <Route path="/product/:slug" element={<ProductDetails />} />
            <Route path="/cart" element={<CartPage />} />

            {/* সাধারণ Cart Checkout-এর জন্য (Optional) */}
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders" element={<MyOrders />} />
            <Route path="/orderdetails/:id" element={<OrderDetails />} />

            {/* User Auth & Profile */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/contact" element={<SubmitContact />} />
            <Route path="/report-issue" element={<Complaint />} />
            <Route path="/faq" element={<FaqSection />} />
            <Route path="/restock" element={<RestockAlertForm />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/feedback" element={<ReviewCarousel />} />




          </Route>

          {/* ========================================== */}
          {/* ADMIN ROUTES (With Admin Sidebar Layout)   */}
          {/* ========================================== */}
          <Route
            path="/admin"
            element={
              <AdminProtect>
                <AdminLayout />
              </AdminProtect>
            }
          >
            <Route index element={<Navigate to="/admin/categories" replace />} />
            <Route path="categories" element={<CategoryManagement />} />
            <Route path="allusers" element={<AllUsers />} />
            <Route path="hero" element={<AdminHeroConfig />} />
            <Route path="productupload" element={<ProductCreate />} />
            <Route path="productlist" element={<ProductList />} />
            <Route path="productedit/:id" element={<ProductEdit />} />
            <Route path="allorders" element={<AllOrders />} />
            <Route path="createcoupon" element={<CreateCoupon />} />
            <Route path="allcoupons" element={<AllCoupon />} />
            <Route path="contactmanage" element={<AdminContactManager />} />
            <Route path="complaints" element={<AdminComplaints />} />
            <Route path="faq" element={<AdminFaqManager />} />
            <Route path="sitesetting" element={<AdminSiteManager />} />
            <Route path="restockmanage" element={<AdminRestockAlerts />} />
            <Route path="privacypolicy" element={<AdminPrivacyPolicy />} />
            <Route path="customerfeedback" element={<AdminCarousel />} />







          </Route>

          {/* Legacy route fallback for /allusers */}
          <Route path="/allusers" element={<Navigate to="/admin/allusers" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;