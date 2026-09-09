using QRCodeCheckIn.Api.Core.Entities;

namespace QRCodeCheckIn.Api.Core.DTOs;

public class CheckInRequest
{
    public string QrCode { get; set; } = string.Empty;
}

public class CheckInResponse
{
    public bool Success { get; set; }
    public string Status { get; set; } = string.Empty; // "Complete", "AlreadyCheckedIn", "NotFound"
    public string Message { get; set; } = string.Empty;
    public Attendee? Attendee { get; set; }
}
