import { useEffect, useState } from "react";
import axiosClient from "../axios-client.js";
import { Link, useParams } from "react-router-dom";
import { useStateContext } from "../context/ContextProvider.jsx";
import ProgressBar from "@ramonak/react-progress-bar";
import { Table, Form, Button } from "react-bootstrap";
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
  const { user } = useStateContext();

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
  const [usersResponse, ticketResponse] = await Promise.all([
    axiosClient.get(`/users/`),
    axiosClient.get(`/tickets/${ticketId}`)
  ]);

  let subtasksResponse;
  try {
    subtasksResponse = await axiosClient.get(`/subtasks/${ticketId}/`);
    setSubtasks(subtasksResponse.data.data);
  } catch (subtasksError) {
    console.warn("No subtasks found:", subtasksError);
    setSubtasks([]);
  }
  setUsers(usersResponse.data.data);
  setTicket(ticketResponse.data);
  } catch (error) {
    console.error("Error fetching data:", error);
  } finally {
    setLoading(false);
  }
  }

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    const newSubtask = {
      technician_id : (technicianId !== '' ? technicianId : '-'),
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
    } catch (error) {
      console.error("Error creating subtask:", error);
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

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px", marginBottom: "10px"}}>
        <h1>Subtasks for ticket <u>{ticket.name}</u></h1>
        <Button className={showForm ? "btn-danger" : "btn-success"} onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Create New Subtask"}
        </Button>
      </div>
      <div className="card animated fadeInDown">
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
                <Form.Control
                  as="select"
                  value={technicianId}
                  onChange={(e) => setTechnicianId(e.target.value)}
                >
                  {technicianId === '' && (<option value="">Select Technician</option>)}
                  {users
                    .filter((user) => ticket.technician_id?.includes(user.id))
                    .map((technician) => (
                      <option key={technician.id} value={technician.id}>
                        {technician.name}
                      </option>
                    ))}
                </Form.Control>
              </Form.Group>
            )}
            <Button className="btn-success" type="submit" style={{marginTop: "20px"}}>Create Subtask</Button>
          </Form>
        )}
        {showForm && (<br/>)}
        <Table>
          <thead>
            <tr>
              <th>Technician</th>
              <th>Description</th>
              <th>Status</th>
              {user.role === 'tech' && (<th>Actions</th>)}
            </tr>
          </thead>
          {loading &&
            <tbody>
            <tr>
              <td colSpan="5" className="text-center">
                Loading...
              </td>
            </tr>
            </tbody>
          }
            {!loading &&
              subtasks.map((subtask) => {
                const technician = users.find((user) => user.id === parseInt(subtask.technician_id, 10));

                return (
                  <tbody key={subtask.id}>
                  <tr key={subtask.id}>
                    <td>{technician ? technician.name : "-"}</td>
                    <td>{subtask.description}</td>
                    <td>{subtask.status}</td>
                    <td>
                      {subtask.status === 'todo' && user.role === 'tech' && <Button className="btn-edit" onClick={() => updateSubtask(subtask, 'in progress', user.id.toString())}>Assign to me</Button>}
                      {subtask.status === 'in progress' && subtask.technician_id === user.id.toString() &&<Button className="btn-delete" onClick={() => updateSubtask(subtask, 'completed', subtask.technician_id)}>Close it</Button>}
                    </td>
                  </tr>
                  </tbody>
                );
              })}
              {!loading && subtasks.length === 0 && (
                <tbody>
                  <tr>
                  <td rowSpan="4"><center>Currently there are no subtasks for this ticket</center></td>
                  </tr>
                </tbody>
              )}
        </Table>
      </div>
      <div className="progress-bar-container">
          {subtasks.length > 0 && (<ProgressBar completed={completedPercentage} bgColor="green" height="15px"/>)}
          {subtasks.length > 0 && (<div className="percentage-text">{`${completedTasks.length} out of ${subtasks.length} completed`}</div>)}
        </div>
    </div>
  )
}
