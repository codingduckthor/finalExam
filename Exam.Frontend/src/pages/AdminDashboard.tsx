import React, { useState, useEffect } from 'react';
import { api } from '../api/axiosClient';
import {
  AppointmentSlotResponseDto,
  DoctorResponseDto,
  OfficeResponseDto,
  SpecialtyDto,
  UserResponseDto,
  UserRoleNames,
  WeekDay,
  WeekDayNames,
} from '../types';
import { Modal } from '../components/Modal';
import { WeeklyScheduleGrid } from '../components/WeeklyScheduleGrid';
import {
  Users,
  Stethoscope,
  Building2,
  Bookmark,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

type ApiValidationError = {
  title?: string;
  detail?: string;
  errors?: Record<string, string[]>;
};

const getErrorMessage = (error: unknown, fallback: string): string => {
  const data = (error as { response?: { data?: unknown } })?.response?.data;

  if (typeof data === 'string' && data.trim()) return data;

  if (data && typeof data === 'object') {
    const problem = data as ApiValidationError;
    const validationMessages = Object.values(problem.errors ?? {}).flat().filter(Boolean);
    if (validationMessages.length) return validationMessages.join(' ');
    if (problem.detail) return problem.detail;
    if (problem.title) return problem.title;
  }

  return fallback;
};

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'doctors' | 'offices' | 'specialties' | 'users'>('doctors');

  // Data states
  const [doctors, setDoctors] = useState<DoctorResponseDto[]>([]);
  const [scheduleDoctor, setScheduleDoctor] = useState<DoctorResponseDto | null>(null);
  const [offices, setOffices] = useState<OfficeResponseDto[]>([]);
  const [specialties, setSpecialties] = useState<SpecialtyDto[]>([]);
  const [users, setUsers] = useState<UserResponseDto[]>([]);

  // Modals & Form states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'doctor' | 'office' | 'specialty' | 'schedule' | 'slot' | null>(null);

  // Notifications
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form Fields
  const [doctorName, setDoctorName] = useState('');
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState<number>(0);
  const [selectedOfficeId, setSelectedOfficeId] = useState<number>(0);
  const [doctorLogin, setDoctorLogin] = useState('');
  const [doctorPassword, setDoctorPassword] = useState('');

  const [officeNumber, setOfficeNumber] = useState('');
  const [officeFloor, setOfficeFloor] = useState<number>(1);

  const [specialtyName, setSpecialtyName] = useState('');

  const [selectedDoctorId, setSelectedDoctorId] = useState<number>(0);
  const [selectedScheduleDays, setSelectedScheduleDays] = useState<WeekDay[]>([
    WeekDay.Monday,
    WeekDay.Tuesday,
    WeekDay.Wednesday,
    WeekDay.Thursday,
    WeekDay.Friday,
  ]);
  const [scheduleStart, setScheduleStart] = useState('09:00');
  const [scheduleEnd, setScheduleEnd] = useState('17:00');

  const [slotDate, setSlotDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [slotStart, setSlotStart] = useState('09:00');
  const [slotEnd, setSlotEnd] = useState('17:00');
  const [slotDuration, setSlotDuration] = useState(30);

  const showNotify = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchData = async () => {
    try {
      const [docsRes, specsRes, officesRes, usersRes] = await Promise.allSettled([
        api.get<DoctorResponseDto[]>('/doctors'),
        api.get<SpecialtyDto[]>('/specialties'),
        api.get<OfficeResponseDto[]>('/office'),
        api.get<UserResponseDto[]>('/users'),
      ]);

      if (docsRes.status === 'fulfilled') setDoctors(docsRes.value.data || []);
      if (specsRes.status === 'fulfilled') setSpecialties(specsRes.value.data || []);
      if (officesRes.status === 'fulfilled') setOffices(officesRes.value.data || []);
      if (usersRes.status === 'fulfilled') setUsers(usersRes.value.data || []);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handlers
  const handleCreateDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorName || !selectedSpecialtyId || !selectedOfficeId || !doctorLogin || !doctorPassword) {
      showNotify('Заполните все поля', 'error');
      return;
    }
    try {
      await api.post('/doctors', {
        fullName: doctorName,
        specialtyId: Number(selectedSpecialtyId),
        officeId: Number(selectedOfficeId),
        login: doctorLogin,
        password: doctorPassword,
      });
      showNotify('Врач успешно добавлен');
      setDoctorName('');
      setSelectedOfficeId(0);
      setDoctorLogin('');
      setDoctorPassword('');
      setModalOpen(false);
      fetchData();
    } catch (err: unknown) {
      showNotify(getErrorMessage(err, 'Ошибка добавления врача'), 'error');
    }
  };

  const handleCreateOffice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!officeNumber) {
      showNotify('Введите номер кабинета', 'error');
      return;
    }
    try {
      await api.post('/office', {
        number: officeNumber,
        floor: Number(officeFloor),
      });
      showNotify('Кабинет успешно создан');
      setOfficeNumber('');
      setModalOpen(false);
      fetchData();
    } catch (err: unknown) {
      showNotify(getErrorMessage(err, 'Ошибка добавления кабинета'), 'error');
    }
  };

  const handleDeleteOffice = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот кабинет?')) return;
    try {
      await api.delete(`/office/${id}`);
      showNotify('Кабинет удален');
      fetchData();
    } catch (err: any) {
      showNotify('Ошибка при удалении кабинета', 'error');
    }
  };

  const handleCreateSpecialty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!specialtyName) {
      showNotify('Введите название специальности', 'error');
      return;
    }
    try {
      await api.post('/specialties', { name: specialtyName });
      showNotify('Специальность создана');
      setSpecialtyName('');
      setModalOpen(false);
      fetchData();
    } catch (err: unknown) {
      showNotify(getErrorMessage(err, 'Ошибка создания специальности'), 'error');
    }
  };

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctorId) {
      showNotify('Выберите врача', 'error');
      return;
    }
    if (selectedScheduleDays.length === 0) {
      showNotify('Выберите хотя бы один рабочий день', 'error');
      return;
    }
    try {
      await Promise.all(selectedScheduleDays.map((dayOfWeek) => api.post('/doctorschedules', {
        doctorId: Number(selectedDoctorId),
        dayOfWeek: Number(dayOfWeek),
        startTime: `${scheduleStart}:00`,
        endTime: `${scheduleEnd}:00`,
      })));
      showNotify(`График добавлен для выбранных дней: ${selectedScheduleDays.length}`);
      setModalOpen(false);
    } catch (err: unknown) {
      showNotify(getErrorMessage(err, 'Ошибка создания расписания'), 'error');
    }
  };

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctorId || !slotDate || !slotStart || !slotEnd) {
      showNotify('Выберите врача, дату и рабочее время', 'error');
      return;
    }

    const workStart = new Date(`${slotDate}T${slotStart}:00`);
    const workEnd = new Date(`${slotDate}T${slotEnd}:00`);
    if (workStart >= workEnd) {
      showNotify('Время окончания должно быть позже времени начала', 'error');
      return;
    }

    const slots: Array<{ startTime: string; endTime: string }> = [];
    for (let start = new Date(workStart); start.getTime() + slotDuration * 60_000 <= workEnd.getTime(); start = new Date(start.getTime() + slotDuration * 60_000)) {
      slots.push({
        startTime: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}T${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}:00`,
        endTime: `${new Date(start.getTime() + slotDuration * 60_000).getFullYear()}-${String(new Date(start.getTime() + slotDuration * 60_000).getMonth() + 1).padStart(2, '0')}-${String(new Date(start.getTime() + slotDuration * 60_000).getDate()).padStart(2, '0')}T${String(new Date(start.getTime() + slotDuration * 60_000).getHours()).padStart(2, '0')}:${String(new Date(start.getTime() + slotDuration * 60_000).getMinutes()).padStart(2, '0')}:00`,
      });
    }

    if (slots.length === 0) {
      showNotify('В указанном интервале нет места для слота выбранной длительности', 'error');
      return;
    }

    try {
      const existingSlots = (await api.get<AppointmentSlotResponseDto[]>(`/appointmentslots/${selectedDoctorId}`)).data ?? [];
      const availableSlots = slots.filter((slot) => !existingSlots.some((existing) =>
        new Date(slot.startTime) < new Date(existing.endTime) && new Date(slot.endTime) > new Date(existing.startTime)
      ));

      if (availableSlots.length === 0) {
        showNotify('На это время уже созданы слоты', 'error');
        return;
      }

      await Promise.all(availableSlots.map((slot) => api.post('/appointmentslots', {
        doctorId: Number(selectedDoctorId),
        ...slot,
      })));
      showNotify(`Создано слотов: ${availableSlots.length}${availableSlots.length < slots.length ? `, пропущено занятых: ${slots.length - availableSlots.length}` : ''}`);
      setModalOpen(false);
    } catch (err: unknown) {
      showNotify(getErrorMessage(err, 'Ошибка создания слота'), 'error');
    }
  };

  if (scheduleDoctor) {
    return <div className="fade-in" style={{ padding: '24px', maxWidth: '1280px', margin: '0 auto' }}>
      <button className="btn btn-secondary" onClick={() => setScheduleDoctor(null)} style={{ marginBottom: '16px' }}>← К списку врачей</button>
      <WeeklyScheduleGrid doctorId={scheduleDoctor.id} doctorName={scheduleDoctor.fullName} canManageSlots />
    </div>;
  }

  return (
    <div className="fade-in" style={{ padding: '24px', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Панель Администратора</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Управление персоналом, кабинетами и графиком клиники</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => { setModalType('doctor'); setModalOpen(true); }}
            className="btn btn-primary"
          >
            <Plus size={16} /> Добавить Врача
          </button>
          <button
            onClick={() => { setModalType('office'); setModalOpen(true); }}
            className="btn btn-secondary"
          >
            <Building2 size={16} /> Добавить кабинет
          </button>
          <button
            onClick={() => { setModalType('specialty'); setModalOpen(true); }}
            className="btn btn-accent"
          >
            <Plus size={16} /> Специальность
          </button>
        </div>
      </div>

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

      {/* Tabs Bar */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '20px', paddingBottom: '8px' }}>
        <button
          className={`btn ${activeTab === 'doctors' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('doctors')}
        >
          <Stethoscope size={16} /> Врачи ({doctors.length})
        </button>
        <button
          className={`btn ${activeTab === 'offices' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('offices')}
        >
          <Building2 size={16} /> Кабинеты ({offices.length})
        </button>
        <button
          className={`btn ${activeTab === 'specialties' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('specialties')}
        >
          <Bookmark size={16} /> Специальности ({specialties.length})
        </button>
        <button
          className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('users')}
        >
          <Users size={16} /> Аккаунты ({users.length})
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'doctors' && (
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.2rem' }}>Список врачей клиники</h3>
          </div>
          {doctors.length === 0 ? (
            <p style={{ color: '#94a3b8', textAlign: 'center', padding: '30px' }}>Врачи еще не добавлены</p>
          ) : (
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>ФИО Врача</th>
                    <th>Специальность</th>
                  </tr>
                </thead>
                <tbody>
                  {doctors.map((doc) => (
                    <tr key={doc.id} onClick={() => setScheduleDoctor(doc)} style={{ cursor: 'pointer' }} title="Открыть расписание врача">
                      <td>#{doc.id}</td>
                      <td style={{ fontWeight: 600 }}>{doc.fullName}</td>
                      <td>
                        <span className="badge badge-doctor">{doc.specialty}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'offices' && (
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.2rem' }}>Кабинеты клиники</h3>
            <button onClick={() => { setModalType('office'); setModalOpen(true); }} className="btn btn-primary btn-sm">
              <Plus size={14} /> Новый кабинет
            </button>
          </div>
          {offices.length === 0 ? (
            <p style={{ color: '#94a3b8', textAlign: 'center', padding: '30px' }}>Кабинеты не добавлены</p>
          ) : (
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Номер кабинета</th>
                    <th>Этаж</th>
                    <th>Удаление</th>
                  </tr>
                </thead>
                <tbody>
                  {offices.map((off) => (
                    <tr key={off.id}>
                      <td>#{off.id}</td>
                      <td style={{ fontWeight: 600 }}>Кабинет №{off.number}</td>
                      <td>{off.floor} этаж</td>
                      <td>
                        <button onClick={() => handleDeleteOffice(off.id)} className="btn btn-danger btn-sm">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'specialties' && (
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.2rem' }}>Медицинские специальности</h3>
            <button onClick={() => { setModalType('specialty'); setModalOpen(true); }} className="btn btn-accent btn-sm">
              <Plus size={14} /> Добавить специальность
            </button>
          </div>
          {specialties.length === 0 ? (
            <p style={{ color: '#94a3b8', textAlign: 'center', padding: '30px' }}>Специальности не найдены</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
              {specialties.map((spec) => (
                <div key={spec.id} className="glass-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Bookmark size={20} color="#10b981" />
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>ID #{spec.id}</span>
                    <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>{spec.name}</h4>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}


      {activeTab === 'users' && (
        <div className="glass-card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Все зарегистрированные пользователи</h3>
          {users.length === 0 ? (
            <p style={{ color: '#94a3b8', textAlign: 'center', padding: '30px' }}>Пользователи не найдены</p>
          ) : (
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Логин</th>
                    <th>Роль</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td>#{u.id}</td>
                      <td style={{ fontWeight: 600 }}>{u.login}</td>
                      <td>
                        <span className={`badge ${
                          u.role === 1 ? 'badge-admin' :
                          u.role === 2 ? 'badge-doctor' :
                          u.role === 3 ? 'badge-registrar' : 'badge-patient'
                        }`}>
                          {UserRoleNames[u.role] || u.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal Dialogs */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={
        modalType === 'doctor' ? 'Добавить врача' :
        modalType === 'office' ? 'Добавить кабинет' :
        modalType === 'specialty' ? 'Добавить специальность' :
        modalType === 'schedule' ? 'Добавить график работы' : 'Добавить слот приёма'
      }>
        {modalType === 'doctor' && (
          <form onSubmit={handleCreateDoctor}>
            <div className="form-group">
              <label>ФИО Врача</label>
              <input
                type="text"
                className="form-input"
                placeholder="Иванов Иван Иванович"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Специальность</label>
              <select
                className="form-select"
                value={selectedSpecialtyId}
                onChange={(e) => setSelectedSpecialtyId(Number(e.target.value))}
              >
                <option value={0}>-- Выберите специальность --</option>
                {specialties.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Кабинет</label>
              <select
                className="form-select"
                value={selectedOfficeId}
                onChange={(e) => setSelectedOfficeId(Number(e.target.value))}
              >
                <option value={0}>-- Выберите кабинет --</option>
                {offices.map((office) => (
                  <option key={office.id} value={office.id}>
                    {office.number} (этаж {office.floor})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Логин врача</label>
              <input className="form-input" value={doctorLogin} onChange={(e) => setDoctorLogin(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Пароль учётной записи</label>
              <input type="password" className="form-input" value={doctorPassword} onChange={(e) => setDoctorPassword(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
              Сохранить врача
            </button>
          </form>
        )}

        {modalType === 'office' && (
          <form onSubmit={handleCreateOffice}>
            <div className="form-group">
              <label>Номер кабинета</label>
              <input
                type="text"
                className="form-input"
                placeholder="например: 104-A"
                value={officeNumber}
                onChange={(e) => setOfficeNumber(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Этаж</label>
              <input
                type="number"
                className="form-input"
                min={1}
                value={officeFloor}
                onChange={(e) => setOfficeFloor(Number(e.target.value))}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
              Создать кабинет
            </button>
          </form>
        )}

        {modalType === 'specialty' && (
          <form onSubmit={handleCreateSpecialty}>
            <div className="form-group">
              <label>Название специальности</label>
              <input
                type="text"
                className="form-input"
                placeholder="например: Кардиолог"
                value={specialtyName}
                onChange={(e) => setSpecialtyName(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-accent" style={{ width: '100%', marginTop: '10px' }}>
              Добавить специальность
            </button>
          </form>
        )}

        {modalType === 'schedule' && (
          <form onSubmit={handleCreateSchedule}>
            <div className="form-group">
              <label>Выберите Врача</label>
              <select
                className="form-select"
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(Number(e.target.value))}
              >
                <option value={0}>-- Выберите врача --</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>{d.fullName} ({d.specialty})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Рабочие дни</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {Object.entries(WeekDayNames).map(([key, name]) => {
                  const day = Number(key) as WeekDay;
                  const selected = selectedScheduleDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      className={`btn ${selected ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                      onClick={() => setSelectedScheduleDays((days) =>
                        selected ? days.filter((item) => item !== day) : [...days, day].sort((a, b) => a - b)
                      )}
                    >
                      {name}
                    </button>
                  );
                })}
              </div>
              <small style={{ color: '#94a3b8', display: 'block', marginTop: '8px' }}>
                Отметьте дни, в которые врач принимает пациентов.
              </small>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-group">
                <label>Время начала</label>
                <input
                  type="time"
                  className="form-input"
                  value={scheduleStart}
                  onChange={(e) => setScheduleStart(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Время окончания</label>
                <input
                  type="time"
                  className="form-input"
                  value={scheduleEnd}
                  onChange={(e) => setScheduleEnd(e.target.value)}
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
              Сохранить график
            </button>
          </form>
        )}

        {modalType === 'slot' && (
          <form onSubmit={handleCreateSlot}>
            <div className="form-group">
              <label>Выберите Врача</label>
              <select
                className="form-select"
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(Number(e.target.value))}
              >
                <option value={0}>-- Выберите врача --</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>{d.fullName} ({d.specialty})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Дата приёма</label>
              <input
                type="date"
                className="form-input"
                value={slotDate}
                onChange={(e) => setSlotDate(e.target.value)}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-group">
                <label>Начало рабочего дня</label>
                <input type="time" className="form-input" value={slotStart} onChange={(e) => setSlotStart(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Конец рабочего дня</label>
                <input type="time" className="form-input" value={slotEnd} onChange={(e) => setSlotEnd(e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label>Длительность одного приёма</label>
              <select className="form-select" value={slotDuration} onChange={(e) => setSlotDuration(Number(e.target.value))}>
                <option value={15}>15 минут</option>
                <option value={20}>20 минут</option>
                <option value={30}>30 минут</option>
                <option value={45}>45 минут</option>
                <option value={60}>60 минут</option>
              </select>
              <small style={{ color: '#94a3b8', display: 'block', marginTop: '8px' }}>
                Будут созданы последовательные свободные слоты в выбранном рабочем интервале.
              </small>
            </div>
            <button type="submit" className="btn btn-accent" style={{ width: '100%', marginTop: '10px' }}>
              Сгенерировать слоты
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
};
