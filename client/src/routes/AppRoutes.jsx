import { Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Organizations from "../pages/Organizations";
import NotFound from "../pages/NotFound";
import Services from "../pages/Services";
import GenerateToken from "../pages/GenerateToken";
import MyQueue from "../pages/MyQueue";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/organizations" element={<Organizations />} />
      <Route path="*" element={<NotFound />} />
      <Route
  path="/services/:organizationId"
  element={<Services />}
/>

<Route
  path="/generate-token"
  element={<GenerateToken />}
/>

<Route path="/myqueue" element={<MyQueue />} />
    </Routes>
  );
};

export default AppRoutes;