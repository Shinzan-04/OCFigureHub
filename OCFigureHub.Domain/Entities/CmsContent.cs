using OCFigureHub.Domain.Common;

namespace OCFigureHub.Domain.Entities;

public class CmsContent : BaseEntity
{
    public string Type { get; set; } = default!; // hero_slide, featured_product, banner, newsletter_config
    public string Title { get; set; } = string.Empty;
    public string? Subtitle { get; set; }
    public string? CtaText { get; set; }
    public string? CtaLink { get; set; }
    public string? ImageUrl { get; set; }
    public string? BgColor { get; set; }
    public string? JsonData { get; set; } // flexible extra data
    public int SortOrder { get; set; } = 0;
    public bool IsEnabled { get; set; } = true;
}
