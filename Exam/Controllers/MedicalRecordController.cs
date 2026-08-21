using Exam.DTOs.MedicalRecord;
using Exam.Interfaces.Services;
using Exam.Interfaces.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Exam.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MedicalRecordController : ControllerBase
{
    private readonly IMedicalRecordService _service;
    private readonly IPatientRepository _patientRepository;

    public MedicalRecordController(
        IMedicalRecordService service,
        IPatientRepository patientRepository)
    {
        _service = service;
        _patientRepository = patientRepository;
    }

    [Authorize(Roles = "Doctor")]
    [HttpPost]
    public async Task<IActionResult> Create(
        CreateMedicalRecordDto dto)
    {
        await _service.CreateAsync(dto);

        return Ok("Медицинская запись создана.");
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var record = await _service.GetByIdAsync(id);

        if (record == null)
            return NotFound("Медицинская запись не найдена.");

        return Ok(record);
    }

    [Authorize(Roles = "Patient")]
    [HttpGet("me")]
    public async Task<IActionResult> GetMyHistory()
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userId, out var id))
            return Forbid();

        var patient = await _patientRepository.GetByUserIdAsync(id);
        if (patient == null)
            return Forbid();

        var records =
            await _service.GetPatientHistoryAsync(patient.Id);

        return Ok(records);
    }
}
