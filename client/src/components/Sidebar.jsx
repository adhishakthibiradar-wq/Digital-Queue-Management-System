import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
  const { user, isAdmin } = useAuth();

  return (
    <aside className="w-64 min-h-screen bg-slate-900 p-6 text-white">
      <h1 className="mb-10 text-3xl font-bold">Smart Queue</h1>

      <nav className="space-y-2">
        <NavLink to="/" className="block rounded-lg px-3 py-2 hover:bg-slate-800">
          🏠 Home
        </NavLink>

        {user && (
          <>
            <NavLink to="/organizations" className="block rounded-lg px-3 py-2 hover:bg-slate-800">
              🏢 Organizations
            </NavLink>
            <NavLink to="/services" className="block rounded-lg px-3 py-2 hover:bg-slate-800">
              🛎️ Services
            </NavLink>
            <NavLink to="/generate-token" className="block rounded-lg px-3 py-2 hover:bg-slate-800">
              🎟️ Generate Token
            </NavLink>
            <NavLink to="/myqueue" className="block rounded-lg px-3 py-2 hover:bg-slate-800">
              📋 My Queue
            </NavLink>
          </>
        )}

        {isAdmin && (
          <>
            <NavLink to="/dashboard" className="block rounded-lg px-3 py-2 hover:bg-slate-800">
              📊 Dashboard
            </NavLink>
            <NavLink to="/dashboard" className="block rounded-lg px-3 py-2 hover:bg-slate-800">
              🧾 Queue Management
            </NavLink>
          </>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;