import { useEffect, useState } from "react";
import axiosClient from "../axios-client.js";
import { Link, useParams } from "react-router-dom";
import { useStateContext } from "../context/ContextProvider.jsx";
import ProgressBar from "@ramonak/react-progress-bar";
import { Table, Form, Button, Modal } from "react-bootstrap";
import Select from "react-select";

export default function Comments() {
  const [subtasks, setSubtasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [ticket, setTicket] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [status, setStatus] = useState("");
  const [description, setDescription] = useState("");
  const [technicianId, setTechnicianId] = useState("");
  const [completedPercentage, setCompletedPercentage] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);
  const {user, setNotification} = useStateContext();
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [errors, setErrors] = useState(null)
  
  const technicianFromQuery = users.find((user) => user.id === parseInt(technicianId, 10));

  let { ticketId } = useParams();

  useEffect(() => {
    fetchData();
  }, [ticketId]);

  useEffect(() => {
    const completedTasks = subtasks.filter((subtask) => subtask.status === 'completed');
    setCompletedTasks(completedTasks);
    const totalTasks = subtasks.length;
    const percentage = (completedTasks.length / totalTasks) * 100;
    setCompletedPercentage(Math.round(percentage));
  }, [subtasks]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const usersResponse = await axiosClient.get(`/users/`, { params: { page: 1, limit: 100 } });
      const allTechnicians = usersResponse.data.data;
  
      if (usersResponse.data.meta.current_page < usersResponse.data.meta.last_page) {
        const totalPages = usersResponse.data.meta.last_page;
        const additionalRequests = [];
  
        for (let page = 2; page <= totalPages; page++) {
          additionalRequests.push(axiosClient.get(`/users/`, { params: { page, limit: 100 } }));
        }
  
        const responses = await Promise.all(additionalRequests);
        responses.forEach((response) => {
          allTechnicians.push(...response.data.data);
        });
      }
  
      setUsers(allTechnicians);
  
      const ticketResponse = await axiosClient.get(`/tickets/${ticketId}`);
      setTicket(ticketResponse.data);
  
      let subtasksResponse;
      try {
        subtasksResponse = await axiosClient.get(`/subtasks/${ticketId}/`);
        setSubtasks(subtasksResponse.data.data);
      } catch (subtasksError) {
        console.warn("No subtasks found:", subtasksError);
        setSubtasks([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    /*
    if (status === 'in progress' && technicianId === '') {
      setErrorMessage("Technician is required for 'in progress' status.");
      setShowErrorModal(true);
      return;
    }
    */
   debugger;
    const newSubtask = {
      technician_id : (technicianId !== '' ? ''+technicianId : '-'),
      ticket_id: ticketId,
      description: description,
      status: status,
    }

    try {
      const response = await axiosClient.post("/subtasks/", newSubtask);
      const data = response.data;
      setSubtasks([...subtasks, data]);
      setShowForm(false);
      setStatus("");
      setDescription("");
      setTechnicianId("");
      setErrors(null);
    } catch (err) {
      debugger;
      console.error("Error creating subtask:", err);
      const response = err.response;
      if (response && response.status === 422) {
        setErrors(response.data.errors)
      }
      if (response && response.status === 424) {
        setErrors(response.data.errors)
      }
    }
  };

  const setStatusWithReset = (newStatus) => {
    if (newStatus === 'todo') {
      setTechnicianId(''); 
    }
    setStatus(newStatus);
  };

  const updateSubtask = async (subtask, value, techId) => {
    const newSubtask = {
      technician_id: techId,
      ticket_id: subtask.ticket_id,
      description: subtask.description,
      status: value,
    };
  
    try {
      const response = await axiosClient.put(`/subtasks/${subtask.id}`, newSubtask);
      const updatedSubtask = response.data;
      setSubtasks((prevSubtasks) =>
        prevSubtasks.map((st) => (st.id === updatedSubtask.id ? updatedSubtask : st))
      );
      setShowForm(false);
      setStatus("");
      setDescription("");
      setTechnicianId("");
    } catch (error) {
      console.error("Error updating subtask:", error);
    }
  };

  const handleCloseErrorModal = () => {
    setShowErrorModal(false);
    setErrorMessage("");
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px", marginBottom: "10px"}}>
        <h1>Subtasks for ticket <u>{ticket.name}</u></h1>
        {user.role === 'admin' &&
        <Button className={showForm ? "btn-danger" : "btn-success"} onClick={() => setShowForm(!showForm)}>
        {showForm ? "Cancel" : "Create New Subtask"}
      </Button>}
      </div>
      <div className="card animated fadeInDown">
      {errors &&
            <div class="alert alert-danger" role="alert">
              {Object.keys(errors).map(key => (
                <p key={key}>{errors[key][0]}</p>
              ))}
            </div>
      }
        {/*}
        <Modal show={showErrorModal} onHide={handleCloseErrorModal}>
          <Modal.Header closeButton>
            <Modal.Title>Error</Modal.Title>
          </Modal.Header>
          <Modal.Body>{errorMessage}</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseErrorModal}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
        {*/}
        {showForm && (
          <Form onSubmit={handleFormSubmit} className="form-container">
            <Form.Group>
              <Form.Label>Status:</Form.Label>
              <Select
                value={{ label: status === '' ? "Select status" : status, value: status }}
                onChange={(selectedOption) => setStatusWithReset(selectedOption.value)}
                options={[
                  { label: "todo", value: "todo" },
                  { label: "in progress", value: "in progress" },
                ]}
                isClearable
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Description:</Form.Label>
              <Form.Control
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Form.Group>
            {status === 'in progress' && (
              <Form.Group>
                <Form.Label>Technician:</Form.Label>
                <Select
                  value={{label : technicianFromQuery ? technicianFromQuery.name : "Select Technician", value : technicianFromQuery ? technicianFromQuery.id : '-'}}
                  onChange={(selectedOption) => setTechnicianId(selectedOption.id)}
                  options={users
                    .filter((user) => ticket.technician_id?.includes(user.id))
                    .map((technician) => ({
                      label: technician.name,
                      value: technician.id,
                      id: technician.id,
                    }))
                  }
                  isClearable
                  placeholder="Select Technician"
                />
              </Form.Group>
            )}
            <Button className="btn-success" type="submit" style={{marginTop: "20px"}}>Create Subtask</Button>
          </Form>
        )}
        {showForm && (<br/>)}
        <Table striped bordered responsive>
          <thead>
            <tr>
              <th>User</th>
              <th>Description</th>
              <th>Status</th>
              {user.role === 'tech' && <th>Actions</th>}
            </tr>
          </thead>
          {loading && (
            <tbody>
              <tr>
                <td colSpan="4" className="text-center">
                  Loading...
                </td>
              </tr>
            </tbody>
          )}
          {!loading && (
            <tbody>
              {subtasks.length === 0 && (
                <tr>
                  <td colSpan="3">
                    <center>No subtasks</center>
                  </td>
                </tr>
              )}
              {subtasks.map(subtask => {
                const technician = users.find(user => user.id === parseInt(subtask.technician_id, 10));

                return (
                  <tr key={subtask.id}>
                    <td>{technician ? technician.name : "-"}</td>
                    <td>{subtask.description}</td>
                    <td>{subtask.status}</td>
                    {user.role === 'tech' && (
                      <td>
                        {subtask.status === 'todo' && user.role === 'tech' && (
                          <Button className="btn-success" onClick={() => updateSubtask(subtask, 'in progress', user.id.toString())}>
                            Assign to me
                          </Button>
                        )}
                        {subtask.status === 'in progress' && subtask.technician_id === user.id.toString() && (
                          <Button className="btn-danger" onClick={() => updateSubtask(subtask, 'completed', subtask.technician_id)}>
                            Close it
                          </Button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          )}
        </Table>
      </div>
      <div className="progress-bar-container" style={{marginTop: "20px"}}>
          {subtasks.length > 0 && (<ProgressBar completed={completedPercentage} bgColor="green" height="15px"/>)}
          {subtasks.length > 0 && (<div className="percentage-text">{`${completedTasks.length} out of ${subtasks.length} completed`}</div>)}
        </div>
    </div>
  )
}
