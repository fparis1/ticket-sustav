import {useEffect, useState} from "react";
import axiosClient from "../axios-client.js";
import {Link} from "react-router-dom";
import {useStateContext} from "../context/ContextProvider.jsx";

export default function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const {setNotification} = useStateContext()

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
        getTickets()
      })
  }

  const getTickets = () => {
    setLoading(true)
    axiosClient.get('/tickets')
      .then(({ data }) => {
        setLoading(false)
        setTickets(data.data)
      })
      .catch(() => {
        setLoading(false)
      })
  }

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
            {tickets.map(t => (
              <tr key={t.id}>
                <td>{t.id}</td>
                <td>{t.name}</td>
                <td>{t.description}</td>
                <td>{t.status}</td>
                <td>
                  <Link className="btn-edit" to={'/tickets/' + t.id}>Edit</Link>
                  &nbsp;
                  <button className="btn-delete" onClick={ev => onDeleteClick(t)}>Delete</button>
                </td>
              </tr>
            ))}
            </tbody>
          }
        </table>
      </div>
    </div>
  )
}
