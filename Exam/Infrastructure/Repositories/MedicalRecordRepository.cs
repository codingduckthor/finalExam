using Exam.Domain;
using Exam.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Exam.Infrastructure.Repositories;

public class MedicalRecordRepository
    : IMedicalRecordRepository
{
    private readonly ApplicationDbContext _context;

    public MedicalRecordRepository(
        ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(
        MedicalRecord record)
    {
        await _context.MedicalRecords.AddAsync(record);
    }

    public async Task<MedicalRecord?> GetByIdAsync(int id)
    {
        return await _context.MedicalRecords
            .Include(m => m.Doctor)
            .Include(m => m.Patient)
            .Include(m => m.Appointment)
            .FirstOrDefaultAsync(m => m.Id == id);
    }

    public async Task<List<MedicalRecord>> GetByPatientAsync(int patientId)
    {
        return await _context.MedicalRecords
            .Include(m => m.Doctor)
            .Include(m => m.Patient)
            .Where(m => m.PatientId == patientId)
            .OrderByDescending(m => m.CreatedAt)
            .ToListAsync();
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}