import React, { useEffect } from "react";
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

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    window.handleGoogleSignIn = async (response) => {
      try {
        const result = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/user/google-signin`,
          { credential: response.credential }
        );
        toast.success("Successfully signed in with Google", {
          onClose: () => navigate("/Home"),
          autoClose: 3000,
        });
        localStorage.setItem("user", JSON.stringify(result.data.user));
      } catch (error) {
        toast.error(error.response?.data?.message || "Google sign-in failed");
      }
    };
  }, [navigate]);
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
        localStorage.setItem("user", JSON.stringify(res.data.newUser));
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
        localStorage.setItem("user", JSON.stringify(res.data.user));
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
          <div
            id="g_id_onload"
            data-client_id={import.meta.env.VITE_GOOGLE_CLIENT_ID}
            data-callback="handleGoogleSignIn"
            data-auto_prompt="false"
          ></div>
          <div
            className="g_id_signin"
            data-type="standard"
            data-size="large"
            data-theme="outline"
            data-text="sign_in_with"
            data-shape="rectangular"
            data-logo_alignment="left"
          ></div>
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
          <div
            id="g_id_onload"
            data-client_id={import.meta.env.VITE_GOOGLE_CLIENT_ID}
            data-callback="handleGoogleSignIn"
            data-auto_prompt="false"
          ></div>
          <div
            className="g_id_signin"
            data-type="standard"
            data-size="large"
            data-theme="outline"
            data-text="sign_in_with"
            data-shape="rectangular"
            data-logo_alignment="left"
          ></div>
          Don't have an account?{" "}
          <button onClick={SwitchLoginSignup}>Sign up</button>
        </div>
      )}
      <ToastContainer />
    </div>
  );
}
