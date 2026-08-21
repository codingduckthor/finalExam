import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../api/axiosClient';
import { AppointmentSlotResponseDto, DoctorScheduleResponseDto } from '../types';

type Patient = { id: number; fullName: string };

type DoctorAppointment = {
  appointmentId: number;
  appointmentSlotId: number;
  patientName: string;
  patientId: number;
  dateTime: string;
};

type Props = {
  doctorId: number;
  doctorName: string;
  canManageSlots?: boolean;
  canBook?: boolean;
  /** Если true — показывать ФИО пациента в занятых слотах (режим врача) */
  showPatientNames?: boolean;
  onAcceptPatient?: (appointmentId: number) => void;
};

const pad = (value: number) => String(value).padStart(2, '0');
const timeText = (date: Date) => `${pad(date.getHours())}:${pad(date.getMinutes())}`;
// API stores appointment slots as clinic-local `datetime2`; do not convert them to UTC.
const toClinicDateTime = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
const mondayOf = (date: Date) => {
  const copy = new Date(date);
  const day = copy.getDay() || 7;
  copy.setDate(copy.getDate() - day + 1);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

export const WeeklyScheduleGrid: React.FC<Props> = ({ doctorId, doctorName, canManageSlots = false, canBook = false, showPatientNames = false, onAcceptPatient }) => {
  const [weekStart, setWeekStart] = useState(() => mondayOf(new Date()));
  const [dateSearch, setDateSearch] = useState(() => new Date().toISOString().slice(0, 10));
  const [schedules, setSchedules] = useState<DoctorScheduleResponseDto[]>([]);
  const [slots, setSlots] = useState<AppointmentSlotResponseDto[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctorAppointments, setDoctorAppointments] = useState<DoctorAppointment[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<AppointmentSlotResponseDto | null>(null);
  const [patientId, setPatientId] = useState(0);
  const [patientName, setPatientName] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState<DoctorAppointment | null>(null);
  const [moveSlotId, setMoveSlotId] = useState(0);
  const [message, setMessage] = useState('');

  const days = useMemo(() => Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + index);
    return date;
  }), [weekStart]);

  const load = async () => {
    const [scheduleResult, slotResult, patientResult, appointmentResult] = await Promise.allSettled([
      api.get<DoctorScheduleResponseDto[]>(`/doctorschedules/${doctorId}`),
      api.get<AppointmentSlotResponseDto[]>(`/appointmentslots/${doctorId}`),
      canBook ? api.get<Patient[]>('/patients') : Promise.resolve({ data: [] as Patient[] }),
      showPatientNames ? api.get<DoctorAppointment[]>(`/appointments/doctor/${doctorId}`) : Promise.resolve({ data: [] as DoctorAppointment[] }),
    ]);
    if (scheduleResult.status === 'fulfilled') setSchedules(scheduleResult.value.data ?? []);
    if (slotResult.status === 'fulfilled') setSlots(slotResult.value.data ?? []);
    if (patientResult.status === 'fulfilled') setPatients(patientResult.value.data ?? []);
    if (appointmentResult.status === 'fulfilled') setDoctorAppointments(appointmentResult.value.data ?? []);
  };

  useEffect(() => { load(); }, [doctorId, weekStart]);

  const isWorking = (date: Date, time: string) => {
    const dayOfWeek = date.getDay() || 7;
    return schedules.some((schedule) => schedule.dayOfWeek === dayOfWeek && time >= schedule.startTime.slice(0, 5) && time < schedule.endTime.slice(0, 5));
  };

  const findSlot = (date: Date, time: string) => slots.find((slot) => {
    const start = new Date(slot.startTime);
    return start.toDateString() === date.toDateString() && timeText(start) === time;
  });

  const createSlot = async (date: Date, time: string) => {
    const start = new Date(date);
    const [hours, minutes] = time.split(':').map(Number);
    start.setHours(hours, minutes, 0, 0);
    await api.post('/appointmentslots', { doctorId, startTime: toClinicDateTime(start), endTime: toClinicDateTime(new Date(start.getTime() + 15 * 60_000)) });
    await load();
  };

  const fillWeek = async () => {
    const candidates: { startTime: string; endTime: string }[] = [];
    for (const date of days) for (let minutes = 8 * 60; minutes < 20 * 60; minutes += 15) {
      const time = `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
      if (isWorking(date, time) && !findSlot(date, time)) {
        const start = new Date(date); start.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
        candidates.push({ startTime: toClinicDateTime(start), endTime: toClinicDateTime(new Date(start.getTime() + 15 * 60_000)) });
      }
    }
    if (!candidates.length) return setMessage('Все рабочие интервалы этой недели уже созданы.');
    await Promise.all(candidates.map((slot) => api.post('/appointmentslots', { doctorId, ...slot })));
    setMessage(`Создано окон: ${candidates.length}`); await load();
  };

  const book = async () => {
    if (!selectedSlot || !patientName.trim()) return setMessage('Введите ФИО пациента.');
    if (new Date(selectedSlot.startTime) <= new Date())
      return setMessage('Нельзя записать пациента на прошедшее время.');

    const patient = patients.find((item) => item.fullName.trim().toLowerCase() === patientName.trim().toLowerCase());
    try {
      await api.post('/appointments', { patientId: patient?.id ?? 0, patientFullName: patientName.trim(), appointmentSlotId: selectedSlot.id });
      setSelectedSlot(null); setPatientId(0); setPatientName(''); setMessage('Пациент записан.'); await load();
    } catch (error: unknown) {
      const data = (error as { response?: { data?: unknown } })?.response?.data;
      setMessage(typeof data === 'string' ? data : 'Не удалось записать пациента.');
    }
  };

  const cancel = async () => {
    if (!selectedAppointment) return;
    try {
      await api.post(`/appointments/${selectedAppointment.appointmentId}/cancel`);
      setSelectedAppointment(null); setMessage('Запись отменена, слот снова свободен.'); await load();
    } catch (error: unknown) {
      const data = (error as { response?: { data?: unknown } })?.response?.data;
      setMessage(typeof data === 'string' ? data : 'Не удалось отменить приём.');
    }
  };
  const complete = async () => { if (!selectedAppointment) return; await api.post(`/appointments/${selectedAppointment.appointmentId}/complete`); onAcceptPatient?.(selectedAppointment.appointmentId); };
  const reschedule = async () => { if (!selectedAppointment || !moveSlotId) return setMessage('Выберите свободную ячейку для переноса.'); await api.post(`/appointments/${selectedAppointment.appointmentId}/reschedule`, { appointmentSlotId: moveSlotId }); setSelectedAppointment(null); setMoveSlotId(0); await load(); };

  const times = Array.from({ length: 48 }, (_, i) => `${pad(8 + Math.floor(i / 4))}:${pad((i % 4) * 15)}`);
  const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  // Карта slotId -> ФИО пациента
  const slotPatientMap = useMemo(() => {
    const map = new Map<number, string>();
    for (const appt of doctorAppointments) {
      if (appt.appointmentSlotId && appt.patientName) {
        map.set(appt.appointmentSlotId, appt.patientName);
      }
    }
    return map;
  }, [doctorAppointments]);

  return <div className="glass-card" style={{ padding: '20px', overflowX: 'auto' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
      <button className="btn btn-secondary btn-sm" onClick={() => setWeekStart(new Date(weekStart.getTime() - 7 * 86400000))}>←</button>
      <div style={{ flex: 1 }}><h2 style={{ fontSize: '1.25rem' }}>Недельное расписание: {doctorName}</h2><small style={{ color: '#94a3b8' }}>Одна ячейка — 15 минут приёма.</small></div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <input type="date" className="form-input" value={dateSearch} onChange={(e) => setDateSearch(e.target.value)} style={{ width: '150px', padding: '7px 10px' }} />
        <button className="btn btn-secondary btn-sm" onClick={() => setWeekStart(mondayOf(new Date(`${dateSearch}T00:00:00`)))}>Найти дату</button>
        <button className="btn btn-secondary btn-sm" onClick={() => setWeekStart(mondayOf(new Date()))}>Сегодня</button>
        {canManageSlots && <button className="btn btn-primary btn-sm" onClick={fillWeek}>Заполнить по графику</button>}
      </div>
      <button className="btn btn-secondary btn-sm" onClick={() => setWeekStart(new Date(weekStart.getTime() + 7 * 86400000))}>→</button>
    </div>
    {message && <p style={{ color: '#06b6d4', marginBottom: '12px' }}>{message}</p>}
    {selectedSlot && <div className="glass-card" style={{ padding: '12px', marginBottom: '12px', display: 'flex', gap: '10px', alignItems: 'center' }}>
      <span>Запись на {new Date(selectedSlot.startTime).toLocaleString('ru-RU')}</span>
      <input className="form-input" list="patients" value={patientName} onChange={(e) => setPatientName(e.target.value)} placeholder="Введите ФИО пациента" />
      <datalist id="patients">{patients.map((patient) => <option key={patient.id} value={patient.fullName} />)}</datalist>
      <button className="btn btn-primary btn-sm" onClick={book}>Записать</button><button className="btn btn-secondary btn-sm" onClick={() => setSelectedSlot(null)}>Отмена</button>
    </div>}
    {selectedAppointment && <div className="glass-card" style={{ padding: '12px', marginBottom: '12px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
      <strong>{selectedAppointment.patientName}</strong>
      <button className="btn btn-primary btn-sm" onClick={complete}>Принять пациента</button>
      <button className="btn btn-danger btn-sm" onClick={cancel}>Отменить приём</button>
      <select className="form-select" value={moveSlotId} onChange={(e) => setMoveSlotId(Number(e.target.value))}><option value={0}>Новая дата и время</option>{slots.filter((item) => !item.isBooked && new Date(item.startTime) > new Date()).map((item) => <option key={item.id} value={item.id}>{new Date(item.startTime).toLocaleString('ru-RU')}</option>)}</select>
      <button className="btn btn-secondary btn-sm" onClick={reschedule}>Перенести запись</button>
      <button className="btn btn-secondary btn-sm" onClick={() => setSelectedAppointment(null)}>Закрыть</button>
    </div>}
    <table className="custom-table" style={{ minWidth: '850px', tableLayout: 'fixed' }}><thead><tr><th>Время</th>{days.map((date, index) => <th key={date.toISOString()} style={{ borderLeft: '2px solid rgba(148, 163, 184, 0.28)' }}>{dayNames[index]}<br /><small>{date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })}</small></th>)}</tr></thead><tbody>
      {times.map((time) => <tr key={time}><td>{time}</td>{days.map((date) => {
        const slot = findSlot(date, time); const working = isWorking(date, time);
        const patientName = slot?.isBooked ? slotPatientMap.get(slot.id) : undefined;
        const style = { padding: '2px', background: slot?.isBooked ? 'rgba(239,68,68,.22)' : slot ? 'rgba(16,185,129,.18)' : working ? 'rgba(6,182,212,.08)' : 'rgba(100,116,139,.12)' };
        return <td key={date.toISOString()} style={{ ...style, borderLeft: '2px solid rgba(148, 163, 184, 0.22)' }}>{slot ? (
          slot.isBooked ? (
            showPatientNames ? (
              // Режим врача: занятый слот — показываем ФИО пациента
              <button type="button" onClick={() => setSelectedAppointment(doctorAppointments.find((item) => item.appointmentSlotId === slot.id) ?? null)} style={{
                width: '100%',
                padding: '3px 4px',
                background: 'rgba(239,68,68,0.15)',
                border: '1px solid rgba(239,68,68,0.4)',
                borderRadius: '4px',
                fontSize: '0.68rem',
                fontWeight: 600,
                color: '#fca5a5',
                lineHeight: 1.2,
                textAlign: 'center',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
              }} title={patientName ?? 'Занято'}>
                {patientName ?? 'Занято'}
              </button>
            ) : (
              // Другие роли: просто кнопка "Занято" задизейбленная
              <button type="button" className="btn btn-sm btn-danger" disabled style={{ width: '100%', padding: '4px' }}>Занято</button>
            )
          ) : (
            // Свободный слот — зелёная кнопка "Свободно"
            <button type="button" className="btn btn-sm btn-accent" disabled={!canBook} onClick={() => setSelectedSlot(slot)} style={{ width: '100%', padding: '4px' }}>Свободно</button>
          )
        ) : working && canManageSlots ? <button type="button" className="btn btn-secondary btn-sm" onClick={() => createSlot(date, time)} style={{ width: '100%', padding: '4px' }}>+</button> : null}</td>;
      })}</tr>)}
    </tbody></table>
  </div>;
};
