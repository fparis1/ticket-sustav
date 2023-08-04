import React, { useState, useEffect } from "react";
import { Link, Navigate, Outlet } from "react-router-dom";
import { useStateContext } from "../context/ContextProvider";
import axiosClient from "../axios-client.js";
import { Navbar, Nav, Button } from "react-bootstrap";

export default function DefaultLayout() {
  const { user, token, setUser, setToken, notification } = useStateContext();
  const [navbarCollapsed, setNavbarCollapsed] = useState(false);

  if (!token) {
    return <Navigate to="/login" />;
  }

  const onLogout = (ev) => {
    ev.preventDefault();

    axiosClient.post("/logout").then(() => {
      setUser({});
      setToken(null);
    });
  };

  useEffect(() => {
    axiosClient.get("/user").then(({ data }) => {
      setUser(data);
      document.body.style.backgroundColor = "lightblue";
    });
  }, []);

  const toggleNavbar = () => {
    setNavbarCollapsed(navbarCollapsed ? !navbarCollapsed : navbarCollapsed);
  };

  const onLinkClick = () => {
    if (navbarCollapsed) {
      toggleNavbar();
    }
  };

  return (
    <div>
      <Navbar expand="lg" className="custom-navbar" variant="light" bg="lightblue" fluid>
        <div>
          <Navbar.Toggle
            aria-controls="basic-navbar-nav"
            onClick={toggleNavbar}
          />
        </div>
        <Navbar.Collapse id="basic-navbar-nav" className={navbarCollapsed ? "show" : ""}>
          <Nav className="mr-auto">
            <Nav.Item>
              <Nav.Link as={Link} to="/dashboard" onClick={onLinkClick}>
                <i className="fa fa-home"></i> Dashboard
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link as={Link} to="/tickets" onClick={onLinkClick}>
                <i className="fa fa-ticket"></i> Tickets
              </Nav.Link>
            </Nav.Item>
            {user.role === "admin" && (
              <>
                <Nav.Item>
                  <Nav.Link as={Link} to="/technicians" onClick={onLinkClick}>
                    <i className="fa fa-users"></i> Technicians
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link as={Link} to="/clients" onClick={onLinkClick}>
                    <i className="fa fa-user"></i> Clients
                  </Nav.Link>
                </Nav.Item>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
        <div className="my-2 my-lg-0">
          <div className="d-flex align-items-center">
            <span>Hello&nbsp;</span>
            <b>{user.name}</b>&nbsp;&nbsp;
            <Button className="btn btn-secondary btn-md" style={{ marginRight: "10px" }} onClick={onLogout}>
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
