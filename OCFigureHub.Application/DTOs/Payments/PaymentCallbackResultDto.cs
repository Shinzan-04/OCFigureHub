namespace OCFigureHub.Application.DTOs.Payments;

public class PaymentCallbackResultDto
{
    public bool Success { get; set; }
    public Guid? OrderId { get; set; }
    public string Message { get; set; } = "";
    public string? PaymentRef { get; set; }
}
