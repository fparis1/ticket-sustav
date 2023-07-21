import React, { useState } from "react";
import axiosClient from "../axios-client.js";
import Modal from "react-modal";

export default function NewClientForm({ isOpen, onClose, onCreateClient, showTicketButton }) {
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    email: "",
    phone: "",
    // Add any other necessary client data
  });

  const handleFormSubmit = (ev) => {
    ev.preventDefault();
    axiosClient
      .post("/clients", formData)
      .then(({ data }) => {
        onCreateClient(data.data); // Notify the parent component about the newly created client
        setFormData({ name: "", email: "", phone: "" }); // Reset the form data
        onClose(); // Close the modal
      })
      .catch((error) => {
        console.error("Error creating a new client: ", error);
        // Handle error if necessary
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
    <Modal isOpen={isOpen} onRequestClose={onClose} contentLabel="New Client Form">
      <h2>Create New Client</h2>
      <form>
        <div>
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label htmlFor="phone">Phone:</label>
          <input
            type="phone"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            required
          />
        </div>
        {/* Add any other necessary client form fields here */}
        <button type="button" onClick={handleFormSubmit}>Create Client</button>
        <button type="button" onClick={onClose}>
          Cancel
        </button>
        {showTicketButton && (
          <button type="button" onClick={() => console.log("Save Ticket")}>
            Save Ticket
          </button>
        )}
      </form>
    </Modal>
  );
}
