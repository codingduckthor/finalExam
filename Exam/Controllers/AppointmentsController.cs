using Exam.DTOs.Appointment;
using Exam.Interfaces.Services;
using Exam.Interfaces.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Exam.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AppointmentsController : ControllerBase
{
    private readonly IAppointmentService _service;
    private readonly IPatientRepository _patientRepository;

    public AppointmentsController(IAppointmentService service, IPatientRepository patientRepository)
    {
        _service = service;
        _patientRepository = patientRepository;
    }

    [Authorize(Roles = "Patient,Registrar,Doctor")]
    [HttpPost]
    public async Task<IActionResult> Create(CreateAppointmentDto dto)
    {
        try
        {
            var patient = await GetCurrentPatientAsync();
            if (User.IsInRole("Patient") && patient == null)
                return Forbid();

            if (User.IsInRole("Patient"))
                dto.PatientId = patient!.Id;
            else if (dto.PatientId <= 0 && string.IsNullOrWhiteSpace(dto.PatientFullName))
                return BadRequest("Введите ФИО пациента.");
            await _service.CreateAppointmentAsync(dto);

            return Ok("Пациент успешно записан.");
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [Authorize(Roles = "Patient,Registrar,Doctor")]
    [HttpGet("me")]
    public async Task<IActionResult> GetMyAppointments()
    {
        var patient = await GetCurrentPatientAsync();
        if (patient == null)
            return Forbid();

        var appointments =
            await _service.GetPatientAppointmentsAsync(patient.Id);

        return Ok(appointments);
    }

    [Authorize(Roles = "Doctor,Admin")]
    [HttpGet("doctor/{doctorId:int}")]
    public async Task<IActionResult> GetDoctorAppointments(int doctorId)
    {
        var appointments = await _service.GetDoctorAppointmentsAsync(doctorId);
        return Ok(appointments);
    }

    [Authorize(Roles = "Doctor")]
    [HttpPost("{id:int}/complete")]
    public async Task<IActionResult> Complete(int id) { await _service.CompleteAsync(id); return Ok(); }

    [Authorize(Roles = "Doctor")]
    [HttpPost("{id:int}/cancel")]
    public async Task<IActionResult> Cancel(int id) { await _service.CancelAsync(id); return Ok(); }

    [Authorize(Roles = "Doctor")]
    [HttpPost("{id:int}/reschedule")]
    public async Task<IActionResult> Reschedule(int id, RescheduleAppointmentDto dto) { await _service.RescheduleAsync(id, dto.AppointmentSlotId); return Ok(); }

    private async Task<Exam.Domain.Patient?> GetCurrentPatientAsync()
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(userId, out var id)
            ? await _patientRepository.GetByUserIdAsync(id)
            : null;
    }
}
