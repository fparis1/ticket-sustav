import { Link } from "react-router-dom";
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
  const adminRoleRef = createRef();
  const techRoleRef = createRef();
  const { setUser, setToken } = useStateContext();
  const [errors, setErrors] = useState(null);

  const onSubmit = (ev) => {
    ev.preventDefault();
    const isAdminChecked = adminRoleRef.current.checked;
    const isTechChecked = techRoleRef.current.checked;
    const payload = {
      name: nameRef.current.value,
      email: emailRef.current.value,
      password: passwordRef.current.value,
      password_confirmation: passwordConfirmationRef.current.value,
      role: isAdminChecked ? "admin" : isTechChecked ? "tech" : "",
    };
    axiosClient
      .post("/signup", payload)
      .then(({ data }) => {
        setUser(data.user);
        setToken(data.token);
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
          <h1 className="title">Signup</h1>
          {errors && (
            <div className="alert alert-danger">
              {Object.keys(errors).map((key) => (
                <p key={key}>{errors[key][0]}</p>
              ))}
            </div>
          )}
          <Form.Group style={{marginTop : "10px"}}>
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
          <div className="radio-container">
            <Form.Check
              ref={adminRoleRef}
              type="radio"
              name="role"
              value="admin"
              label="Admin"
              className="form-field"
              style={{marginTop : "10px"}}
            />
            <Form.Check
              ref={techRoleRef}
              type="radio"
              name="role"
              value="tech"
              label="Technician"
              className="form-field"
            />
          </div>
          <Button variant="outline-light" type="submit" style={{marginTop : "10px", marginBottom : "10px"}}>
            Signup
          </Button>
          <p className="message">
            Already registered? <Link to="/login" variant="link" className="text-white-50" style={{padding : "3px"}}>Sign In</Link>
          </p>
        </Form>
      </div>
    </div>
  )
}
