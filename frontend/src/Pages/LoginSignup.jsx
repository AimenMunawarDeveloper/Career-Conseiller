import React from "react";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function LoginSignup() {
  const [isLogin, setIsLogin] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  function SwitchLoginSignup() {
    setIsLogin(!isLogin);
  }
  function handleSignup(e) {
    e.preventDefault();
    axios
      .post(`${import.meta.env.VITE_BACKEND_URL}/api/user/register`, {
        username,
        email,
        password,
      })
      .then((res) => {
        toast.success(res.data.message, {
          onClose: () => navigate("/Home"),
          autoClose: 3000,
        });
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Signup failed");
      });
  }

  function handleLogin(e) {
    e.preventDefault();
    axios
      .post(`${import.meta.env.VITE_BACKEND_URL}/api/user/login`, {
        email,
        password,
      })
      .then((res) => {
        toast.success(res.data.message, {
          onClose: () => navigate("/Home"),
          autoClose: 3000,
        });
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Login failed");
      });
  }

  return (
    <div>
      {!isLogin ? (
        <div>
          <h1>Signup</h1>
          <form onSubmit={handleSignup}>
            <label>Username</label>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            ></input>
            <label>Email</label>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            ></input>
            <label>Password</label>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            ></input>
            <button type="submit">Signup</button>
          </form>
          Already have an account?
          <button onClick={SwitchLoginSignup}>Login</button>
        </div>
      ) : (
        <div>
          <h1>Login</h1>
          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            ></input>
            <label>Password</label>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            ></input>
            <button type="submit">Login</button>
          </form>
          Don't have an account?{" "}
          <button onClick={SwitchLoginSignup}>Sign up</button>
        </div>
      )}
      <ToastContainer />
    </div>
  );
}
