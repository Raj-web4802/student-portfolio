function ErrorMessage({ message }) {
	return (
		<div className="error-message" role="alert">
			<p>Failed to load repositories.</p>
			{message && <pre className="error-detail">{message}</pre>}
		</div>
	)
}

export default ErrorMessage
