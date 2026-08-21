import React, { useState, useEffect } from 'react';
import { api } from '../api/axiosClient';
import {
  DoctorResponseDto,
  SpecialtyDto,
  AppointmentSlotResponseDto,
  AppointmentResponseDto,
  MedicalRecordResponseDto,
} from '../types';
import { StatCard } from '../components/StatCard';
import { Modal } from '../components/Modal';
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  CheckCircle,
  AlertCircle,
  FileText,
  Bookmark,
  ChevronRight,
} from 'lucide-react';

export const PatientDashboard: React.FC = () => {
  const [specialties, setSpecialties] = useState<SpecialtyDto[]>([]);
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState<number>(0);

  const [doctors, setDoctors] = useState<DoctorResponseDto[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorResponseDto | null>(null);

  const [freeSlots, setFreeSlots] = useState<AppointmentSlotResponseDto[]>([]);

  // My Appointments & Records
  const [myAppointments, setMyAppointments] = useState<AppointmentResponseDto[]>([]);
  const [myRecords, setMyRecords] = useState<MedicalRecordResponseDto[]>([]);

  // Modal
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<AppointmentSlotResponseDto | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecordResponseDto | null>(null);

  // Notifications
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotify = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    fetchSpecialties();
    fetchDoctors(0);
    fetchPatientData();
  }, []);

  useEffect(() => {
    fetchDoctors(selectedSpecialtyId);
  }, [selectedSpecialtyId]);

  const fetchSpecialties = async () => {
    try {
      const res = await api.get<SpecialtyDto[]>('/specialties');
      setSpecialties(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDoctors = async (specId: number) => {
    try {
      const res = await api.get<DoctorResponseDto[]>(`/doctors${specId > 0 ? `?specialtyId=${specId}` : ''}`);
      setDoctors(res.data || []);
      if (res.data.length > 0) {
        handleSelectDoctor(res.data[0]);
      } else {
        setSelectedDoctor(null);
        setFreeSlots([]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPatientData = async (_patientId?: number) => {
    try {
      const [appRes, recRes] = await Promise.allSettled([
        api.get<AppointmentResponseDto[]>('/appointments/me'),
        api.get<MedicalRecordResponseDto[]>('/medicalrecord/me'),
      ]);

      if (appRes.status === 'fulfilled') setMyAppointments(appRes.value.data || []);
      if (recRes.status === 'fulfilled') setMyRecords(recRes.value.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectDoctor = async (doc: DoctorResponseDto) => {
    setSelectedDoctor(doc);
    try {
      const res = await api.get<AppointmentSlotResponseDto[]>(`/appointmentslots/free/${doc.id}`);
      setFreeSlots(res.data || []);
    } catch (err) {
      console.error(err);
      setFreeSlots([]);
    }
  };

  const handleConfirmBooking = async () => {
    if (!selectedSlot) return;
    try {
      await api.post('/appointments', {
        appointmentSlotId: selectedSlot.id,
      });
      showNotify('Вы успешно записались на приём!');
      setBookingModalOpen(false);
      if (selectedDoctor) handleSelectDoctor(selectedDoctor);
      fetchPatientData();
    } catch (err: any) {
      showNotify(err.response?.data || 'Ошибка записи на прием', 'error');
    }
  };

  return (
    <div className="fade-in" style={{ padding: '24px', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Toast Notification */}
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
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Личный Кабинет Пациента</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Запись к врачам, просмотр талонов и историй болезней</p>
        </div>
      </div>

      {/* KPI Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <StatCard title="Моих записей" value={myAppointments.length} icon={Calendar} color="#06b6d4" />
        <StatCard title="Записей в медкарте" value={myRecords.length} icon={FileText} color="#10b981" />
        <StatCard title="Доступно врачей" value={doctors.length} icon={Stethoscope} color="#a855f7" />
      </div>

      {/* Search & Booking Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', marginBottom: '24px' }}>
        {/* Left Column: Filter & Doctors List */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bookmark size={18} color="#06b6d4" /> Фильтр по специальности
          </h3>
          <div className="form-group">
            <select
              className="form-select"
              value={selectedSpecialtyId}
              onChange={(e) => setSelectedSpecialtyId(Number(e.target.value))}
            >
              <option value={0}>Все специальности ({specialties.length})</option>
              {specialties.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <h4 style={{ fontSize: '0.9rem', color: '#94a3b8', margin: '16px 0 10px' }}>Врачи клиники:</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '350px', overflowY: 'auto' }}>
            {doctors.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Врачи не найдены</p>
            ) : (
              doctors.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => handleSelectDoctor(doc)}
                  className="glass-card"
                  style={{
                    padding: '12px',
                    cursor: 'pointer',
                    borderColor: selectedDoctor?.id === doc.id ? '#06b6d4' : 'rgba(255,255,255,0.08)',
                    background: selectedDoctor?.id === doc.id ? 'rgba(6,182,212,0.15)' : 'rgba(15,23,42,0.5)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <h5 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{doc.fullName}</h5>
                    <span className="badge badge-doctor" style={{ marginTop: '4px' }}>{doc.specialty}</span>
                  </div>
                  <ChevronRight size={18} color="#64748b" />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Free Slots Grid */}
        <div className="glass-card" style={{ padding: '20px' }}>
          {selectedDoctor ? (
            <>
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.2rem', color: '#f1f5f9' }}>
                  Свободное время у врача: <span style={{ color: '#06b6d4' }}>{selectedDoctor.fullName}</span>
                </h3>
                <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Специальность: {selectedDoctor.specialty}</span>
              </div>

              {freeSlots.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                  <Clock size={36} color="#64748b" style={{ marginBottom: '10px' }} />
                  <p>У данного врача нет свободных слотов для записи в ближайшее время.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
                  {freeSlots.map((slot) => {
                    const startDate = new Date(slot.startTime);
                    return (
                      <div
                        key={slot.id}
                        className="glass-card"
                        style={{
                          padding: '14px',
                          textAlign: 'center',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          background: 'rgba(16, 185, 129, 0.08)',
                        }}
                      >
                        <div style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: 600, marginBottom: '4px' }}>
                          {startDate.toLocaleDateString()}
                        </div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>
                          {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <button
                          onClick={() => {
                            setSelectedSlot(slot);
                            setBookingModalOpen(true);
                          }}
                          className="btn btn-accent btn-sm"
                          style={{ width: '100%' }}
                        >
                          Записаться
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
              Выберите врача слева для просмотра свободных слотов
            </div>
          )}
        </div>
      </div>

      {/* Bottom Grid: My Appointments & Medical History */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* My Appointments */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} color="#06b6d4" /> Мои записи на приём
          </h3>
          {myAppointments.length === 0 ? (
            <p style={{ color: '#94a3b8', padding: '20px', textAlign: 'center' }}>У вас пока нет активных записей</p>
          ) : (
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Врач</th>
                    <th>Специальность</th>
                    <th>Дата и время</th>
                  </tr>
                </thead>
                <tbody>
                  {myAppointments.map((app) => (
                    <tr key={app.appointmentId}>
                      <td style={{ fontWeight: 600 }}>{app.doctorName}</td>
                      <td><span className="badge badge-doctor">{app.specialty}</span></td>
                      <td>{new Date(app.dateTime).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* My Medical Records */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={18} color="#10b981" /> Моя медицинская карта
          </h3>
          {myRecords.length === 0 ? (
            <p style={{ color: '#94a3b8', padding: '20px', textAlign: 'center' }}>Медицинские заключения отсутствуют</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto' }}>
              {myRecords.map((rec) => (
                <div key={rec.id} className="glass-card" style={{ padding: '14px', background: 'rgba(15,23,42,0.6)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#38bdf8' }}>{rec.doctorName}</span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{new Date(rec.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', marginBottom: '2px' }}><strong>Диагноз:</strong> {rec.diagnosis}</div>
                  <div style={{ fontSize: '0.85rem', color: '#34d399' }}><strong>Лечение:</strong> {rec.treatment}</div>
                  <button className="btn btn-secondary btn-sm" style={{ marginTop: '10px' }} onClick={() => setSelectedRecord(rec)}>Открыть карту</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Booking Confirmation Modal */}
      <Modal isOpen={bookingModalOpen} onClose={() => setBookingModalOpen(false)} title="Подтверждение записи на приём">
        {selectedSlot && selectedDoctor && (
          <div>
            <div style={{ background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.3)', borderRadius: '10px', padding: '16px', marginBottom: '20px' }}>
              <div style={{ fontSize: '0.9rem', marginBottom: '6px' }}><strong>Врач:</strong> {selectedDoctor.fullName}</div>
              <div style={{ fontSize: '0.9rem', marginBottom: '6px' }}><strong>Специальность:</strong> {selectedDoctor.specialty}</div>
              <div style={{ fontSize: '0.9rem', marginBottom: '6px' }}><strong>Дата приёма:</strong> {new Date(selectedSlot.startTime).toLocaleDateString()}</div>
              <div style={{ fontSize: '0.9rem', color: '#34d399' }}><strong>Время:</strong> {new Date(selectedSlot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            </div>

            <button onClick={handleConfirmBooking} className="btn btn-accent" style={{ width: '100%', padding: '12px' }}>
              Подтвердить запись
            </button>
          </div>
        )}
      </Modal>

      <Modal isOpen={selectedRecord !== null} onClose={() => setSelectedRecord(null)} title="Медицинская карта">
        {selectedRecord && (
          <div className="table-container">
            <table className="custom-table"><tbody>
              {[
                ['Жалобы', selectedRecord.complaints],
                ['Anamnesis vitae', selectedRecord.anamnesisVitae],
                ['Anamnesis morbi', selectedRecord.anamnesisMorbi],
                ['Общий осмотр', selectedRecord.generalExamination],
                ['Status localis', selectedRecord.statusLocalis],
                ['Предварительный диагноз', selectedRecord.diagnosis],
                ['Анализы', selectedRecord.analyses],
                ['Назначения', selectedRecord.treatment],
                ['Рекомендации', selectedRecord.recommendations],
              ].map(([label, value]) => <tr key={label}><th style={{ width: '35%' }}>{label}</th><td style={{ whiteSpace: 'pre-wrap' }}>{value || '—'}</td></tr>)}
            </tbody></table>
          </div>
        )}
      </Modal>
    </div>
  );
};
