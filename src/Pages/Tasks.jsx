import { useEffect, useState } from "react";
import { Check, CircleAlert, LogOut, LoaderCircle, Plus, Trash2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createTask, deleteTask, getCurrentUser, getTasks, updateTask } from "../lib/api";

const emptyForm = { title: "", description: "", priority: "medium" };

function Tasks() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [user, setUser] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!localStorage.getItem("taskmanager_token")) {
      navigate("/login", { replace: true });
      return undefined;
    }
    let active = true;
    Promise.all([getTasks(), getCurrentUser()])
      .then(([taskBody, userBody]) => {
        if (active) {
          setTasks(taskBody.tasks || []);
          setUser(userBody.user);
        }
      })
      .catch((requestError) => {
        if (requestError.status === 401) {
          localStorage.removeItem("taskmanager_token");
          navigate("/login", { replace: true });
        } else if (active) {
          setError(requestError.message);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [navigate]);

  function handleAuthError(requestError) {
    if (requestError.status === 401) {
      localStorage.removeItem("taskmanager_token");
      navigate("/login", { replace: true });
      return true;
    }
    return false;
  }

  function handleLogout() {
    localStorage.removeItem("taskmanager_token");
    navigate("/login", { replace: true });
  }

  function showNotice(message) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3200);
  }

  async function handleCreate(event) {
    event.preventDefault();
    const title = form.title.trim();
    if (!title) {
      setError("A task title is required.");
      return;
    }

    const optimisticTask = {
      _id: `optimistic-${Date.now()}`,
      title,
      description: form.description.trim(),
      priority: form.priority,
      completed: false,
      optimistic: true,
    };
    setSaving(true);
    setError("");
    setTasks((current) => [optimisticTask, ...current]);
    setForm(emptyForm);

    try {
      const body = await createTask({
        title,
        description: optimisticTask.description,
        priority: optimisticTask.priority,
      });
      setTasks((current) => current.map((task) => (
        task._id === optimisticTask._id ? body.task : task
      )));
      showNotice("Task created and saved to MongoDB.");
    } catch (requestError) {
      setTasks((current) => current.filter((task) => task._id !== optimisticTask._id));
      if (!handleAuthError(requestError)) setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(task) {
    setBusyId(task._id);
    setError("");
    try {
      const body = await updateTask(task._id, { completed: !task.completed });
      setTasks((current) => current.map((item) => (
        item._id === task._id ? body.task : item
      )));
      showNotice(task.completed ? "Task marked active." : "Task completed.");
    } catch (requestError) {
      if (!handleAuthError(requestError)) setError(requestError.message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(task) {
    if (!window.confirm(`Delete “${task.title}”?`)) return;
    setBusyId(task._id);
    setError("");
    try {
      await deleteTask(task._id);
      setTasks((current) => current.filter((item) => item._id !== task._id));
      showNotice("Task deleted.");
    } catch (requestError) {
      if (!handleAuthError(requestError)) setError(requestError.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main className="page-section tasks-page">
      <section className="tasks-intro">
        <div>
          <p className="eyebrow">Practical 7 / authenticated workspace</p>
          <h1>Task control room</h1>
          <p className="section-copy">Private task data for {user?.email || "your account"}. Every request is authorized by JWT.</p>
        </div>
        <div className="task-header-actions">
          <div className="task-count" aria-label={`${tasks.length} tasks in the database`}>
            <strong>{tasks.length}</strong>
            <span>private tasks</span>
          </div>
          <button className="icon-button" type="button" onClick={handleLogout} title="Log out" aria-label="Log out">
            <LogOut size={18} />
          </button>
        </div>
      </section>

      <section className="task-layout" aria-label="Task management">
        <form className="section task-form" onSubmit={handleCreate}>
          <div className="section-heading">
            <div>
              <p className="eyebrow">Create</p>
              <h2>Capture the next thing</h2>
            </div>
            <Plus aria-hidden="true" size={22} />
          </div>
          <label>
            Title
            <input
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              placeholder="e.g. Review API responses"
              maxLength={120}
              required
            />
          </label>
          <label>
            Description
            <textarea
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              placeholder="Add useful context"
              rows="4"
            />
          </label>
          <label>
            Priority
            <select
              value={form.priority}
              onChange={(event) => setForm({ ...form, priority: event.target.value })}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>
          <button className="button task-submit" type="submit" disabled={saving}>
            {saving ? <LoaderCircle className="spin" size={18} /> : <Plus size={18} />}
            {saving ? "Saving..." : "Add task"}
          </button>
        </form>

        <section className="section task-list-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Your queue</p>
              <h2>Tasks that stay put</h2>
            </div>
            <span className="sync-status"><span /> MongoDB live</span>
          </div>

          {error && (
            <div className="task-alert" role="alert">
              <CircleAlert size={18} />
              <span>{error}</span>
              <button type="button" aria-label="Dismiss error" onClick={() => setError("")}><X size={16} /></button>
            </div>
          )}
          {loading ? (
            <div className="task-state"><LoaderCircle className="spin" size={24} /><span>Loading your tasks...</span></div>
          ) : tasks.length === 0 ? (
            <div className="task-state empty-state"><Check size={28} /><span>No tasks yet. Add the first one.</span></div>
          ) : (
            <div className="task-list">
              {tasks.map((task) => (
                <article className={`task-item ${task.completed ? "is-complete" : ""}`} key={task._id}>
                  <button
                    className="task-check"
                    type="button"
                    onClick={() => handleToggle(task)}
                    disabled={busyId === task._id || task.optimistic}
                    aria-label={task.completed ? `Mark ${task.title} active` : `Complete ${task.title}`}
                  >
                    {task.completed && <Check size={16} />}
                  </button>
                  <div className="task-copy">
                    <div className="task-title-row">
                      <h3>{task.title}</h3>
                      <span className={`priority priority-${task.priority}`}>{task.priority}</span>
                    </div>
                    {task.description && <p>{task.description}</p>}
                    <small>{task.optimistic ? "Saving..." : task.completed ? "Completed" : "Open"}</small>
                  </div>
                  <button
                    className="icon-button danger"
                    type="button"
                    onClick={() => handleDelete(task)}
                    disabled={busyId === task._id || task.optimistic}
                    aria-label={`Delete ${task.title}`}
                    title="Delete task"
                  >
                    {busyId === task._id ? <LoaderCircle className="spin" size={18} /> : <Trash2 size={18} />}
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>

      {notice && <div className="toast" role="status"><Check size={18} /> {notice}</div>}
    </main>
  );
}

export default Tasks;
