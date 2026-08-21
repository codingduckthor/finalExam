using Exam.Domain;
using Exam.Infrastructure;
using Exam.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Exam.Infrastructure.Repositories;

public class AppointmentSlotRepository
    : IAppointmentSlotRepository
{
    private readonly ApplicationDbContext _context;

    public AppointmentSlotRepository(
        ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(AppointmentSlot slot)
    {
        await _context.AppointmentSlots.AddAsync(slot);
    }

    public async Task<List<AppointmentSlot>>
        GetByDoctorAsync(int doctorId)
    {
        return await _context.AppointmentSlots
            .Include(x => x.Doctor)
            .Where(x => x.DoctorId == doctorId)
            .ToListAsync();
    }

    public async Task<AppointmentSlot?> GetByIdAsync(int id)
    {
        return await _context.AppointmentSlots
            .Include(s => s.Doctor)
                .ThenInclude(d => d.Specialty)
            .FirstOrDefaultAsync(s => s.Id == id);
    }

    public async Task<List<AppointmentSlot>>
        GetFreeSlotsAsync(int doctorId)
    {
        return await _context.AppointmentSlots
            .Include(x => x.Doctor)
            .Where(x =>
                x.DoctorId == doctorId &&
                !x.IsBooked)
            .ToListAsync();
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}