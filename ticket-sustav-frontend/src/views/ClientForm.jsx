import {useNavigate, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import axiosClient from "../axios-client.js";
import {useStateContext} from "../context/ContextProvider.jsx";

export default function ClientForm() {
  const navigate = useNavigate();
  let {id} = useParams();
  const [client, setClient] = useState({
    id: null,
    name: '',
    email: '',
    phone: ''
  })
  const [errors, setErrors] = useState(null)
  const [loading, setLoading] = useState(false)
  const {setNotification} = useStateContext()
  const {user} = useStateContext()

  if (id) {
    useEffect(() => {
      setLoading(true)
      axiosClient.get(`/clients/${id}`)
        .then(({data}) => {
          setLoading(false)
          setClient(data)
        })
        .catch(() => {
          setLoading(false)
        })
    }, [])
  }

  const onSubmit = ev => {
    ev.preventDefault()
    if (client.id) {
      axiosClient.put(`/clients/${client.id}`, client)
        .then(() => {
          setNotification('Client was successfully updated')
          navigate('/clients')
        })
        .catch(err => {
          const response = err.response;
          if (response && response.status === 422) {
            setErrors(response.data.errors)
          }
        })
    } else {
      axiosClient.post('/clients', client)
        .then(() => {
          setNotification('Client was successfully created')
          navigate('/clients')
        })
        .catch(err => {
          const response = err.response;
          if (response && response.status === 422) {
            setErrors(response.data.errors)
          }
        })
    }
  }

  useEffect(() => {
    if (user) {
      checkRole();
    }
  }, [user]);

  const checkRole = () => {
    if (user.role === "tech") {
      navigate('/dashboard');
    }
  };

  return (
    <>
      {client.id && <h1>Update Client: {client.name}</h1>}
      {!client.id && <h1>New Client</h1>}
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
        {!loading && (
          <form onSubmit={onSubmit}>
            <input value={client.name} onChange={ev => setClient({...client, name: ev.target.value})} placeholder="Name"/>
            <input value={client.email} onChange={ev => setClient({...client, email: ev.target.value})} placeholder="Email"/>
            <input value={client.phone} onChange={ev => setClient({...client, phone: ev.target.value})} placeholder="Phone"/>
            <button className="btn">Save</button>
          </form>
        )}
      </div>
    </>
  )
}
