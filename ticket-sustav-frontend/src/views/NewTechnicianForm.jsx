import { useNavigate } from "react-router-dom";
import { createRef, useState } from "react";
import axiosClient from "../axios-client.js";
import { useStateContext } from "../context/ContextProvider.jsx";
import { Form, Button } from "react-bootstrap";
import "../index.css";

export default function Signup() {
  const nameRef = createRef();
  const emailRef = createRef();
  const passwordRef = createRef();
  const passwordConfirmationRef = createRef();
  const navigate = useNavigate();
  const { setNotification } = useStateContext();
  const [errors, setErrors] = useState(null);

  const onSubmit = (ev) => {
    ev.preventDefault();
    debugger;
    const payload = {
      name: nameRef.current.value,
      email: emailRef.current.value,
      password: passwordRef.current.value,
      password_confirmation: passwordConfirmationRef.current.value,
      role: "tech",
    };
    axiosClient
      .post("/signup", payload)
      .then(({}) => {
        setNotification('Technician was successfully created')
        navigate('/technicians');
      })
      .catch((err) => {
        const response = err.response;
        if (response && response.status === 422) {
          setErrors(response.data.errors);
        }
      });
  };

  return (
    <div>
      <div>
        <Form onSubmit={onSubmit} className="login-signup-container">
          <h1 className="custom">Create new technican</h1>
          {errors && (
            <div className="alert alert-danger">
              {Object.keys(errors).map((key) => (
                <p key={key}>{errors[key][0]}</p>
              ))}
            </div>
          )}
          <Form.Group className="container-style">
            <Form.Control ref={nameRef} type="text" placeholder="Full Name" className="form-field" />
          </Form.Group>
          <Form.Group>
            <Form.Control ref={emailRef} type="email" placeholder="Email Address" className="form-field" />
          </Form.Group>
          <Form.Group>
            <Form.Control ref={passwordRef} type="password" placeholder="Password" className="form-field" />
          </Form.Group>
          <Form.Group>
            <Form.Control
              ref={passwordConfirmationRef}
              type="password"
              placeholder="Repeat Password"
              className="form-field"
            />
          </Form.Group>
          <Button variant="outline-light" type="submit" className="submit-form">
            Create
          </Button>
        </Form>
      </div>
    </div>
  )
}
