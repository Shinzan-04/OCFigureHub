namespace OCFigureHub.Application.DTOs.Downloads;

public class DownloadResponseDto
{
    public Guid TokenId { get; set; }

    public DateTime ExpiresAtUtc { get; set; }

    public int ExpireInSeconds { get; set; }

    public bool RequiresDownloadStep => true;
}
