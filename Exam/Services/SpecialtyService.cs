using Exam.Domain;
using Exam.DTOs.Specialty;
using Exam.Interfaces.Repositories;
using Exam.Interfaces.Services;

namespace Exam.Services;

public class SpecialtyService : ISpecialtyService
{
    private readonly ISpecialtyRepository _repository;

    public SpecialtyService(ISpecialtyRepository repository)
    {
        _repository = repository;
    }

    public async Task CreateSpecialtyAsync(CreateSpecialtyDto dto)
    {
        var specialty = new Specialty
        {
            Name = dto.Name
        };

        await _repository.AddAsync(specialty);

        await _repository.SaveChangesAsync();
    }

    public async Task<List<Specialty>> GetAllAsync()
    {
        return await _repository.GetAllAsync();
    }
}