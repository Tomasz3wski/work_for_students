import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import MyApplications from "./pages/MyApplications"; 
import CreateOffer from "./pages/CreateOffer"; // <--- IMPORT NOWEJ STRONY
import "./App.css";

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Navbar />
        <div className="content-area">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            {/* Nowa trasa dla studenta */}
            <Route path="/my-applications" element={<MyApplications />} />
            {/* Nowa trasa dla pracodawcy */}
            <Route path="/create-offer" element={<CreateOffer />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}