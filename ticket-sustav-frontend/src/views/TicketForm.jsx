import {useNavigate, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import axiosClient from "../axios-client.js";
import {useStateContext} from "../context/ContextProvider.jsx";
import Modal from "react-modal";
import NewClientForm from "./NewClientForm";

export default function TicketForm() {
  const navigate = useNavigate();
  let {id} = useParams();
  const [ticket, setTicket] = useState({
    id: '',
    name: '',
    description: '',
    status: '',
    client_id: '',
    technician_id: '',
  })

  const [clients, setClients] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [errors, setErrors] = useState(null)
  const [loading, setLoading] = useState(false)
  const {setNotification} = useStateContext();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleClientForm = () => {
    setIsModalOpen(!isModalOpen);
  };

  // Function to fetch all clients
  const fetchAllClients = () => {
    axiosClient
      .get("/clients")
      .then(({ data }) => {
        setClients(data.data);
      })
      .catch((error) => {
        console.error("Error fetching clients: ", error);
      });
  };

  const fetchAllTechnicians = () => {
    axiosClient
      .get("/users") // Update the API endpoint to the appropriate URL for fetching clients
      .then(({ data }) => {
        // Assuming the response data is an array of client objects
        setTechnicians(data.data);
        // Save the clients in a variable or context, e.g., setClients(data) or update the context state with the fetched data.
      })
      .catch((error) => {
        console.error("Error fetching clients: ", error);
        // Handle error if necessary
      });
  };

  if (id) {
    useEffect(() => {
      setLoading(true)
      axiosClient.get(`/tickets/${id}`)
        .then(({data}) => {
          setLoading(false)
          setTicket(data)
        })
        .catch(() => {
          setLoading(false)
        })
    }, [])
  }

  const onSubmit = ev => {
    ev.preventDefault()
    if (ticket.id) {
      axiosClient.put(`/tickets/${ticket.id}`, ticket)
        .then(() => {
          setNotification('Ticket was successfully updated')
          navigate('/tickets')
        })
        .catch(err => {
          const response = err.response;
          if (response && response.status === 422) {
            setErrors(response.data.errors)
          }
        })
    } else {
      axiosClient.post('/tickets', ticket)
        .then(() => {
          setNotification('Ticket was successfully created')
          navigate('/tickets')
        })
        .catch(err => {
          const response = err.response;
          if (response && response.status === 422) {
            setErrors(response.data.errors)
          }
        })
    }
  }

  const handleNewClientCreate = () => {
    fetchAllClients();
    setNotification("New client was successfully created");
  };

  useEffect(() => {
    fetchAllTechnicians();
    fetchAllClients();
  }, []);

  return (
    <>
      {ticket.id && <h1>Update Ticket: {ticket.name}</h1>}
      {!ticket.id && <h1>New Ticket</h1>}
      <div className="card animated fadeInDown">
        {loading && (
          <div className="text-center">
            Loading...
          </div>
        )}
        {errors &&
          <div className="alert">
            {Object.keys(errors).map(key => (
              <p key={key}>{errors[key][0]}</p>
            ))}
          </div>
        }
        {!loading && (
          <form onSubmit={onSubmit}>
            <input value={ticket.name} onChange={ev => setTicket({...ticket, name: ev.target.value})} placeholder="Name"/>
            <input value={ticket.description} onChange={ev => setTicket({...ticket, description: ev.target.value})} placeholder="Description"/>
            {/*<input value={ticket.status} onChange={ev => setTicket({...ticket, status: ev.target.value})} placeholder="Status"/>*/}

            <select
              value={ticket.status}
              onChange={ev => {
                const selectedStatus = ev.target.value;
                // If the selected status is "open", set the technician_id to '-'
                if (selectedStatus === 'open') {
                  setTicket({ ...ticket, status: selectedStatus, technician_id: '-' });
                } else {
                  setTicket({ ...ticket, status: selectedStatus });
                }
              }}
            >
              {!ticket.status && <option value="">Select a status</option>}
                <option key="open" value="open">
                  open
                </option>
                <option key="taken" value="taken">
                  taken
                </option>
                {ticket.id && 
                <option key="closed" value="closed">
                  closed
                </option>}
            </select>
            <button type="button" onClick={toggleClientForm}>
              Create New Client
            </button>
            <br/><br/>
            <NewClientForm
              isOpen={isModalOpen}
              onClose={toggleClientForm}
              onCreateClient={handleNewClientCreate}
            />
            <select value={ticket.client_id} onChange={ev => setTicket({...ticket, client_id: ev.target.value})}>
              {!ticket.client_id && <option value="">Select a client</option>}
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
            {ticket.status !== 'open' && ticket.status !== '' && ( // Only show the technician select element when the status is not "open"
              <select
                value={ticket.technician_id}
                onChange={ev => setTicket({ ...ticket, technician_id: ev.target.value })}
              >
                {!ticket.technician_id && <option value="">Select a technician</option>}
                {technicians.map((technician) => (
                  <option key={technician.id} value={technician.id}>
                    {technician.name}
                  </option>
                ))}
              </select>
            )}
            <button className="btn">Save</button>
          </form>
        )}
      </div>
    </>
  )
}
