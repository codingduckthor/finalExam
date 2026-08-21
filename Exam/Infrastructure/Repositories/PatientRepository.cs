using Exam.Domain;
using Exam.Infrastructure;
using Exam.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Exam.Infrastructure.Repositories;

public class PatientRepository : IPatientRepository
{
    private readonly ApplicationDbContext _context;

    public PatientRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(Patient patient)
    {
        await _context.Patients.AddAsync(patient);
    }

    public async Task<List<Patient>> GetAllAsync()
    {
        return await _context.Patients.ToListAsync();
    }

    public async Task<bool> ExistsAsync(int id)
    {
        return await _context.Patients.AnyAsync(p => p.Id == id);
    }

    public Task<Patient?> GetByUserIdAsync(int userId) =>
        _context.Patients.SingleOrDefaultAsync(p => p.UserId == userId);

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
