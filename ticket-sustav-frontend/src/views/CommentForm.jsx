import { useEffect, useState } from "react";
import axiosClient from "../axios-client.js";
import { Link, useParams } from "react-router-dom";
import { useStateContext } from "../context/ContextProvider.jsx";

export default function Comments() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  let {ticketId} = useParams();

 useEffect(() => {
    getComments();
  }, []); 

  useEffect(() => {
    if (ticketId) {
      getComments();
    }
  }, [ticketId]);

  const getComments = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get(`/comments/${ticketId}/`);
      console.log(response)
      setComments(response.data.data);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Comments for {ticketId}</h1>
        <Link className="btn-add" to={'/comments/' + ticketId + '/new'}>Add new comment</Link>
      </div>
      <div className="card animated fadeInDown">

        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Description</th>
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
                <td>{comment.user_id}</td>
                <td>{comment.description}</td>
              </tr>
            ))}
            </tbody>
          }
        </table>
      </div>
    </div>
  );
}
