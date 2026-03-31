# FlexiCare Matching API Contract

This document describes the mission matching flow for a Yango-like experience:

- the client creates a mission
- FlexiCare finds the best available provider
- the provider is assigned automatically
- the client tracks the mission until completion

## Core Rules

- A provider must be `available` to be considered.
- A provider must match the requested service category.
- A provider closer to the client gets a higher score.
- Higher-rated and verified providers get a higher score.
- The backend should keep the final assignment decision.
- The frontend only consumes the results and updates the UI.

## Mission Statuses

Mission lifecycle:

- `pending`
- `assigned`
- `in_progress`
- `completed`
- `cancelled`

Matching lifecycle:

- `searching`
- `candidate_found`
- `assigned`
- `expired`
- `failed`

Provider availability:

- `available`
- `offline`
- `busy`

## 1. Create a Mission

`POST /api/client/missions`

### Request

```json
{
  "service_id": 2,
  "mission_type": "urgent",
  "title": "Besoin d'aide à domicile",
  "description": "Intervention immédiate",
  "price": 25000,
  "latitude": 3.3792,
  "longitude": 6.5244,
  "address": "Bastos, Yaounde",
  "start_date": "2026-03-24T10:00:00Z",
  "end_date": null
}
```

### Response

```json
{
  "success": true,
  "data": {
    "mission": {
      "id": 3,
      "status": "pending"
    },
    "matching_status": "searching"
  },
  "message": "Mission created and matching started"
}
```

### Notes

- If the client wallet is insufficient, the mission must not be created.
- Matching starts immediately after mission creation.
- The client should be redirected to the searching screen.

## 2. Mission Detail

`GET /api/client/missions/{mission}`

### Response

```json
{
  "success": true,
  "data": {
    "id": 3,
    "title": "Besoin d'aide à domicile",
    "status": "pending",
    "mission_type": "urgent",
    "service": {
      "id": 2,
      "name": "Menages"
    },
    "client": {
      "id": 4,
      "name": "MBONDA Mireille"
    },
    "provider": null,
    "price": "25000.00",
    "latitude": 3.3792,
    "longitude": 6.5244,
    "address": "Bastos, Yaounde",
    "matching_status": "searching",
    "created_at": "2026-03-24T10:00:00Z"
  }
}
```

## 3. Mission Searching Screen

`GET /api/client/missions/{mission}/searching`

### Response

```json
{
  "success": true,
  "data": {
    "mission": {
      "id": 3,
      "title": "Besoin d'aide à domicile"
    },
    "searching": true,
    "radius_km": 5,
    "candidates_count": 4,
    "best_candidate": null
  },
  "message": "Searching for the best provider"
}
```

### Front behavior

- show the mission title
- show the client location on a map
- animate the search state
- poll every 5 to 10 seconds
- redirect to mission detail once assigned

## 4. Nearby Providers

`GET /api/client/missions/{mission}/nearby-providers`

### Response

```json
{
  "success": true,
  "data": {
    "mission": {
      "id": 3,
      "latitude": 3.3792,
      "longitude": 6.5244
    },
    "providers": [
      {
        "id": 12,
        "name": "NTONGA Melissa",
        "latitude": 3.3811,
        "longitude": 6.5251,
        "distance_km": 1.42,
        "rating": 4.8,
        "verification_status": "certified",
        "availability_status": "available",
        "score": 92
      }
    ]
  }
}
```

### Notes

- This endpoint is useful if the UI needs to show candidates.
- The backend can also keep this internal and only expose the final assignment.

## 5. Tracking

`GET /api/client/missions/{mission}/tracking`

### Response

```json
{
  "success": true,
  "data": {
    "mission": {
      "id": 3,
      "status": "assigned"
    },
    "provider": {
      "id": 12,
      "name": "NTONGA Melissa",
      "latitude": 3.3811,
      "longitude": 6.5251
    },
    "distance_km": 1.42,
    "provider_last_seen_at": "2026-03-24T10:12:00Z",
    "eta_minutes": 8
  },
  "message": "Tracking data"
}
```

### Front behavior

- update map markers periodically
- show ETA and distance
- redirect when mission reaches `completed`

## 6. Provider Availability

`POST /api/provider/availability`

### Online

```json
{
  "availability_status": "available",
  "availability_days": ["monday", "wednesday", "friday"],
  "availability_start_time": "08:00",
  "availability_end_time": "18:00",
  "latitude": 6.5244,
  "longitude": 3.3792
}
```

### Offline

```json
{
  "availability_status": "offline"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "availability_status": "available",
    "updated_at": "2026-03-24T10:00:00Z"
  },
  "message": "Availability updated"
}
```

## 7. Provider Missions

`GET /api/provider/missions`

### Response

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 3,
        "title": "Besoin d'aide à domicile",
        "status": "assigned",
        "mission_type": "urgent",
        "price": "25000.00",
        "service": {
          "id": 2,
          "name": "Menages"
        },
        "client": {
          "id": 4,
          "name": "MBONDA Mireille"
        },
        "address": "Bastos, Yaounde",
        "distance_km": 1.42
      }
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 15,
      "total": 1,
      "last_page": 1
    }
  }
}
```

## 8. Provider Mission Detail

`GET /api/provider/missions/{mission}`

### Response

```json
{
  "success": true,
  "data": {
    "id": 3,
    "title": "Besoin d'aide à domicile",
    "status": "assigned",
    "mission_type": "urgent",
    "client_started_at": null,
    "provider_started_at": null,
    "client_completed_at": null,
    "provider_completed_at": null,
    "price": "25000.00",
    "latitude": 3.3792,
    "longitude": 6.5244,
    "address": "Bastos, Yaounde",
    "client": {},
    "provider": {},
    "service": {},
    "matching": {
      "score": 92,
      "distance_km": 1.42,
      "reason": "Closest available certified provider"
    }
  }
}
```

## 9. Provider Actions

`POST /api/provider/missions/{mission}/accept`

`POST /api/provider/missions/{mission}/start`

`POST /api/provider/missions/{mission}/complete`

`POST /api/provider/missions/{mission}/cancel`

### Notes

- `accept` is a business trace.
- `start` confirms the provider started the mission.
- `complete` confirms the provider ended the mission.
- `cancel` is only allowed before the start time and while the mission is still assignable.

## 10. Matching Engine Contract

The backend should rank providers using a score built from:

- distance
- rating
- verification status
- response speed
- skill match
- service compatibility
- availability

Suggested scoring:

```text
score =
  distance_score * 40 +
  rating_score * 20 +
  verification_score * 15 +
  response_score * 15 +
  skill_match_score * 10
```

### Filtering before ranking

- provider must be `available`
- provider must serve the requested service
- provider must not be busy
- provider must be within the matching radius

### Radius guidance

- urgent: smaller radius
- scheduled: larger radius

## 11. Recommended Front Flow

### Client

- choose urgent or scheduled
- choose service
- enter title and description
- get GPS position
- submit mission
- redirect to searching screen
- poll tracking or mission detail

### Provider

- toggle online/offline
- send GPS when online
- see missions
- open mission detail
- accept
- start
- complete

## 12. Suggested Status Meaning

- `pending`: mission received / waiting for assignment
- `assigned`: mission assigned to a provider
- `in_progress`: client and provider confirmed the start
- `completed`: client and provider confirmed the end
- `cancelled`: mission stopped

