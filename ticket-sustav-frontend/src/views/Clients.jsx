import {useEffect, useState} from "react";
import axiosClient from "../axios-client.js";
import {Link, useNavigate} from "react-router-dom";
import {useStateContext} from "../context/ContextProvider.jsx";

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const {setNotification} = useStateContext();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const {user} = useStateContext();
  const navigate = useNavigate();

  useEffect(() => {
    getClients();
  }, [])

  useEffect(() => {
    debugger;
    if (user) {
      checkRole();
    }
  }, [user]);

  const checkRole = () => {
    debugger;
    if (user.role === "tech") {
      navigate('/dashboard');
    }
  };

  const onDeleteClick = client => {
    if (!window.confirm("Are you sure you want to delete this client?")) {
      return
    }
    axiosClient.delete(`/clients/${client.id}`)
      .then(() => {
        setNotification('Client was successfully deleted')
        getClients()
      })
  }

  const getClients = (page = 1) => {
    setLoading(true);
    axiosClient
      .get(`/clients?page=${page}`)
      .then(({ data }) => {
        setLoading(false);
        setClients(data.data);
        setTotalPages(data.meta.last_page);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    getClients(currentPage);
  }, [currentPage]);

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div>
      <div style={{display: 'flex', justifyContent: "space-between", alignItems: "center"}}>
        <h1>Clients</h1>
        <Link className="btn-add" to="/clients/new">Add new client</Link>
      </div>
      <div className="card animated fadeInDown">
        <table>
          <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Actions</th>
          </tr>
          </thead>
          {loading &&
            <tbody>
            <tr>
              <td colSpan="5" class="text-center">
                Loading...
              </td>
            </tr>
            </tbody>
          }
          {!loading &&
            <tbody>
            {clients.map(c => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.name}</td>
                <td>{c.email}</td>
                <td>{c.phone}</td>
                <td>
                  <Link className="btn-edit" to={'/clients/' + c.id}>Edit</Link>
                  &nbsp;
                  <button className="btn-delete" onClick={ev => onDeleteClick(c)}>Delete</button>
                </td>
              </tr>
            ))}
            </tbody>
          }
        </table>
        {totalPages > 1 &&
        <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
          <button onClick={goToPreviousPage} disabled={currentPage === 1}>
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
            <button
              key={pageNumber}
              onClick={() => goToPage(pageNumber)}
              disabled={currentPage === pageNumber}
            >
              {pageNumber}
            </button>
          ))}
          <button onClick={goToNextPage} disabled={currentPage === totalPages}>
            Next
          </button>
        </div>
        }
      </div>
    </div>
  )
}
