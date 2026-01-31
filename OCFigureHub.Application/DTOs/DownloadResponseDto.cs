namespace OCFigureHub.Application.DTOs.Downloads;

public class DownloadResponseDto
{
    public string SignedUrl { get; set; } = default!;
    public DateTime ExpiresAtUtc { get; set; }
}
