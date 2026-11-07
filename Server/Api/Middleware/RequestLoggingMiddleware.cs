using Microsoft.AspNetCore.Http;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.IO;
using System;

namespace FinalProject.Middleware
{
    public static class FileLogger
    {
        private static readonly SemaphoreSlim _semaphore = new SemaphoreSlim(1, 1);
        
        // Path to project root folder
        private static readonly string _path = Path.GetFullPath(
            Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "request_logs.txt"));

        public static async Task LogAsync(string text)
        {
            await _semaphore.WaitAsync();
            try
            {
                await File.AppendAllTextAsync(_path, text + Environment.NewLine);
            }
            finally
            {
                _semaphore.Release();
            }
        }
    }

    public class RequestLoggingMiddleware
    {
        private readonly RequestDelegate _next;

        public RequestLoggingMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var now = DateTime.UtcNow;
            var request = context.Request;
            var sb = new StringBuilder();

            sb.AppendLine($"[{now:O}] Incoming request: {request.Method} {request.Path}{request.QueryString}");

            // Read request body if present
            try
            {
                request.EnableBuffering();
                if (request.ContentLength > 0 && request.Body.CanSeek)
                {
                    request.Body.Seek(0, SeekOrigin.Begin);
                    using var reader = new StreamReader(request.Body, Encoding.UTF8, detectEncodingFromByteOrderMarks: false, leaveOpen: true);
                    var body = await reader.ReadToEndAsync();
                    request.Body.Seek(0, SeekOrigin.Begin);
                    if (!string.IsNullOrWhiteSpace(body))
                        sb.AppendLine($"Body: {body}");
                }
            }
            catch (Exception ex)
            {
                sb.AppendLine($"Failed to read request body: {ex.Message}");
            }

            await FileLogger.LogAsync(sb.ToString());

            try
            {
                await _next(context);

                var successMsg = $"[{DateTime.UtcNow:O}] Success: {request.Method} {request.Path} returned {context.Response.StatusCode}";
                await FileLogger.LogAsync(successMsg);
            }
            catch (Exception ex)
            {
                var err = new StringBuilder();
                err.AppendLine($"[{DateTime.UtcNow:O}] Error while processing request: {request.Method} {request.Path}{request.QueryString}");
                err.AppendLine($"Exception: {ex}");
                await FileLogger.LogAsync(err.ToString());
                throw;
            }
        }
    }

    public static class RequestLoggingMiddlewareExtensions
    {
        public static IApplicationBuilder UseRequestLogging(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<RequestLoggingMiddleware>();
        }
    }
}
