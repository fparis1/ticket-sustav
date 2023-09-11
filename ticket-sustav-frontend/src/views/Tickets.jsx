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

  const fetchTechnicians = async () => {
    let allTechnicians = {};
  
    try {
      const { data: firstPageData } = await axiosClient.get(`/technicians?page=1`);
      const totalPages = firstPageData.meta.last_page;
  
      for (let page = 1; page <= totalPages; page++) {
        const { data } = await axiosClient.get(`/technicians?page=${page}`);
  
        const techniciansData = data.data.reduce((acc, technician) => {
          acc[technician.id] = technician;
          return acc;
        }, {});
  
        allTechnicians = { ...allTechnicians, ...techniciansData };
      }
  
      setTechnicians(allTechnicians);
      debugger;
    } catch (error) {
    }
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
    fetchTechnicians();
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
    <Container className="container-style">
      <div className="header-style">
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
                    <Link className="btn btn-primary actions-link" to={'/tickets/' + t.id + '/' + t.id}>Show</Link>
                    &nbsp;
                    {t.status !== 'closed' &&
                      <Link className="btn btn-warning actions-link" to={'/tickets/' + t.id}>Edit</Link>
                    }
                    &nbsp;
                    {user.role === "admin" &&
                      <Button className="btn btn-danger actions-link" onClick={ev => onDeleteClick(t)}>Delete</Button>
                    }
                  </td>
                  <td>
                    <Link
                      className="btn btn-success actions-link"
                      id="subtask"
                      to={'/subtasks/' + t.id}
                      style={{ pointerEvents: t.status === 'closed' ? 'none' : 'auto'}}
                      disabled={t.status === 'closed'}
                    >
                      Subtasks
                    </Link>
                  </td>
                  <td>
                    <Link className="btn btn-info actions-link" to={'/comments/' + t.id}>Comment</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          }
        </Table>
        {totalPages > 1 &&
          <div className="pagination">
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
