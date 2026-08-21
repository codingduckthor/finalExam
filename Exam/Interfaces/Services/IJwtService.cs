using Exam.Domain;

namespace Exam.Interfaces.Services;

public interface IJwtService
{
    string GenerateToken(User user);
}
