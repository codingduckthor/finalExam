using Exam.DTOs.Office;

namespace Exam.Interfaces.Services;

public interface IOfficeService
{
    Task CreateAsync(CreateOfficeDto dto);

    Task<List<OfficeResponseDto>> GetAllAsync();

    Task DeleteAsync(int id);
}