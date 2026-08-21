using Exam.Domain;
using Exam.Domain.Enums;
using Exam.DTOs.Appointment;
using Exam.Interfaces.Repositories;
using Exam.Interfaces.Services;

namespace Exam.Services;

public class AppointmentService : IAppointmentService
{
    private readonly IAppointmentRepository _appointmentRepository;
    private readonly IPatientRepository _patientRepository;
    private readonly IAppointmentSlotRepository _slotRepository;

    public AppointmentService(
    IAppointmentRepository appointmentRepository,
    IPatientRepository patientRepository,
    IAppointmentSlotRepository slotRepository)
    {
        _appointmentRepository = appointmentRepository;
        _patientRepository = patientRepository;
        _slotRepository = slotRepository;
    }

    public async Task CreateAppointmentAsync(CreateAppointmentDto dto)
    {
        if (dto.PatientId <= 0)
        {
            var fullName = dto.PatientFullName.Trim();
            if (string.IsNullOrWhiteSpace(fullName))
                throw new InvalidOperationException("Введите ФИО пациента.");

            var existingPatient = (await _patientRepository.GetAllAsync())
                .FirstOrDefault(patient => string.Equals(patient.FullName, fullName, StringComparison.OrdinalIgnoreCase));

            if (existingPatient != null)
            {
                dto.PatientId = existingPatient.Id;
            }
            else
            {
                var patient = new Patient { FullName = fullName, BirthDate = DateTime.UtcNow.Date };
                await _patientRepository.AddAsync(patient);
                await _patientRepository.SaveChangesAsync();
                dto.PatientId = patient.Id;
            }
        }

        var slot =
            await _slotRepository.GetByIdAsync(dto.AppointmentSlotId);

        if (slot == null)
            throw new InvalidOperationException("Слот не найден.");

        if (await _appointmentRepository.PatientBusyAsync(
            dto.PatientId,
            slot.StartTime))
        {
            throw new InvalidOperationException(
                "Пациент уже записан на это время.");
        }

        if (slot.IsBooked)
            throw new InvalidOperationException("Слот уже занят.");

        if (!await _patientRepository.ExistsAsync(dto.PatientId))
            throw new InvalidOperationException("Пациент не найден.");

        if (slot.StartTime <= DateTime.Now)
            throw new InvalidOperationException(
                "Нельзя записаться на прошедшее время.");

        var appointment = new Appointment
        {
            PatientId = dto.PatientId,
            AppointmentSlotId = slot.Id,
            Status = AppointmentStatus.Scheduled
        };

        slot.IsBooked = true;

        await _appointmentRepository.AddAsync(appointment);

        await _appointmentRepository.SaveChangesAsync();
    }

    public async Task<List<AppointmentResponseDto>> GetPatientAppointmentsAsync(int patientId)
    {
        var appointments =
            await _appointmentRepository.GetPatientAppointmentsAsync(patientId);

        return appointments.Select(a => new AppointmentResponseDto
        {
            AppointmentId = a.Id,
            AppointmentSlotId = a.AppointmentSlotId,
            DoctorName = a.AppointmentSlot.Doctor.FullName,
            Specialty = a.AppointmentSlot.Doctor.Specialty.Name,
            PatientName = a.Patient?.FullName ?? string.Empty,
            PatientId = a.PatientId,
            DateTime = a.AppointmentSlot.StartTime
        }).ToList();
    }

    public async Task<List<AppointmentResponseDto>> GetDoctorAppointmentsAsync(int doctorId)
    {
        var appointments =
            await _appointmentRepository.GetDoctorAppointmentsAsync(doctorId);

        return appointments.Select(a => new AppointmentResponseDto
        {
            AppointmentId = a.Id,
            AppointmentSlotId = a.AppointmentSlotId,
            DoctorName = a.AppointmentSlot?.Doctor?.FullName ?? string.Empty,
            Specialty = string.Empty,
            PatientName = a.Patient?.FullName ?? string.Empty,
            PatientId = a.PatientId,
            DateTime = a.AppointmentSlot?.StartTime ?? default
        }).ToList();
    }

    public async Task CancelAsync(int appointmentId)
    {
        var appointment = await _appointmentRepository.GetByIdAsync(appointmentId) ?? throw new InvalidOperationException("Запись не найдена.");
        if (appointment.Status == AppointmentStatus.Completed || appointment.MedicalRecord != null)
            throw new InvalidOperationException("Нельзя отменить завершённый приём с медицинской картой.");

        appointment.AppointmentSlot.IsBooked = false;
        _appointmentRepository.Remove(appointment);
        await _appointmentRepository.SaveChangesAsync();
    }

    public async Task CompleteAsync(int appointmentId)
    {
        var appointment = await _appointmentRepository.GetByIdAsync(appointmentId) ?? throw new InvalidOperationException("Запись не найдена.");
        appointment.Status = AppointmentStatus.Completed;
        await _appointmentRepository.SaveChangesAsync();
    }

    public async Task RescheduleAsync(int appointmentId, int appointmentSlotId)
    {
        var appointment = await _appointmentRepository.GetByIdAsync(appointmentId) ?? throw new InvalidOperationException("Запись не найдена.");
        var target = await _slotRepository.GetByIdAsync(appointmentSlotId) ?? throw new InvalidOperationException("Новый слот не найден.");
        if (target.IsBooked || target.DoctorId != appointment.AppointmentSlot.DoctorId)
            throw new InvalidOperationException("Выбранный слот недоступен.");
        appointment.AppointmentSlot.IsBooked = false;
        target.IsBooked = true;
        appointment.AppointmentSlotId = target.Id;
        appointment.Status = AppointmentStatus.Scheduled;
        await _appointmentRepository.SaveChangesAsync();
    }
}
