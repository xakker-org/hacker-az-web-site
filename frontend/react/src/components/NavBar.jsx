import { Link, NavLink } from "react-router-dom";
import { clearTokens, getAccessToken } from "../utils/tokens";

export default function NavBar() {
  const isLoggedIn = Boolean(getAccessToken());

  const onLogout = () => {
    clearTokens();
    window.location.href = "#/";
  };

  return (
    <header className="navbar">
      <Link to="/" className="brand-mark">
        Xakker Self Study
      </Link>

      <nav className="nav-links">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/courses">Courses</NavLink>
        {!isLoggedIn && <NavLink to="/login">Login</NavLink>}
        {!isLoggedIn && <NavLink to="/register">Register</NavLink>}
        {isLoggedIn && (
          <button className="logout-btn" onClick={onLogout} type="button">
            Logout
          </button>
        )}
      </nav>
    </header>
  );
}
