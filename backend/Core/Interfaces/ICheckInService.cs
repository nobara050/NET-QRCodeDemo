using QRCodeCheckIn.Api.Core.DTOs;
using QRCodeCheckIn.Api.Core.Entities;

namespace QRCodeCheckIn.Api.Core.Interfaces;

public interface ICheckInService
{
    Task<IEnumerable<Attendee>> GetAllAttendeesAsync();
    Task<Attendee?> GetAttendeeByQrCodeAsync(string qrCode);
    Task<CheckInResponse> CheckInAsync(string qrCode);
    Task<bool> ResetAllCheckInsAsync();
}
