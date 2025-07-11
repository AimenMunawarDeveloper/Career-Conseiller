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

  const login = (user, authtoken) => {
    console.log("in context", user, authtoken);
    setUser(user);
    setToken(authtoken);
  };
  const logout = () => {
    setUser(null);
    setToken(null);
  };

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  return (
    <AppContext.Provider value={{ user, token, login, logout }}>
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
