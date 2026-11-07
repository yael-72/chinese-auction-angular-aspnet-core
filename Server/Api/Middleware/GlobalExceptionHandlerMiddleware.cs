using FinalProject.Exceptions;
using System.Net;
using System.Text.Json;

namespace FinalProject.Middleware
{
    public class GlobalExceptionHandlerMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<GlobalExceptionHandlerMiddleware> _logger;

        public GlobalExceptionHandlerMiddleware(RequestDelegate next, ILogger<GlobalExceptionHandlerMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

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
        /// Extracts the innermost (most detailed) exception message from the exception chain.
        /// This ensures the client receives the most specific error details.
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
                    return context.Response.WriteAsJsonAsync(new { message = GetDetailedMessage(nfEx) });

                case ConflictException cfEx:
                    context.Response.StatusCode = (int)HttpStatusCode.Conflict;
                    return context.Response.WriteAsJsonAsync(new { message = GetDetailedMessage(cfEx) });

                case BusinessException bEx:
                    context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                    return context.Response.WriteAsJsonAsync(new { message = GetDetailedMessage(bEx) });

                case ArgumentNullException anEx:
                    context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                    return context.Response.WriteAsJsonAsync(new { message = GetDetailedMessage(anEx) });

                case ArgumentException aEx:
                    context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                    return context.Response.WriteAsJsonAsync(new { message = GetDetailedMessage(aEx) });

                default:
                    context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                    // Always return the detailed message, even for unhandled exceptions
                    return context.Response.WriteAsJsonAsync(new { message = GetDetailedMessage(exception) });
            }
        }
    }
}
