using Exam.DTOs.AppointmentSlot;

namespace Exam.Interfaces.Services;

public interface IAppointmentSlotService
{
    Task CreateAsync(CreateAppointmentSlotDto dto);

    Task<List<AppointmentSlotResponseDto>>
        GetByDoctorAsync(int doctorId);

    Task<List<AppointmentSlotResponseDto>>
        GetFreeSlotsAsync(int doctorId);
}