import {Navigate, Outlet} from "react-router-dom";
import { useStateContext } from "../context/ContextProvider";
import { useEffect } from "react";

export default function GuestLayout() {
  const { user, token } = useStateContext();

  useEffect(() => {
    document.body.style.backgroundColor = "lightblue";
  })

  if (token) {
    return <Navigate to="/" />;
  }

  return (
    <div id="guestLayout">
      <Outlet />
    </div>
  );
}
