function Skills({ skillList }) {
	return (
		<section className="section card">
			<p className="eyebrow">Skills</p>
			<h2>Tools I use regularly</h2>
			<p className="skills-lead">A short set of front-end skills used across the project.</p>
			<ul className="skills-list">
				{skillList.map((skill) => (
					<li key={skill}>{skill}</li>
				))}
			</ul>
		</section>
	)
}

export default Skills
