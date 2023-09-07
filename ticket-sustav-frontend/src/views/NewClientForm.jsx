import React, { useState } from "react";
import axiosClient from "../axios-client.js";
import { Modal, Form, Button } from "react-bootstrap";

export default function NewClientForm({ isOpen, onClose, onCreateClient, showTicketButton }) {
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    email: "",
    phone: "",
  });

  const handleFormSubmit = (ev) => {
    ev.preventDefault();
    axiosClient
      .post("/clients", formData)
      .then(({ data }) => {
        onCreateClient(data.data); 
        setFormData({ name: "", email: "", phone: "" });
        onClose();
      })
      .catch((error) => {
        console.error("Error creating a new client: ", error);
      });
  };

  const handleInputChange = (ev) => {
    const { name, value } = ev.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  return (
    <Modal show={isOpen} onHide={onClose} contentLabel="New Client Form">
      <Modal.Header closeButton>
        <Modal.Title>Create New Client</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="name">
            <Form.Label>Name:</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </Form.Group>
          <Form.Group controlId="email">
            <Form.Label>Email:</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </Form.Group>
          <Form.Group controlId="phone">
            <Form.Label>Phone:</Form.Label>
            <Form.Control
              type="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
            />
          </Form.Group>
          <Button variant="success" type="button" onClick={handleFormSubmit} className="container-style client-style">Create Client</Button>
          <Button variant="danger" onClick={onClose} className="container-style">Cancel</Button>
          {showTicketButton && (
            <Button variant="info" onClick={() => console.log("Save Ticket")}>
              Save Ticket
            </Button>
          )}
        </Form>
      </Modal.Body>
    </Modal>
  );
}
