using Exam.Domain;

public class MedicalRecord
{
    public int Id { get; set; }

    public int AppointmentId { get; set; }
    public Appointment Appointment { get; set; } = null!;

    public int DoctorId { get; set; }
    public Doctor Doctor { get; set; } = null!;

    public int PatientId { get; set; }
    public Patient Patient { get; set; } = null!;

    public string Complaints { get; set; } = string.Empty;

    public string Diagnosis { get; set; } = string.Empty;

    public string Treatment { get; set; } = string.Empty;
    public string AnamnesisVitae { get; set; } = string.Empty;
    public string AnamnesisMorbi { get; set; } = string.Empty;
    public string GeneralExamination { get; set; } = string.Empty;
    public string StatusLocalis { get; set; } = string.Empty;
    public string Analyses { get; set; } = string.Empty;
    public string Recommendations { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
