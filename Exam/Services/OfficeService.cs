using Exam.Domain;
using Exam.DTOs.Office;
using Exam.Interfaces.Repositories;
using Exam.Interfaces.Services;

namespace Exam.Services;

public class OfficeService : IOfficeService
{
    private readonly IOfficeRepository _repository;

    public OfficeService(IOfficeRepository repository)
    {
        _repository = repository;
    }

    public async Task CreateAsync(CreateOfficeDto dto)
    {
        var office = new Office
        {
            Number = dto.Number,
            Floor = dto.Floor
        };

        await _repository.AddAsync(office);
        await _repository.SaveChangesAsync();
    }

    public async Task<List<OfficeResponseDto>> GetAllAsync()
    {
        var offices = await _repository.GetAllAsync();

        return offices.Select(o => new OfficeResponseDto
        {
            Id = o.Id,
            Number = o.Number,
            Floor = o.Floor
        }).ToList();
    }

    public async Task DeleteAsync(int id)
    {
        var office = await _repository.GetByIdAsync(id);

        if (office == null)
            throw new Exception("Кабинет не найден.");

        await _repository.DeleteAsync(office);
        await _repository.SaveChangesAsync();
    }
}