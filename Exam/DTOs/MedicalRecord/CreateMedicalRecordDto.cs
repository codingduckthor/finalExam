namespace Exam.DTOs.MedicalRecord;

public class CreateMedicalRecordDto
{
    public int AppointmentId { get; set; }

    public string Complaints { get; set; } = string.Empty;

    public string Diagnosis { get; set; } = string.Empty;

    public string Treatment { get; set; } = string.Empty;
    public string AnamnesisVitae { get; set; } = string.Empty;
    public string AnamnesisMorbi { get; set; } = string.Empty;
    public string GeneralExamination { get; set; } = string.Empty;
    public string StatusLocalis { get; set; } = string.Empty;
    public string Analyses { get; set; } = string.Empty;
    public string Recommendations { get; set; } = string.Empty;
}
