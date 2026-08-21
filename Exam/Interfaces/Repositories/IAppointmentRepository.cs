using Exam.Domain;

namespace Exam.Interfaces.Repositories;

public interface IAppointmentRepository
{
    Task<bool> PatientBusyAsync(int patientId, DateTime slotStartTime);

    Task AddAsync(Appointment appointment);
    void Remove(Appointment appointment);

    Task<List<Appointment>> GetPatientAppointmentsAsync(int patientId);

    Task<List<Appointment>> GetDoctorAppointmentsAsync(int doctorId);

    Task<Appointment?> GetByIdAsync(int id);
    Task SaveChangesAsync();
}
