using Exam.Domain;
using Exam.Infrastructure;
using Exam.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Exam.Infrastructure.Repositories;

public class SpecialtyRepository : ISpecialtyRepository
{
    private readonly ApplicationDbContext _context;

    public SpecialtyRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(Specialty specialty)
    {
        await _context.Specialties.AddAsync(specialty);
    }

    public async Task<List<Specialty>> GetAllAsync()
    {
        return await _context.Specialties.ToListAsync();
    }

    public async Task<bool> ExistsAsync(int id)
    {
        return await _context.Specialties.AnyAsync(s => s.Id == id);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}