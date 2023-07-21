import {useEffect, useState} from "react";
import axiosClient from "../axios-client.js";
import {Link} from "react-router-dom";
import {useStateContext} from "../context/ContextProvider.jsx";

export default function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const {setNotification} = useStateContext();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    getTickets();
  }, [])

  const onDeleteClick = ticket => {
    if (!window.confirm("Are you sure you want to delete this ticket?")) {
      return
    }
    axiosClient.delete(`/tickets/${ticket.id}`)
      .then(() => {
        setNotification('Ticket was successfully deleted')
        const ticketsOnCurrentPage = tickets.filter(t => t.id !== ticket.id);
        if (ticketsOnCurrentPage.length === 0 && currentPage > 1) {
          // Redirect to the previous page
          setCurrentPage(currentPage - 1);
        } else {
          getTickets({ currentPage });
        }
      })
  }

  const getTickets = (page) => {
    setLoading(true)
    axiosClient.get(`/tickets?page=${page}`)
      .then(({ data }) => {
        setLoading(false);
        setTickets(data.data);
        setTotalPages(data.meta.last_page);
      })
      .catch(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    getTickets(currentPage);
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
        <h1>Tickets</h1>
        <Link className="btn-add" to="/tickets/new">Add new ticket</Link>
      </div>
      <div className="card animated fadeInDown">
        <table>
          <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Description</th>
            <th>Status</th>
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
            {tickets.length === 0 && <p>No tickets</p>}
            {tickets.map(t => (
              <tr key={t.id}>
                <td>{t.id}</td>
                <td>{t.name}</td>
                <td>{t.description}</td>
                <td>{t.status}</td>
                <td>
                  {t.status !== 'closed' &&
                  <Link className="btn-edit" to={'/tickets/' + t.id}>Edit</Link>
                  }
                  &nbsp;
                  <button className="btn-delete" onClick={ev => onDeleteClick(t)}>Delete</button>
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
