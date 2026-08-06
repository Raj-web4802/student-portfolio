function Spinner() {
	return (
		<div className="spinner" role="status" aria-live="polite">
			<svg
				width="48"
				height="48"
				viewBox="0 0 50 50"
				aria-hidden="true"
			>
				<circle
					cx="25"
					cy="25"
					r="20"
					fill="none"
					strokeWidth="4"
					stroke="#3b82f6"
					strokeLinecap="round"
					strokeDasharray="31.415, 31.415"
				>
					<animateTransform
						attributeName="transform"
						type="rotate"
						from="0 25 25"
						to="360 25 25"
						dur="1s"
						repeatCount="indefinite"
					/>
				</circle>
			</svg>
			<span className="visually-hidden">Loading...</span>
		</div>
	)
}

export default Spinner
