import React, { useState, useEffect } from 'react';
import { api } from '../api/axiosClient';
import {
  DoctorScheduleResponseDto,
  AppointmentSlotResponseDto,
  DoctorResponseDto,
  WeekDay,
  WeekDayNames,
  MedicalRecordResponseDto,
} from '../types';
import { StatCard } from '../components/StatCard';
import { Modal } from '../components/Modal';
import { WeeklyScheduleGrid } from '../components/WeeklyScheduleGrid';
import { MedicalRecordCard } from '../components/MedicalRecordCard';
import {
  Calendar,
  Clock,
  FileText,
  Plus,
  CheckCircle,
  AlertCircle,
  Search,
  UserCheck,
} from 'lucide-react';

export const DoctorDashboard: React.FC = () => {
  const [doctors, setDoctors] = useState<DoctorResponseDto[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<number>(0);
  // Врач сразу видит своё расписание поумолчанию
  const [showWeeklySchedule, setShowWeeklySchedule] = useState(true);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [selectedScheduleDays, setSelectedScheduleDays] = useState<WeekDay[]>([
    WeekDay.Monday, WeekDay.Tuesday, WeekDay.Wednesday, WeekDay.Thursday, WeekDay.Friday,
  ]);
  const [scheduleVersion, setScheduleVersion] = useState(0);
  const [medicalAppointmentId, setMedicalAppointmentId] = useState<number | null>(null);

  const [schedules, setSchedules] = useState<DoctorScheduleResponseDto[]>([]);
  const [slots, setSlots] = useState<AppointmentSlotResponseDto[]>([]);

  // Medical Record modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'schedule' | 'slot' | 'record' | null>(null);

  // Record Form state
  const [appointmentId, setAppointmentId] = useState<number>(1);
  const [complaints, setComplaints] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');

  // Schedule & Slot form states
  const [scheduleDay, setScheduleDay] = useState<WeekDay>(WeekDay.Monday);
  const [scheduleStart, setScheduleStart] = useState('09:00');
  const [scheduleEnd, setScheduleEnd] = useState('17:00');

  const [slotStartTime, setSlotStartTime] = useState('');
  const [slotEndTime, setSlotEndTime] = useState('');

  // Patient history search
  const [searchPatientId, setSearchPatientId] = useState<string>('');
  const [patientRecords, setPatientRecords] = useState<MedicalRecordResponseDto[]>([]);

  // Notifications
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotify = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (selectedDoctorId > 0) {
      fetchDoctorData(selectedDoctorId);
    }
  }, [selectedDoctorId]);

  const fetchDoctors = async () => {
    try {
      const res = await api.get<DoctorResponseDto>('/doctors/me');
      setDoctors([res.data]);
      setSelectedDoctorId(res.data.id);
    } catch (err) {
      console.error('Error fetching doctors:', err);
    }
  };

  const fetchDoctorData = async (docId: number) => {
    try {
      const [schedRes, slotsRes] = await Promise.allSettled([
        api.get<DoctorScheduleResponseDto[]>(`/doctorschedules/${docId}`),
        api.get<AppointmentSlotResponseDto[]>(`/appointmentslots/${docId}`),
      ]);

      if (schedRes.status === 'fulfilled') setSchedules(schedRes.value.data || []);
      if (slotsRes.status === 'fulfilled') setSlots(slotsRes.value.data || []);
    } catch (err) {
      console.error('Error fetching doctor schedule/slots:', err);
    }
  };

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctorId || selectedScheduleDays.length === 0) return;
    try {
      await Promise.all(selectedScheduleDays.map((dayOfWeek) => api.post('/doctorschedules', {
        doctorId: selectedDoctorId,
        dayOfWeek: Number(dayOfWeek),
        startTime: `${scheduleStart}:00`,
        endTime: `${scheduleEnd}:00`,
      })));
      showNotify('Расписание успешно создано');
      setModalOpen(false);
      setShowScheduleForm(false);
      setScheduleVersion((version) => version + 1);
      fetchDoctorData(selectedDoctorId);
    } catch (err: any) {
      showNotify(err.response?.data || 'Ошибка добавления расписания', 'error');
    }
  };

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctorId || !slotStartTime || !slotEndTime) return;
    try {
      await api.post('/appointmentslots', {
        doctorId: selectedDoctorId,
        startTime: `${slotStartTime}:00`,
        endTime: `${slotEndTime}:00`,
      });
      showNotify('Слот приема добавлен');
      setModalOpen(false);
      fetchDoctorData(selectedDoctorId);
    } catch (err: any) {
      showNotify(err.response?.data || 'Ошибка добавления слота', 'error');
    }
  };

  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointmentId || !complaints || !diagnosis) {
      showNotify('Заполните жалобы и диагноз', 'error');
      return;
    }
    try {
      await api.post('/medicalrecord', {
        appointmentId: Number(appointmentId),
        complaints,
        diagnosis,
        treatment,
      });
      showNotify('Медицинская запись успешно создана!');
      setComplaints('');
      setDiagnosis('');
      setTreatment('');
      setModalOpen(false);
    } catch (err: any) {
      showNotify(err.response?.data || 'Ошибка при создании мед. карты', 'error');
    }
  };

  const handleSearchPatientHistory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchPatientId) return;
    try {
      const res = await api.get<MedicalRecordResponseDto[]>(`/medicalrecord/patient/${searchPatientId}`);
      setPatientRecords(res.data || []);
      if (res.data.length === 0) showNotify('Записи для данного пациента не найдены', 'error');
    } catch (err: any) {
      showNotify('Ошибка поиска медкарт пациента', 'error');
    }
  };

  const freeSlotsCount = slots.filter((s) => !s.isBooked).length;
  const bookedSlotsCount = slots.filter((s) => s.isBooked).length;

  if (showWeeklySchedule && selectedDoctorId) {
    if (medicalAppointmentId) return <MedicalRecordCard appointmentId={medicalAppointmentId} onBack={() => setMedicalAppointmentId(null)} />;
    const doctor = doctors.find((item) => item.id === selectedDoctorId);
    return <div className="fade-in" style={{ padding: '24px', maxWidth: '1280px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Моё расписание</h1>
          <p style={{ color: '#94a3b8' }}>Зелёные слоты — свободны (можно записать пациента). Красные — занятые (отображается ФИО пациента).</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={() => setShowWeeklySchedule(false)}>Кабинет врача</button>
          <button className="btn btn-primary" onClick={() => setShowScheduleForm((open) => !open)}>Настроить график</button>
        </div>
      </div>
      {showScheduleForm && <form className="glass-card" onSubmit={handleCreateSchedule} style={{ padding: '16px', marginBottom: '16px' }}>
        <div className="form-group"><label>Рабочие дни</label><div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>{Object.entries(WeekDayNames).map(([key, name]) => {
          const day = Number(key) as WeekDay; const active = selectedScheduleDays.includes(day);
          return <button key={day} type="button" className={`btn ${active ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setSelectedScheduleDays((days) => active ? days.filter((item) => item !== day) : [...days, day].sort((a, b) => a - b))}>{name}</button>;
        })}</div></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '10px', alignItems: 'end' }}><div className="form-group"><label>Начало работы</label><input type="time" className="form-input" value={scheduleStart} onChange={(e) => setScheduleStart(e.target.value)} /></div><div className="form-group"><label>Конец работы</label><input type="time" className="form-input" value={scheduleEnd} onChange={(e) => setScheduleEnd(e.target.value)} /></div><button type="submit" className="btn btn-primary">Сохранить</button></div>
      </form>}
      <WeeklyScheduleGrid key={scheduleVersion} doctorId={selectedDoctorId} doctorName={doctor?.fullName ?? 'Врач'} canManageSlots canBook showPatientNames onAcceptPatient={setMedicalAppointmentId} />
    </div>;
  }

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
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Кабинет Врача</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Управление временем приёма, слотами и амбулаторными картами</p>
        </div>
        <button className="btn btn-primary" disabled={!selectedDoctorId} onClick={() => setShowWeeklySchedule(true)}>Недельное расписание</button>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <label style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Выберите профиль врача:</label>
          <select
            className="form-select"
            value={selectedDoctorId}
            onChange={(e) => setSelectedDoctorId(Number(e.target.value))}
            style={{ width: '220px' }}
          >
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>{d.fullName}</option>
            ))}
          </select>
          <button
            onClick={() => { setModalType('record'); setModalOpen(true); }}
            className="btn btn-accent"
          >
            <FileText size={16} /> Создать Медзапись
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <StatCard title="Дней в расписании" value={schedules.length} icon={Calendar} color="#06b6d4" />
        <StatCard title="Свободных слотов" value={freeSlotsCount} icon={Clock} color="#10b981" />
        <StatCard title="Занятых слотов" value={bookedSlotsCount} icon={UserCheck} color="#f59e0b" />
      </div>

      {/* Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* Schedule */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={18} color="#06b6d4" /> Моё расписание работы
            </h3>
            <button onClick={() => { setModalType('schedule'); setModalOpen(true); }} className="btn btn-primary btn-sm">
              <Plus size={14} /> Добавить день
            </button>
          </div>
          {schedules.length === 0 ? (
            <p style={{ color: '#94a3b8', padding: '20px', textAlign: 'center' }}>График еще не сформирован</p>
          ) : (
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>День недели</th>
                    <th>Время приема</th>
                  </tr>
                </thead>
                <tbody>
                  {schedules.map((s) => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 600 }}>{WeekDayNames[s.dayOfWeek]}</td>
                      <td>{s.startTime} — {s.endTime}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Appointment Slots */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={18} color="#10b981" /> Слоты приёма пациентов
            </h3>
            <button onClick={() => { setModalType('slot'); setModalOpen(true); }} className="btn btn-accent btn-sm">
              <Plus size={14} /> Создать слот
            </button>
          </div>
          {slots.length === 0 ? (
            <p style={{ color: '#94a3b8', padding: '20px', textAlign: 'center' }}>Слоты приёма отсутствуют</p>
          ) : (
            <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Начало</th>
                      <th>Окончание</th>
                      <th>Статус</th>
                    </tr>
                  </thead>
                  <tbody>
                    {slots.map((sl) => (
                      <tr key={sl.id}>
                        <td>{new Date(sl.startTime).toLocaleString()}</td>
                        <td>{new Date(sl.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                        <td>
                          {sl.isBooked ? (
                            <span className="badge badge-danger">Забронирован</span>
                          ) : (
                            <span className="badge badge-success">Свободен</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Patient History Search Section */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={18} color="#a855f7" /> Поиск истории болезней пациента
        </h3>
        <form onSubmit={handleSearchPatientHistory} style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <div style={{ position: 'relative' }}>
              <Search size={18} color="#64748b" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input
                type="number"
                className="form-input"
                style={{ paddingLeft: '38px', width: '100%' }}
                placeholder="Введите ID Пациента"
                value={searchPatientId}
                onChange={(e) => setSearchPatientId(e.target.value)}
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary">
            Найти амбулаторные карты
          </button>
        </form>

        {patientRecords.length > 0 && (
          <div style={{ display: 'grid', gap: '12px' }}>
            {patientRecords.map((rec) => (
              <div key={rec.id} className="glass-card" style={{ padding: '16px', background: 'rgba(15,23,42,0.6)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.85rem', color: '#06b6d4', fontWeight: 600 }}>Запись #{rec.id} (Приём #{rec.appointmentId})</span>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{new Date(rec.createdAt).toLocaleDateString()}</span>
                </div>
                <div style={{ fontSize: '0.9rem', marginBottom: '4px' }}><strong>Жалобы:</strong> {rec.complaints}</div>
                <div style={{ fontSize: '0.9rem', marginBottom: '4px' }}><strong>Диагноз:</strong> {rec.diagnosis}</div>
                <div style={{ fontSize: '0.9rem', color: '#10b981' }}><strong>Назначение:</strong> {rec.treatment}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={
        modalType === 'schedule' ? 'Добавить график работы' :
        modalType === 'slot' ? 'Добавить слот приема' : 'Оформить медицинскую запись'
      }>
        {modalType === 'schedule' && (
          <form onSubmit={handleCreateSchedule}>
            <div className="form-group">
              <label>День недели</label>
              <select className="form-select" value={scheduleDay} onChange={(e) => setScheduleDay(Number(e.target.value))}>
                {Object.entries(WeekDayNames).map(([k, name]) => (
                  <option key={k} value={k}>{name}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-group">
                <label>Время начала</label>
                <input type="time" className="form-input" value={scheduleStart} onChange={(e) => setScheduleStart(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Время окончания</label>
                <input type="time" className="form-input" value={scheduleEnd} onChange={(e) => setScheduleEnd(e.target.value)} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>Сохранить график</button>
          </form>
        )}

        {modalType === 'slot' && (
          <form onSubmit={handleCreateSlot}>
            <div className="form-group">
              <label>Время начала слота</label>
              <input type="datetime-local" className="form-input" value={slotStartTime} onChange={(e) => setSlotStartTime(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Время окончания слота</label>
              <input type="datetime-local" className="form-input" value={slotEndTime} onChange={(e) => setSlotEndTime(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-accent" style={{ width: '100%', marginTop: '10px' }}>Создать слот</button>
          </form>
        )}

        {modalType === 'record' && (
          <form onSubmit={handleCreateRecord}>
            <div className="form-group">
              <label>ID Записи на приём (AppointmentId)</label>
              <input
                type="number"
                className="form-input"
                value={appointmentId}
                onChange={(e) => setAppointmentId(Number(e.target.value))}
              />
            </div>
            <div className="form-group">
              <label>Жалобы пациента</label>
              <textarea
                className="form-input"
                rows={2}
                placeholder="Описание жалоб..."
                value={complaints}
                onChange={(e) => setComplaints(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Диагноз</label>
              <input
                type="text"
                className="form-input"
                placeholder="Окончательный диагноз"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>План лечения и назначения</label>
              <textarea
                className="form-input"
                rows={3}
                placeholder="Препараты, режим, повторный прием..."
                value={treatment}
                onChange={(e) => setTreatment(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-accent" style={{ width: '100%', marginTop: '10px' }}>
              Сохранить амбулаторную запись
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
};
