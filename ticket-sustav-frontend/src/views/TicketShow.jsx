import {useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import axiosClient from "../axios-client.js";
import {useStateContext} from "../context/ContextProvider.jsx";
import { Form, FormGroup, FormControl, Button, Card, Spinner, Alert, Dropdown } from "react-bootstrap";
import "../index.css";

export default function TicketForm() {
  let {id} = useParams();
  const [ticket, setTicket] = useState({
    id: '',
    name: '',
    description: '',
    status: '',
    client_id: '',
    technician_id: '',
  })

  const [client, setClient] = useState({})
  const [technician, setTechnician] = useState({})
  const [errors, setErrors] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchClient = (cl_id) => {
    axiosClient
      .get(`/clients/${cl_id}`)
      .then(({ data }) => {
        setClient(data);
        console.log(data);
      })
      .catch((error) => {
        console.error("Error fetching clients: ", error);
      });
  };

  const fetchTechnician = (techIds) => {
    if (!techIds || techIds.length === 0) {
      setTechnician([]);
      return;
    }
  
    const fetchTechniciansPromises = techIds.map((tech_id) => {
      return axiosClient
        .get(`/users/${tech_id}`)
        .then(({ data }) => data)
        .catch((error) => {
          console.error("Error fetching technician with ID ", tech_id, ": ", error);
          return null;
        });
    });
  
    Promise.all(fetchTechniciansPromises)
      .then((technicians) => {
        const filteredTechnicians = technicians.filter((tech) => tech !== null);
        setTechnician(filteredTechnicians);
      })
      .catch((error) => {
        console.error("Error fetching technicians: ", error);
      });
  };

  if (id) {
    useEffect(() => {
      setLoading(true)
      axiosClient.get(`/tickets/${id}`)
        .then(({data}) => {
          setLoading(false)
          setTicket(data)
          debugger;
          if (data.technician_id !== '-') {
            fetchTechnician(Array.isArray(data.technician_id) ? data.technician_id : [data.technician_id]);
          } else {
            setTechnician([]);
          }
          fetchClient(data.client_id);
        })
        .catch(() => {
          setLoading(false)
        })
    }, [id])
  }

  return (
    <>
      <h1 className='custom'>Ticket info</h1>
      <Card className="animated fadeInDown">
        {loading && (
          <div className="text-center">
            <Spinner animation="border" />
            Loading...
          </div>
        )}
        {errors && (
          <div className="alert">
            <Alert variant="danger">
              {Object.keys(errors).map((key) => (
                <p key={key}>{errors[key][0]}</p>
              ))}
            </Alert>
          </div>
        )}
        <Form className="show-container">
          <FormGroup className="show-container">
            <Form.Label>Ticket name:</Form.Label>
            <FormControl value={ticket.name} readOnly />
          </FormGroup>
          <FormGroup className="show-container">
            <Form.Label>Ticket description:</Form.Label>
            <FormControl value={ticket.description} readOnly />
          </FormGroup>
          <FormGroup className="show-container">
            <Form.Label>Ticket status:</Form.Label>
            <FormControl value={ticket.status} readOnly />
          </FormGroup>
          <FormGroup className="show-container">
            <Form.Label>Client name:</Form.Label>
            <FormControl value={client.name} readOnly />
          </FormGroup>
          {technician.length > 0 && (
            <FormGroup className="show-container">
              <Form.Label>Technician(s) name:</Form.Label>
              {technician.map((tech) => (
                <FormControl key={tech.id} value={tech.name} readOnly />
              ))}
            </FormGroup>
          )}
        </Form>
      </Card>
    </>
  )
}
