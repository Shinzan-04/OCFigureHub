using OCFigureHub.Domain.Common;

namespace OCFigureHub.Domain.Entities;

public class SiteSetting : BaseEntity
{
    public string Key { get; set; } = default!;
    public string Value { get; set; } = default!;
    public string Group { get; set; } = "general"; // general, notifications, security, payment, email, appearance
}
