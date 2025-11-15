# Resource Concierge - Example Queries

## Training Examples for AI Query Understanding

This document contains example queries that the Resource Concierge should understand and correctly parse. These examples serve as:
1. **Test cases** for validation
2. **User documentation** for what queries work
3. **Training data** for future LLM integration

---

## Category: Study Rooms

### Simple Queries
**Query**: "Find a study room"
**Expected Extraction**:
```json
{
  "intent": "search",
  "category": "Study Room",
  "capacity": null,
  "date": null,
  "time": null,
  "location": null
}
```

**Query**: "Show me study rooms"
**Expected Extraction**:
```json
{
  "intent": "search",
  "category": "Study Room"
}
```

### With Capacity
**Query**: "Find a study room for 4 people"
**Expected Extraction**:
```json
{
  "intent": "search",
  "category": "Study Room",
  "capacity": 4
}
```

**Query**: "I need a room that seats 10 students"
**Expected Extraction**:
```json
{
  "intent": "search",
  "category": "Study Room",
  "capacity": 10
}
```

### With Time/Date
**Query**: "Find a study room for tomorrow"
**Expected Extraction**:
```json
{
  "intent": "search",
  "category": "Study Room",
  "date": "tomorrow"
}
```

**Query**: "Study room available tomorrow afternoon"
**Expected Extraction**:
```json
{
  "intent": "search",
  "category": "Study Room",
  "date": "tomorrow",
  "time": "afternoon"
}
```

**Query**: "Study space for next Tuesday at 2pm"
**Expected Extraction**:
```json
{
  "intent": "search",
  "category": "Study Room",
  "date": "next_tuesday",
  "time": "14:00"
}
```

### Complex Queries
**Query**: "Find a study room for 4 people tomorrow afternoon in Hodge Hall"
**Expected Extraction**:
```json
{
  "intent": "search",
  "category": "Study Room",
  "capacity": 4,
  "date": "tomorrow",
  "time": "afternoon",
  "location": "Hodge Hall"
}
```

**Query**: "I need a quiet study space for my team of 6 on Friday morning"
**Expected Extraction**:
```json
{
  "intent": "search",
  "category": "Study Room",
  "capacity": 6,
  "date": "friday",
  "time": "morning"
}
```

---

## Category: Equipment

### Projector Queries
**Query**: "I need a projector"
**Expected Extraction**:
```json
{
  "intent": "search",
  "category": "Equipment",
  "keywords": ["projector"]
}
```

**Query**: "Find a projector for next Tuesday"
**Expected Extraction**:
```json
{
  "intent": "search",
  "category": "Equipment",
  "keywords": ["projector"],
  "date": "next_tuesday"
}
```

**Query**: "Projector for my presentation tomorrow at 3pm"
**Expected Extraction**:
```json
{
  "intent": "search",
  "category": "Equipment",
  "keywords": ["projector"],
  "date": "tomorrow",
  "time": "15:00"
}
```

### Other Equipment
**Query**: "I need AV equipment"
**Expected Extraction**:
```json
{
  "intent": "search",
  "category": "Equipment",
  "keywords": ["av"]
}
```

**Query**: "laptop for tomorrow"
**Expected Extraction**:
```json
{
  "intent": "search",
  "category": "Equipment",
  "keywords": ["laptop"],
  "date": "tomorrow"
}
```

---

## Category: Labs

**Query**: "Show me available labs"
**Expected Extraction**:
```json
{
  "intent": "search",
  "category": "Lab"
}
```

**Query**: "Computer lab for tonight"
**Expected Extraction**:
```json
{
  "intent": "search",
  "category": "Lab",
  "keywords": ["computer"],
  "time": "night"
}
```

**Query**: "Lab equipment this weekend"
**Expected Extraction**:
```json
{
  "intent": "search",
  "category": "Lab",
  "date": "weekend"
}
```

---

## Category: Conference/Meeting Rooms

**Query**: "conference room for 20 people"
**Expected Extraction**:
```json
{
  "intent": "search",
  "category": "Conference Room",
  "capacity": 20
}
```

**Query**: "meeting room tomorrow morning"
**Expected Extraction**:
```json
{
  "intent": "search",
  "category": "Conference Room",
  "date": "tomorrow",
  "time": "morning"
}
```

---

## Time Expressions Reference

### Relative Dates
| Expression | Meaning |
|------------|---------|
| "today" | Current date |
| "tomorrow" | Current date + 1 day |
| "this weekend" | Next Sat/Sun |
| "next week" | Following Monday |
| "next Monday" | Next occurrence of Monday |
| "Friday" | Next occurrence of Friday |

### Time Periods
| Expression | Time Range |
|------------|------------|
| "morning" | 8:00 AM - 12:00 PM |
| "afternoon" | 12:00 PM - 5:00 PM |
| "evening" | 5:00 PM - 9:00 PM |
| "night" | 9:00 PM - 12:00 AM |

### Specific Times
| Expression | Parsed Time |
|------------|-------------|
| "at 2pm" | 14:00 |
| "at 9:30 am" | 09:30 |
| "2 o'clock" | 14:00 (afternoon context) |

---

## Booking Intent Queries

These should redirect to the booking flow, not just search:

**Query**: "Book a study room for tomorrow"
**Expected Action**: Redirect to `/resources?category=Study+Room` with date filter, then booking page

**Query**: "Reserve a projector for Friday"
**Expected Action**: Show search results + prominent "Book" buttons

---

## Information/Help Queries

These should provide help/documentation:

**Query**: "How do I book a resource?"
**Expected Response**: Link to help documentation or tutorial

**Query**: "What resources are available?"
**Expected Response**: Show category list with descriptions

**Query**: "What are the booking policies?"
**Expected Response**: Display policy information from context docs

---

## Edge Cases & Error Handling

### Ambiguous Queries
**Query**: "Find something for tomorrow"
- **Issue**: No category specified
- **Response**: "What type of resource do you need? (study room, equipment, lab, etc.)"

**Query**: "I need a room"
- **Issue**: Vague category
- **Response**: "I can help you find study rooms, conference rooms, or labs. Which would you like?"

### Impossible Requests
**Query**: "Find a study room for 100 people"
- **Issue**: Capacity too large (no resources match)
- **Response**: "We don't have any study rooms that large. The largest available seats X people. Would you like to see that?"

**Query**: "projector for yesterday"
- **Issue**: Date in past
- **Response**: "I can only search for future dates. Did you mean today or tomorrow?"

### Typos & Variations
The system should handle common misspellings:
- "studdy room" → "study room"
- "projector" / "projecter" / "porjector"
- "tommorow" → "tomorrow"

---

## Real User Examples (Post-Launch)

_Space reserved for actual user queries after launch. These will help improve the AI._

---

## Testing Checklist

Use these examples to verify the concierge works correctly:

- [ ] Parses category correctly in 10/10 test cases
- [ ] Extracts capacity numbers accurately
- [ ] Understands "tomorrow", "next week", relative dates
- [ ] Maps time periods (morning/afternoon/evening)
- [ ] Handles combined queries (category + capacity + date)
- [ ] Provides helpful error messages for ambiguous queries
- [ ] Never fabricates resources not in database
- [ ] Response time < 2 seconds for all queries

---

**Status**: Living Document - Will be updated based on user feedback
**Last Updated**: 2025-11-06
**Contributors**: Aneesh Yaramati
