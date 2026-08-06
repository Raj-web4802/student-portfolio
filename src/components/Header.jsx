import { Link } from "react-router-dom";
function Header({ name }) {
	return (
		<header className="section card header">
			<div className="header-copy">
				<p className="eyebrow">Portfolio</p>
				<h1>{name}</h1>
				<p className="header-lead">
					Frontend developer focused on clean interfaces, clear hierarchy,
					and responsive interaction.
				</p>
				<div className="hero-actions">
					<Link className="button" to="/projects">
						View projects
					</Link>
					<Link className="button button-secondary" to="/contact">
						Contact me
					</Link>
				</div>
			</div>
			<div className="header-meta" aria-label="Profile highlights">
				<span>Open to work</span>
				<span>React</span>
				<span>TypeScript</span>
			</div>
		</header>
	);
}

export default Header;
