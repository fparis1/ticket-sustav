import {useNavigate, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import axiosClient from "../axios-client.js";
import {useStateContext} from "../context/ContextProvider.jsx";
import { Form, Button, Card, Spinner, Alert, Row, Col, Container } from "react-bootstrap";

export default function ClientForm() {
  const navigate = useNavigate();
  let {id} = useParams();
  const [client, setClient] = useState({
    id: null,
    name: '',
    email: '',
    phone: ''
  })
  const [errors, setErrors] = useState(null)
  const [loading, setLoading] = useState(false)
  const {setNotification} = useStateContext()
  const {user} = useStateContext()

  if (id) {
    useEffect(() => {
      setLoading(true)
      axiosClient.get(`/clients/${id}`)
        .then(({data}) => {
          setLoading(false)
          setClient(data)
        })
        .catch(() => {
          setLoading(false)
        })
    }, [])
  }

  const onSubmit = ev => {
    ev.preventDefault()
    if (client.id) {
      axiosClient.put(`/clients/${client.id}`, client)
        .then(() => {
          setNotification('Client was successfully updated')
          navigate('/clients')
        })
        .catch(err => {
          const response = err.response;
          if (response && response.status === 422) {
            setErrors(response.data.errors)
          }
        })
    } else {
      axiosClient.post('/clients', client)
        .then(() => {
          setNotification('Client was successfully created')
          navigate('/clients')
        })
        .catch(err => {
          const response = err.response;
          if (response && response.status === 422) {
            setErrors(response.data.errors)
          }
        })
    }
  }

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

  return (
    <Container className="form-container">
      {client.id && <h1>Update Client: {client.name}</h1>}
      {!client.id && <h1>New Client</h1>}
      <Card className="animated fadeInDown">
        {loading && (
          <div className="text-center">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        )}
        {errors && (
          <Alert variant="danger">
            {Object.keys(errors).map((key) => (
              <p key={key}>{errors[key][0]}</p>
            ))}
          </Alert>
        )}
        {!loading && (
          <Form onSubmit={onSubmit}>
            <Row>
              <Col>
                <Form.Group controlId="name">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={client.name}
                    onChange={(ev) =>
                      setClient({ ...client, name: ev.target.value })
                    }
                    placeholder="Name"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col>
                <Form.Group controlId="email">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={client.email}
                    onChange={(ev) =>
                      setClient({ ...client, email: ev.target.value })
                    }
                    placeholder="Email"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col>
                <Form.Group controlId="phone">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    type="text"
                    value={client.phone}
                    onChange={(ev) =>
                      setClient({ ...client, phone: ev.target.value })
                    }
                    placeholder="Phone"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Button className="btn" type="submit" style={{margin: "30px"}}>
              Save
            </Button>
          </Form>
        )}
      </Card>
    </Container>
  )
}
