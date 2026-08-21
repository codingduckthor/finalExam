using Exam.Domain;
using Exam.DTOs.Doctor;

namespace Exam.Interfaces.Services;

public interface IDoctorService
{
    Task CreateDoctorAsync(CreateDoctorDto dto);

    Task<List<DoctorResponseDto>> GetDoctorsBySpecialtyAsync(int specialtyId);
}
