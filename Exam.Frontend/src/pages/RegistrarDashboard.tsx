import React, { useState, useEffect } from 'react';
import { api } from '../api/axiosClient';
import { DoctorResponseDto, SpecialtyDto } from '../types';
import { StatCard } from '../components/StatCard';
import { Modal } from '../components/Modal';
import { WeeklyScheduleGrid } from '../components/WeeklyScheduleGrid';
import {
  UserPlus,
  Stethoscope,
  Bookmark,
  Calendar,
  CheckCircle,
  AlertCircle,
  Plus,
} from 'lucide-react';

export const RegistrarDashboard: React.FC = () => {
  const [doctors, setDoctors] = useState<DoctorResponseDto[]>([]);
  const [scheduleDoctor, setScheduleDoctor] = useState<DoctorResponseDto | null>(null);
  const [specialties, setSpecialties] = useState<SpecialtyDto[]>([]);

  // Register patient modal
  const [modalOpen, setModalOpen] = useState(false);
  const [patientFullName, setPatientFullName] = useState('');
  const [patientBirthDate, setPatientBirthDate] = useState('');

  // Notifications
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotify = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    fetchClinicOverview();
  }, []);

  const fetchClinicOverview = async () => {
    try {
      const [docRes, specRes] = await Promise.allSettled([
        api.get<DoctorResponseDto[]>('/doctors'),
        api.get<SpecialtyDto[]>('/specialties'),
      ]);

      if (docRes.status === 'fulfilled') setDoctors(docRes.value.data || []);
      if (specRes.status === 'fulfilled') setSpecialties(specRes.value.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientFullName || !patientBirthDate) {
      showNotify('Заполните имя и дату рождения пациента', 'error');
      return;
    }
    try {
      await api.post('/patients', {
        fullName: patientFullName,
        birthDate: new Date(patientBirthDate).toISOString(),
      });
      showNotify('Пациент успешно зарегистрирован!');
      setPatientFullName('');
      setPatientBirthDate('');
      setModalOpen(false);
    } catch (err: any) {
      showNotify(err.response?.data || 'Ошибка при регистрации пациента', 'error');
    }
  };

  if (scheduleDoctor) {
    return <div className="fade-in" style={{ padding: '24px', maxWidth: '1280px', margin: '0 auto' }}>
      <button className="btn btn-secondary" onClick={() => setScheduleDoctor(null)} style={{ marginBottom: '16px' }}>← К списку врачей</button>
      <WeeklyScheduleGrid doctorId={scheduleDoctor.id} doctorName={scheduleDoctor.fullName} canBook />
    </div>;
  }

  return (
    <div className="fade-in" style={{ padding: '24px', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Notification Toast */}
      {notification && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: notification.type === 'success' ? '#10b981' : '#ef4444',
            color: '#fff',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            zIndex: 2000,
          }}
        >
          {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span style={{ fontWeight: 600 }}>{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Рабочее место Регистратора</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Регистрация пациентов, ведение картотеки и направление на приём</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn btn-accent">
          <UserPlus size={18} /> Зарегистрировать Пациента
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <StatCard title="Всего врачей" value={doctors.length} icon={Stethoscope} color="#06b6d4" />
        <StatCard title="Специальностей" value={specialties.length} icon={Bookmark} color="#10b981" />
        <StatCard title="Статус регистратуры" value="Активна" icon={Calendar} color="#f59e0b" />
      </div>

      {/* Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div className="glass-card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Врачи на смене</h3>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Врач</th>
                  <th>Специальность</th>
                  <th>Запись</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map((d) => (
                  <tr key={d.id}>
                    <td style={{ fontWeight: 600 }}>{d.fullName}</td>
                    <td><span className="badge badge-doctor">{d.specialty}</span></td>
                    <td><button className="btn btn-primary btn-sm" onClick={() => setScheduleDoctor(d)}>Расписание</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
          <UserPlus size={48} color="#10b981" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '1.3rem', marginBottom: '8px' }}>Быстрая регистрация карточки пациента</h3>
          <p style={{ color: '#94a3b8', maxWidth: '360px', marginBottom: '20px', fontSize: '0.9rem' }}>
            Создавайте профили новых пациентов для последующей записи к врачам клиники.
          </p>
          <button onClick={() => setModalOpen(true)} className="btn btn-accent">
            <Plus size={16} /> Создать карточку пациента
          </button>
        </div>
      </div>

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Регистрация нового пациента">
        <form onSubmit={handleCreatePatient}>
          <div className="form-group">
            <label>ФИО Пациента</label>
            <input
              type="text"
              className="form-input"
              placeholder="Сидоров Алексей Петрович"
              value={patientFullName}
              onChange={(e) => setPatientFullName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Дата рождения</label>
            <input
              type="date"
              className="form-input"
              value={patientBirthDate}
              onChange={(e) => setPatientBirthDate(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-accent" style={{ width: '100%', marginTop: '10px' }}>
            Сохранить карточку
          </button>
        </form>
      </Modal>
    </div>
  );
};
