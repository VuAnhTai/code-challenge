# Live Scoreboard API Module Specification

Link design system: https://www.figma.com/board/85wZDuYKNiOiZKZde9i1xJ/Untitled?node-id=0-1&p=f&t=JDa3uuRZOsMm4uct-0

## Overview

This document provides specifications for the Live Scoreboard API module, responsible for managing user scores and providing real-time updates to the website's top 10 leaderboard.

## Table of Contents

1. [Module Purpose](#module-purpose)
2. [System Architecture](#system-architecture)
3. [API Endpoints](#api-endpoints)
4. [Authentication & Security](#authentication--security)
5. [Data Model](#data-model)
6. [Real-time Updates](#real-time-updates)
7. [Performance Considerations](#performance-considerations)
8. [Error Handling](#error-handling)
9. [Potential Improvements](#potential-improvements)

## Module Purpose

The Live Scoreboard API module enables:

- Secure updating of user scores after completed actions

- Real-time broadcasting of scoreboard changes

- Protection against unauthorized score modifications

- Efficient retrieval of top-ranking users

## System Architecture

### Components

1. **API Service** - Handles HTTP requests for score updates and retrievals

2. **Authentication Service** - Verifies user identity and action legitimacy

3. **Score Processor** - Validates and processes score updates

4. **WebSocket Server** - Broadcasts real-time scoreboard changes

5. **Database** - Stores user scores and related data

6. **Redis Cache** - Maintains the current top 10 leaderboard for fast access

### Flow Diagram

```
┌────────────┐     ┌─────────────────┐     ┌───────────────┐     ┌───────────────┐
│            │     │                 │     │               │     │               │
│  Website   │     │  API Gateway    │     │  Auth Service │     │  API Service  │
│            │     │                 │     │               │     │               │
└─────┬──────┘     └────────┬────────┘     └───────┬───────┘     └───────┬───────┘
      │                     │                      │                     │
      │  1. Complete Action │                      │                     │
      ├────────────────────►│                      │                     │
      │                     │                      │                     │
      │                     │  2. Authenticate     │                     │
      │                     ├─────────────────────►│                     │
      │                     │                      │                     │
      │                     │  3. Auth Response    │                     │
      │                     │◄─────────────────────┤                     │
      │                     │                      │                     │
      │                     │  4. Forward Request  │                     │
      │                     ├────────────────────────────────────────────►
      │                     │                      │                     │
      │                     │                      │                     │  ┌───────────────┐
      │                     │                      │                     │  │               │
      │                     │                      │                     │  │  Database     │
      │                     │                      │                     │  │               │
      │                     │                      │                     │  └───────┬───────┘
      │                     │                      │                     │          │
      │                     │                      │                     │  5. Update Score
      │                     │                      │                     ├─────────►│
      │                     │                      │                     │          │
      │                     │                      │                     │  6. Updated Data
      │                     │                      │                     │◄─────────┤
      │                     │                      │                     │          │
      │                     │                      │                     │          │
      │                     │                      │                     │  ┌───────┴───────┐
      │                     │                      │                     │  │               │
      │                     │                      │                     │  │  Redis Cache  │
      │                     │                      │                     │  │               │
      │                     │                      │                     │  └───────┬───────┘
      │                     │                      │                     │          │
      │                     │                      │                     │  7. Update Cache
      │                     │                      │                     ├─────────►│
      │                     │                      │                     │          │
┌─────┴──────┐     ┌────────┴────────┐     ┌───────┴───────┐     ┌───────┴───────┐          │
│            │     │                 │     │               │     │               │          │
│  Website   │◄────┤  WebSocket     │◄────┤               │◄────┤  API Service  │◄─────────┘
│            │     │  Server        │     │               │     │               │
└────────────┘     └─────────────────┘     └───────────────┘     └───────────────┘
      ▲                                                                 │
      │                                                                 │
      │            8. Broadcast Scoreboard Update                       │
      ├─────────────────────────────────────────────────────────────────┘
```

## API Endpoints

### 1. Update User Score

```
POST /api/scores/update
```

**Request:**

```json
{
  "actionId": "string",  // Unique identifier for the completed action
  "actionData": {        // Data related to the action, for verification
    "timestamp": "string",
    "metadata": "object"
  }
}
```

**Response:**

```json
{
  "success": true,
  "newScore": 1250,
  "rank": 7,
  "message": "Score updated successfully"
}
```

### 2. Get Top 10 Leaderboard

```
GET /api/scores/leaderboard
```

**Response:**

```json
{
  "lastUpdated": "2023-05-15T14:32:10Z",
  "leaders": [
    {
      "userId": "string",
      "username": "string",
      "score": 9876,
      "rank": 1,
      "avatar": "string" // URL
    },
    // 9 more entries...
  ]
}
```

### 3. Get User Rank

```
GET /api/scores/rank/:userId
```

**Response:**

```json
{
  "userId": "string",
  "username": "string",
  "score": 1250,
  "rank": 57
}
```

### 4. Get User Rank History

```
GET /api/scores/history/:userId
```

**Parameters:**
- `period`: string (optional) - "daily", "weekly", "monthly", "all"
- `limit`: number (optional) - Number of records to return, default: 30
- `from`: timestamp (optional) - Start date
- `to`: timestamp (optional) - End date

**Response:**

```json
{
  "userId": "string",
  "username": "string",
  "history": [
    {
      "timestamp": "2023-05-15T14:32:10Z",
      "rank": 57,
      "score": 1250,
      "event": "daily_snapshot"
    },
    // more entries...
  ]
}
```

### 5. WebSocket Connection

```
WS /api/scores/live
```

The WebSocket sends scoreboard updates whenever there's a change in the top 10.

## Authentication & Security

### Score Update Authentication

1. **JWT Authentication** - All requests must include a valid JWT token
2. **Action Verification**
   - Each score-generating action receives a unique, time-bound `actionId`
   - The action can only be used once to update a score
   - The system verifies that the action was legitimate before updating scores

### Security Measures

1. **Rate Limiting**
   - Maximum 10 score update requests per minute per user
   - Excessive requests trigger temporary blocks

2. **Action Expiration**
   - Actions expire after 2 minutes
   - Prevents delayed or replayed score updates

3. **Audit Logging**
   - All score updates are logged with user ID, IP address, and action details
   - Logs are monitored for suspicious patterns

## Data Model

The data model is designed for optimizing both write performance (score updates) and read performance (leaderboard generation), while maintaining data integrity and security.

### User Score Schema

```
User {
  userId: string (primary key)
  username: string
  email: string
  score: integer
  lastScoreUpdate: timestamp
}
```

**Purpose:**
- Stores the primary user information and current score
- Keeps track of the most recent score update for analytics and security monitoring
- Designed for high-frequency read operations when generating leaderboards

**Indexing Strategy:**
- Primary index: `userId` for direct user lookups
- Secondary index: `score` (descending) for efficient leaderboard generation
- Compound index: `(score, lastScoreUpdate)` for tie-breaking in rankings

### UserRankSnapshot Schema

```
UserRankSnapshot {
  id: string (primary key)
  userId: string (indexed)
  timestamp: timestamp (indexed)
  rank: integer
  score: integer
  event: string  // "daily", "achievement", "entered_top_10", etc.
}
```

**Purpose:**
- Records point-in-time snapshots of a user's rank and score
- Enables historical trends analysis without bloating the User document
- Captures meaningful events in a user's ranking journey

**When Snapshots Are Created:**
1. **Scheduled snapshots**: Daily/weekly captures for all users
2. **Milestone snapshots**: When a user reaches a new personal best
3. **Threshold snapshots**: When entering or leaving significant rank thresholds (top 10, 50, 100)
4. **Achievement snapshots**: When earning badges or completing special actions

**Indexing Strategy:**
- Primary index: `id` (generated UUID or auto-increment)
- Secondary indices:
  - `userId` for retrieving a user's complete history
  - `timestamp` for time-based queries
  - Compound index: `(userId, timestamp)` for efficient user history retrieval

**Storage Optimization:**
- Time-based partitioning for efficient pruning of old data
- Scheduled aggregation of older snapshots (e.g., daily → weekly → monthly)

### Action Schema

```
Action {
  actionId: string (primary key)
  userId: string (foreign key)
  type: string
  pointsAwarded: integer
  timestamp: timestamp
  metadata: object
  used: boolean
}
```

**Purpose:**
- Creates an audit trail for score-increasing actions
- Ensures each action can only be used once to update a score
- Provides data for security monitoring and analytics

**Security Features:**
- The `used` flag prevents replay attacks
- TTL (Time To Live) on actions ensures they expire after 2 minutes
- `metadata` stores context-specific details that can be verified

**Indexing Strategy:**
- Primary index: `actionId` for O(1) lookups during verification
- Secondary indices:
  - `userId` for retrieving a user's recent actions
  - `timestamp` with TTL for automatic expiration
  - Compound index: `(userId, used)` for identifying unused actions

### Relationships Between Models:

1. **User → UserRankSnapshot (One-to-Many)**
   - Each User has multiple historical rank snapshots
   - The current rank is calculated on-demand, not stored

2. **User → Action (One-to-Many)**
   - Each User can perform multiple score-increasing actions
   - Actions directly influence the User's score

3. **Action → Score Update (One-to-One)**
   - Each verified Action results in exactly one score update
   - The mapping is tracked via the `used` flag

### Data Consistency Considerations:

1. **Transactional Updates**:
   - Score updates and Action status changes occur in a single transaction
   - Prevents situations where scores are updated but actions remain reusable

2. **Eventual Consistency**:
   - Rank snapshots and leaderboard updates may have slight delays
   - Redis cache ensures users see consistent top 10 rankings despite any database lag

3. **Conflict Resolution**:
   - Timestamp-based conflict resolution if multiple score updates occur simultaneously
   - Last-writer-wins with verification of action legitimacy

## Real-time Updates

### WebSocket Implementation

1. The system uses WebSockets to push scoreboard updates to connected clients
2. When a user's score changes the top 10 rankings, all connected clients receive an update
3. Updates include the full top 10 list to ensure consistency

### Update Protocol

1. Client connects to `/api/scores/live`
2. Server sends the initial leaderboard
3. Server broadcasts updates whenever the top 10 changes
4. Clients receive and render the updated leaderboard

## Performance Considerations

1. **Caching Strategy**
   - Top 10 leaderboard is cached in Redis
   - Cache refreshes every 10 seconds or when a top-ranked score changes

2. **Database Optimization**
   - Indexed queries for score updates and retrievals
   - Denormalized score data for faster leaderboard generation

3. **Scaling**
   - Horizontal scaling of the API service
   - WebSocket connections distributed with sticky sessions

## Error Handling

1. **Common Errors**
   - `401`: Authentication failure
   - `403`: Rate limit exceeded or action already used
   - `404`: User not found
   - `409`: Conflicting score update
   - `500`: Internal server error

2. **Monitoring**
   - Error rates tracked in CloudWatch/Datadog
   - Alerts for unusual error patterns
   - Detailed logging for debugging

## Potential Improvements

1. **Advanced Features**
   - Historical leaderboards (daily/weekly/monthly)
   - Score categories or filters
   - Achievement badges for milestone scores

2. **Technical Enhancements**
   - GraphQL API for more flexible data querying
   - Event-driven architecture using message queues
   - Machine learning for anomaly detection in score patterns

3. **Performance Optimizations**
   - Edge caching for global deployment
   - Sharded database for higher throughput
   - Optimistic UI updates to reduce perceived latency
