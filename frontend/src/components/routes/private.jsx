import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppData } from "../../context/appContext";
import Loading from "../../pages/core/Loading";

const ProtectRoute = () => {
    const { isAuth, user, loading } = useAppData();

    const location = useLocation();
    
    if (loading) return <Loading/>;

    if (!isAuth) return <Navigate to={'/login'} replace />;

    if (!user?.role && location.pathname !== '/select-role') return <Navigate to={'/select-role'} replace />;

    if (user?.role && location.pathname === '/select-role') return <Navigate to={'/'} replace />;

    return <Outlet />;
};

export default ProtectRoute;
