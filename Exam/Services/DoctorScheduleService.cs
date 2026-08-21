using Exam.Domain;
using Exam.DTOs.DoctorSchedule;
using Exam.Interfaces.Repositories;
using Exam.Interfaces.Services;

namespace Exam.Services;

public class DoctorScheduleService
    : IDoctorScheduleService
{
    private readonly IDoctorScheduleRepository _repository;
    private readonly IDoctorRepository _doctorRepository;

    public DoctorScheduleService(
        IDoctorScheduleRepository repository,
        IDoctorRepository doctorRepository)
    {
        _repository = repository;
        _doctorRepository = doctorRepository;
    }

    public async Task CreateAsync(CreateDoctorScheduleDto dto)
    {
        if (!await _doctorRepository.ExistsAsync(dto.DoctorId))
            throw new InvalidOperationException(
                "Врач не найден.");

        if (dto.StartTime >= dto.EndTime)
            throw new InvalidOperationException(
                "Время начала должно быть меньше времени окончания.");

        var existingSchedules = await _repository.GetByDoctorAsync(dto.DoctorId);
        if (existingSchedules.Any(schedule =>
            schedule.DayOfWeek == dto.DayOfWeek &&
            dto.StartTime < schedule.EndTime && dto.EndTime > schedule.StartTime))
        {
            throw new InvalidOperationException("Этот интервал пересекается с уже созданным графиком врача.");
        }

        var schedule = new DoctorSchedule
        {
            DoctorId = dto.DoctorId,
            DayOfWeek = dto.DayOfWeek,
            StartTime = dto.StartTime,
            EndTime = dto.EndTime
        };

        await _repository.AddAsync(schedule);

        await _repository.SaveChangesAsync();
    }

    public async Task<List<DoctorScheduleResponseDto>>
        GetByDoctorAsync(int doctorId)
    {
        var schedules =
            await _repository.GetByDoctorAsync(doctorId);

        return schedules.Select(s =>
            new DoctorScheduleResponseDto
            {
                Id = s.Id,
                DoctorName = s.Doctor.FullName,
                DayOfWeek = s.DayOfWeek,
                StartTime = s.StartTime,
                EndTime = s.EndTime
            }).ToList();
    }
}
