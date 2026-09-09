using Microsoft.AspNetCore.Mvc;
using QRCodeCheckIn.Api.Core.DTOs;
using QRCodeCheckIn.Api.Core.Interfaces;

namespace QRCodeCheckIn.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CheckInController : ControllerBase
{
    private readonly ICheckInService _checkInService;

    public CheckInController(ICheckInService checkInService)
    {
        _checkInService = checkInService;
    }

    [HttpGet("attendees")]
    public async Task<IActionResult> GetAttendees()
    {
        var attendees = await _checkInService.GetAllAttendeesAsync();
        return Ok(attendees);
    }

    /*
     * =========================================================================
     * [TODO: AUTHORIZATION / ADMIN ROLE CHECK - PRODUCTION READY LOGIC]
     * =========================================================================
     * Vấn đề bảo mật:
     * - Nếu endpoint này là public hoàn toàn, bất kỳ ai (kể cả khách tham dự có mã QR)
     *   đều có thể mở link và tự điểm danh cho chính mình trước giờ sự kiện.
     * 
     * Giải pháp khi triển khai Production:
     * 1. Thêm Attribute [Authorize(Roles = "Organizer,Admin")] hoặc Custom Staff Policy:
     *    [Authorize(Roles = "Organizer")]
     * 
     * 2. Hoặc kiểm tra Bearer JWT Token / API Key / Staff Secret trong Request Headers:
     *    var authHeader = Request.Headers["Authorization"].ToString();
     *    if (string.IsNullOrEmpty(authHeader) || !IsValidStaffToken(authHeader))
     *    {
     *        return Unauthorized(new CheckInResponse
     *        {
     *            Success = false,
     *            Status = "Unauthorized",
     *            Message = "Chỉ ban tổ chức (BTC) mới có quyền thực hiện Check-In."
     *        });
     *    }
     * =========================================================================
     */
    [HttpPost]
    // [Authorize(Roles = "Organizer,Admin")] // TODO: Bật khi tích hợp Authentication (JWT / Identity)
    public async Task<IActionResult> CheckIn([FromBody] CheckInRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.QrCode))
        {
            return BadRequest(new CheckInResponse
            {
                Success = false,
                Status = "InvalidCode",
                Message = "QR Code payload is missing."
            });
        }

        var result = await _checkInService.CheckInAsync(request.QrCode);
        return result.Success ? Ok(result) : NotFound(result);
    }

    [HttpPost("reset")]
    public async Task<IActionResult> Reset()
    {
        await _checkInService.ResetAllCheckInsAsync();
        return Ok(new { message = "All check-ins reset." });
    }
}
