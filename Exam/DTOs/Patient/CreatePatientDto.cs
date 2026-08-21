namespace Exam.DTOs.Patient
{
    public class CreatePatientDto
    {
        public string FullName { get; set; } = string.Empty;

        public DateTime BirthDate { get; set; }
    }
}
