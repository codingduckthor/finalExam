using Exam.Domain;
using Exam.DTOs.Doctor;
using Exam.Interfaces.Repositories;
using Exam.Interfaces.Services;

namespace Exam.Services;

public class DoctorService : IDoctorService
{
    private readonly IDoctorRepository _doctorRepository;
    private readonly ISpecialtyRepository _specialtyRepository;
    private readonly IOfficeRepository _officeRepository;
    private readonly IUserRepository _userRepository;

    public DoctorService(
        IDoctorRepository doctorRepository,
        ISpecialtyRepository specialtyRepository,
        IOfficeRepository officeRepository,
        IUserRepository userRepository)
    {
        _doctorRepository = doctorRepository;
        _specialtyRepository = specialtyRepository;
        _officeRepository = officeRepository;
        _userRepository = userRepository;
    }

    public async Task CreateDoctorAsync(CreateDoctorDto dto)
    {
        if (!await _specialtyRepository.ExistsAsync(dto.SpecialtyId))
            throw new InvalidOperationException("Специальность не существует.");

        if (!await _officeRepository.ExistsAsync(dto.OfficeId))
            throw new InvalidOperationException("Кабинет не существует.");

        if (await _userRepository.GetByLoginAsync(dto.Login) != null)
            throw new InvalidOperationException("Пользователь с таким логином уже существует.");

        var user = new User
        {
            Login = dto.Login,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role = Exam.Domain.Enums.UserRole.Doctor
        };
        await _userRepository.AddAsync(user);

        var doctor = new Doctor
        {
            FullName = dto.FullName,
            SpecialtyId = dto.SpecialtyId,
            OfficeId = dto.OfficeId,
            User = user
        };

        await _doctorRepository.AddAsync(doctor);

        await _doctorRepository.SaveChangesAsync();
    }

    public async Task<List<DoctorResponseDto>> GetDoctorsBySpecialtyAsync(int specialtyId)
    {
        var doctors =
            await _doctorRepository.GetBySpecialtyAsync(specialtyId);

        return doctors.Select(d => new DoctorResponseDto
        {
            Id = d.Id,
            FullName = d.FullName,
            Specialty = d.Specialty.Name
        }).ToList();
    }
}
