import React, { useEffect } from "react";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useApp } from "../Context/AppContext";
import loginsignup from "../../assets/images/loginsignup.svg";
import logo from "../../assets/images/logo.png";

export default function LoginSignup() {
  const [isLogin, setIsLogin] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useApp();
  console.log("in login signup", login);

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
        console.log(result.data.user, result.data.token);
        login(result.data.user, result.data.token);
        toast.success("Successfully signed in with Google", {
          onClose: () => navigate("/Home"),
          autoClose: 3000,
        });
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
    if (!username) {
      toast.error("Please enter your username");
      return;
    }
    if (!email) {
      toast.error("Please enter your email");
      return;
    }
    if (!password) {
      toast.error("Please enter your password");
      return;
    }
    axios
      .post(`${import.meta.env.VITE_BACKEND_URL}/api/user/register`, {
        username,
        email,
        password,
      })
      .then((res) => {
        login(res.data.user, res.data.token);
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
    if (!email) {
      toast.error("Please enter your email");
      return;
    }
    if (!password) {
      toast.error("Please enter your password");
      return;
    }
    axios
      .post(`${import.meta.env.VITE_BACKEND_URL}/api/user/login`, {
        email,
        password,
      })
      .then((res) => {
        login(res.data.user, res.data.token);
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
    <div className="w-full h-screen flex flex-row">
      <div className="w-1/2 h-screen flex flex-col p-4">
        {/* Logo positioned closer to top */}
        <div className="w-full flex justify-start items-start pt-4 pb-6">
          <img src={logo} alt="logo" className="w-32 h-auto" />
        </div>

        {!isLogin ? (
          <div className="w-full flex flex-col items-center justify-start gap-4 px-24">
            <h1 className="w-full text-black text-3xl font-bold mb-6">
              Create an account
            </h1>
            <form
              onSubmit={handleSignup}
              className="w-full flex flex-col items-center justify-center gap-4"
            >
              <label className="text-black w-full">Username</label>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-2 rounded-md border-2 border-gray-300"
              />
              <label className="w-full">Email</label>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 rounded-md border-2 border-gray-200"
              />
              <label className="w-full">Password</label>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 rounded-md border-2 border-gray-200"
              />
              <button
                type="submit"
                className="bg-purple-500 text-white p-3 rounded-md w-full hover:bg-purple-600 transition-all duration-300 cursor-pointer flex items-center justify-center"
                style={{ height: "40px" }}
              >
                Signup
              </button>
            </form>
            <div
              id="g_id_onload"
              data-client_id={import.meta.env.VITE_GOOGLE_CLIENT_ID}
              data-callback="handleGoogleSignIn"
              data-auto_prompt="false"
              className="w-full"
            ></div>
            <div
              className="g_id_signin w-full rounded-md"
              data-type="standard"
              data-size="large"
              data-theme="outline"
              data-text="continue_with"
              data-shape="rectangular"
              data-logo_alignment="left"
              data-width="100%"
            ></div>
            <button
              onClick={SwitchLoginSignup}
              className="underline hover:text-blue-500"
            >
              Already have an account?
            </button>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center justify-start gap-4 px-24">
            <h1 className="w-full text-black text-3xl font-bold mb-6">
              Welcome Back
            </h1>
            <form
              onSubmit={handleLogin}
              className="w-full flex flex-col items-center justify-center gap-4"
            >
              <label className="text-black w-full">Email</label>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 rounded-md border-2 border-gray-300"
              />
              <label className="text-black w-full">Password</label>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 rounded-md border-2 border-gray-200"
              />
              <button
                type="submit"
                className="bg-purple-500 text-white p-3 rounded-md w-full hover:bg-purple-600 transition-all duration-300 cursor-pointer flex items-center justify-center"
                style={{ height: "40px" }}
              >
                Login
              </button>
            </form>
            <div
              id="g_id_onload"
              data-client_id={import.meta.env.VITE_GOOGLE_CLIENT_ID}
              data-callback="handleGoogleSignIn"
              data-auto_prompt="false"
              className="w-full"
            ></div>
            <div
              className="g_id_signin w-full rounded-md"
              data-type="standard"
              data-size="large"
              data-theme="outline"
              data-text="continue_with"
              data-shape="rectangular"
              data-logo_alignment="left"
              data-width="100%"
            ></div>
            <button
              onClick={SwitchLoginSignup}
              className="underline hover:text-blue-500"
            >
              Don't have an account?
            </button>
          </div>
        )}
      </div>
      <div className="w-1/2 h-screen flex items-center justify-center bg-purple-500">
        <img src={loginsignup} alt="loginsignup" className="h-3/4 w-full" />
      </div>
      <ToastContainer />
    </div>
  );
}
