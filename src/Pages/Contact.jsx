import { useState } from "react";

function Contact() {
  const [message, setMessage] = useState("");
  const [showPreview, setShowPreview] = useState(true);
  const [showHelp, setShowHelp] = useState(false);

  return (
    <main className="page-section">
      <section className="section card contact-card">
        <p className="eyebrow">Contact</p>
        <h2>Let’s build something great together</h2>
        <p className="section-copy">
          I’m available for freelance work, internships, and collaboration on front-end projects.
          Reach out and I’ll respond within one business day.
        </p>
        <label className="contact-field">
          <div className="contact-field-header">
            <span>Your message</span>
            <button
              type="button"
              className="button button-secondary button-small"
              onClick={() => setShowHelp((prev) => !prev)}
            >
              {showHelp ? "Hide help" : "Need help?"}
            </button>
          </div>
          <input
            type="text"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Type your idea or question here"
          />
        </label>
        {showHelp && (
          <div className="help-tooltip">
            Share a short description of your goal, timeline, and expected outcome.
          </div>
        )}
        <button
          type="button"
          className="button button-secondary"
          onClick={() => setShowPreview((prev) => !prev)}
        >
          {showPreview ? "Hide preview" : "Show preview"}
        </button>
        {showPreview && (
          <div className="live-preview">
            <p className="eyebrow">Live preview</p>
            <div className="preview-box">
              {message || "Start typing to see your message appear here."}
            </div>
          </div>
        )}
        <div className="contact-actions">
          <a className="button" href="mailto:raj@gmail.com">
            Email me
          </a>
          <a className="button button-secondary" href="tel:+1234567890">
            Call me
          </a>
        </div>
        <div className="contact-meta">
          <div>
            <p className="eyebrow">Email</p>
            <p>raj@gmail.com</p>
          </div>
          <div>
            <p className="eyebrow">Location</p>
            <p>Remote / Worldwide</p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Contact;
