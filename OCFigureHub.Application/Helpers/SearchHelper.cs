using System.Text;
using System.Text.RegularExpressions;
using System.Globalization;

namespace OCFigureHub.Application.Helpers;

public static class SearchHelper
{
    public static string Normalize(string? text)
    {
        if (string.IsNullOrWhiteSpace(text)) return string.Empty;

        // Handle Vietnamese d/D
        text = text.Replace("đ", "d").Replace("Đ", "D");

        // Remove accents (Vietnamese specific and general)
        var normalizedString = text.Normalize(NormalizationForm.FormD);
        var stringBuilder = new StringBuilder();

        foreach (var c in normalizedString)
        {
            var unicodeCategory = CharUnicodeInfo.GetUnicodeCategory(c);
            if (unicodeCategory != UnicodeCategory.NonSpacingMark)
            {
                stringBuilder.Append(c);
            }
        }

        var result = stringBuilder.ToString().Normalize(NormalizationForm.FormC).ToLower().Trim();
        
        // Remove special characters but keep spaces and alphanumeric
        result = Regex.Replace(result, @"[^a-z0-9\s]", "");
        
        // Remove multiple spaces
        result = Regex.Replace(result, @"\s+", " ");
        
        return result;
    }

    public static List<string> Tokenize(string? text)
    {
        if (string.IsNullOrWhiteSpace(text)) return new List<string>();
        return Normalize(text).Split(' ', StringSplitOptions.RemoveEmptyEntries).ToList();
    }

    public static SearchAnalysis Analyze(string? query)
    {
        var normalized = Normalize(query);
        var tokens = Tokenize(query);
        var analysis = new SearchAnalysis { OriginalQuery = query, NormalizedQuery = normalized, Tokens = tokens };

        if (tokens.Count == 0) return analysis;

        // Synonym / Alias mapping
        if (tokens.Contains("free") || tokens.Contains("0d") || tokens.Contains("0vnd") || normalized.Contains("mien phi"))
        {
            analysis.IsFree = true;
        }

        if (tokens.Contains("anime") || tokens.Contains("manga") || normalized.Contains("nhan vat anime"))
        {
            analysis.Categories.Add("Anime");
        }

        if (tokens.Contains("monster") || tokens.Contains("monsters") || normalized.Contains("quai vat") || tokens.Contains("creature"))
        {
            analysis.Categories.Add("Monsters");
        }

        if (tokens.Contains("commercial") || normalized.Contains("thuong mai"))
        {
            analysis.License = "Commercial";
        }

        if (tokens.Contains("personal") || normalized.Contains("ca nhan"))
        {
            analysis.License = "Personal";
        }

        if (tokens.Contains("pro") || tokens.Contains("premium") || tokens.Contains("subscription") || tokens.Contains("sub"))
        {
            analysis.IsPro = true;
        }

        return analysis;
    }

    public static int CalculateScore(Domain.Entities.Product product, SearchAnalysis analysis)
    {
        if (string.IsNullOrWhiteSpace(analysis.NormalizedQuery)) return 0;

        int score = 0;
        var pName = Normalize(product.Name);
        var pDesc = Normalize(product.Description);
        var pTags = Normalize(product.Tags);
        var pCreator = Normalize(product.Creator);
        var pCat = Normalize(product.Category);

        // 1. Match exact name (highest)
        if (pName == analysis.NormalizedQuery) score += 1000;
        else if (pName.StartsWith(analysis.NormalizedQuery)) score += 500;
        else if (pName.Contains(analysis.NormalizedQuery)) score += 300;

        // 2. Token matches in name
        foreach (var token in analysis.Tokens)
        {
            if (pName.Contains(token)) score += 100;
        }

        // 3. Tag matches
        foreach (var token in analysis.Tokens)
        {
            if (pTags.Contains(token)) score += 80;
        }

        // 4. Category / Creator match
        foreach (var cat in analysis.Categories)
        {
            if (pCat.Equals(cat, StringComparison.OrdinalIgnoreCase)) score += 150;
        }
        
        foreach (var token in analysis.Tokens)
        {
            if (pCreator.Contains(token)) score += 50;
            if (pCat.Contains(token)) score += 40;
        }

        // 5. Description match (lowest)
        if (pDesc.Contains(analysis.NormalizedQuery)) score += 50;
        foreach (var token in analysis.Tokens)
        {
            if (pDesc.Contains(token)) score += 10;
        }

        // 6. Alias/Synonym extra points
        if (analysis.IsFree == true && product.Price == 0) score += 200;
        if (analysis.IsPro == true && product.IsPro) score += 200;
        if (!string.IsNullOrEmpty(analysis.License) && product.License.ToString().Equals(analysis.License, StringComparison.OrdinalIgnoreCase)) score += 150;

        return score;
    }
}

public class SearchAnalysis
{
    public string? OriginalQuery { get; set; }
    public string NormalizedQuery { get; set; } = string.Empty;
    public List<string> Tokens { get; set; } = new();
    public bool? IsFree { get; set; }
    public bool? IsPro { get; set; }
    public List<string> Categories { get; set; } = new();
    public string? License { get; set; }
}
