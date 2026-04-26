/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, ChangeEvent, FormEvent } from 'react';
import { format, parseISO, startOfDay } from 'date-fns';
import { vi } from 'date-fns/locale';
import { 
  Plus, 
  Search, 
  Calendar, 
  ClipboardList, 
  User, 
  Stethoscope, 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight,
  LogOut,
  ChevronLeft,
  Trash2,
  Clock,
  LayoutDashboard,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SBARHandover } from './types';
import { cn } from './lib/utils';

// Local storage key
const STORAGE_KEY = 'sbar_handovers_v1';

export default function App() {
  const [handovers, setHandovers] = useState<SBARHandover[]>([]);
  const [view, setView] = useState<'dashboard' | 'form'>('dashboard');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState('');

  // Loads handovers on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setHandovers(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse handovers', e);
      }
    }
  }, []);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(handovers));
  }, [handovers]);

  const filteredHandovers = useMemo(() => {
    const start = startOfDay(selectedDate);
    return handovers.filter(h => {
      const hDate = startOfDay(parseISO(h.date));
      const matchesDate = hDate.getTime() === start.getTime();
      const matchesSearch = h.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            h.diagnosis.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            h.room.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesDate && matchesSearch;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [handovers, selectedDate, searchQuery]);

  const stats = useMemo(() => {
    const start = startOfDay(selectedDate);
    const daily = handovers.filter(h => startOfDay(parseISO(h.date)).getTime() === start.getTime());
    return {
      total: daily.length,
      rooms: [...new Set(daily.map(h => h.room))].length
    };
  }, [handovers, selectedDate]);

  const handleSave = (data: SBARHandover) => {
    if (editingId) {
      setHandovers(prev => prev.map(h => h.id === editingId ? data : h));
    } else {
      setHandovers(prev => [data, ...prev]);
    }
    setView('dashboard');
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bản bàn giao này?')) {
      setHandovers(prev => prev.filter(h => h.id !== id));
    }
  };

  const openEdit = (id: string) => {
    setEditingId(id);
    setView('form');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <ClipboardList size={20} />
            </div>
            <h1 className="font-bold text-lg tracking-tight text-slate-800">SBAR Medical</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 text-slate-500 hover:text-blue-600 transition-colors">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        <AnimatePresence mode="wait">
          {view === 'dashboard' ? (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Dashboard Content */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Bàn giao trực</h2>
                  <div className="flex items-center gap-2 mt-1 text-slate-500">
                    <Calendar size={16} />
                    <span className="text-sm font-medium">
                      {format(selectedDate, "eeee, 'ngày' d MMMM, yyyy", { locale: vi })}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => { setEditingId(null); setView('form'); }}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all shadow-sm active:scale-95"
                >
                  <Plus size={18} />
                  <span>Thêm bệnh nhân</span>
                </button>
              </div>

              {/* Quick Stats & Date Picker */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <section className="md:col-span-3 space-y-4">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">Lọc theo ngày</h3>
                    <div className="flex flex-col gap-2">
                       <input 
                        type="date"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                        value={format(selectedDate, 'yyyy-MM-dd')}
                        onChange={(e) => setSelectedDate(parseISO(e.target.value))}
                       />
                       <div className="flex justify-between items-center mt-2 px-1">
                          <button 
                            onClick={() => setSelectedDate(prev => {
                              const d = new Date(prev);
                              d.setDate(d.getDate() - 1);
                              return d;
                            })}
                            className="p-1 hover:bg-slate-100 rounded-md transition-colors"
                          >
                            <ChevronLeft size={18} />
                          </button>
                          <button 
                            onClick={() => setSelectedDate(new Date())}
                            className="text-xs font-medium text-blue-600 hover:underline"
                          >
                            Hôm nay
                          </button>
                          <button 
                            onClick={() => setSelectedDate(prev => {
                              const d = new Date(prev);
                              d.setDate(d.getDate() + 1);
                              return d;
                            })}
                            className="p-1 hover:bg-slate-100 rounded-md transition-colors"
                          >
                            <ChevronRight size={18} />
                          </button>
                       </div>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Thống kê ngày</h3>
                      <LayoutDashboard size={14} className="text-slate-300" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-2xl font-bold text-slate-800">{stats.total}</div>
                        <div className="text-[10px] text-slate-400 uppercase font-medium">Bệnh nhân</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-slate-800">{stats.rooms}</div>
                        <div className="text-[10px] text-slate-400 uppercase font-medium">Buồng bệnh</div>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="md:col-span-9 space-y-4">
                  {/* Search Bar */}
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search size={18} className="text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <input
                      type="text"
                      className="block w-full pl-10 pr-3 py-3 bg-white border border-slate-200 rounded-2xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                      placeholder="Tìm theo tên bệnh nhân, chẩn đoán, buồng..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  {/* Patients List */}
                  <div className="space-y-4">
                    {filteredHandovers.length > 0 ? (
                      filteredHandovers.map((h) => (
                        <HandoverCard 
                          key={h.id} 
                          handover={h} 
                          onEdit={() => openEdit(h.id)} 
                          onDelete={() => handleDelete(h.id)}
                        />
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-300 space-y-4">
                        <div className="p-4 bg-slate-50 rounded-full text-slate-300">
                          <Stethoscope size={48} />
                        </div>
                        <div className="text-center">
                          <h3 className="text-slate-600 font-medium">Không có dữ liệu bàn giao</h3>
                          <p className="text-slate-400 text-sm mt-1">Chọn ngày khác hoặc thêm bệnh nhân mới</p>
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="max-w-3xl mx-auto"
            >
              <SBARForm 
                onSave={handleSave} 
                onCancel={() => { setEditingId(null); setView('dashboard'); }}
                initialData={editingId ? handovers.find(h => h.id === editingId) : undefined}
                defaultDate={selectedDate}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

interface HandoverCardProps {
  key?: React.Key;
  handover: SBARHandover;
  onEdit: () => void;
  onDelete: () => void;
}

function HandoverCard({ handover, onEdit, onDelete }: HandoverCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div 
      layout
      className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 group relative overflow-hidden"
    >
      <div className="p-5">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex gap-4 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
              handover.gender === 'Nam' ? "bg-blue-50 text-blue-600" : "bg-pink-50 text-pink-600"
            )}>
              <User size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-slate-800">{handover.patientName}</h3>
                <span className="text-sm text-slate-400">• {handover.age} tuổi</span>
              </div>
              <p className="text-sm font-medium text-slate-500 mt-0.5">
                P.{handover.room} - G.{handover.bed} | <span className="text-slate-700">{handover.diagnosis}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:self-start">
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title={isExpanded ? "Thu gọn" : "Xem chi tiết"}
            >
              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            <button 
              onClick={onEdit}
              className="px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              Sửa
            </button>
            <button 
              onClick={onDelete}
              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* SBAR Snippets / Full View */}
        <div className="mt-4 space-y-3">
          <AnimatePresence initial={false}>
            {isExpanded ? (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden space-y-4 pt-2"
              >
                <div className="grid grid-cols-1 gap-4">
                  <FullSBARSection label="S: Situation" color="bg-blue-500" content={handover.situation} />
                  <FullSBARSection label="B: Background" color="bg-indigo-500" content={handover.background} />
                  <FullSBARSection label="A: Assessment" color="bg-orange-500" content={handover.assessment} />
                  <FullSBARSection label="R: Recommendation" color="bg-red-500" content={handover.recommendation} />
                </div>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SBARPreview label="S" color="bg-blue-500" content={handover.situation} />
                <SBARPreview label="R" color="bg-red-500" content={handover.recommendation} />
              </div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="mt-4 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-50 pt-3">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Clock size={12} />
              Cập nhật: {format(parseISO(handover.updatedAt), "HH:mm")}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle2 size={12} className="text-green-500" />
            Bàn giao xong
          </div>
        </div>
      </div>
      {/* Accent bar */}
      <div className="absolute top-0 left-0 w-1 h-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.div>
  );
}

function FullSBARSection({ label, color, content }: { label: string, color: string, content: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <div className={cn("w-5 h-5 rounded flex items-center justify-center font-black text-white text-[9px]", color)}>
          {label[0]}
        </div>
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{label}</span>
      </div>
      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 whitespace-pre-wrap text-sm text-slate-700 leading-relaxed min-h-[40px]">
        {content || <span className="text-slate-300 italic text-xs">Không có thông tin</span>}
      </div>
    </div>
  );
}

function VitalStat({ label, value, unit, className }: { label: string, value: string, unit: string, className?: string }) {
  return (
    <div className={cn("flex flex-col", className)}>
      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">{label}</span>
      <span className="text-sm font-bold text-slate-700">{value} <span className="text-[10px] font-medium text-slate-400 italic">{unit}</span></span>
    </div>
  );
}

function SBARPreview({ label, color, content }: { label: string, color: string, content: string }) {
  return (
    <div className="flex gap-3 items-start bg-slate-50 p-2.5 rounded-xl border border-slate-100">
      <div className={cn("w-6 h-6 flex items-center justify-center rounded text-[10px] font-black text-white shrink-0 mt-0.5", color)}>
        {label}
      </div>
      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
        {content || "Không có dữ liệu"}
      </p>
    </div>
  );
}

interface SBARFormProps {
  onSave: (data: SBARHandover) => void;
  onCancel: () => void;
  initialData?: SBARHandover;
  defaultDate: Date;
}

function SBARForm({ onSave, onCancel, initialData, defaultDate }: SBARFormProps) {
  const [formData, setFormData] = useState<Partial<SBARHandover>>(initialData || {
    id: crypto.randomUUID(),
    date: format(defaultDate, 'yyyy-MM-dd'),
    patientName: '',
    age: '',
    gender: 'Nam',
    room: '',
    bed: '',
    diagnosis: '',
    situation: '',
    background: '',
    assessment: '',
    recommendation: '',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.patientName) return alert('Vui lòng nhập tên bệnh nhân');
    
    const now = new Date().toISOString();
    onSave({
      ...(formData as SBARHandover),
      updatedAt: now,
      createdAt: initialData ? initialData.createdAt : now,
    } as SBARHandover);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden mb-12">
      <div className="bg-slate-900 px-6 py-8 text-white">
        <div className="flex items-center justify-between mb-2">
          <button type="button" onClick={onCancel} className="text-slate-400 hover:text-white flex items-center gap-1 transition-colors">
            <ChevronLeft size={18} />
            <span className="text-sm font-medium">Bỏ qua</span>
          </button>
          <span className="text-xs uppercase font-bold tracking-widest text-slate-500">Tiêu chuẩn SBAR</span>
        </div>
        <h2 className="text-2xl font-bold">{initialData ? 'Chỉnh sửa bàn giao' : 'Thêm bệnh nhân mới'}</h2>
        <p className="text-slate-400 text-sm mt-1">Cung cấp thông tin chi tiết để bác sĩ trực có cái nhìn chính xác nhất.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-8">
        {/* Patient General Info */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <User size={18} className="text-blue-600" />
            <h3 className="font-bold text-slate-800">Thông tin hành chính</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase px-1">Tên bệnh nhân</label>
              <input
                name="patientName"
                value={formData.patientName}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-slate-300"
                placeholder="VD: Nguyễn Văn A"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase px-1">Tuổi</label>
              <input
                name="age"
                type="number"
                value={formData.age}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                placeholder="30"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase px-1">Giới tính</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none appearance-none"
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase px-1">Buồng</label>
              <input name="room" value={formData.room} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="A1" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase px-1">Giường</label>
              <input name="bed" value={formData.bed} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="05" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase px-1">Ngày bàn giao</label>
              <input 
                name="date" 
                type="date" 
                value={formData.date} 
                onChange={handleChange} 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20" 
              />
            </div>
          </div>
          <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase px-1">Chẩn đoán</label>
              <input name="diagnosis" value={formData.diagnosis} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="Sốt xuất huyết Dengue ngày 3..." />
            </div>
        </section>

        {/* SBAR Sections */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <ClipboardList size={18} className="text-blue-600" />
            <h3 className="font-bold text-slate-800">Cấu trúc S-B-A-R</h3>
          </div>
          
          <div className="space-y-5">
            <SBARField 
              name="situation" 
              label="S: Situation (Tình trạng bàn giao)" 
              color="bg-blue-600" 
              value={formData.situation || ''} 
              onChange={handleChange}
              placeholder="Tại sao bệnh nhân cần bàn giao? Tình trạng ổn hay không? Có biến cố gì mới không?"
            />
            <SBARField 
              name="background" 
              label="B: Background (Tiền sử & Bệnh sử)" 
              color="bg-indigo-600" 
              value={formData.background || ''} 
              onChange={handleChange}
              placeholder="Chẩn đoán, tiền sử quan trọng, dị ứng, thuốc đang dùng..."
            />
            <SBARField 
              name="assessment" 
              label="A: Assessment (Đánh giá hiện tại)" 
              color="bg-orange-600" 
              value={formData.assessment || ''} 
              onChange={handleChange}
              placeholder="Triệu chứng cơ năng, đánh giá ý thức, tiêu hóa, tiết niệu, cận lâm sàng bất thường..."
            />
            <SBARField 
              name="recommendation" 
              label="R: Recommendation (Y lệnh & Kiến nghị)" 
              color="bg-red-600" 
              value={formData.recommendation || ''} 
              onChange={handleChange}
              placeholder="Theo dõi gì đặc biệt? Y lệnh cần làm ngay trong đêm? Hướng xử trí nếu có biến đổi..."
            />
          </div>
        </section>

        <div className="flex items-center justify-end gap-3 pt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-200 active:scale-95"
          >
            Lưu bàn giao
          </button>
        </div>
      </form>
    </div>
  );
}

function SBARField({ name, label, color, value, onChange, placeholder }: { name: string, label: string, color: string, value: string, onChange: any, placeholder: string }) {
  return (
    <div className="space-y-2 group">
      <div className="flex items-center gap-2">
        <div className={cn("w-6 h-6 rounded flex items-center justify-center font-black text-white text-[10px]", color)}>
          {label[0]}
        </div>
        <label className="text-xs font-bold text-slate-600 group-focus-within:text-blue-600 transition-colors uppercase tracking-wide">
          {label}
        </label>
      </div>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows={3}
        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all text-sm placeholder:text-slate-300 resize-none leading-relaxed"
        placeholder={placeholder}
      />
    </div>
  );
}
