import React, { useState } from 'react';
import { api } from '../api/axiosClient';

const fields = [
  ['complaints', 'Жалобы'], ['anamnesisVitae', 'Anamnesis vitae'], ['anamnesisMorbi', 'Anamnesis morbi'],
  ['generalExamination', 'Общий осмотр'], ['statusLocalis', 'Status localis'], ['diagnosis', 'Предварительный диагноз'],
  ['analyses', 'Анализы'], ['treatment', 'Назначения'], ['recommendations', 'Рекомендации'],
] as const;

export const MedicalRecordCard: React.FC<{ appointmentId: number; onBack: () => void }> = ({ appointmentId, onBack }) => {
  const [form, setForm] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const save = async () => { await api.post('/medicalrecord', { appointmentId, ...form }); setSaved(true); };
  return <div className="fade-in" style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}><button className="btn btn-secondary" onClick={onBack}>← К расписанию</button><div><button className="btn btn-primary" onClick={save}>Сохранить карту</button><button className="btn btn-secondary" style={{ marginLeft: '8px' }} onClick={() => window.print()}>Печать</button></div></div>
    <div className="glass-card" style={{ padding: '20px' }}><h1>Медицинская карта пациента</h1>{saved && <p style={{ color: '#10b981' }}>Карта сохранена.</p>}<table className="custom-table" style={{ marginTop: '16px' }}><tbody>{fields.map(([key, label]) => <tr key={key}><th style={{ width: '30%' }}>{label}</th><td><textarea className="form-input" value={form[key] ?? ''} onChange={(e) => setForm({ ...form, [key]: e.target.value })} style={{ minHeight: '70px', resize: 'vertical' }} /></td></tr>)}</tbody></table></div>
  </div>;
};
