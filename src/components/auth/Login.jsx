import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Card, Form, Button } from "react-bootstrap";
import { postLogin } from "../../service/authAPI";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();
    
    if (!email || !password) {
      alert("Please enter both email and password");
      return;
    }

    try {
      const res = await postLogin(email, password);
      console.log("Full API Response:", res);
      console.log("Response data:", res.data);

      if (res.data && res.data.accessToken) {
        localStorage.setItem("token", res.data.accessToken);
        alert("Login successful!");
        navigate("/");
      } else {
        console.log("Unexpected response structure:", res.data);
        alert(res.data.message || "Invalid email or password");
      }
    } catch (error) {
      console.error("Login error:", error);
      console.error("Error response:", error.response);
      
      if (error.response && error.response.data) {
        alert(error.response.data.message || "Login failed");
      } else if (error.request) {
        alert("Cannot connect to server. Please try again later.");
      } else {
        alert("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <Container
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "100vh" }}
    >
      <Card
        className="p-4 shadow-sm"
        style={{
          width: "400px",
        }}
      >
        <h3 className="text-center mb-3 fw-bold">Login</h3>
        <Form onSubmit={handleLogin}>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"  
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Form.Group>

          <Button
            variant="primary"
            type="submit"
            className="w-100"
            style={{ backgroundColor: "#007bff", color: "white" }}
          >
            Login
          </Button>
        </Form>
        <div className="text-center mt-3">
          <p>
            Do you have an account yet? <a href="/register">Sign Up</a>
          </p>
        </div>
      </Card>
    </Container>
  );
};

export default Login;