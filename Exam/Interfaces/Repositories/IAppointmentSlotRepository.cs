using Exam.Domain;

namespace Exam.Interfaces.Repositories;

public interface IAppointmentSlotRepository
{
    Task AddAsync(AppointmentSlot slot);
    Task<List<AppointmentSlot>> GetByDoctorAsync(int doctorId);
    Task<AppointmentSlot?> GetByIdAsync(int id);
    Task<List<AppointmentSlot>> GetFreeSlotsAsync(int doctorId);
    Task SaveChangesAsync();
}