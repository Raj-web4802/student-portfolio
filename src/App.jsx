import { Routes, Route } from "react-router-dom";
import "./App.css";

import NavBar from "./components/NavBar";

import Home from "./Pages/Home";
import Projects from "./Pages/Projects";
import Contact from "./Pages/Contact";
import Tasks from "./Pages/Tasks";
import Login from "./Pages/Login";
import NotFound from "./Pages/NotFound";

function App() {

  return (

    <div className="portfolio-shell">

      <NavBar />

      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/projects" element={<Projects />} />

        <Route path="/contact" element={<Contact />} />

        <Route path="/tasks" element={<Tasks />} />

        <Route path="/login" element={<Login />} />

        <Route path="*" element={<NotFound />} />

      </Routes>

    </div>

  );

}

export default App;