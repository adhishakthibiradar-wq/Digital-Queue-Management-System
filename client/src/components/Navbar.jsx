import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <nav className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">

      <Link to="/" className="text-xl font-bold">
        Smart Queue
      </Link>


      <div className="flex items-center gap-6">

        <Link to="/">
          Home
        </Link>

        {user && (
          <>
            <Link to="/organizations">
              Organizations
            </Link>

            <Link to="/myqueue">
              My Queue
            </Link>
          </>
        )}


        {user ? (
          <>

            <span>
              {user.name}
            </span>

            <button
              onClick={handleLogout}
              className="bg-white text-blue-600 px-3 py-1 rounded"
            >
              Logout
            </button>

          </>
        ) : (
          <Link to="/login">
            Login
          </Link>
        )}

      </div>

    </nav>
  );
};

export default Navbar;