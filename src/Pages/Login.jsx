import { useState } from "react";
import { ArrowRight, KeyRound, LoaderCircle, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { login, register } from "../lib/api";

function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (mode === "register") {
        await register(form);
      }
      const body = mode === "login" ? await login(form) : await login(form);
      localStorage.setItem("taskmanager_token", body.token);
      navigate("/tasks");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  const isLogin = mode === "login";
  return (
    <main className="page-section auth-page">
      <section className="section card auth-card">
        <div className="auth-mark"><KeyRound size={20} /></div>
        <p className="eyebrow">Practical 7 / secure access</p>
        <h1>{isLogin ? "Welcome back" : "Create your account"}</h1>
        <p className="section-copy">
          {isLogin ? "Sign in to view and manage your private task queue." : "Your password is hashed before it reaches MongoDB."}
        </p>
        <div className="auth-switcher" role="tablist" aria-label="Authentication mode">
          <button type="button" className={isLogin ? "active" : ""} onClick={() => { setMode("login"); setError(""); }}>Sign in</button>
          <button type="button" className={!isLogin ? "active" : ""} onClick={() => { setMode("register"); setError(""); }}>Register</button>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="you@example.com" required />
          </label>
          <label>
            Password
            <input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="At least 8 characters" minLength={8} required />
          </label>
          {error && <p className="auth-error" role="alert">{error}</p>}
          <button className="button task-submit" type="submit" disabled={busy}>
            {busy ? <LoaderCircle className="spin" size={18} /> : isLogin ? <ArrowRight size={18} /> : <UserPlus size={18} />}
            {busy ? "Working..." : isLogin ? "Sign in" : "Create account"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default Login;
