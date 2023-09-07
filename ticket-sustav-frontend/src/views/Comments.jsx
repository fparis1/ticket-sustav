import { useEffect, useState } from "react";
import axiosClient from "../axios-client.js";
import { Link, useParams } from "react-router-dom";
import { useStateContext } from "../context/ContextProvider.jsx";
import { Table, Button, Form } from 'react-bootstrap';

export default function Comments() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [ticket, setTicket] = useState(true);
  const {user} = useStateContext();
  const [showAddComment, setShowAddComment] = useState(false);

  let {ticketId} = useParams();

  const formatTimestamp = (timestamp) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      timeZoneName: "short",
    };
  
    return new Intl.DateTimeFormat("en-US", options).format(new Date(timestamp));
  };

  useEffect(() => {
    fetchData();
  }, [ticketId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let allUsers = [];
      let page = 1;
      let usersResponse;
    
      do {
        usersResponse = await axiosClient.get(`/users/?page=${page}`).catch(error => ({ data: { data: [] } }));
        if (usersResponse.data) {
          allUsers = allUsers.concat(usersResponse.data.data);
        }
        page++;
        debugger;
      } while (page <= usersResponse.data.meta.last_page);
    
      // Now allUsers contains all fetched users
      setUsers(allUsers);
    
      const commentsResponse = await axiosClient.get(`/comments/${ticketId}/`).catch(error => ({ data: { data: [] } }));
      const ticketResponse = await axiosClient.get(`/tickets/${ticketId}`).catch(error => ({ data: {} }));
    
      if (commentsResponse.data) {
        setComments(commentsResponse.data.data);
      }
    
      if (ticketResponse.data) {
        setTicket(ticketResponse.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const findUserById = (userId) => {
    return users.find(user => String(user.id) === userId);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    const description = e.target.elements.description.value;

    const newComment = {
      user_id: String(user.id),
      ticket_id: ticketId,
      description: description,
    };

    try {
      await axiosClient.post(`/comments/`, newComment);

      e.target.reset();
      setShowAddComment(false);

      fetchData();
    } catch (error) {
      console.error("Error creating comment:", error);
    }
  };

  return (
    <div>
      <div className="header-style container-style">
        <h1 className='custom'>Comments for ticket <u>{ticket.name}</u></h1>
        <Button className={showAddComment ? "btn-danger" : "btn-success"} onClick={() => setShowAddComment(!showAddComment)}>
          {showAddComment ? "Cancel" : "Add new comment"}
        </Button>
      </div>
      {showAddComment && (
        <div>
          <Form onSubmit={handleAddComment}>
            <Form.Label className='custom'>Description:</Form.Label>
            <Form.Control type="text" name="description" required />
            <br/>
            <Button type="submit" className="btn-success">Add Comment</Button>
          </Form>
          <br/>
        </div>
      )}
      <div className="card animated fadeInDown">
        <Table striped bordered responsive>
          <thead>
            <tr>
              <th>User</th>
              <th>Description</th>
              <th>Created at</th>
            </tr>
          </thead>
          {loading && (
            <tbody>
              <tr>
                <td colSpan="5" className="text-center">
                  Loading...
                </td>
              </tr>
            </tbody>
          )}
          {!loading && (
            <tbody>
              {comments.length === 0 && <p>No comments</p>}
              {comments.map(comment => (
                <tr key={comment.id}>
                  <td>{findUserById(comment.user_id)?.name}</td>
                  <td>{comment.description}</td>
                  <td>{formatTimestamp(comment.created_at)}</td>
                </tr>
              ))}
            </tbody>
          )}
        </Table>
      </div>
    </div>
  );
}
