import {Link} from "react-router-dom";
import axiosClient from "../axios-client.js";
import {createRef} from "react";
import {useStateContext} from "../context/ContextProvider.jsx";
import { useState } from "react";
import { Form, Button } from 'react-bootstrap';
import "../index.css";

export default function Login() {
  const emailRef = createRef()
  const passwordRef = createRef()
  const { setUser, setToken } = useStateContext()
  const [errors, setErrors] = useState(null);

  const onSubmit = ev => {
    ev.preventDefault()

    const payload = {
      email: emailRef.current.value,
      password: passwordRef.current.value,
    }
    axiosClient.post('/login', payload)
      .then(({data}) => {
        setUser(data.user)
        setToken(data.token);
      })
      .catch((err) => {
        const response = err.response;
        if (response && response.status === 422) {
          setErrors(response.data.errors)
        }
      })
  }

  return (
    <div>
      <div className="form">
      <Form onSubmit={onSubmit} className="login-signup-container">
        <h2>Login into your account</h2>

        {errors && (
            <div className="alert alert-danger">
              {Object.keys(errors).map((key) => (
                <p key={key}>{errors[key][0]}</p>
              ))}
            </div>
          )}

        <Form.Group controlId="formEmail" style={{marginTop : "10px"}} >
          <Form.Control ref={emailRef} type="email" placeholder="Email"/>
        </Form.Group>
        <Form.Group controlId="formPassword" style={{marginTop : "10px", marginBottom: "10px"}} >
          <Form.Control ref={passwordRef} type="password" placeholder="Password" />
        </Form.Group>

        <Button variant="outline-light" type="submit" style={{marginTop : "10px", marginBottom: "10px"}}>Login</Button>

        <p className="message">Not registered? <Link to="/signup" variant="link" className="text-white-50" style={{padding : "3px"}}>Create an account</Link></p>
      </Form>
      </div>
    </div>
  )
}
