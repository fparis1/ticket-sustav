import {useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import axiosClient from "../axios-client.js";
import {useStateContext} from "../context/ContextProvider.jsx";

export default function TicketForm() {
  let {id} = useParams();
  const [ticket, setTicket] = useState({
    id: '',
    name: '',
    description: '',
    status: '',
    client_id: '',
    technician_id: '',
  })

  const [client, setClient] = useState({

  })
  const [technician, setTechnician] = useState({

  })
  const [errors, setErrors] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchClient = (cl_id) => {
    axiosClient
      .get(`/clients/${cl_id}`)
      .then(({ data }) => {
        setClient(data);
        console.log(data);
      })
      .catch((error) => {
        console.error("Error fetching clients: ", error);
      });
  };

  const fetchTechnician = (tech_id) => {
    axiosClient
      .get(`/users/${tech_id}`) 
      .then(({ data }) => {
        setTechnician(data);
        console.log(data);
      })
      .catch((error) => {
        console.error("Error fetching clients: ", error);
        // Handle error if necessary
      });
  };

  if (id) {
    useEffect(() => {
      setLoading(true)
      axiosClient.get(`/tickets/${id}`)
        .then(({data}) => {
          setLoading(false)
          setTicket(data)
          debugger;
          if (data.technician_id !== '-') {
            fetchTechnician(data.technician_id);
          }
          fetchClient(data.client_id);
        })
        .catch(() => {
          setLoading(false)
        })
    }, [])
  }

  return (
    <>
      <h1>Ticket info</h1>
      <div className="card animated fadeInDown">
        {loading && (
          <div className="text-center">
            Loading...
          </div>
        )}
        {errors &&
          <div className="alert">
            {Object.keys(errors).map(key => (
              <p key={key}>{errors[key][0]}</p>
            ))}
          </div>
        }
            Ticket name:
            <input value={ticket.name} />
            Ticket description:
            <input value={ticket.description} />
            Ticket status:
            <input value={ticket.status} />
            Client name:
            <input value={client.name} />
            {technician.name && <p>Technician name:</p>}
            {technician.name && <input value={technician.name}/>}
      </div>
    </>
  )
}
