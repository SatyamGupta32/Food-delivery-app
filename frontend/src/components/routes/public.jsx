import { Navigate, Outlet } from "react-router-dom";
import { useAppData } from "../../context/appContext";
import Loading from "../../pages/core/Loading";

const PublicRoute = ( ) => {
    const { isAuth, loading } = useAppData();

    if (loading) return <Loading />;

    return isAuth ? <Navigate to="/" replace /> : <Outlet />;
};

export default PublicRoute;