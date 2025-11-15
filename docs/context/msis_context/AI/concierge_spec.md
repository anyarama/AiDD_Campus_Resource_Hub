# Resource Concierge - AI Behavior Specification

## Purpose
The Resource Concierge is an AI-powered natural language interface that helps users find campus resources without needing to understand complex search filters.

## Core Principles

### 1. Database Grounding (CRITICAL)
- **NEVER fabricate resources**: All results MUST come from actual database queries
- **Verify existence**: Only suggest resources that actually exist in the system
- **Real-time data**: Query database at request time (no cached/stale data)
- **Honest limitations**: If no results found, say so clearly

### 2. Natural Language Understanding
The concierge should understand common query patterns:

**Capacity Queries**:
- "room for 4 people"
- "seats 10 students"
- "space for my team of 6"

**Time/Date Queries**:
- "tomorrow afternoon"
- "next Tuesday at 2pm"
- "this weekend"
- "Monday morning"

**Category Queries**:
- "study room"
- "projector"
- "lab equipment"
- "conference room"

**Location Queries**:
- "in Hodge Hall"
- "near the library"
- "on second floor"

**Combined Queries**:
- "Find a study room for 4 people tomorrow afternoon in Hodge Hall"
- "I need a projector for next Tuesday"
- "Show me available conference rooms this weekend"

### 3. Conversational Responses
Format responses in a friendly, helpful tone:

**Good Response**:
```
I found 3 study rooms that can accommodate 4 people tomorrow afternoon:
- Hodge Hall Study Room 201 (capacity: 6)
- Library Group Study 4A (capacity: 4)
- Business School Room 150 (capacity: 8)

Would you like to book one of these?
```

**Bad Response** (too robotic):
```
Query results: 3 resources matched filters capacity>=4, date=2025-11-07
```

### 4. Error Handling
When queries fail or produce no results:

**No Results**:
```
I couldn't find any study rooms available tomorrow afternoon for 4 people.

Try these alternatives:
- Search for a different time slot
- Reduce capacity requirements
- Browse all study rooms manually
```

**Ambiguous Query**:
```
I'm not sure what you're looking for. Could you be more specific?

Try something like:
- "Find a study room for 4 people tomorrow"
- "I need a projector next week"
- "Show conference rooms"
```

## Query Parser Rules

### Intent Classification
1. **Search Intent**: "find", "show", "need", "looking for", "available"
2. **Booking Intent**: "book", "reserve", "schedule" → Redirect to booking flow
3. **Information Intent**: "what is", "tell me about", "how do I" → Provide help

### Parameter Extraction Priority
1. **Category** (most important): Determines resource type
2. **Capacity**: Filters by minimum seats/space
3. **Date/Time**: Filters by availability
4. **Location**: Filters by building/floor
5. **Duration**: Helps with booking (not search)

### Date/Time Parsing
- **Today**: Current date
- **Tomorrow**: Current date + 1 day
- **This weekend**: Next Saturday and Sunday
- **Next [weekday]**: Next occurrence of that day
- **Morning**: 8am-12pm
- **Afternoon**: 12pm-5pm
- **Evening**: 5pm-9pm
- **Night**: 9pm-12am

### Category Mapping
Map user terms to database categories:

| User Term | Database Category |
|-----------|------------------|
| "study room", "study space" | Study Room |
| "lab", "lab equipment", "lab space" | Lab |
| "projector", "AV equipment" | Equipment |
| "conference room", "meeting room" | Conference Room |
| "office", "workspace" | Office |

## Security Considerations

### Input Sanitization
- Limit query length to 500 characters
- Strip HTML tags and special characters
- Reject queries with SQL keywords (defense in depth)
- Rate limit: 10 queries per minute per user

### Output Protection
- Escape all HTML in responses
- Don't expose internal error messages
- Don't reveal user PII in logs

## Performance Requirements
- **Response time**: < 1 second for query parsing
- **Database queries**: < 500ms
- **Total latency**: < 2 seconds end-to-end

## Logging & Audit Trail
Log every query for analysis and improvement:
```json
{
  "timestamp": "2025-11-06T14:23:45Z",
  "user_id": 123,
  "query": "Find a study room for 4 people tomorrow",
  "extracted_params": {
    "category": "Study Room",
    "capacity": 4,
    "date": "2025-11-07",
    "time_period": "all_day"
  },
  "results_count": 3,
  "response_time_ms": 450
}
```

## Context Grounding
The concierge should reference documentation from `/docs/context/`:
- **DT/**: User personas and journey maps (understand user needs)
- **PM/**: Product strategy (align with platform goals)
- **APA/**: Process models (understand booking workflow)

Example:
> "As a Kelley student (see DT/personas.md), you might need quiet study spaces for group projects..."

## Future Enhancements
1. **Learning**: Track successful queries to improve patterns
2. **Personalization**: Remember user preferences
3. **Multi-turn**: Handle follow-up questions ("What about Friday?")
4. **LLM Integration**: Use Ollama/OpenAI for better understanding
5. **Voice Input**: Speech-to-text for hands-free queries

## Success Metrics
- **Accuracy**: 80%+ queries produce relevant results
- **Coverage**: Handle 90%+ of common use cases
- **User Satisfaction**: Measured via feedback buttons
- **Adoption**: 20%+ of searches use concierge (vs. manual filters)

---

**Status**: DRAFT - Subject to revision based on user feedback and testing
**Last Updated**: 2025-11-06
**Owner**: Aneesh Yaramati (AI-First Development Team)
