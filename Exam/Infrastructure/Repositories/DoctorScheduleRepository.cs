using Exam.Domain;
using Exam.Infrastructure;
using Exam.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Exam.Infrastructure.Repositories;

public class DoctorScheduleRepository : IDoctorScheduleRepository
{
    private readonly ApplicationDbContext _context;

    public DoctorScheduleRepository(
        ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(DoctorSchedule schedule)
    {
        await _context.DoctorSchedules.AddAsync(schedule);
    }

    public async Task<List<DoctorSchedule>> GetByDoctorAsync(int doctorId)
    {
        return await _context.DoctorSchedules
            .Include(ds => ds.Doctor)
            .Where(ds => ds.DoctorId == doctorId)
            .ToListAsync();
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
