# Error Handling Architecture - Complete Implementation

## Overview
The application now implements a **centralized error handling pattern** where exceptions bubble up from the DAL (Data Access Layer) through BLL (Business Logic Layer) to the Middleware, ensuring the **most detailed error message** reaches the client.

## Error Flow Diagram

```
DAL Layer (Database operations)
    ↓ throws specific exception
BLL/Service Layer (Business logic validation)
    ↓ wraps exception with context if needed, or re-throws
Controller Layer (Simplified)
    ↓ no try-catch blocks - lets exceptions propagate
Middleware (GlobalExceptionHandlerMiddleware)
    ↓ extracts innermost exception via GetDetailedMessage()
Client Response with DETAILED ERROR MESSAGE
```

## Key Components

### 1. **Exception Classes** (Custom Exceptions)
Located in `FinalProject/Exceptions/`

```csharp
// All support exception chaining to preserve detailed context
public class BusinessException : Exception
{
    public BusinessException(string message) : base(message) { }
    public BusinessException(string message, Exception innerException) 
        : base(message, innerException) { }
}

public class NotFoundException : Exception { /* ... */ }
public class ConflictException : Exception { /* ... */ }
```

**Why exception chaining:**
- Allows BLL to catch a DAL exception and wrap it with additional context
- Preserves the original detailed error from the deepest layer
- Middleware extracts the innermost (most detailed) message

### 2. **DAL Layer** (Data Access Layer)
Example from GiftDAL:

```csharp
public class GiftDAL : IGiftDAL
{
    public async Task<Gift> GetById(int id)
    {
        try
        {
            var gift = await _context.Gifts.FirstOrDefaultAsync(g => g.Id == id);
            if (gift == null)
                throw new NotFoundException($"מתנה עם מזהה {id} לא נמצאת במערכת.");
            return gift;
        }
        catch (DbUpdateException dbEx)
        {
            throw new BusinessException("שגיאה בבסיס הנתונים. אנא נסה שוב.", dbEx);
        }
    }
}
```

**Pattern:**
- Throws `specific exceptions` with detailed, user-friendly messages
- Can wrap database exceptions in BusinessException if needed

### 3. **BLL/Service Layer** (Business Logic)
Example from GiftService:

```csharp
public class GiftService : IGiftService
{
    public async Task<GiftDTO> GetById(int id)
    {
        var g = await _giftDal.GetById(id); // Exception from DAL bubbles up
        if (g == null)
            throw new NotFoundException($"מתנה עם מזהה {id} לא נמצאת במערכת.");
        return _mapper.Map<GiftDTO>(g);
    }

    public async Task Add(GiftCreateDTO giftDTO)
    {
        if (giftDTO == null) 
            throw new ArgumentNullException(nameof(giftDTO), "נתוני המתנה נדרשים...");
        
        if (string.IsNullOrWhiteSpace(giftDTO.Name)) 
            throw new ArgumentException("שם המתנה נדרש לא יכול להיות ריק...");
        
        // Additional validation and business logic...
        
        var gift = _mapper.Map<Gift>(giftDTO);
        await _giftDal.Add(gift); // Exception from DAL bubbles up
    }
}
```

**Pattern:**
- Validates input and throws **ArgumentException** or **ArgumentNullException** for validation failures
- Throws **ConflictException** for duplicate/constraint violations
- Throws **NotFoundException** for missing data
- Throws **BusinessException** for business rule violations
- **NO try-catch blocks** - lets DAL exceptions propagate up naturally

### 4. **Controller Layer** (Simplified)
Example from GiftController:

```csharp
[ApiController]
[Route("api/[controller]")]
public class GiftController : ControllerBase
{
    private readonly IGiftService _giftService;
    
    // ✅ CORRECT: No try-catch blocks
    [HttpPost]
    public async Task<ActionResult> Add(GiftCreateDTO gift)
    {
        await _giftService.Add(gift);
        return Ok(new { message = $"מתנה '{gift.Name}' נוספה בהצלחה" });
    }

    // ✅ CORRECT: Let middleware handle exceptions
    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        await _giftService.Delete(id);
        return Ok(new { message = $"מתנה ID {id} נמחקה בהצלחה" });
    }

    // ❌ WRONG: This suppresses detailed errors
    // [HttpPost]
    // public async Task<ActionResult> Add(GiftCreateDTO gift)
    // {
    //     try
    //     {
    //         await _giftService.Add(gift);
    //         return Ok(new { message = $"מתנה '{gift.Name}' נוספה בהצלחה" });
    //     }
    //     catch (Exception ex)
    //     {
    //         return BadRequest(new { message = "כללית שגיאה בהוספה..." }); // ❌ LOSES DETAIL!
    //     }
    // }
}
```

**Pattern:**
- **NO try-catch blocks** that catch and suppress exceptions
- Controllers only call the service and return success response
- All exceptions bubble up to GlobalExceptionHandlerMiddleware

### 5. **GlobalExceptionHandlerMiddleware** (Central Error Handler)
Located in `FinalProject/Middleware/GlobalExceptionHandlerMiddleware.cs`

```csharp
public class GlobalExceptionHandlerMiddleware
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception exception)
        {
            _logger.LogError($"Unhandled exception: {exception.Message}");
            await HandleExceptionAsync(context, exception);
        }
    }

    /// <summary>
    /// Extracts the INNERMOST (most detailed) exception message.
    /// If DAL throws Exception A, and BLL wraps it as Exception B,
    /// this method returns A's message (the most specific).
    /// </summary>
    private static string GetDetailedMessage(Exception exception)
    {
        Exception? current = exception;
        string? lastMessage = exception.Message;

        while (current?.InnerException != null)
        {
            current = current.InnerException;
            if (!string.IsNullOrWhiteSpace(current.Message))
                lastMessage = current.Message;
        }

        return lastMessage ?? "שגיאה בעיבוד הבקשה. אנא נסה שוב או צור קשר עם תמיכה.";
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        switch (exception)
        {
            case NotFoundException nfEx:
                context.Response.StatusCode = (int)HttpStatusCode.NotFound;
                // ✅ Uses GetDetailedMessage() to extract innermost exception
                return context.Response.WriteAsJsonAsync(
                    new { message = GetDetailedMessage(nfEx) });

            case ConflictException cfEx:
                context.Response.StatusCode = (int)HttpStatusCode.Conflict;
                return context.Response.WriteAsJsonAsync(
                    new { message = GetDetailedMessage(cfEx) });

            case BusinessException bEx:
                context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                return context.Response.WriteAsJsonAsync(
                    new { message = GetDetailedMessage(bEx) });

            case ArgumentNullException anEx:
                context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                return context.Response.WriteAsJsonAsync(
                    new { message = GetDetailedMessage(anEx) });

            case ArgumentException aEx:
                context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                return context.Response.WriteAsJsonAsync(
                    new { message = GetDetailedMessage(aEx) });

            default:
                context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                // ✅ Even unknown exceptions get their detailed message extracted
                return context.Response.WriteAsJsonAsync(
                    new { message = GetDetailedMessage(exception) });
        }
    }
}
```

**Key Features:**
- ✅ Catches ALL exceptions from any layer
- ✅ Uses `GetDetailedMessage()` to extract the **innermost exception** (most specific)
- ✅ Returns appropriate HTTP status codes
- ✅ Always returns the detailed error message to the client
- ✅ Logs errors for debugging

## Error Chain Example

### Scenario: User tries to add a duplicate gift

**Layer-by-layer execution:**

```
Controller (Add method)
    ↓ calls giftService.Add(giftDTO)
    
Service (GiftService.Add)
    ↓ validates input
    ↓ checks for duplicates in database
    ↓ throws new ConflictException("מתנה בשם 'צעצוע' כבר קיימת במערכת...")
    
Middleware (catches ConflictException)
    ↓ calls GetDetailedMessage(exception)
    ↓ extracts message: "מתנה בשם 'צעצוע' כבר קיימת במערכת..."
    ↓ returns HTTP 409 Conflict with detailed message
    
Client Response:
{
    "message": "מתנה בשם 'צעצוע' כבר קיימת במערכת. כל מתנה חייבת להיות בעלת שם ייחודי."
}
```

### Scenario: Validation error in Service

```
Controller (Add method)
    ↓ calls giftService.Add(giftDTO)
    
Service (GiftService.Add)
    ↓ if (giftDTO.Price < 0)
    ↓ throws new ArgumentException("מחיר המתנה לא יכול להיות שלילי...")
    
Middleware (catches ArgumentException)
    ↓ returns HTTP 400 BadRequest with detailed message
    
Client Response:
{
    "message": "מחיר המתנה לא יכול להיות שלילי. אנא הזן מחיר של 0 ומעלה."
}
```

## Implementation Checklist for All Controllers

✅ **Done for all controllers:**
- [x] AuthController
- [x] CategoryController
- [x] DonorController
- [x] GiftController
- [x] LotteryController
- [x] MailController
- [x] ReportController
- [x] TicketController

**Each controller should:**
- ✅ Remove try-catch blocks that suppress exceptions
- ✅ Only return success responses (200/201)
- ✅ Let middleware handle all exceptions
- ✅ Keep logging in service layer instead

## Best Practices

### ✅ DO:
```csharp
// In Service Layer: Throw specific, detailed exceptions
public async Task Add(GiftCreateDTO giftDTO)
{
    if (giftDTO == null) 
        throw new ArgumentNullException(nameof(giftDTO), "נתוני המתנה נדרשים...");
    
    if (giftDTO.Price < 0) 
        throw new ArgumentException("מחיר לא יכול להיות שלילי...");
    
    var existing = await _giftDal.Get(null, null, null, null);
    if (existing.Any(g => g.Name == giftDTO.Name))
        throw new ConflictException($"מתנה בשם '{giftDTO.Name}' כבר קיימת...");
    
    await _giftDal.Add(_mapper.Map<Gift>(giftDTO));
}

// In Controller: Clean, simple methods
[HttpPost]
public async Task<ActionResult> Add(GiftCreateDTO gift)
{
    await _giftService.Add(gift);
    return Ok(new { message = $"מתנה '{gift.Name}' נוספה בהצלחה" });
}
```

### ❌ DON'T:
```csharp
// Don't suppress detailed errors in controllers
[HttpPost]
public async Task<ActionResult> Add(GiftCreateDTO gift)
{
    try
    {
        await _giftService.Add(gift);
        return Ok(new { message = $"מתנה '{gift.Name}' נוספה בהצלחה" });
    }
    catch (Exception ex) // ❌ WRONG
    {
        // ❌ This loses the detailed error message!
        return BadRequest(new { message = "הוספת המתנה נכשלה" });
    }
}
```

## Testing the Flow

To verify the error handling works correctly:

```bash
# Test 1: Add duplicate gift
POST /api/gift
Body: { "name": "צעצוע", "price": 100 } // if "צעצוע" already exists

# Expected Response (409 Conflict):
{
    "message": "מתנה בשם 'צעצוע' כבר קיימת במערכת. כל מתנה חייבת להיות בעלת שם ייחודי."
}

# Test 2: Invalid price
POST /api/gift
Body: { "name": "משהו חדש", "price": -50 }

# Expected Response (400 Bad Request):
{
    "message": "מחיר המתנה לא יכול להיות שלילי. אנא הזן מחיר של 0 ומעלה."
}

# Test 3: Not found
GET /api/gift/99999

# Expected Response (404 Not Found):
{
    "message": "מתנה עם מזהה 99999 לא נמצאת במערכת. בדוק את המזהה וודא שהוא תקין."
}
```

## Summary

The error handling architecture now ensures:
1. ✅ **Detailed errors** from the deepest layer (DAL) reach the client
2. ✅ **Proper HTTP status codes** based on exception type
3. ✅ **Clean controllers** without exception handling logic
4. ✅ **Centralized error management** in middleware
5. ✅ **Exception chaining** preserves error context
6. ✅ **Innermost exception** extraction for maximum specificity

This pattern provides the best user experience with clear, specific error messages while maintaining clean separation of concerns across application layers.
