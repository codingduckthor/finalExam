using Exam.Domain;
using Exam.Infrastructure;
using Exam.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Exam.Infrastructure.Repositories;

public class AppointmentRepository : IAppointmentRepository
{
    private readonly ApplicationDbContext _context;

    public AppointmentRepository(ApplicationDbContext context)
    {
        _context = context;
    }


    public async Task<bool> PatientBusyAsync(
        int patientId,
        DateTime slotStartTime)
    {
        return await _context.Appointments
            .Include(a => a.AppointmentSlot)
            .AnyAsync(a =>
                a.PatientId == patientId &&
                a.AppointmentSlot.StartTime == slotStartTime);
    }

    public async Task AddAsync(Appointment appointment)
    {
        await _context.Appointments.AddAsync(appointment);
    }

    public void Remove(Appointment appointment) => _context.Appointments.Remove(appointment);

    public async Task<List<Appointment>> GetPatientAppointmentsAsync(int patientId)
    {
        return await _context.Appointments
            .Include(a => a.AppointmentSlot)
                .ThenInclude(s => s.Doctor)
                    .ThenInclude(d => d.Specialty)
            .Where(a => a.PatientId == patientId)
            .ToListAsync();
    }

    public async Task<List<Appointment>> GetDoctorAppointmentsAsync(int doctorId)
    {
        return await _context.Appointments
            .Include(a => a.AppointmentSlot)
                .ThenInclude(s => s.Doctor)
            .Include(a => a.Patient)
            .Where(a => a.AppointmentSlot.DoctorId == doctorId)
            .ToListAsync();
    }

    public async Task<Appointment?> GetByIdAsync(int id)
    {
        return await _context.Appointments
            .Include(a => a.Patient)
            .Include(a => a.MedicalRecord)
            .Include(a => a.AppointmentSlot)
                .ThenInclude(s => s.Doctor)
            .FirstOrDefaultAsync(a => a.Id == id);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
