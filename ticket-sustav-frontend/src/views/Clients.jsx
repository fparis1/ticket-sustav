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
  const [currentSortOption, setCurrentSortOption] = useState('id');
  const [currentSortDirection, setCurrentSortDirection] = useState('asc');

  useEffect(() => {
    getClients();
  }, [])

  useEffect(() => {
    if (user) {
      checkRole();
    }
  }, [user]);

  const checkRole = () => {
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

  const getClients = (page = 1, sortBy = 'id', sortDir = 'desc') => {
    setLoading(true);
    axiosClient
      .get(`/clients?page=${page}&sort_by=${sortBy}&sort_dir=${sortDir}`)
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
    getClients(currentPage, currentSortOption, currentSortDirection);
  }, [currentPage, currentSortOption, currentSortDirection]);

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

  const handleSortChange = (option) => {
    if (option === currentSortOption) {
      toggleSortDirection();
    } else {
      setCurrentSortOption(option);
      setCurrentSortDirection('asc');
    }
  };
  
  const toggleSortDirection = () => {
    setCurrentSortDirection((prevDir) => (prevDir === 'asc' ? 'desc' : 'asc'));
  };

  const renderSortButton = (option, displayName) => {
    const isSelected = option === currentSortOption;
    const arrow = isSelected ? (currentSortDirection === 'asc' ? '▲' : '▼') : '';
    const buttonStyle = {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '0',
      fontWeight: 'bold',
    };

    return (
      <th>
        <button style={buttonStyle} onClick={() => handleSortChange(option)}>
          {displayName} {isSelected && arrow}
        </button>
      </th>
    );
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
              {renderSortButton('name', 'Name')}
              {renderSortButton('email', 'Email')}
              {renderSortButton('phone', 'Phone')}
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
