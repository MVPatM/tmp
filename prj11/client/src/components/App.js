import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LoginPage from "./LoginPage/LoginPage"
import MainPage from "./MainPage/MainPage"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />}>
        </Route>
        <Route path="/" element={<MainPage />}>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
