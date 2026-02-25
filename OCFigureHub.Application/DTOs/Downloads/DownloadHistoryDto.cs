namespace OCFigureHub.Application.DTOs.Downloads;

public class DownloadHistoryDto
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public Guid? OrderId { get; set; }
    public Guid? SubscriptionId { get; set; }
    public bool Success { get; set; }
    public string? FailureReason { get; set; }
    public DateTime DownloadedAt { get; set; }
}
