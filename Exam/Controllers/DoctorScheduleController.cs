using Exam.DTOs.DoctorSchedule;
using Exam.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Exam.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DoctorSchedulesController : ControllerBase
{
    private readonly IDoctorScheduleService _service;

    public DoctorSchedulesController(
        IDoctorScheduleService service)
    {
        _service = service;
    }

    [Authorize(Roles = "Admin,Doctor")]
    [HttpPost]
    public async Task<IActionResult> Create(
        CreateDoctorScheduleDto dto)
    {
        try
        {
            await _service.CreateAsync(dto);

            return Ok("Расписание успешно создано.");
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [Authorize(Roles = "Admin,Doctor,Registrar")]
    [HttpGet("{doctorId}")]
    public async Task<IActionResult> GetByDoctor(
        int doctorId)
    {
        var schedules =
            await _service.GetByDoctorAsync(doctorId);

        return Ok(schedules);
    }
}
