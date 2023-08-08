import {useEffect, useState} from "react";
import axiosClient from "../axios-client.js";
import {Link} from "react-router-dom";
import {useStateContext} from "../context/ContextProvider.jsx";
import { Container, Table, Button } from "react-bootstrap";

export default function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const {user, setNotification} = useStateContext();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [technicians, setTechnicians] = useState({});
  const [currentSortOption, setCurrentSortOption] = useState('id');
  const [currentSortDirection, setCurrentSortDirection] = useState('asc');

  const fetchTechnicians = (page = 1, allTechnicians = {}) => {
    axiosClient
      .get(`/technicians?page=${page}`)
      .then(({ data }) => {
        const techniciansData = data.data.reduce((acc, technician) => {
          acc[technician.id] = technician;
          return acc;
        }, {});
  
        const mergedTechnicians = { ...allTechnicians, ...techniciansData };
  
        if (data.meta.current_page < data.meta.last_page) {
          fetchTechnicians(page + 1, mergedTechnicians);
        } else {
          setTechnicians(mergedTechnicians);
        }
      })
      .catch(() => {
      });
  };

  const onDeleteClick = ticket => {
    if (!window.confirm("Are you sure you want to delete this ticket?")) {
      return
    }
    axiosClient.delete(`/tickets/${ticket.id}`)
    axiosClient.delete(`/comments/${ticket.id}`)
    axiosClient.delete(`/subtasks/${ticket.id}`)
      .then(() => {
        setNotification('Ticket was successfully deleted')
        const ticketsOnCurrentPage = tickets.filter(t => t.id !== ticket.id);
        if (ticketsOnCurrentPage.length === 0 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } else {
          getTickets({ currentPage });
        }
      })
  }

  const getTickets = (page, sortBy, sortDir) => {
    setLoading(true);
    axiosClient
      .get(`/tickets?page=${page}&sort_by=${sortBy}&sort_dir=${sortDir}`)
      .then(({ data }) => {
        setLoading(false);
        setTickets(data.data);
        setTotalPages(data.meta.last_page);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    getTickets(currentPage, currentSortOption, currentSortDirection);
    fetchTechnicians(1);
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
    <Container style={{marginTop : "10px"}}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom : "10px"}}>
        <h1 className='custom'>Tickets</h1>
        {user.role === "admin" && <Link className="btn btn-primary" to="/tickets/new">Add new ticket</Link>}
      </div>
      <div className="card animated fadeInDown">
        <Table responsive striped bordered hover>
          <thead>
            <tr>
              {renderSortButton('name', 'Name')}
              {renderSortButton('description', 'Description')}
              {renderSortButton('status', 'Status')}
              {renderSortButton('technician_id', 'Technician(s)')}
              <th>Actions</th>
              <th>Subtasks</th>
              <th>Comments</th>
            </tr>
          </thead>
          {loading &&
            <tbody>
              <tr>
                <td colSpan="5" className="text-center">
                  Loading...
                </td>
              </tr>
            </tbody>
          }
          {!loading &&
            <tbody>
              {tickets.length === 0 && <p>No tickets</p>}
              {tickets.map(t => (
                <tr key={t.id}>
                  <td>{t.name}</td>
                  <td>{t.description}</td>
                  <td>{t.status}</td>
                  <td>
                    {t.technician_id.map((techId) => (
                      <span key={techId}>
                        {technicians[techId]?.name || "-"}
                        <br />
                      </span>
                    ))}
                  </td>
                  <td>
                    <Link style={{marginBottom : "2px", marginTop : "2px"}} className="btn btn-primary" id="show" to={'/tickets/' + t.id + '/' + t.id}>Show</Link>
                    &nbsp;
                    {t.status !== 'closed' &&
                      <Link style={{marginBottom : "2px", marginTop : "2px"}} className="btn btn-warning" to={'/tickets/' + t.id}>Edit</Link>
                    }
                    &nbsp;
                    {user.role === "admin" &&
                      <Button style={{marginBottom : "2px", marginTop : "2px"}} className="btn btn-danger" onClick={ev => onDeleteClick(t)}>Delete</Button>
                    }
                  </td>
                  <td>
                    <Link
                      className="btn btn-success"
                      id="subtask"
                      to={'/subtasks/' + t.id}
                      style={{ pointerEvents: t.status === 'closed' ? 'none' : 'auto', marginBottom : "2px", marginTop : "2px"}}
                      disabled={t.status === 'closed'}
                    >
                      Subtasks
                    </Link>
                  </td>
                  <td>
                    <Link style={{marginBottom : "2px", marginTop : "2px"}} className="btn btn-info" id="comment" to={'/comments/' + t.id}>Comment</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          }
        </Table>
        {totalPages > 1 &&
          <div style={{ display: "flex", justifyContent: "center", marginTop: "10px", marginBottom: "20px" }}>
            <Button onClick={goToPreviousPage} disabled={currentPage === 1}>
              Previous
            </Button>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
              <Button
                key={pageNumber}
                onClick={() => goToPage(pageNumber)}
                disabled={currentPage === pageNumber}
              >
                {pageNumber}
              </Button>
            ))}
            <Button onClick={goToNextPage} disabled={currentPage === totalPages}>
              Next
            </Button>
          </div>
        }
      </div>
      <br/>
    </Container>
  )
}
