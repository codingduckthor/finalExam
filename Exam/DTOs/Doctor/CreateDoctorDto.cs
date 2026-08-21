namespace Exam.DTOs.Doctor
{
    public class CreateDoctorDto
    {
        [System.ComponentModel.DataAnnotations.Required]
        [System.ComponentModel.DataAnnotations.StringLength(200)]
        public string FullName { get; set; } = string.Empty;

        [System.ComponentModel.DataAnnotations.Range(1, int.MaxValue)]
        public int SpecialtyId { get; set; }
        [System.ComponentModel.DataAnnotations.Range(1, int.MaxValue)]
        public int OfficeId { get; set; }
        [System.ComponentModel.DataAnnotations.Required]
        [System.ComponentModel.DataAnnotations.StringLength(100, MinimumLength = 3)]
        public string Login { get; set; } = string.Empty;
        [System.ComponentModel.DataAnnotations.Required]
        [System.ComponentModel.DataAnnotations.StringLength(128, MinimumLength = 8)]
        public string Password { get; set; } = string.Empty;
    }
}
