import React, { createContext, useContext, useState, useEffect } from "react";

export const AppContext = createContext({
  user: null,
  token: null,
  login: () => {},
  logout: () => {},
});

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isOpen, setIsOpen] = useState(true);
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
  }, []);

  const login = (user, authtoken) => {
    console.log("in context", user, authtoken);
    setUser(user);
    setToken(authtoken);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", authtoken);
  };
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };
  return (
    <AppContext.Provider
      value={{ user, token, login, logout, isOpen, toggleSidebar }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
