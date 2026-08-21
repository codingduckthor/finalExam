using Exam.Domain;
using Exam.Infrastructure;
using Exam.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Exam.Infrastructure.Repositories;

public class DoctorRepository : IDoctorRepository
{
    private readonly ApplicationDbContext _context;

    public DoctorRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(Doctor doctor)
    {
        await _context.Doctors.AddAsync(doctor);
    }

    public async Task<List<Doctor>> GetBySpecialtyAsync(int specialtyId)
    {
        var query = _context.Doctors
            .Include(d => d.Specialty)
            .AsQueryable();

        if (specialtyId > 0)
        {
            query = query.Where(d => d.SpecialtyId == specialtyId);
        }

        return await query.ToListAsync();
    }

    public async Task<bool> ExistsAsync(int id)
    {
        return await _context.Doctors.AnyAsync(d => d.Id == id);
    }

    public Task<Doctor?> GetByUserIdAsync(int userId) =>
        _context.Doctors.SingleOrDefaultAsync(d => d.UserId == userId);

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
