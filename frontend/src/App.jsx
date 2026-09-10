import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API = "http://127.0.0.1:8000";

function App() {
  const [features, setFeatures] = useState([]);
  const [logs, setLogs] = useState([]);
  const [userId, setUserId] = useState("");
  const [selectedFeature, setSelectedFeature] = useState("");
  const [result, setResult] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(null);

  const [newFeature, setNewFeature] = useState({
    key: "",
    enabled: true,
    rollout_percentage: 10,
  });

  const loadData = async () => {
    try {
      const [featureRes, logRes] = await Promise.all([
        axios.get(`${API}/features`),
        axios.get(`${API}/audit-logs`),
      ]);

      setFeatures(featureRes.data);
      setLogs(logRes.data);

      if (!selectedFeature && featureRes.data.length > 0) {
        setSelectedFeature(featureRes.data[0].key);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const createFeature = async () => {
    if (!newFeature.key.trim()) return;

    await axios.post(`${API}/features`, newFeature);

    setNewFeature({
      key: "",
      enabled: true,
      rollout_percentage: 10,
    });

    setShowCreate(false);
    loadData();
  };

  const updateFeature = async () => {
    await axios.put(`${API}/features/${showEdit.id}`, {
      enabled: showEdit.enabled,
      rollout_percentage: showEdit.rollout_percentage,
    });

    setShowEdit(null);
    loadData();
  };

  // Toggle feature directly from the dashboard
  const toggleFeature = async (feature) => {
    await axios.put(`${API}/features/${feature.id}`, {
      enabled: !feature.enabled,
      rollout_percentage: feature.rollout_percentage,
    });

    loadData();
  };

  const rollback = async (id) => {
    await axios.post(`${API}/features/${id}/rollback`);
    loadData();
  };

  const evaluateFeature = async () => {
    if (!selectedFeature || !userId.trim()) return;

    const response = await axios.post(`${API}/evaluate`, {
      feature: selectedFeature,
      user_id: userId,
    });

    setResult(response.data);
  };

  const enabledCount = features.filter((f) => f.enabled).length;
  const disabledCount = features.length - enabledCount;

  return (
    <div className="layout">

      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-icon">🚀</span>
          <span>ReleasePilot</span>
        </div>

        <nav>
          <div className="nav-item active">
            <span>⌂</span> Dashboard
          </div>

          <div className="nav-item">
            <span>⚑</span> Feature Flags
          </div>

          <div className="nav-item">
            <span>▷</span> Evaluate
          </div>

          <div className="nav-item">
            <span>▤</span> Audit Logs
          </div>
        </nav>

        <div className="sidebar-bottom">
          <div className="ship-card">
            <div className="ship-icon">⚡</div>
            <h3>Ship Faster</h3>
            <p>
              Feature flags for modern development.
            </p>
          </div>

          <div className="version">v1.0.0</div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="main">

        {/* HEADER */}
        <header className="topbar">
          <div>
            <h1>Welcome back! 👋</h1>
            <p>
              Manage your feature flags and rollouts with confidence.
            </p>
          </div>

          <div className="connection">
            <span className="status-dot"></span>
            API Connected
          </div>
        </header>

        {/* METRICS */}
        <div className="metrics">

          <div className="metric purple">
            <div className="metric-icon">⚑</div>
            <div>
              <span>Total Features</span>
              <strong>{features.length}</strong>
            </div>
          </div>

          <div className="metric green">
            <div className="metric-icon">✓</div>
            <div>
              <span>Enabled</span>
              <strong>{enabledCount}</strong>
            </div>
          </div>

          <div className="metric red">
            <div className="metric-icon">Ⅱ</div>
            <div>
              <span>Disabled</span>
              <strong>{disabledCount}</strong>
            </div>
          </div>

          <div className="metric blue">
            <div className="metric-icon">▤</div>
            <div>
              <span>Audit Events</span>
              <strong>{logs.length}</strong>
            </div>
          </div>

        </div>

        {/* FEATURES */}
        <section className="panel">

          <div className="panel-header">
            <div>
              <h2>⚑ Feature Flags</h2>
              <p>Control feature rollouts and manage configuration.</p>
            </div>

            <button
              className="primary-btn"
              onClick={() => setShowCreate(true)}
            >
              + Create Feature
            </button>
          </div>

          {features.map((feature) => (
            <div className="feature-card" key={feature.id}>

              <div className="feature-icon">◇</div>

              <div className="feature-info">
                <h3>{feature.key}</h3>

                <p className="feature-description">
                  Feature configuration and progressive rollout
                </p>

                <div className="feature-status">

                  <button
                    type="button"
                    className={`toggle ${feature.enabled ? "on" : ""}`}
                    onClick={() => toggleFeature(feature)}
                    aria-label={`Toggle ${feature.key}`}
                  >
                    <span></span>
                  </button>

                  <span>
                    {feature.enabled ? "Enabled" : "Disabled"}
                  </span>

                  <span className="rollout-label">
                    👥 {feature.rollout_percentage}% rollout
                  </span>
                </div>

                <div className="progress">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${feature.rollout_percentage}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="feature-actions">

                <button
                  className="edit-btn"
                  onClick={() => setShowEdit({ ...feature })}
                >
                  ✎ Edit
                </button>

                <button
                  className="rollback-btn"
                  onClick={() => rollback(feature.id)}
                >
                  ↶ Rollback
                </button>

              </div>
            </div>
          ))}

        </section>

        {/* LOWER GRID */}
        <div className="lower-grid">

          {/* EVALUATE */}
          <section className="panel evaluate-panel">

            <div className="panel-title">
              <div className="blue-icon">▷</div>
              <div>
                <h2>Evaluate Feature</h2>
                <p>
                  Check if a feature is enabled for a specific user.
                </p>
              </div>
            </div>

            <label>Feature</label>

            <select
              value={selectedFeature}
              onChange={(e) => setSelectedFeature(e.target.value)}
            >
              {features.map((feature) => (
                <option key={feature.id} value={feature.key}>
                  {feature.key}
                </option>
              ))}
            </select>

            <label>User ID</label>

            <input
              placeholder="Enter user ID (e.g. user123)"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />

            <button
              className="evaluate-btn"
              onClick={evaluateFeature}
            >
              ▷ Evaluate
            </button>

            <div className="result-box">

              {!result && (
                <span>
                  💡 Result will appear here...
                </span>
              )}

              {result && (
                <div className="result">
                  <strong>
                    {result.enabled ? "✓ ENABLED" : "✕ DISABLED"}
                  </strong>

                  <span>
                    Bucket: {result.bucket}
                  </span>

                  <span>
                    Rollout: {result.rollout_percentage}%
                  </span>
                </div>
              )}

            </div>

          </section>

          {/* AUDIT */}
          <section className="panel audit-panel">

            <div className="panel-title">
              <div className="blue-icon">▤</div>
              <div>
                <h2>Audit History</h2>
                <p>Track all changes to your feature flags.</p>
              </div>
            </div>

            <div className="timeline">

              {logs.slice().reverse().map((log) => (

                <div className="timeline-item" key={log.id}>

                  <div
                    className={`timeline-dot ${
                      log.action === "ROLLBACK"
                        ? "rollback-dot"
                        : "update-dot"
                    }`}
                  >
                    {log.action === "ROLLBACK" ? "↶" : "✎"}
                  </div>

                  <div className="timeline-content">

                    <strong>{log.action}</strong>

                    <span>
                      {log.old_value} → {log.new_value}
                    </span>

                  </div>

                  <small>
                    {new Date(log.created_at).toLocaleDateString()}
                  </small>

                </div>

              ))}

            </div>

          </section>

        </div>

        {/* BANNER */}
        <section className="release-banner">

          <div>
            <h2>Release Better Software</h2>

            <p>
              Feature flags. Progressive rollouts. Instant rollback.
            </p>

            <div className="banner-features">
              <span>🛡 Reduce Risk</span>
              <span>👥 Target Users</span>
              <span>⚡ Ship Faster</span>
            </div>
          </div>

          <div className="banner-rocket">
            🚀
          </div>

        </section>

      </main>

      {/* CREATE MODAL */}
      {showCreate && (
        <div className="modal-overlay">
          <div className="modal">

            <h2>Create Feature</h2>

            <input
              placeholder="Feature key"
              value={newFeature.key}
              onChange={(e) =>
                setNewFeature({
                  ...newFeature,
                  key: e.target.value,
                })
              }
            />

            <input
              type="number"
              min="0"
              max="100"
              placeholder="Rollout percentage"
              value={newFeature.rollout_percentage}
              onChange={(e) =>
                setNewFeature({
                  ...newFeature,
                  rollout_percentage: Number(e.target.value),
                })
              }
            />

            <div className="modal-actions">

              <button
                className="cancel-btn"
                onClick={() => setShowCreate(false)}
              >
                Cancel
              </button>

              <button
                className="primary-btn"
                onClick={createFeature}
              >
                Create
              </button>

            </div>

          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEdit && (
        <div className="modal-overlay">
          <div className="modal">

            <h2>Edit Feature</h2>

            <h3>{showEdit.key}</h3>

            <label>Rollout Percentage</label>

            <input
              type="number"
              min="0"
              max="100"
              value={showEdit.rollout_percentage}
              onChange={(e) =>
                setShowEdit({
                  ...showEdit,
                  rollout_percentage: Number(e.target.value),
                })
              }
            />

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={showEdit.enabled}
                onChange={(e) =>
                  setShowEdit({
                    ...showEdit,
                    enabled: e.target.checked,
                  })
                }
              />
              Enabled
            </label>

            <div className="modal-actions">

              <button
                className="cancel-btn"
                onClick={() => setShowEdit(null)}
              >
                Cancel
              </button>

              <button
                className="primary-btn"
                onClick={updateFeature}
              >
                Save Changes
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default App;