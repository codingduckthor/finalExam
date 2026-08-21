using Exam.DTOs.AppointmentSlot;
using Exam.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Exam.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AppointmentSlotsController
    : ControllerBase
{
    private readonly IAppointmentSlotService _service;

    public AppointmentSlotsController(
        IAppointmentSlotService service)
    {
        _service = service;
    }

    [Authorize(Roles = "Admin,Doctor")]
    [HttpPost]
    public async Task<IActionResult> Create(
        CreateAppointmentSlotDto dto)
    {
        await _service.CreateAsync(dto);

        return Ok();
    }

    [Authorize]
    [HttpGet("{doctorId}")]
    public async Task<IActionResult> GetByDoctor(
        int doctorId)
    {
        return Ok(
            await _service.GetByDoctorAsync(doctorId));
    }

    [Authorize]
    [HttpGet("free/{doctorId}")]
    public async Task<IActionResult> GetFree(
        int doctorId)
    {
        return Ok(
            await _service.GetFreeSlotsAsync(doctorId));
    }
}