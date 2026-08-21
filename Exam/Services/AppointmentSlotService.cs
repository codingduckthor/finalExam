using Exam.Domain;
using Exam.DTOs.AppointmentSlot;
using Exam.Interfaces.Repositories;
using Exam.Interfaces.Services;

namespace Exam.Services;

public class AppointmentSlotService
    : IAppointmentSlotService
{
    private readonly IAppointmentSlotRepository _repository;
    private readonly IDoctorRepository _doctorRepository;

    public AppointmentSlotService(
        IAppointmentSlotRepository repository,
        IDoctorRepository doctorRepository)
    {
        _repository = repository;
        _doctorRepository = doctorRepository;
    }

    public async Task CreateAsync(
        CreateAppointmentSlotDto dto)
    {
        if (!await _doctorRepository.ExistsAsync(dto.DoctorId))
            throw new InvalidOperationException("Врач не найден.");

        if (dto.StartTime >= dto.EndTime)
        {
            throw new InvalidOperationException(
                "Некорректный интервал времени.");
        }

        var slot = new AppointmentSlot
        {
            DoctorId = dto.DoctorId,
            StartTime = dto.StartTime,
            EndTime = dto.EndTime,
            IsBooked = false
        };

        await _repository.AddAsync(slot);

        await _repository.SaveChangesAsync();
    }

    public async Task<List<AppointmentSlotResponseDto>>
        GetByDoctorAsync(int doctorId)
    {
        var slots =
            await _repository.GetByDoctorAsync(doctorId);

        return slots.Select(x =>
            new AppointmentSlotResponseDto
            {
                Id = x.Id,
                DoctorName = x.Doctor.FullName,
                StartTime = x.StartTime,
                EndTime = x.EndTime,
                IsBooked = x.IsBooked
            }).ToList();
    }

    public async Task<List<AppointmentSlotResponseDto>>
        GetFreeSlotsAsync(int doctorId)
    {
        var slots =
            await _repository.GetFreeSlotsAsync(doctorId);

        return slots.Select(x =>
            new AppointmentSlotResponseDto
            {
                Id = x.Id,
                DoctorName = x.Doctor.FullName,
                StartTime = x.StartTime,
                EndTime = x.EndTime,
                IsBooked = x.IsBooked
            }).ToList();
    }
}
