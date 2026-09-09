namespace QRCodeCheckIn.Api.Core.Entities;

public class Attendee
{
    public string QrCode { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public bool IsCheckedIn { get; set; }
    public DateTime? CheckedInAt { get; set; }
}
