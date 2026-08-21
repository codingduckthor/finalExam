namespace Exam.Domain
{
    public class Office
    {
        public int Id { get; set; }
        public string Number { get; set; } = string.Empty;
        public int Floor { get; set; }
        public ICollection<Doctor> Doctors { get; set; } = new List<Doctor>();
    }
}
