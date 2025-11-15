# Resource Concierge - Response Templates

## Purpose
This document defines conversational response templates for various scenarios the Resource Concierge encounters.

---

## Successful Search Results

### Multiple Results Found
```
I found {count} {category} that match your criteria:

{resource_list}

{availability_info}
```

**Example**:
```
I found 3 study rooms that can accommodate 4 people tomorrow afternoon:

• Hodge Hall Study Room 201 (capacity: 6, available all day)
• Library Group Study 4A (capacity: 4, available 2pm-5pm)  
• Business School Room 150 (capacity: 8, available all day)

Would you like to book one of these?
```

### Single Result Found
```
I found exactly what you're looking for!

{resource_name} - {description_snippet}
• Capacity: {capacity}
• Location: {location}
• Available: {availability}

[Book Now Button]
```

### Many Results (> 10)
```
Great news! I found {count} {category} that match "{query}".

Showing top 10 results:
{resource_list}

[View All Results Button]
```

---

## No Results Scenarios

### No Matches - Specific Query
```
I couldn't find any {category} available {time_constraint} that match your requirements.

Here's what you can try:
• Adjust your time: Search for a different day or time slot
• Reduce requirements: Try a smaller capacity or different location
• Browse all {category}: [View All {Category}]
• Contact support: Need help? [Contact Us]
```

### No Matches - Category Empty
```
We don't currently have any {category} in the system.

You might be interested in:
• {alternative_category_1}
• {alternative_category_2}

Or [Browse All Resources]
```

### Impossible Request (e.g., capacity too large)
```
That's quite a group! Our largest {category} only accommodates {max_capacity} people.

Would you like to see:
• Our biggest available space (capacity: {max_capacity})
• Multiple smaller rooms you could book together
• Alternative resource types
```

---

## Clarification Needed

### Ambiguous Category
```
I'm not quite sure what type of resource you need. Could you be more specific?

Popular options:
• Study Rooms - Quiet spaces for individual or group study
• Conference Rooms - Meeting spaces with AV equipment
• Labs - Computer labs and specialized equipment
• Equipment - Projectors, laptops, and other devices

Or try searching: [Show All Categories]
```

### Ambiguous Time
```
When do you need the {resource}?

Try something like:
• "tomorrow afternoon"
• "next Tuesday at 2pm"
• "this weekend"
• "Monday morning"
```

### Missing Key Information
```
I understand you're looking for {partial_info}, but I need a bit more information:

• {missing_field_1}: {hint}
• {missing_field_2}: {hint}

Example: "Find a study room for 4 people tomorrow afternoon"
```

---

## Error Scenarios

### Service Unavailable
```
Oops! The concierge service is temporarily unavailable.

You can still search manually:
[Use Standard Search] [Browse Resources]

Or try again in a moment: [Retry]
```

### Query Too Complex
```
That's a complex request! Let me break it down:

I understand you want:
{understood_parts}

But I'm not sure about:
{unclear_parts}

Could you rephrase or simplify your query?
```

### Rate Limit Exceeded
```
Whoa, slow down! You're searching too quickly.

Please wait a moment before trying again.

Tip: Try to be more specific in your queries to find what you need faster!
```

---

## Booking Intent Detected

### Direct Booking Request
```
Ready to book a {category}?

Let me show you what's available:
{search_results}

Click "Book Now" on any resource to check detailed availability and reserve it.
```

### Redirect to Booking Flow
```
I found some great options for you!

{resource_list}

Next step: Select a resource and choose your time slot to complete the booking.
```

---

## Help/Information Responses

### How to Book
```
📚 How to Book a Resource

1. Search: Find the resource you need (or ask me!)
2. Review: Check availability and details
3. Request: Click "Book Now" and select your time
4. Wait: Resource owner or staff will review your request
5. Confirm: You'll get notified when approved

Need more help? [View Full Guide]
```

### Available Categories
```
🏛️ Campus Resources Available

**Study Rooms**: Quiet spaces for individual or group work
**Labs**: Computer labs and specialized equipment  
**Equipment**: Projectors, laptops, cameras, and more
**Conference Rooms**: Meeting spaces with AV capabilities
**Tutoring**: One-on-one or group tutoring sessions

What are you looking for today?
```

### Booking Policies
```
📋 Booking Policies

• **Advance Notice**: Book at least 2 hours in advance
• **Cancellation**: Cancel up to 1 hour before start time
• **Late Arrivals**: If you're 15+ minutes late, booking may be cancelled
• **Penalties**: Repeated no-shows may limit future bookings

For full policies, see: [Resource Hub Guidelines]
```

---

## Success Stories (Social Proof)

### After Successful Query
```
✅ Found what you need!

{results}

💡 Did you know? Students use our concierge to find resources 3x faster than manual search!
```

### Popular Resource Highlight
```
⭐ This is one of our most popular {category}!

{resource_details}

Tip: Book early to secure your preferred time slot.
```

---

## Conversational Transitions

### Follow-up Suggestions
```
{search_results}

**What else can I help you with?**
• Find resources for a different time
• Compare these options  
• Learn about booking policies
• Browse other categories
```

### Encouragement
```
{results}

Great choice! This {category} has an average rating of {rating}/5 stars.

Ready to book? [Continue]
```

---

## Time-Specific Messages

### Morning (6am-12pm)
```
☀️ Good morning! {response}
```

### Afternoon (12pm-5pm)
```
{response}
```

### Evening (5pm-9pm)
```
🌙 Good evening! {response}
```

### Late Night (9pm-6am)
```
🦉 Late night study session? {response}
```

---

## Personalization (Future)

### Returning User
```
Welcome back, {user_name}! {response}

Based on your history, you might also like:
• {suggestion_1}
• {suggestion_2}
```

### First-Time User
```
👋 Welcome to Campus Resource Hub! {response}

**New here?** Let me show you around:
[Take a Quick Tour] [See Example Queries]
```

---

## Accessibility-Friendly Responses

All responses should:
- Use clear, simple language
- Include semantic HTML headings
- Provide alternative navigation options
- Support screen readers
- Include ARIA labels where needed

**Example**:
```html
<div role="status" aria-live="polite">
  <h2>Search Results</h2>
  <p>I found 3 study rooms:</p>
  <ul aria-label="Available study rooms">
    <li>...</li>
  </ul>
</div>
```

---

## Error Message Tone

**Good** (Friendly, helpful):
```
Hmm, I couldn't find anything matching that. Let's try a different approach!
```

**Bad** (Robotic, unhelpful):
```
Error: No results returned. Query failed.
```

**Good** (Takes responsibility):
```
I'm having trouble understanding that query. Could you rephrase it?
```

**Bad** (Blames user):
```
Invalid query syntax. Your input is incorrect.
```

---

## Call-to-Action Buttons

Standard CTAs to include:

- `[Book Now]` - Proceed to booking
- `[View Details]` - See full resource page
- `[Refine Search]` - Adjust parameters
- `[Browse All]` - See all in category
- `[Try Example]` - Load example query
- `[Get Help]` - Contact support
- `[Start Over]` - Clear and restart

---

**Status**: Template Library v1.0
**Last Updated**: 2025-11-06
**Usage**: Reference these templates in `ai_concierge_service.py`
