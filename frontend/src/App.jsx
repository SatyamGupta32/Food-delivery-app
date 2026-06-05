import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import Login from "./pages/Auth/Login";
import Singup from "./pages/Auth/Singup";
import LandingPage from "./pages/Home/LandingPage";
import { Toaster } from 'react-hot-toast';
import ProtectRoute from "./components/routes/private";
import PublicRoute from "./components/routes/public";
import SelectRole from "./pages/Auth/SelectRole";
import Navbar from "./components/layout/Navbar";
import Account from "./pages/Auth/Account";
import RestaurantPanel from "./pages/vendor/RestaurantPanel";
import { useAppData } from "./context/appContext";
import Loading from "./pages/core/Loading";
import Details from "./pages/Restaurant/Details";
import Cart from "./pages/cart/Cart";
import Address from "./pages/Address/Address";
import Checkout from "./pages/Checkout/Checkout";
import PaymentSuccess from "./pages/Payment/PaymentSuccess";
import OrderSuccess from "./pages/Payment/OrderSuccess";
import MyOrders from "./pages/Orders/MyOrders";
import OrderDetails from "./pages/Orders/OrderDetails";
import RiderPanel from "./pages/Rider/RiderPanel";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import Header from "./components/layout/Header";
import SearchResults from "./pages/Auth/components/SearchResults";
import Product from "./pages/Product/Product";

const AppLayout = () => {

  const location = useLocation();

  const isHomePage = location.pathname === "/";

  return (
    <>
      <Navbar showSearch={true} />

      <main className={isHomePage ? "pt-32" : "pt-14"}>
        <Routes>

          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Singup />} />
          </Route>

          <Route element={<ProtectRoute />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/payment-success/:payId" element={<PaymentSuccess />} />
            <Route path="/order-success" element={<OrderSuccess />} />
            <Route path="/order-success/:payId" element={<OrderSuccess />} />
            <Route path="/address" element={<Address />} />
            <Route path="/orders" element={<MyOrders />} />
            <Route path="/order/:id" element={<OrderDetails />} />
            <Route path="/restaurant/:id" element={<Details />} />
            <Route path="/select-role" element={<SelectRole />} />
            <Route path="/account" element={<Account />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/product/:id" element={<Product />} />
          </Route>

        </Routes>
      </main>
    </>
  );
};

const RoleLayout = ({ home }) => {
  return (
    <>
      <div className='w-full bg-white shadow-sm fixed z-10 left-0 right-0 top-0'>
        <Header showCart={false} />
      </div>

      <main className="pt-14">
        <Routes element={<ProtectRoute />}>
          <Route path="/" element={home} />
          <Route path="/account" element={<Account />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
};

const App = () => {

  const { user, loading } = useAppData();

  if (loading) return <Loading />;

  return (
    <BrowserRouter>

      {user?.role === 'admin' ? (
        <RoleLayout home={<AdminDashboard />} />
      )
        : user?.role === 'seller' ?
          (
            <RoleLayout home={<RestaurantPanel />} />
          )
          : user?.role === 'rider' ?
            (
              <RoleLayout home={<RiderPanel />} />
            )
            :
            (
              <AppLayout />
            )
      }

      <Toaster />

    </BrowserRouter>
  );
};

export default App;
