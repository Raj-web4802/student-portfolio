import { useState, useEffect } from "react";
import Spinner from "../components/Spinner";
import ErrorMessage from "../components/ErrorMessage";

function Projects() {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [userProfile, setUserProfile] = useState(null);
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState(null);

  const GITHUB_USER = "Raj-web4802";
  const apiUrl = `https://api.github.com/users/${GITHUB_USER}/repos`;

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(apiUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) setRepos(data);
        else throw new Error(data.message || "Unexpected response");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [apiUrl]);
  async function fetchUserProfile(username) {
    setUserLoading(true);
    setUserError(null);
    setUserProfile(null);
    try {
      const url = `https://api.github.com/users/${username}`;
      const res = await fetch(url);
      if (!res.ok) {
        if (res.status === 404) throw new Error("User not found");
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      setUserProfile(data);

      // Fetch the user's repositories and show them
      setLoading(true);
      setError(null);
      try {
        const rres = await fetch(`https://api.github.com/users/${username}/repos`);
        if (!rres.ok) throw new Error(`HTTP ${rres.status}`);
        const rdata = await rres.json();
        if (Array.isArray(rdata)) setRepos(rdata);
        else throw new Error(rdata.message || "Unexpected response");
      } catch (rerr) {
        setError(rerr.message);
      } finally {
        setLoading(false);
      }

      setSearchTerm("");
    } catch (err) {
      setUserError(err.message);
    } finally {
      setUserLoading(false);
    }
  }

  

  return (
    <main className="page-section">
      <section className="section card">
        <p className="eyebrow">Projects</p>
        <h2>Featured work</h2>
        <p className="section-copy">
          These projects are designed to showcase clean layouts, accessible interactions, and practical component structure.
        </p>
        <div className="project-search">
          <input
            type="search"
            placeholder="Search repositories"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") setSearchTerm(query);
            }}
            aria-label="Search repositories"
          />
          <button
            type="button"
            className="button button-small"
            onClick={() => {
              const name = query.trim();
              setSearchTerm(name);
              if (name) fetchUserProfile(name);
              else {
                setUserProfile(null);
                setUserError(null);
              }
            }}
          >
            Search
          </button>
        </div>

        {userLoading && <p>Loading profile…</p>}
        {userError && <ErrorMessage message={userError} />}
        {userProfile && (
          <div className="profile-card">
            <img src={userProfile.avatar_url} alt={`${userProfile.login} avatar`} />
            <div className="profile-meta">
              <h3>{userProfile.name || userProfile.login}</h3>
              <p className="muted">{userProfile.login}</p>
              <p>{userProfile.bio}</p>
              <div className="profile-stats">
                <span>{userProfile.public_repos} repos</span>
                <span>{userProfile.followers} followers</span>
              </div>
              <button
                type="button"
                className="button button-small"
                onClick={() => window.open(userProfile.html_url, "_blank", "noopener,noreferrer")}
              >
                View profile
              </button>
            </div>
          </div>
        )}

        {error && <ErrorMessage message={error} />}
        {loading ? (
          <Spinner />
        ) : (
          <div className="project-grid">
            {repos
              .filter((r) => r.name.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((r) => (
                <article key={r.id} className="project-card">
                  <h3>{r.name}</h3>
                  <p>{r.description || "No description"}</p>
                  <button
                    type="button"
                    className="button project-link"
                    onClick={() => window.open(r.html_url, "_blank", "noopener,noreferrer")}
                    aria-label={`Open ${r.name} on GitHub in a new tab`}
                  >
                    View on GitHub
                  </button>
                </article>
              ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default Projects;
