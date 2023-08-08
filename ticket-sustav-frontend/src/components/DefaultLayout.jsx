import React, { useState, useEffect } from "react";
import { Link, Navigate, Outlet } from "react-router-dom";
import { useStateContext } from "../context/ContextProvider";
import axiosClient from "../axios-client.js";
import { Navbar, Nav, Button } from "react-bootstrap";

export default function DefaultLayout() {
  const { user, token, setUser, setToken, notification } = useStateContext();
  const [navbarCollapsed, setNavbarCollapsed] = useState(false);
  const [linkDestination, setLinkDestination] = useState('');

  const onLogout = (ev) => {
    ev.preventDefault();

    axiosClient.post("/logout").then(() => {
      setUser({});
      setToken(null);
    })
    .catch((error) => {
      console.error("Logout failed:", error);
    });
  };

  useEffect(() => {
    axiosClient.get("/user").then(({ data }) => {
      setUser(data);
      document.body.style.backgroundColor = "lightblue";
    });
  }, []);

  if (!token) {
    return <Navigate to="/login" />;
  }

  const toggleNavbar = () => {
    setNavbarCollapsed(navbarCollapsed ? !navbarCollapsed : navbarCollapsed);
  };

  const onLinkClick = (destination) => {
    if (navbarCollapsed) {
      toggleNavbar();
    }
    setLinkDestination(destination);
  };

  return (
    <div className="defaultLayout">
      <Navbar expand="lg" className="custom-navbar" variant="dark" bg="dark" fluid>
        <div>
          <Navbar.Toggle
            aria-controls="basic-navbar-nav"
            onClick={toggleNavbar}
          />
        </div>
        <Navbar.Collapse id="basic-navbar-nav" className={navbarCollapsed ? "show" : ""}>
          <Nav className="mr-auto">
            <Nav.Item>
              <Nav.Link as={Link} to="/dashboard" onClick={() => onLinkClick('dashboard')} style={{ color: linkDestination === 'dashboard' ? 'white' : 'grey' }}>
                <i className="fa fa-home"></i> Dashboard
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link as={Link} to="/tickets" onClick={() => onLinkClick('tickets')} style={{ color: linkDestination === 'tickets' ? 'white' : 'grey' }}>
                <i className="fa fa-ticket"></i> Tickets
              </Nav.Link>
            </Nav.Item>
            {user.role === "admin" && (
              <>
                <Nav.Item>
                  <Nav.Link as={Link} to="/technicians" onClick={() => onLinkClick('technicians')} style={{ color: linkDestination === 'technicians' ? 'white' : 'grey' }}>
                    <i className="fa fa-users"></i> Technicians
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link as={Link} to="/clients" onClick={() => onLinkClick('clients')} style={{ color: linkDestination === 'clients' ? 'white' : 'grey' }}>
                    <i className="fa fa-user"></i> Clients
                  </Nav.Link>
                </Nav.Item>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
        <div>
          <div className="d-flex align-items-center">
            <div style={{color: "white"}}>
              <>Hello&nbsp;</>
              <b><i><xx-large>{user.name}</xx-large></i></b>&nbsp;&nbsp;
            </div>
            <Button variant="outline-light" style={{ marginRight: "10px" }} onClick={onLogout}>
              Logout
            </Button>
          </div>
        </div>
      </Navbar>
        <div className="container-xl" style={{justifyContent: "center", alignItems: "center"}}>
          <div className="row">
            <div className="col-lg-12 col-md-12 col-sm-4">
              <main>
                <Outlet />
              </main>
              {notification && (
                <div className="notification alert alert-info">{notification}</div>
              )}
            </div>
          </div>
        </div>
      </div>
  );
}
