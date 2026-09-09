using System.Collections.Concurrent;
using QRCodeCheckIn.Api.Core.DTOs;
using QRCodeCheckIn.Api.Core.Entities;
using QRCodeCheckIn.Api.Core.Interfaces;

namespace QRCodeCheckIn.Api.Infrastructure.Services;

public class InMemoryCheckInService : ICheckInService
{
    private readonly ConcurrentDictionary<string, Attendee> _attendees = new(StringComparer.OrdinalIgnoreCase);

    public InMemoryCheckInService()
    {
        InitializeSampleData();
    }

    private void InitializeSampleData()
    {
        var sampleAttendees = new List<Attendee>
        {
            new() { QrCode = "USR-001", Name = "Alice Johnson", Email = "alice@example.com", IsCheckedIn = false },
            new() { QrCode = "USR-002", Name = "Bob Smith", Email = "bob@example.com", IsCheckedIn = false },
            new() { QrCode = "USR-003", Name = "Charlie Davis", Email = "charlie@example.com", IsCheckedIn = false }
        };

        foreach (var attendee in sampleAttendees)
        {
            _attendees[attendee.QrCode] = attendee;
        }
    }

    public Task<IEnumerable<Attendee>> GetAllAttendeesAsync()
    {
        return Task.FromResult(_attendees.Values.OrderBy(a => a.QrCode).AsEnumerable());
    }

    public Task<Attendee?> GetAttendeeByQrCodeAsync(string qrCode)
    {
        if (string.IsNullOrWhiteSpace(qrCode)) return Task.FromResult<Attendee?>(null);
        _attendees.TryGetValue(qrCode.Trim(), out var attendee);
        return Task.FromResult(attendee);
    }

    public Task<CheckInResponse> CheckInAsync(string qrCode)
    {
        if (string.IsNullOrWhiteSpace(qrCode))
        {
            return Task.FromResult(new CheckInResponse
            {
                Success = false,
                Status = "InvalidCode",
                Message = "QR code cannot be empty."
            });
        }

        var normalizedCode = qrCode.Trim();

        if (!_attendees.TryGetValue(normalizedCode, out var attendee))
        {
            return Task.FromResult(new CheckInResponse
            {
                Success = false,
                Status = "NotFound",
                Message = $"Attendee with code '{normalizedCode}' not found."
            });
        }

        if (attendee.IsCheckedIn)
        {
            return Task.FromResult(new CheckInResponse
            {
                Success = true,
                Status = "AlreadyCheckedIn",
                Message = $"{attendee.Name} already checked in at {attendee.CheckedInAt:HH:mm:ss}.",
                Attendee = attendee
            });
        }

        // Mark check-in
        attendee.IsCheckedIn = true;
        attendee.CheckedInAt = DateTime.Now;

        return Task.FromResult(new CheckInResponse
        {
            Success = true,
            Status = "Complete",
            Message = $"Check-in successful! Welcome {attendee.Name}.",
            Attendee = attendee
        });
    }

    public Task<bool> ResetAllCheckInsAsync()
    {
        foreach (var attendee in _attendees.Values)
        {
            attendee.IsCheckedIn = false;
            attendee.CheckedInAt = null;
        }
        return Task.FromResult(true);
    }
}
