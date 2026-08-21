using Exam.Domain;
using Exam.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Exam.Infrastructure.Repositories;

public class OfficeRepository : IOfficeRepository
{
    private readonly ApplicationDbContext _context;

    public OfficeRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(Office office)
    {
        await _context.Offices.AddAsync(office);
    }

    public async Task<List<Office>> GetAllAsync()
    {
        return await _context.Offices.ToListAsync();
    }

    public async Task<Office?> GetByIdAsync(int id)
    {
        return await _context.Offices.FindAsync(id);
    }

    public Task<bool> ExistsAsync(int id) =>
        _context.Offices.AnyAsync(x => x.Id == id);

    public Task DeleteAsync(Office office)
    {
        _context.Offices.Remove(office);
        return Task.CompletedTask;
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
