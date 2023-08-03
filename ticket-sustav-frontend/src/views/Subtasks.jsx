import { useEffect, useState } from "react";
import axiosClient from "../axios-client.js";
import { Link, useParams } from "react-router-dom";
import { useStateContext } from "../context/ContextProvider.jsx";
import { Progress } from 'flowbite-react';
import ProgressBar from "@ramonak/react-progress-bar";
//import 'react-progress-bar/dist/react-progress-bar.css';

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
    // Calculate the completed percentage
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

  // Subtasks request (with error handling)
  let subtasksResponse;
  try {
    subtasksResponse = await axiosClient.get(`/subtasks/${ticketId}/`);
    setSubtasks(subtasksResponse.data.data);
  } catch (subtasksError) {
    // Handle the case where there are no subtasks
    console.warn("No subtasks found:", subtasksError);
    setSubtasks([]);
  }
  debugger;
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Subtasks for ticket <u>{ticket.name}</u></h1>
        <button className={showForm ? "btn-delete" : "btn-add"} onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Create New Subtask"}
        </button>
      </div>
      <div className="card animated fadeInDown">
      {showForm && (
          <form onSubmit={handleFormSubmit}>
            <div>
              <label htmlFor="status">Status:</label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatusWithReset(e.target.value)}
              >
                {status === '' && (<option value="">Select Status</option>)}
                <option value="todo">TO DO</option>
                <option value="in progress">In Progress</option>
              </select>
            </div>
            <div>
              <label htmlFor="description">Description:</label>
              <input
                type="text"
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            {status === 'in progress' && ( // Display technician only when status is "in progress"
              <div>
                <label htmlFor="technician">Technician:</label>
                <select
                  id="technician"
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
                </select>
              </div>
            )}
            <button className="btn-add" type="submit">Create Subtask</button>
          </form>
        )}
        {showForm && (<br/>)}
        <table>
          <thead>
            <tr>
              <th>Technician</th>
              <th>Description</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          {loading &&
            <tbody>
            <tr>
              <td colSpan="5" class="text-center">
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
                      {subtask.status === 'todo' && user.role === 'tech' && <button onClick={() => updateSubtask(subtask, 'in progress', user.id.toString())}>Assing to me</button>}
                      {subtask.status === 'in progress' && subtask.technician_id === user.id.toString() &&<button onClick={() => updateSubtask(subtask, 'completed', subtask.technician_id)}>Close it</button>}
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
        </table>
      </div>
      <div className="progress-bar-container">
          {subtasks.length > 0 && (<ProgressBar completed={completedPercentage} bgColor="green" height="15px"/>)}
          {subtasks.length > 0 && (<div className="percentage-text">{`${completedTasks.length} out of ${subtasks.length} completed`}</div>)}
        </div>
    </div>
  );
}
