using Exam.DTOs.Specialty;

namespace Exam.Interfaces.Services;

public interface ISpecialtyService
{
    Task CreateSpecialtyAsync(CreateSpecialtyDto dto);
    Task<List<Exam.Domain.Specialty>> GetAllAsync();
}
