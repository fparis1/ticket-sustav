import { useEffect, useState } from "react";
import axiosClient from "../axios-client.js";
import { Link, useParams } from "react-router-dom";
import { useStateContext } from "../context/ContextProvider.jsx";

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
      const [commentsResponse, usersResponse, ticketResponse] = await Promise.all([
        axiosClient.get(`/comments/${ticketId}/`),
        axiosClient.get(`/users/`),
        axiosClient.get(`/tickets/${ticketId}`)
      ]);
      setComments(commentsResponse.data.data);
      setUsers(usersResponse.data.data);
      setTicket(ticketResponse.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const findUserById = (userId) => {
    debugger;
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Comments for {ticket.name}</h1>
        <button className={showAddComment ? "btn-delete" : "btn-add"} onClick={() => setShowAddComment(!showAddComment)}>
          {showAddComment ? "Cancel" : "Add new comment"}
        </button>
      </div>
      {showAddComment && (
        <div>
          <form onSubmit={handleAddComment}>
            <label>
              Description:
              <input type="text" name="description" required />
            </label>
            <button type="submit" className="btn-add">Add Comment</button>
          </form>
        </div>
      )}
      <div className="card animated fadeInDown">

        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Description</th>
              <th>Created at</th>
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
            <tbody>
            {comments.length === 0 && <p>No comments</p>}
            {comments.map(comment => (
              <tr key={comment.id}>
                {/*console.log(comment)*/}
                <td>{findUserById(comment.user_id)?.name}</td>
                <td>{comment.description}</td>
                <td>{formatTimestamp(comment.created_at)}</td>
              </tr>
            ))}
            </tbody>
          }
        </table>
      </div>
    </div>
  );
}
