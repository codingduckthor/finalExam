using Exam.DTOs.Appointment;

namespace Exam.Interfaces.Services;

public interface IAppointmentService
{
    Task CreateAppointmentAsync(CreateAppointmentDto dto);

    Task<List<AppointmentResponseDto>> GetPatientAppointmentsAsync(int patientId);

    Task<List<AppointmentResponseDto>> GetDoctorAppointmentsAsync(int doctorId);
    Task CancelAsync(int appointmentId);
    Task RescheduleAsync(int appointmentId, int appointmentSlotId);
    Task CompleteAsync(int appointmentId);
}
