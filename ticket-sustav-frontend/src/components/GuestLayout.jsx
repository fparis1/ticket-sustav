import {Navigate, Outlet} from "react-router-dom";
import { useStateContext } from "../context/ContextProvider";
import { useEffect } from "react";
import "../index.css";

export default function GuestLayout({ errors }) {
  const { user, token } = useStateContext();
  
  useEffect(() => {
    document.body.style.backgroundColor = "lightblue";
  })

  if (token) {
    return <Navigate to="/" />;
  }

  return (
    <div id="guestLayout" className="gradient-custom">
      <div class="container">
        <div class="row d-flex justify-content-center align-items-center h-100">
          <div class="col-12 col-md-8 col-lg-6 col-xl-5">
            <div class="card bg-dark text-white" style={{borderRadius: "1rem"}}>
              <div class="card-body p-5 text-center">
                  {errors && (
                      <div className="alert alert-danger">
                        {Object.keys(errors).map((key) => (
                          <p key={key}>{errors[key][0]}</p>
                        ))}
                      </div>
                    )}
                  <Outlet/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
