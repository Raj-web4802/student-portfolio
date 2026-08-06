import { Link } from "react-router-dom";

function NavBar() {
  return (
    <nav className="top-nav" aria-label="Primary navigation">
      <Link to="/">Home</Link>
      <Link to="/projects">Projects</Link>
      <Link to="/contact">Contact</Link>
    </nav>
  );
}

export default NavBar;