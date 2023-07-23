import { useEffect, useState } from "react";
import axiosClient from "../axios-client.js";
import { Link, useParams } from "react-router-dom";
import { useStateContext } from "../context/ContextProvider.jsx";

export default function Comments() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  let {ticketId} = useParams(); // Assuming the parameter in the URL is 'ticketId'

 useEffect(() => {
    // The effect runs only once when the component mounts, ensuring that the ticketId is available.
    getComments();
  }, []); // Empty dependency array ensures this effect runs only once.

  useEffect(() => {
    // Check if ticketId is available before making subsequent API requests when currentPage changes.
    if (ticketId) {
      getComments();
    }
  }, [currentPage, ticketId]);

  const getComments = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get(`/comments/${ticketId}/`, {
        params: { page: currentPage },
      });
      setComments(response.data.data);
      setTotalPages(response.data.meta.last_page);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Comments</h1>
      </div>
      <div className="card animated fadeInDown">
        {loading ? (
          <p className="text-center">Loading...</p>
        ) : (
          <ul>
            {comments.map((comment) => (
              <li key={comment.id}>
                <h3>Comment ID: {comment.id}</h3>
                <p>Description: {comment.description}</p>
                <p>Ticket ID: {comment.ticket_id}</p>
                <p>User ID: {comment.user_id}</p>
                {/* Add other relevant information here */}
              </li>
            ))}
          </ul>
        )}
        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
            <button onClick={goToPreviousPage} disabled={currentPage === 1}>
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
              <button
                key={pageNumber}
                onClick={() => goToPage(pageNumber)}
                disabled={currentPage === pageNumber}
              >
                {pageNumber}
              </button>
            ))}
            <button onClick={goToNextPage} disabled={currentPage === totalPages}>
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
