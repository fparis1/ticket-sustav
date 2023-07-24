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
  const {user, setNotification} = useStateContext();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleClientForm = () => {
    setIsModalOpen(!isModalOpen);
  };

 // Function to fetch all clients
 const fetchAllClients = () => {
  const allClients = []; // Initialize an array to store all clients

  // Recursive function to fetch clients from each page
  const fetchClientsByPage = (page) => {
    axiosClient
      .get("/clients", {
        params: {
          page, // Pass the current page as a query parameter
        },
      })
      .then(({ data }) => {
        const { data: clients, meta } = data;
        allClients.push(...clients); // Add the fetched clients to the array

        // Check if there are more pages and recursively fetch them if needed
        if (meta.current_page < meta.last_page) {
          fetchClientsByPage(meta.current_page + 1);
        } else {
          setClients(allClients); // Set the complete array of clients once all pages are fetched
        }
      })
      .catch((error) => {
        console.error("Error fetching clients: ", error);
      });
  };

  // Start fetching clients from the first page
  fetchClientsByPage(1);
};

const fetchAllTechnicians = () => {
  const allTechnicians = []; // Initialize an array to store all technicians

  // Recursive function to fetch technicians from each page
  const fetchTechniciansByPage = (page) => {
    axiosClient
      .get("/users", {
        params: {
          page, // Pass the current page as a query parameter
        },
      })
      .then(({ data }) => {
        const { data: technicians, meta } = data;
        allTechnicians.push(...technicians); // Add the fetched technicians to the array

        // Check if there are more pages and recursively fetch them if needed
        if (meta.current_page < meta.last_page) {
          fetchTechniciansByPage(meta.current_page + 1);
        } else {
          setTechnicians(allTechnicians); // Set the complete array of technicians once all pages are fetched
        }
      })
      .catch((error) => {
        console.error("Error fetching technicians: ", error);
      });
  };

  // Start fetching technicians from the first page
  fetchTechniciansByPage(1);
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
            Ticket name:
            <input value={ticket.name} onChange={ev => setTicket({...ticket, name: ev.target.value})} placeholder="Name" disabled={user.role === "tech"}/>
            Ticket description:
            <input value={ticket.description} onChange={ev => setTicket({...ticket, description: ev.target.value})} placeholder="Description" disabled={user.role === "tech"}/>
            Ticket status:
            <select
              value={ticket.status}
              onChange={ev => {
                const selectedStatus = ev.target.value;
                // If the selected status is "open", set the technician_id to ''
                // If the selected status is "taken", reset the technician_id to an empty value (show the technician select element)
                if (selectedStatus === 'open') {
                  setTicket({ ...ticket, status: selectedStatus, technician_id: '-' });
                } else if (selectedStatus === 'taken') {
                  if (user.role === 'admin') {
                    setTicket({ ...ticket, status: selectedStatus, technician_id: '' });
                  }
                  else {
                    setTicket({ ...ticket, status: selectedStatus, technician_id: '' + user.id });
                  }
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
              {ticket.id && (
                <option key="closed" value="closed">
                  closed
                </option>
              )}
            </select>
            {user.role === "admin" && 
            <button type="button" onClick={toggleClientForm}>
              Create New Client
            </button>}
            {user.role === "admin" && <br/>}
            {user.role === "admin" && <br/>}
            <NewClientForm
              isOpen={isModalOpen}
              onClose={toggleClientForm}
              onCreateClient={handleNewClientCreate}
            />
            Client name:
            <select value={ticket.client_id} onChange={ev => setTicket({...ticket, client_id: ev.target.value})} disabled={user.role === "tech"}>
              {!ticket.client_id && <option value="">Select a client</option>}
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
            {ticket.status !== 'open' && ticket.status !== '' && user.role === "admin" && <p>Technician name:</p>}
            {ticket.status !== 'open' && ticket.status !== '' && user.role === "admin" && ( // Only show the technician select element when the status is not "open"
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
