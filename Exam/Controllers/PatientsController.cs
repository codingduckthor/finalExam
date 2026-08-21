using Exam.DTOs.Patient;
using Exam.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Exam.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PatientsController : ControllerBase
{
    private readonly IPatientService _service;

    public PatientsController(IPatientService service)
    {
        _service = service;
    }

    [Authorize(Roles = "Admin,Registrar,Doctor")]
    [HttpPost]
    public async Task<IActionResult> Create(CreatePatientDto dto)
    {
        await _service.CreatePatientAsync(dto);

        return Ok("Пациент успешно создан.");
    }

    [Authorize(Roles = "Admin,Registrar,Doctor")]
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var patients = await _service.GetAllAsync();
        return Ok(patients);
    }
}
