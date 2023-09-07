import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axiosClient from "../axios-client.js";
import { useStateContext } from "../context/ContextProvider.jsx";
import Select from 'react-select';
import NewClientForm from "./NewClientForm";
import { Form, Button, Container, Row, Col } from 'react-bootstrap';

export default function TicketForm() {
  const navigate = useNavigate();
  let { id } = useParams();
  const [ticket, setTicket] = useState({
    id: '',
    name: '',
    description: '',
    status: '',
    client_id: '',
    technician_id: [],
  });

  const [clients, setClients] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [errors, setErrors] = useState(null)
  const [loading, setLoading] = useState(false)
  const { user, setNotification } = useStateContext();
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
        .get("/technicians", {
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
        .then(({ data }) => {
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

  const statusOptions = [
    ...((!ticket.id || user.role === 'admin') ? [{ value: 'open', label: 'open' }] : []),
    { value: 'taken', label: 'taken' },
    ...(ticket.id && (ticket.technician_id.includes(user.id) || user.role === 'admin') ? [{ value: 'closed', label: 'closed' }] : []),
  ];

  const clientOptions = clients.map((client) => ({
    value: client.id.toString(),
    label: client.name,
  }));

  const technicianOptions = technicians.map((technician) => ({
    value: technician.id,
    label: technician.name,
  }));

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
    <Container className="form-container">
      {ticket.id && <h1 className='custom'>Update Ticket: {ticket.name}</h1>}
      {!ticket.id && <h1 className='custom'>New Ticket</h1>}
      <div className="card animated fadeInDown">
        {loading && (
          <div className="text-center">
            Loading...
          </div>
        )}
        {errors &&
          <div class="alert alert-danger" role="alert">
            {Object.keys(errors).map(key => (
              <p key={key}>{errors[key][0]}</p>
            ))}
          </div>
        }
        {!loading && (
          <Form onSubmit={onSubmit}>
            <Row>
              <Col>
                <Form.Group>
                  <Form.Label>Ticket name:</Form.Label>
                  <Form.Control
                    value={ticket.name}
                    onChange={ev => setTicket({ ...ticket, name: ev.target.value })}
                    placeholder="Name"
                    disabled={user.role === "tech"}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col>
                <Form.Group controlId="ticketDescription">
                  <Form.Label>Ticket description:</Form.Label>
                  <Form.Control
                    value={ticket.description}
                    onChange={ev => setTicket({ ...ticket, description: ev.target.value })}
                    placeholder="Description"
                    disabled={user.role === "tech"}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col>
                <Form.Group controlId="ticketStatus">
                  <Form.Label>Ticket status:</Form.Label>
                  <Select
                    value={statusOptions.find(option => option.value === ticket.status)}
                    options={statusOptions}
                    onChange={selectedOption => {
                      const selectedStatus = selectedOption.value;
                      if (selectedStatus === 'open') {
                        setTicket({ ...ticket, status: selectedStatus, technician_id: ['-'] });
                      } else if (selectedStatus === 'taken') {
                        if (user.role === 'admin') {
                          setTicket({ ...ticket, status: selectedStatus, technician_id: '' });
                        } else {
                          setTicket({ ...ticket, status: selectedStatus, technician_id: [user.id] });
                        }
                      } else {
                        setTicket({ ...ticket, status: selectedStatus });
                      }
                    }}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              {user.role === "admin" && (
                <Col md={6}>
                  <Button type="button" onClick={toggleClientForm} className="mb-3">
                    Create New Client
                  </Button>
                </Col>
              )}
            </Row>
            <Row>
              <Col>
                <NewClientForm
                  isOpen={isModalOpen}
                  onClose={toggleClientForm}
                  onCreateClient={handleNewClientCreate}
                />
                <Form.Group controlId="ticketClient">
                  <Form.Label>Client name:</Form.Label>
                  <Select
                    value={clientOptions.find((option) => option.value === ticket.client_id)}
                    options={clientOptions}
                    onChange={(selectedOption) =>
                      setTicket({ ...ticket, client_id: '' + selectedOption.value })
                    }
                    isDisabled={user.role === 'tech'}
                    placeholder={!ticket.client_id ? 'Select a client' : undefined}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              {ticket.status !== 'open' && ticket.status !== '' && user.role === "admin" && (
                <Col>
                  <Form.Group controlId="ticketTechnician">
                    <Form.Label>Technicians:</Form.Label>
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
                  </Form.Group>
                </Col>
              )}
            </Row>
            <Row>
              <Col>
                <Button className="btn btn-success" type="submit">
                  {ticket.id && <>Save</>}
                  {!ticket.id && <>Create</>}
                </Button>
              </Col>
            </Row>
          </Form>
        )}
      </div>
    </Container>
  )
}
