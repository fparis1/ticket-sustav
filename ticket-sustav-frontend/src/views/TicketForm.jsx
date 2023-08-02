import {useNavigate, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import axiosClient from "../axios-client.js";
import {useStateContext} from "../context/ContextProvider.jsx";
import Modal from "react-modal";
import Select from 'react-select';
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
    technician_id: [],
  })

  const [clients, setClients] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [errors, setErrors] = useState(null)
  const [loading, setLoading] = useState(false)
  const {user, setNotification} = useStateContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTechnicians, setSelectedTechnicians] = useState([]);

  const toggleClientForm = () => {
    setIsModalOpen(!isModalOpen);
  };

 const fetchAllClients = () => {
  const allClients = []; 

  const fetchClientsByPage = (page) => {
    axiosClient
      .get("/clients", {
        params: {
          page, 
        },
      })
      .then(({ data }) => {
        const { data: clients, meta } = data;
        allClients.push(...clients); 

        if (meta.current_page < meta.last_page) {
          fetchClientsByPage(meta.current_page + 1);
        } else {
          setClients(allClients);
        }
      })
      .catch((error) => {
        console.error("Error fetching clients: ", error);
      });
  };

  fetchClientsByPage(1);
};

const fetchAllTechnicians = () => {
  const allTechnicians = []; 

  const fetchTechniciansByPage = (page) => {
    axiosClient
      .get("/users", {
        params: {
          page, 
        },
      })
      .then(({ data }) => {
        const { data: technicians, meta } = data;
        allTechnicians.push(...technicians); 

        if (meta.current_page < meta.last_page) {
          fetchTechniciansByPage(meta.current_page + 1);
        } else {
          setTechnicians(allTechnicians);
        }
      })
      .catch((error) => {
        console.error("Error fetching technicians: ", error);
      });
  };

  fetchTechniciansByPage(1);
  };

  if (id) {
    useEffect(() => {
      setLoading(true)
      axiosClient.get(`/tickets/${id}`)
        .then(({data}) => {
          //debugger;
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

  const technicianOptions = technicians.map((technician) => ({
    value: technician.id,
    label: technician.name,
  }));
  
  // Function to check if a technician is selected based on their ID
  const isTechnicianSelected = (technicianId) =>
    ticket.technician_id.includes(technicianId);

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
                if (selectedStatus === 'open') {
                  setTicket({ ...ticket, status: selectedStatus, technician_id: ['-'] });
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
            {ticket.status !== 'open' && ticket.status !== '' && user.role === "admin" && (
              <div>
                <p>Technicians name:</p>
                <Select
                  className="select-container"
                  isMulti
                  placeholder="Select technician(s)"
                  options={technicianOptions}
                  value={technicianOptions.filter((technician) =>
                    isTechnicianSelected(technician.value)
                  )}
                  onChange={(selectedOptions) => {
                    const selectedTechnicians = selectedOptions.map((option) => option.value);
                    setTicket({ ...ticket, technician_id: selectedTechnicians });
                  }}
                />
              </div>
            )}
            <button className="btn">Save</button>
          </form>
        )}
      </div>
    </>
  )
}
