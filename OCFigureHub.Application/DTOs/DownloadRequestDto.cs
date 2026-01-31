namespace OCFigureHub.Application.DTOs.Downloads;

public class DownloadRequestDto
{
    public Guid ProductId { get; set; }
    public string Format { get; set; } = "STL"; // STL/OBJ
}
