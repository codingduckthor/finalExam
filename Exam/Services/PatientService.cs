using Exam.Domain;
using Exam.DTOs.Patient;
using Exam.Interfaces.Repositories;
using Exam.Interfaces.Services;

namespace Exam.Services;

public class PatientService : IPatientService
{
    private readonly IPatientRepository _repository;

    public PatientService(IPatientRepository repository)
    {
        _repository = repository;
    }

    public async Task CreatePatientAsync(CreatePatientDto dto)
    {
        var patient = new Patient
        {
            FullName = dto.FullName,
            BirthDate = dto.BirthDate
        };

        await _repository.AddAsync(patient);

        await _repository.SaveChangesAsync();
    }

    public async Task<List<Patient>> GetAllAsync()
    {
        return await _repository.GetAllAsync();
    }
}