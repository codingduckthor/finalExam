using Exam.Domain;

namespace Exam.Interfaces.Repositories;

public interface IDoctorScheduleRepository
{
    Task AddAsync(DoctorSchedule schedule);

    Task<List<DoctorSchedule>> GetByDoctorAsync(int doctorId);

    Task SaveChangesAsync();
}