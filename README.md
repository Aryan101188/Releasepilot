# 🚀 ReleasePilot

ReleasePilot is a feature flag and progressive rollout platform designed to help teams release software safely and gradually.

It provides a REST API and React dashboard for creating feature flags, controlling rollout percentages, evaluating features for users, tracking configuration changes, and performing instant rollbacks.

## ✨ Features

- Feature flag creation and management
- Enable/disable feature flags
- Percentage-based progressive rollouts
- Deterministic user bucketing using SHA-256
- Per-user feature evaluation
- Instant rollback to 0% rollout
- Audit logging for configuration changes
- React dashboard with rollout visualization
- Persistent storage using SQLite and SQLAlchemy
- RESTful FastAPI backend
- Docker configuration for backend and frontend

## 🏗️ Architecture

```text
                 React Dashboard
                       |
                    Axios
                       |
                       v
                FastAPI REST API
                       |
          +------------+------------+
          |                         |
          v                         v
     Feature Flags             Audit Logs
          |                         |
          +------------+------------+
                       |
                       v
                    SQLite


🛠️ Tech Stack
Frontend
React
Vite
Axios
CSS
Backend
Python
FastAPI
SQLAlchemy
Pydantic
SQLite
DevOps
Docker
Docker Compose
🎯 Progressive Rollout

ReleasePilot uses deterministic user bucketing to consistently decide whether a user receives a feature.

The system combines the feature key and user ID, hashes the value using SHA-256, and maps the result to a bucket from 0 to 99.

Feature Key + User ID
        |
        v
     SHA-256
        |
        v
   Integer Hash
        |
        v
      % 100
        |
        v
   Bucket 0-99

The evaluation rule is:

bucket < rollout_percentage

For example, with a 30% rollout:

User bucket = 22

22 < 30
   ↓
ENABLED

While:

User bucket = 71

71 < 30
   ↓
DISABLED

Because the calculation is deterministic, the same user consistently receives the same result for the same feature configuration.

🔄 Release Workflow

A typical rollout can gradually increase exposure:

0%   → Internal testing
10%  → Small production rollout
30%  → Wider validation
50%  → Majority of users
100% → Full release

If an issue is detected, the feature can be immediately rolled back:

30% rollout
     ↓
   Issue
     ↓
  Rollback
     ↓
0% rollout
🔌 API Endpoints
Method	Endpoint	Description
GET	/	API health/root response
POST	/features	Create a feature flag
GET	/features	List feature flags
PUT	/features/{id}	Update feature configuration
POST	/features/{id}/rollback	Roll back a feature
POST	/evaluate	Evaluate a feature for a user
GET	/audit-logs	View configuration history
🧪 Example Evaluation
Request
POST /evaluate
{
  "feature": "new-payment-page",
  "user_id": "user123"
}
Response
{
  "enabled": true,
  "bucket": 22,
  "rollout_percentage": 30
}

The dashboard also provides a manual evaluation interface for testing specific users.

📋 Audit Logging

ReleasePilot records important configuration changes.

Example:

UPDATE
enabled=False, rollout=10
        ↓
enabled=True, rollout=30

Rollback actions are also recorded:

ROLLBACK
enabled=True, rollout=30
        ↓
enabled=False, rollout=0

This provides a history of feature configuration changes.

🖥️ Running Locally
1. Clone the repository
git clone https://github.com/Aryan101188/Releasepilot.git
cd Releasepilot
2. Start the backend

From the project root:

.\venv\Scripts\Activate.ps1
uvicorn backend.main:app --reload

Backend:

http://127.0.0.1:8000

FastAPI documentation:

http://127.0.0.1:8000/docs
3. Start the frontend

Open another terminal:

cd frontend
npm install
npm run dev

Frontend:

http://localhost:5173
📁 Project Structure
releasepilot/
│
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── Dockerfile
│   └── models/
│       ├── feature.py
│       └── audit.py
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── Dockerfile
│   ├── package.json
│   └── vite.config.js
│
├── docker-compose.yml
├── .gitignore
└── README.md
💡 Why ReleasePilot?

Progressive delivery reduces release risk by allowing teams to expose new functionality gradually instead of enabling it for every user at once.

ReleasePilot demonstrates practical concepts including:

Feature flag management
Progressive delivery
Deterministic hashing
REST API design
Database persistence
Auditability
Rollback workflows
Frontend/backend integration
📌 Project Status

ReleasePilot is a placement-focused MVP demonstrating feature flag management, deterministic progressive delivery, REST APIs, persistent storage, audit logging, and rollback capabilities.
