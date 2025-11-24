import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Components/Home";
import SignUpListener from "./Components/SignUpListener";
import SignUpArtist from "./Components/SignUpArtist";
import SignInListener from "./Components/SignInListener";
import SignInArtist from "./Components/SignInArtist";
import DashboardListener from "./Components/DashboardListener";
import DashboardArtist from "./Components/DashboardArtist";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup/listener" element={<SignUpListener />} />
        <Route path="/signup/artist" element={<SignUpArtist />} />
        <Route path="/signin/listener" element={<SignInListener />} />
        <Route path="/signin/artist" element={<SignInArtist />} />
        <Route path="/dashboard/listener" element={<DashboardListener />} />
        <Route path="/dashboard/artist" element={<DashboardArtist />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
