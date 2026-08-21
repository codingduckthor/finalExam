using Exam.DTOs.Doctor;
using Exam.Interfaces.Services;
using Exam.Interfaces.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Exam.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DoctorsController : ControllerBase
{
    private readonly IDoctorService _service;
    private readonly IDoctorRepository _doctorRepository;

    public DoctorsController(IDoctorService service, IDoctorRepository doctorRepository)
    {
        _service = service;
        _doctorRepository = doctorRepository;
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> Create(CreateDoctorDto dto)
    {
        try
        {
            await _service.CreateDoctorAsync(dto);

            return Ok("Врач успешно добавлен.");
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [Authorize]
    [HttpGet]
    public async Task<IActionResult> GetBySpecialty([FromQuery] int specialtyId = 0)
    {
        var doctors = await _service.GetDoctorsBySpecialtyAsync(specialtyId);

        return Ok(doctors);
    }

    [Authorize(Roles = "Doctor")]
    [HttpGet("me")]
    public async Task<IActionResult> GetCurrentDoctor()
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userId, out var id)) return Forbid();

        var doctor = await _doctorRepository.GetByUserIdAsync(id);
        if (doctor == null) return NotFound("Профиль врача не найден.");

        var doctors = await _service.GetDoctorsBySpecialtyAsync(0);
        return Ok(doctors.First(x => x.Id == doctor.Id));
    }
}
