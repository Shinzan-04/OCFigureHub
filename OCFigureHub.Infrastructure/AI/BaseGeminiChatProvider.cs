using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using OCFigureHub.Application.Abstractions.AI;
using OCFigureHub.Application.DTOs.Chat;

namespace OCFigureHub.Infrastructure.AI;

public abstract class BaseGeminiChatProvider : IAiChatProvider
{
    protected readonly HttpClient HttpClient;
    protected readonly ILogger Logger;
    protected readonly string ApiKey;
    protected readonly string Model;

    public abstract string Name { get; }

    protected BaseGeminiChatProvider(HttpClient httpClient, ILogger logger, string apiKey, string model)
    {
        HttpClient = httpClient;
        Logger = logger;
        ApiKey = apiKey;
        Model = model;
    }

    public async Task<AiChatProviderResult> GenerateAsync(AiChatProviderRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(ApiKey))
        {
            Logger.LogWarning("[{Provider}] API key is not configured", Name);
            return new AiChatProviderResult
            {
                Success = false,
                Provider = Name,
                ErrorMessage = "API key not configured"
            };
        }

        try
        {
            var payload = BuildPayload(request);
            var url = $"https://generativelanguage.googleapis.com/v1beta/models/{Model}:generateContent?key={ApiKey}";

            using var cts = CancellationTokenSource.CreateLinkedTokenSource(ct);
            cts.CancelAfter(TimeSpan.FromSeconds(20));

            // Manually serialize to avoid any PropertyNamingPolicy interference at the root level
            var jsonPayload = JsonSerializer.Serialize(payload, new JsonSerializerOptions
            {
                PropertyNamingPolicy = null // KEEP NAMES EXACTLY AS IN DICTIONARY
            });

            var response = await HttpClient.PostAsync(url, new StringContent(jsonPayload, System.Text.Encoding.UTF8, "application/json"), cts.Token);

            if (response.IsSuccessStatusCode)
            {
                var json = await response.Content.ReadAsStringAsync(ct);
                var result = ParseGeminiResponse(json);

                if (result != null)
                {
                    return new AiChatProviderResult
                    {
                        Success = true,
                        Reply = result,
                        Provider = Name
                    };
                }

                return new AiChatProviderResult
                {
                    Success = false,
                    Provider = Name,
                    ErrorMessage = "Failed to parse Gemini response"
                };
            }

            var errorContent = await response.Content.ReadAsStringAsync(ct);
            var statusCode = (int)response.StatusCode;
            Logger.LogWarning("[{Provider}] HTTP {Status}: {Error}", Name, statusCode, errorContent);

            return new AiChatProviderResult
            {
                Success = false,
                Provider = Name,
                IsRateLimited = statusCode == 429,
                IsServerError = statusCode >= 500,
                ErrorMessage = $"HTTP {statusCode}: {errorContent}"
            };
        }
        catch (OperationCanceledException)
        {
            Logger.LogWarning("[{Provider}] Request timed out", Name);
            return new AiChatProviderResult
            {
                Success = false,
                Provider = Name,
                IsTimeout = true,
                ErrorMessage = "Request timed out"
            };
        }
        catch (HttpRequestException ex)
        {
            Logger.LogWarning(ex, "[{Provider}] Network error", Name);
            return new AiChatProviderResult
            {
                Success = false,
                Provider = Name,
                ErrorMessage = "Network error"
            };
        }
        catch (Exception ex)
        {
            Logger.LogError(ex, "[{Provider}] Unexpected error", Name);
            return new AiChatProviderResult
            {
                Success = false,
                Provider = Name,
                ErrorMessage = "Unexpected error"
            };
        }
    }

    protected abstract List<object> BuildContents(AiChatProviderRequest request);
    protected abstract string GetSystemPrompt(AiChatProviderRequest request);

    private object BuildPayload(AiChatProviderRequest request)
    {
        var contents = BuildContents(request);
        var systemPrompt = GetSystemPrompt(request);

        // Use a Dictionary to ensure "system_instruction" is exactly as required by Gemini API
        // regardless of the JSON naming policy.
        var payload = new Dictionary<string, object>
        {
            ["contents"] = contents,
            ["system_instruction"] = new
            {
                parts = new[] { new { text = systemPrompt } }
            },
            ["generationConfig"] = new
            {
                temperature = 0.4,
                maxOutputTokens = 1024,
                topP = 0.8,
                topK = 40
            }
        };

        return payload;
    }

    private string? ParseGeminiResponse(string json)
    {
        try
        {
            using var doc = JsonDocument.Parse(json);
            var root = doc.RootElement;

            if (root.TryGetProperty("error", out var error))
            {
                Logger.LogWarning("[{Provider}] API Error: {Error}", Name, error.GetRawText());
                return null;
            }

            if (root.TryGetProperty("candidates", out var candidates) &&
                candidates.GetArrayLength() > 0)
            {
                var firstCandidate = candidates[0];
                if (firstCandidate.TryGetProperty("content", out var content) &&
                    content.TryGetProperty("parts", out var parts) &&
                    parts.GetArrayLength() > 0)
                {
                    return parts[0].GetProperty("text").GetString();
                }
            }

            return null;
        }
        catch (Exception ex)
        {
            Logger.LogWarning(ex, "Failed to parse Gemini response: {Json}", json);
            return null;
        }
    }
}
