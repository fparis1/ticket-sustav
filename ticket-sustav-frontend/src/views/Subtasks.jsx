import { useEffect, useState } from "react";
import axiosClient from "../axios-client.js";
import { useParams } from "react-router-dom";
import { useStateContext } from "../context/ContextProvider.jsx";
import ProgressBar from "@ramonak/react-progress-bar";
import { Table, Form, Button } from "react-bootstrap";
import Select from "react-select";
import "./../index.css";

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
  const {user} = useStateContext();
  const [errors, setErrors] = useState(null)
  
  const technicianFromQuery = users.find((user) => user.id === parseInt(technicianId, 10));

  let { ticketId } = useParams();

  useEffect(() => {
    fetchData();
  }, [ticketId]);

  //used for calculating percentage of completed tasks

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

      //get all users so that they can be displayed in table

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
   //check if there is technician selected or not
    const newSubtask = {
      technician_id : (technicianId !== '' ? ''+technicianId : '-'),
      ticket_id: ticketId,
      description: description,
      status: status,
    }

    //add new subtask into the list of the subtasks
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
  //reset technicianId when todo status is selected
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
      //update value of previous subtasks from table
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
      <div className="header-style">
        <h1 className='custom'>Subtasks for ticket <u>{ticket.name}</u></h1>
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
              <th>Technician</th>
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
      <div className="progress-bar-container progress-style">
          {subtasks.length > 0 && (<ProgressBar completed={completedPercentage} bgColor="green" height="15px"/>)}
          {subtasks.length > 0 && (<div className="percentage-text" id="percent">{`${completedTasks.length} out of ${subtasks.length} completed`}</div>)}
        </div>
    </div>
  )
}
