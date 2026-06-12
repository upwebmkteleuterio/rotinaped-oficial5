import { useAppStore } from "../store/useAppStore";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/common/UI";
import {
  ArrowLeft,
  Camera,
  User,
  Settings2,
  Baby,
  Plus,
  ChevronRight,
  Heart,
  Briefcase,
  Phone,
  Trash2,
  Stethoscope,
  Info,
  CheckCircle2,
  Sparkles,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";
import { useState, useRef, ChangeEvent } from "react";
import { Child } from "../types";

export default function Profiles() {
  const {
    children,
    activeChildId,
    setActiveChild,
    addChild,
    updateChild,
    deleteChild,
  } = useAppStore();
  const [view, setView] = useState<"list" | "form">("list");
  const [editingChild, setEditingChild] = useState<Partial<Child> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError("A imagem deve ter no máximo 2MB.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingChild({
          ...editingChild!,
          photoUrl: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdd = () => {
    setEditingChild({
      id: crypto.randomUUID(),
      name: "",
      birthDate: "",
      gender: "male",
      feedingType: "breastfeeding",
      profileType: "child",
    });
    setView("form");
  };

  const handleEdit = (child: Child) => {
    setEditingChild({
      ...child,
      profileType: child.profileType || "child"
    });
    setView("form");
  };

  const handleSave = () => {
    if (!editingChild?.name || !editingChild?.birthDate) {
      const isPregnant = editingChild?.profileType === "pregnant";
      setError(`Por favor, preencha o nome e a ${isPregnant ? "data prevista do parto" : "data de nascimento"}.`);
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => setError(null), 3000);
      return;
    }

    const type = editingChild.profileType || "child";
    let finalChild = {
      ...editingChild,
      profileType: type,
      gender: type === "pregnant" ? "female" : (editingChild.gender || "male"),
    } as Child;

    // Sanitize child-specific fields if this is NOT a child profile
    if (type !== "child") {
      delete finalChild.deliveryType;
      delete finalChild.gestationalWeeks;
      delete finalChild.gestationalDays;
      delete finalChild.birthWeight;
      delete finalChild.birthHeight;
      delete finalChild.apgar1min;
      delete finalChild.apgar5min;
      delete finalChild.feedingType;
    }

    const isNew = !children.find((c) => c.id === finalChild.id);
    if (isNew) {
      addChild(finalChild);
      setActiveChild(finalChild.id!);
    } else {
      updateChild(finalChild.id!, finalChild);
    }
    setView("list");
    setEditingChild(null);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o perfil de ${name}? Todos os dados vinculados serão mantidos, mas o perfil não será mais acessível.`)) {
      deleteChild(id);
    }
  };

  return (
    <div className="pb-24 bg-slate-50 min-h-screen">
      <AnimatePresence mode="wait">
        {view === "list" ? (
          <motion.main
            key="list"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="px-6 py-8 space-y-8"
          >
            <div className="flex items-center gap-4">
              {children.length > 0 && (
                <button
                  onClick={() => navigate(-1)}
                  className="w-10 h-10 bg-white border border-slate-100 rounded-full flex items-center justify-center text-slate-400 active:scale-95 transition-transform"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <div>
                <h2 className="text-3xl font-bold text-slate-800 tracking-tight">
                  Perfis
                </h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Gestão de Perfis</p>
              </div>
              <div className="flex-1" />
              <button
                onClick={handleAdd}
                className="w-12 h-12 bg-brand-blue rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-100 active:scale-95 transition-transform"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>



            <div className="space-y-4">
              {children.map((child) => (
                <Card
                  key={child.id}
                  className={cn(
                    "p-6 flex items-center justify-between border transition-all cursor-pointer group hover:bg-slate-50",
                    activeChildId === child.id
                      ? "bg-blue-50/50 border-blue-200 ring-2 ring-blue-100/50"
                      : "bg-white border-slate-100",
                  )}
                  onClick={() => setActiveChild(child.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      {child.photoUrl ? (
                        <img
                          src={child.photoUrl}
                          alt={child.name}
                          className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-sm"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className={cn(
                          "w-14 h-14 rounded-2xl flex items-center justify-center border-2 border-white shadow-sm",
                          child.gender === 'male' ? "bg-blue-50 text-blue-400" : "bg-rose-50 text-rose-400"
                        )}>
                          <User className="w-6 h-6" />
                        </div>
                      )}
                      {activeChildId === child.id && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                          <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 tracking-tight leading-tight">
                        {child.name}
                      </h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                        {child.profileType === 'pregnant' ? 'DPP: ' : 'Nasc. '} 
                        {new Date(child.birthDate).toLocaleDateString()}
                        {child.profileType === 'pregnant' && ' | GESTANTE'}
                        {child.profileType === 'adult' && ' | ADULTO'}
                        {child.profileType === 'elderly' && ' | IDOSO'}
                        {(child.profileType === 'child' || !child.profileType) && ' | CRIANÇA'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(child);
                      }}
                      className="p-3 bg-slate-100/50 rounded-xl text-slate-400 hover:bg-brand-blue hover:text-white transition-all active:scale-90"
                    >
                      <Settings2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(child.id, child.name);
                      }}
                      className="p-3 bg-rose-50 rounded-xl text-rose-400 hover:bg-rose-500 hover:text-white transition-all active:scale-90"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>

            {children.length === 0 && (
              <div className="space-y-6 animate-fade-in text-left">
                {/* Onboarding Welcome Card */}
                <div className="bg-gradient-to-br from-blue-50/60 to-indigo-50/60 border border-blue-100/50 p-6 rounded-[2rem] space-y-4 shadow-xs">
                  <div className="flex items-center gap-2.5 text-brand-blue">
                    <Sparkles className="w-5 h-5 animate-pulse text-amber-500 fill-amber-500" />
                    <span className="text-xs font-black uppercase tracking-wider">Bem-vindo(a) ao RotinaPed!</span>
                  </div>
                  <h3 className="text-lg font-black text-slate-800 tracking-tight">Vamos começar a configurar?</h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    Para começarmos, precisamos primeiro que você configure o seu primeiro perfil. O RotinaPed foi projetado para acompanhar os cuidados de saúde de toda a família:
                  </p>
                  
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-700 pt-1">
                    <div className="flex items-center gap-1.5 bg-white p-2.5 rounded-xl border border-slate-100 shadow-3xs">
                      👶 Bebês e Crianças
                    </div>
                    <div className="flex items-center gap-1.5 bg-white p-2.5 rounded-xl border border-slate-100 shadow-3xs">
                      🤰 Gestantes (DPP)
                    </div>
                    <div className="flex items-center gap-1.5 bg-white p-2.5 rounded-xl border border-slate-100 shadow-3xs">
                      👩 Adultos
                    </div>
                    <div className="flex items-center gap-1.5 bg-white p-2.5 rounded-xl border border-slate-100 shadow-3xs">
                      👵 Idosos
                    </div>
                  </div>
                  
                  <p className="text-[10px] text-slate-400 font-semibold leading-normal pt-2 border-t border-slate-100/60">
                    💡 Toque no botão de adicionar (<span className="text-brand-blue font-bold">+</span>) no canto superior direito para cadastrar o seu primeiro perfil e liberar o aplicativo.
                  </p>
                </div>

                {/* Simulated illustration for visual delight */}
                <div className="py-8 text-center space-y-4 opacity-50 grayscale">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-300">
                    <User className="w-8 h-8" />
                  </div>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Aguardando seu primeiro cadastro...</p>
                </div>
              </div>
            )}
          </motion.main>
        ) : (
          <motion.main
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="px-6 py-4 space-y-10"
          >
            <div className="flex items-center gap-4">
              <button
                onClick={() => setView("list")}
                className="w-10 h-10 bg-slate-200/50 rounded-full flex items-center justify-center text-slate-600 active:scale-90 transition-transform"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
                  {children.find(c => c.id === editingChild?.id) ? "Editar Perfil" : "Novo Perfil"}
                </h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Informações de Saúde</p>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-rose-50 text-rose-500 p-4 rounded-2xl text-xs font-bold border border-rose-100 flex items-center gap-3"
              >
                <Info className="w-5 h-5" />
                {error}
              </motion.div>
            )}

            {/* Photo Upload Section */}
            <div className="flex flex-col items-center gap-4 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <div className="relative">
                <div
                  onClick={handlePhotoClick}
                  className="w-32 h-32 bg-slate-50 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-xl cursor-pointer flex items-center justify-center"
                >
                  {editingChild?.photoUrl ? (
                    <img
                      src={editingChild.photoUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="text-slate-300">
                      <Baby className="w-12 h-12" />
                    </div>
                  )}
                </div>
                <button
                  onClick={handlePhotoClick}
                  className="absolute -bottom-2 -right-2 w-12 h-12 bg-brand-blue rounded-2xl border-4 border-white flex items-center justify-center text-white shadow-lg active:scale-90 transition-transform"
                >
                  <Camera className="w-5 h-5" />
                </button>
              </div>
              <div className="text-center">
                <span className="text-[10px] font-bold text-brand-blue uppercase tracking-widest">
                  Personalizar Foto
                </span>
                <p className="text-[9px] text-slate-400 mt-1 uppercase font-bold tracking-tighter">Máximo 2MB</p>
              </div>
            </div>

            {/* Identification Section */}
            <section className="space-y-6">
              <div className="flex items-center gap-2 text-brand-blue">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold tracking-tight">Identificação</h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                    Tipo de Perfil
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'child', label: 'Criança', icon: Baby, color: 'border-blue-200 text-blue-600 bg-blue-50/45' },
                      { id: 'pregnant', label: 'Gestante', icon: Heart, color: 'border-pink-200 text-pink-600 bg-pink-50/45' },
                      { id: 'adult', label: 'Adulto', icon: User, color: 'border-indigo-200 text-indigo-600 bg-indigo-50/45' },
                      { id: 'elderly', label: 'Idoso', icon: Sparkles, color: 'border-amber-200 text-amber-600 bg-amber-50/45' },
                    ].map((type) => {
                      const isSelected = (editingChild?.profileType || 'child') === type.id;
                      return (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setEditingChild({ ...editingChild!, profileType: type.id as any })}
                          className={cn(
                            "py-4 px-2 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all border flex flex-col items-center gap-1.5 justify-center",
                            isSelected ? type.color : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                          )}
                        >
                          <type.icon className="w-4 h-4" />
                          {type.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    placeholder="Como devemos chamar?"
                    className="w-full bg-white border border-slate-100 rounded-2xl p-5 text-sm font-semibold text-slate-700 shadow-sm focus:ring-4 focus:ring-brand-blue/5 focus:border-brand-blue transition-all outline-none placeholder:text-slate-300"
                    value={editingChild?.name || ""}
                    onChange={(e) =>
                      setEditingChild({
                        ...editingChild!,
                        name: e.target.value,
                      })
                    }
                  />
                </div>

                {editingChild?.profileType === 'pregnant' ? (
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                      Previsão do Parto (DPP) *
                    </label>
                    <input
                      type="date"
                      className="w-full bg-white border border-slate-100 rounded-2xl p-5 text-sm font-semibold text-slate-700 shadow-sm focus:ring-4 focus:ring-brand-blue/5 focus:border-brand-blue transition-all outline-none"
                      value={editingChild?.birthDate || ""}
                      onChange={(e) =>
                        setEditingChild({
                          ...editingChild!,
                          birthDate: e.target.value,
                        })
                      }
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                        Nascimento *
                      </label>
                      <input
                        type="date"
                        className="w-full bg-white border border-slate-100 rounded-2xl p-5 text-sm font-semibold text-slate-700 shadow-sm focus:ring-4 focus:ring-brand-blue/5 focus:border-brand-blue transition-all outline-none"
                        value={editingChild?.birthDate || ""}
                        onChange={(e) =>
                          setEditingChild({
                            ...editingChild!,
                            birthDate: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                        Sexo
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {(['male', 'female'] as const).map((g) => (
                          <button
                            key={g}
                            type="button"
                            onClick={() => setEditingChild({ ...editingChild!, gender: g })}
                            className={cn(
                              "py-5 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all border",
                              editingChild?.gender === g 
                                ? g === 'male' ? "bg-blue-50 border-blue-200 text-blue-600" : "bg-rose-50 border-rose-200 text-rose-600"
                                : "bg-white border-slate-100 text-slate-400"
                            )}
                          >
                            {g === 'male' ? "Menino" : "Menina"}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                      CPF (Opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="000.000.000-00"
                      className="w-full bg-white border border-slate-100 rounded-2xl p-5 text-sm font-semibold text-slate-700 shadow-sm focus:ring-4 focus:ring-brand-blue/5 transition-all outline-none placeholder:text-slate-300"
                      value={editingChild?.documentId || ""}
                      onChange={(e) =>
                        setEditingChild({
                          ...editingChild!,
                          documentId: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                      Tipo Sanguíneo
                    </label>
                    <select
                      className="w-full bg-white border border-slate-100 rounded-2xl p-5 text-sm font-semibold text-slate-700 shadow-sm focus:ring-4 focus:ring-brand-blue/5 transition-all outline-none appearance-none cursor-pointer"
                      value={editingChild?.bloodType || ""}
                      onChange={(e) =>
                        setEditingChild({
                          ...editingChild!,
                          bloodType: e.target.value,
                        })
                      }
                    >
                      <option value="">Selecione</option>
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </section>

            {/* Birth Details Section */}
            {(!editingChild?.profileType || editingChild.profileType === 'child') && (
              <section className="bg-rose-50/50 p-8 rounded-[2.5rem] space-y-8 border border-rose-100/50 relative overflow-hidden">
                <Baby className="absolute -right-6 -top-6 w-32 h-32 text-rose-500/5" />
                <div className="flex items-center gap-2 text-rose-700 relative z-10">
                  <div className="w-8 h-8 bg-white/60 rounded-lg flex items-center justify-center">
                    <Baby className="w-4 h-4" />
                  </div>
                  <h3 className="text-lg font-bold tracking-tight">Dados de Nascimento</h3>
                </div>

                <div className="space-y-6 relative z-10">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-rose-400 uppercase tracking-widest pl-1">
                      Tipo de Parto
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {(['normal', 'cesarea'] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setEditingChild({ ...editingChild!, deliveryType: t })}
                          className={cn(
                            "py-5 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all border",
                            editingChild?.deliveryType === t 
                              ? "bg-white border-rose-200 text-rose-600 shadow-sm"
                              : "bg-white/40 border-transparent text-slate-400"
                          )}
                        >
                          {t === 'normal' ? "Normal" : "Cesárea"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-rose-400 uppercase tracking-widest pl-1">
                      Idade Gestacional
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <input
                          type="number"
                          placeholder="Semanas"
                          className="w-full bg-white border border-rose-100 rounded-2xl p-5 text-sm font-semibold text-slate-700 shadow-sm focus:ring-4 focus:ring-rose-200/20 transition-all outline-none"
                          value={editingChild?.gestationalWeeks || ""}
                          onChange={(e) =>
                            setEditingChild({
                              ...editingChild!,
                              gestationalWeeks: e.target.value ? Number(e.target.value) : undefined,
                            })
                          }
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[8px] font-bold text-slate-300 pointer-events-none">SEM</span>
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          placeholder="Dias"
                          className="w-full bg-white border border-rose-100 rounded-2xl p-5 text-sm font-semibold text-slate-700 shadow-sm focus:ring-4 focus:ring-rose-200/20 transition-all outline-none"
                          value={editingChild?.gestationalDays || ""}
                          onChange={(e) =>
                            setEditingChild({
                              ...editingChild!,
                              gestationalDays: e.target.value ? Number(e.target.value) : undefined,
                            })
                          }
                        />
                         <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[8px] font-bold text-slate-300 pointer-events-none">DIAS</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-rose-400 uppercase tracking-widest pl-1">
                        Peso (g)
                      </label>
                      <input
                        type="number"
                        placeholder="Ex: 3200"
                        className="w-full bg-white border border-rose-100 rounded-2xl p-5 text-sm font-semibold text-slate-700 shadow-sm focus:ring-4 focus:ring-rose-200/20 transition-all outline-none"
                        value={editingChild?.birthWeight || ""}
                        onChange={(e) =>
                          setEditingChild({
                            ...editingChild!,
                            birthWeight: e.target.value ? Number(e.target.value) : undefined,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-rose-400 uppercase tracking-widest pl-1">
                        Altura (cm)
                      </label>
                      <input
                        type="number"
                        placeholder="Ex: 49"
                        className="w-full bg-white border border-rose-100 rounded-2xl p-5 text-sm font-semibold text-slate-700 shadow-sm focus:ring-4 focus:ring-rose-200/20 transition-all outline-none"
                        value={editingChild?.birthHeight || ""}
                        onChange={(e) =>
                          setEditingChild({
                            ...editingChild!,
                            birthHeight: e.target.value ? Number(e.target.value) : undefined,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Health & Nutrition Section */}
            <section className="space-y-6">
              <div className="flex items-center gap-2 text-emerald-600">
                <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                   <Heart className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold tracking-tight">Saúde e Nutrição</h3>
              </div>

              <div className="space-y-6">
                {(!editingChild?.profileType || editingChild.profileType === 'child') && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                      Tipo de Alimentação
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() =>
                          setEditingChild({
                            ...editingChild!,
                            feedingType: "breastfeeding",
                          })
                        }
                        className={cn(
                          "py-5 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all border",
                          editingChild?.feedingType === "breastfeeding"
                            ? "bg-emerald-50 border-emerald-200 text-emerald-600 shadow-sm"
                            : "bg-white border-slate-100 text-slate-400",
                        )}
                      >
                        Amamentação
                      </button>
                      <button
                        onClick={() =>
                          setEditingChild({
                            ...editingChild!,
                            feedingType: "formula",
                          })
                        }
                        className={cn(
                          "py-5 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all border",
                          editingChild?.feedingType === "formula"
                            ? "bg-emerald-50 border-emerald-200 text-emerald-600 shadow-sm"
                            : "bg-white border-slate-100 text-slate-400",
                        )}
                      >
                        Fórmula
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                    Alergias Conhecidas
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: APLV, Pólen, Medicamentos..."
                    className="w-full bg-white border border-slate-100 rounded-2xl p-5 text-sm font-semibold text-slate-700 shadow-sm focus:ring-4 focus:ring-emerald-100 transition-all outline-none placeholder:text-slate-300"
                    value={editingChild?.allergies || ""}
                    onChange={(e) =>
                      setEditingChild({
                        ...editingChild!,
                        allergies: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                    Doenças Prévias / Observações
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Histórico médico relevante..."
                    className="w-full bg-white border border-slate-100 rounded-2xl p-5 text-sm font-semibold text-slate-700 shadow-sm focus:ring-4 focus:ring-emerald-100 transition-all outline-none resize-none placeholder:text-slate-300"
                    value={editingChild?.observations || ""}
                    onChange={(e) =>
                      setEditingChild({
                        ...editingChild!,
                        observations: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </section>

            {/* Pediatrician Section */}
            <section className="bg-slate-100 p-8 rounded-[2.5rem] space-y-6 border border-slate-200/50 shadow-inner">
              <div className="flex items-center gap-2 text-slate-700">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-brand-blue">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold tracking-tight">
                  {editingChild?.profileType === "pregnant" 
                    ? "Obstetra" 
                    : (editingChild?.profileType === "adult" || editingChild?.profileType === "elderly")
                      ? "Médico de Referência"
                      : "Pediatra"}
                </h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                    Nome do Médico
                  </label>
                  <input
                    type="text"
                    placeholder={editingChild?.profileType === "pregnant" 
                      ? "Dr(a). Obstetra" 
                      : (editingChild?.profileType === "adult" || editingChild?.profileType === "elderly")
                        ? "Ex: Dr(a). Silva"
                        : "Dr(a). Sobrenome"}
                    className="w-full bg-white border-none rounded-2xl p-5 text-sm font-semibold text-slate-700 shadow-sm focus:ring-4 focus:ring-brand-blue/5 transition-all outline-none placeholder:text-slate-300"
                    value={editingChild?.pediatricianName || ""}
                    onChange={(e) =>
                      setEditingChild({
                        ...editingChild!,
                        pediatricianName: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                    Telefone / WhatsApp
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input
                      type="tel"
                      placeholder="(00) 00000-0000"
                      className="w-full bg-white border-none rounded-2xl py-5 pl-12 pr-5 text-sm font-semibold text-slate-700 shadow-sm focus:ring-4 focus:ring-brand-blue/5 transition-all outline-none placeholder:text-slate-300"
                      value={editingChild?.pediatricianPhone || ""}
                      onChange={(e) =>
                        setEditingChild({
                          ...editingChild!,
                          pediatricianPhone: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Action Buttons */}
            <div className="flex flex-col gap-4 pt-6">
              <button
                onClick={handleSave}
                className="w-full bg-gradient-to-r from-brand-blue to-blue-400 text-white font-bold py-5 rounded-[2rem] shadow-xl shadow-blue-100 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
              >
                <CheckCircle2 className="w-5 h-5" />
                {children.find(c => c.id === editingChild?.id) ? "Salvar Alterações" : "Criar Perfil"}
              </button>
              <button
                onClick={() => setView("list")}
                className="text-slate-400 text-[10px] font-bold flex items-center justify-center gap-2 uppercase tracking-widest active:opacity-50 transition-opacity"
              >
                Cancelar Edição
              </button>
            </div>
          </motion.main>
        )}
      </AnimatePresence>


    </div>
  );
}
