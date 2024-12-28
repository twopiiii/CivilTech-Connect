import React, { useContext } from "react";
import { AuthContext } from "./components/backend/context/Auth";
import { Navigate } from "react-router-dom";

const RequireAuth = ({ children }) => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/admin/login" />;
  }

  return children;
};

export default RequireAuth;
