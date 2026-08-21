using Exam.DTOs.DoctorSchedule;

namespace Exam.Interfaces.Services;

public interface IDoctorScheduleService
{
    Task CreateAsync(CreateDoctorScheduleDto dto);

    Task<List<DoctorScheduleResponseDto>>
        GetByDoctorAsync(int doctorId);
}

