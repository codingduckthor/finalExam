using Exam.Domain;
using Microsoft.EntityFrameworkCore;

namespace Exam.Infrastructure
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(
            DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Doctor> Doctors => Set<Doctor>();
        public DbSet<Patient> Patients => Set<Patient>();
        public DbSet<Specialty> Specialties => Set<Specialty>();
        public DbSet<Appointment> Appointments => Set<Appointment>();
        public DbSet<User> Users => Set<User>();
        public DbSet<DoctorSchedule> DoctorSchedules => Set<DoctorSchedule>();
        public DbSet<AppointmentSlot> AppointmentSlots => Set<AppointmentSlot>();
        public DbSet<Office> Offices => Set<Office>();
        public DbSet<MedicalRecord> MedicalRecords => Set<MedicalRecord>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>()
                .HasIndex(u => u.Login)
                .IsUnique();

            modelBuilder.Entity<Doctor>()
                .HasIndex(d => d.UserId)
                .IsUnique()
                .HasFilter("[UserId] IS NOT NULL");

            modelBuilder.Entity<Patient>()
                .HasIndex(p => p.UserId)
                .IsUnique()
                .HasFilter("[UserId] IS NOT NULL");

            // Specialty 1 -> M Doctor

            modelBuilder.Entity<Doctor>()
                .HasOne(d => d.Specialty)
                .WithMany(s => s.Doctors)
                .HasForeignKey(d => d.SpecialtyId)
                .OnDelete(DeleteBehavior.Restrict);


            // Patient 1 -> M Appointment

            modelBuilder.Entity<Appointment>()
                .HasOne(a => a.Patient)
                .WithMany(p => p.Appointments)
                .HasForeignKey(a => a.PatientId)
                .OnDelete(DeleteBehavior.Cascade);

            //1 x M
            modelBuilder.Entity<DoctorSchedule>()
                .HasOne(ds => ds.Doctor)
                .WithMany(d => d.DoctorSchedules)
                .HasForeignKey(ds => ds.DoctorId);

            //1 x M
            modelBuilder.Entity<AppointmentSlot>()
                .HasOne(s => s.Doctor)
                .WithMany(d => d.AppointmentSlots)
                .HasForeignKey(s => s.DoctorId)
                .OnDelete(DeleteBehavior.Cascade);

            //1 x 1
            modelBuilder.Entity<Appointment>()
                .HasOne(a => a.AppointmentSlot)
                .WithOne(s => s.Appointment)
                .HasForeignKey<Appointment>(a => a.AppointmentSlotId)
                .OnDelete(DeleteBehavior.Restrict);

            //1 x 1
            modelBuilder.Entity<MedicalRecord>()
                .HasOne(m => m.Appointment)
                .WithOne(a => a.MedicalRecord)
                .HasForeignKey<MedicalRecord>(m => m.AppointmentId)
                .OnDelete(DeleteBehavior.Cascade);

            //1 x M
            modelBuilder.Entity<MedicalRecord>()
                .HasOne(m => m.Doctor)
                .WithMany(d => d.MedicalRecords)
                .HasForeignKey(m => m.DoctorId)
                .OnDelete(DeleteBehavior.Restrict);

            //1 x M
            modelBuilder.Entity<MedicalRecord>()
                .HasOne(m => m.Patient)
                .WithMany(p => p.MedicalRecords)
                .HasForeignKey(m => m.PatientId)
                .OnDelete(DeleteBehavior.Restrict);

            //1 x M
            modelBuilder.Entity<Doctor>()
                .HasOne(d => d.Office)
                .WithMany(o => o.Doctors)
                .HasForeignKey(d => d.OfficeId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
