import {Link, Navigate, Outlet} from "react-router-dom";
import {useStateContext} from "../context/ContextProvider";
import axiosClient from "../axios-client.js";
import {useEffect} from "react";

export default function DefaultLayout() {
  const {user, token, setUser, setToken, notification} = useStateContext();
  if (!token) {
    return <Navigate to="/login"/>
  }

  const onLogout = ev => {
    ev.preventDefault()

    //calls setToken function in ContextProvider with null value

    axiosClient.post('/logout')
      .then(() => {
        setUser({})
        setToken(null)
      })
  }

  useEffect(() => {
    axiosClient.get('/user')
      .then(({data}) => {
         setUser(data)
      })
  }, [])

  return (
    <div id="defaultLayout">
      <aside>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/tickets">Tickets</Link>
        {user.role === "admin" && (
          <>
            <Link to="/technicians">Technicians</Link>
            <Link to="/clients">Clients</Link>
          </>
        )}
      </aside>
      <div className="content">
        <header>
          <div>
            Header
          </div>

          <div>
            Hello <b>{user.name}</b> &nbsp; &nbsp;
            <a onClick={onLogout} className="btn-logout" href="#">Logout</a>
          </div>
        </header>
        <main>
          <Outlet/>
        </main>
        {notification &&
          <div className="notification">
            {notification}
          </div>
        }
      </div>
    </div>
  )
}
