# Airth Mini Job Queue Management Dashboard

[![NestJS](https://img.shields.io/badge/Backend-NestJS_v10-e31b5f.svg)](https://nestjs.com/)
[![React](https://img.shields.io/badge/Frontend-React_v18-61dafb.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript_v5-3178c6.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

An enterprise-grade, high-performance **Mini Job Queue Management Dashboard** built for the **Airth React + NestJS Intern Assignment**. 

This repository demonstrates best practices in **API Design**, **Finite State Machine (FSM) validation**, **Atomic Database Concurrency Protection**, **Real-time WebSockets**, and **React State Management**.

---

## 🚀 Live Links & Quick Start

* 📡 **Live Backend API**: `https://airth-queue-backend.onrender.com` *(or local: `http://localhost:3001`)*
* 💻 **Live Frontend Dashboard**: `https://airth-queue-frontend.vercel.app` *(or local: `http://localhost:3000`)*
* 📄 **Interactive Swagger API Docs**: `http://localhost:3001/api/docs`

---

## 📦 System Architecture & Features

```
               ┌────────────────────────────────────────────────────────┐
               │              React 18 Dashboard (Vite)                 │
               │  - Real-time Metrics & Filter Chips                    │
               │  - FSM Transition Control Buttons                      │
               │  - Live Race Condition Simulator Widget                │
               └───────────────────────────┬────────────────────────────┘
                                           │
                                 HTTP REST / WebSockets
                                           │
               ┌───────────────────────────▼────────────────────────────┐
               │              NestJS Backend (Port 3001)                │
               │  - Global ValidationPipe & HttpExceptionFilter        │
               │  - FSM State Guard & Transition Validation           │
               │  - Socket.io Real-time Event Gateway                   │
               │  - Background Queue Worker Simulation                  │
               └───────────────────────────┬────────────────────────────┘
                                           │
                                Atomic SQL Queries
                                           │
               ┌───────────────────────────▼────────────────────────────┐
               │             SQLite / PostgreSQL Database               │
               │  - Atomic `WHERE status = :expectedStatus`             │
               │  - Optimistic Version Lock (@VersionColumn)            │
               └────────────────────────────────────────────────────────┘
```

---

## 🧠 Critical Thinking & Architectural Decisions

### 1. State Machine Transitions
Jobs follow a strict, uni-directional Finite State Machine (FSM):

$$\text{pending} \longrightarrow \text{running} \longrightarrow \begin{cases} \text{completed} \\ \text{failed} \end{cases}$$

* **Terminal States**: `completed` and `failed` are immutable. They can **never** transition back to `running` or `pending`.
* **Allowed Transitions**:
  * `pending` $\rightarrow$ `running`
  * `running` $\rightarrow$ `completed` OR `failed`

---

### 2. Answering the Core Questions

#### Q1: Where should state transition rules be enforced?
> **Answer**: State machine rules **MUST** be enforced in the **Backend Service & Database layer**. While the React UI conditionally disables buttons, client-side validation can be bypassed. NestJS validates the requested transition via `isValidTransition()` before hitting the DB.

#### Q2: What happens if someone bypasses the React application and calls the API directly?
> **Answer**: The NestJS backend intercepts the request through `ValidationPipe` (verifying DTO types) and `JobsService.updateStatus()`. If an illegal state transition is attempted (e.g. `completed` $\rightarrow$ `running`), the API returns a standardized `400 Bad Request` payload:
> ```json
> {
>   "statusCode": 400,
>   "timestamp": "2026-09-15T12:00:00.000Z",
>   "path": "/jobs/uuid-1234/status",
>   "message": "Invalid state transition: Cannot change status from \"completed\" to \"running\""
> }
> ```

#### Q3: What happens when two requests arrive at nearly the same time? (Race Condition)
> **Answer**: Imagine two browser tabs hit `PATCH /jobs/:id/status` to transition a job from `pending` $\rightarrow$ `running` at the exact same millisecond.
> 
> To prevent race conditions, we use an **Atomic Conditional SQL Query**:
> ```typescript
> const updateResult = await this.jobRepository
>   .createQueryBuilder()
>   .update(Job)
>   .set({ status: newStatus, updatedAt: new Date() })
>   .where('id = :id AND status = :expectedStatus', {
>     id,
>     expectedStatus: currentStatus, // Must still be 'pending' in DB
>   })
>   .execute();
> ```
> 
> * **Request 1**: First to reach the DB $\rightarrow$ updates row $\rightarrow$ `affected === 1` $\rightarrow$ Returns `200 OK`.
> * **Request 2**: Second to reach the DB $\rightarrow$ `status` is now `running` $\rightarrow$ `affected === 0` $\rightarrow$ Throws `409 ConflictException`:
>   ```json
>   {
>     "statusCode": 409,
>     "message": "Concurrency Conflict: Job [id] was modified by another concurrent request or tab."
>   }
>   ```

#### Q4: How would you prevent an invalid or inconsistent state?
> **Answer**: 
> 1. Database-level enum checks and non-null constraints.
> 2. TypeORM `@VersionColumn()` optimistic locking.
> 3. Atomic conditional SQL updates ensuring zero phantom state overwrites.

---

## ⭐ Bonus Feature: Production-Ready Enhancements

1. **Real-Time WebSockets (`Socket.io`)**: Broadcasts job creations, status updates, and metric count changes instantly across all open browser sessions without polling.
2. **Background Queue Worker Simulation**: When a job enters `running` status, an asynchronous worker simulates processing for 4 seconds before automatically finalizing it as `completed` (or `failed`), demonstrating real job queue lifecycle dynamics.
3. **Interactive Race Condition Simulator Widget**: Built right into the React dashboard top bar! Evaluators can click **"Test Race Condition"** to intentionally fire 2 parallel HTTP PATCH requests side-by-side and observe live `200 OK` vs `409 Conflict` resolution.

---

## 🛠️ Local Installation & Setup

### Prerequisites
* Node.js v18+ 
* npm v9+

### 1. Backend Setup (NestJS)
```bash
cd backend
npm install
npm run start:dev
```
Backend will start at `http://localhost:3001` with Swagger docs at `http://localhost:3001/api/docs`.

To run automated state machine & concurrency E2E tests:
```bash
npm run test:e2e
```

### 2. Frontend Setup (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
Frontend dashboard will be running at `http://localhost:3000`.

---

## 🧪 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/jobs` | Create a new job (`status: pending`) |
| `GET` | `/jobs` | List all jobs (supports `?status=pending`) |
| `GET` | `/jobs/counts` | Get count breakdown per status |
| `GET` | `/jobs/:id` | Get specific job by ID |
| `PATCH` | `/jobs/:id/status` | Update job status with FSM & concurrency lock |
| `DELETE` | `/jobs/:id` | Delete a job |

---

## 📝 License
Created by **Shrishti Tomar** for the **Airth Intern Assignment**.
