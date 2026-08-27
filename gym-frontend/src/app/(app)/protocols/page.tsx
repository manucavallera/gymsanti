"use client";
import { useEffect, useState } from "react";
import { Plus, ChevronLeft, BookOpen, Pencil, Trash2, Save, X, Search } from "lucide-react";
import { authFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth";

interface Protocol {
  id: number; title: string; content: string; category: string;
  sections?: ProtocolSection[] | null;
  isPublic: boolean; createdAt: string; updatedAt: string;
}

type SectionType = "heading" | "text" | "list" | "note" | "image";
interface ProtocolSection { id: string; type: SectionType; title?: string; content: string; }

const SECTION_LABELS: Record<SectionType, string> = {
  heading: "Título",
  text: "Texto",
  list: "Lista (un elemento por línea)",
  note: "Nota importante",
  image: "Imagen (URL)",
};

const CATEGORIES = [
  { value: "entrenamiento", label: "Entrenamiento", emoji: "🏋️" },
  { value: "nutricion", label: "Nutrición", emoji: "🥗" },
  { value: "descanso", label: "Descanso", emoji: "😴" },
  { value: "suplementacion", label: "Suplementación", emoji: "💊" },
  { value: "general", label: "General", emoji: "📋" },
];

const CAT_COLORS: Record<string, string> = {
  entrenamiento: "bg-fuchsia-600/20 text-fuchsia-400 border-fuchsia-600/30",
  nutricion: "bg-green-600/20 text-green-400 border-green-600/30",
  descanso: "bg-purple-600/20 text-purple-400 border-purple-600/30",
  suplementacion: "bg-orange-600/20 text-orange-400 border-orange-600/30",
  general: "bg-zinc-600/20 text-zinc-400 border-zinc-600/30",
};

function renderMarkdown(text: string) {
  return text
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-6 mb-2">$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 class="text-base font-bold mt-4 mb-2 text-zinc-300">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-white">$1</strong>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 text-zinc-300 list-disc">$1</li>')
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-2 border-fuchsia-500 pl-4 text-zinc-400 italic my-2">$1</blockquote>')
    .replace(/\n/g, '<br />');
}

function renderSections(sections: ProtocolSection[]) {
  return sections.map((section) => {
    if (section.type === "heading") return <h2 key={section.id} className="mt-6 mb-2 text-xl font-bold">{section.content}</h2>;
    if (section.type === "list") return <ul key={section.id} className="my-3 list-disc space-y-1 pl-5 text-zinc-300">{section.content.split("\n").filter(Boolean).map((item, index) => <li key={`${section.id}-${index}`}>{item}</li>)}</ul>;
    if (section.type === "note") return <blockquote key={section.id} className="my-3 border-l-2 border-fuchsia-500 pl-4 italic text-zinc-400">{section.content}</blockquote>;
    if (section.type === "image") return <img key={section.id} src={section.content} alt={section.title || "Imagen del protocolo"} className="my-4 max-h-96 w-full rounded-xl object-cover" />;
    return <p key={section.id} className="my-3 whitespace-pre-wrap text-zinc-300">{section.content}</p>;
  });
}

export default function ProtocolsPage() {
  const { user } = useAuth();
  const isCoach = user?.role === "coach" || user?.role === "admin";
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [selected, setSelected] = useState<Protocol | null>(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Protocol | null>(null);
  const [form, setForm] = useState({ title: "", content: "", category: "general", sections: [] as ProtocolSection[] });
  const [saving, setSaving] = useState(false);

  const load = () => authFetch("/protocols").then((r) => r.json()).then(setProtocols);
  useEffect(() => { load(); }, []);

  const save = async () => {
    setSaving(true);
    if (editing) {
      await authFetch(`/protocols/${editing.id}`, { method: "PUT", body: JSON.stringify(form) });
    } else {
      await authFetch("/protocols", { method: "POST", body: JSON.stringify(form) });
    }
    setForm({ title: "", content: "", category: "general", sections: [] });
    setShowForm(false);
    setEditing(null);
    setSaving(false);
    load();
  };

  const del = async (id: number) => {
    await authFetch(`/protocols/${id}`, { method: "DELETE" });
    if (selected?.id === id) setSelected(null);
    load();
  };

  const startEdit = (p: Protocol) => {
    setEditing(p);
    setForm({ title: p.title, content: p.content, category: p.category, sections: p.sections || [] });
    setShowForm(true);
    setSelected(null);
  };

  const filtered = (filter === "all" ? protocols : protocols.filter((p) => p.category === filter))
    .filter((p) => !search || p.title.toLowerCase().includes(search.toLowerCase()));

  if (selected) {
    const cat = CATEGORIES.find((c) => c.value === selected.category);
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setSelected(null)} className="text-zinc-400 hover:text-white transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h2 className="text-2xl font-bold flex-1">{selected.title}</h2>
          {isCoach && (
            <div className="flex gap-2">
              <button onClick={() => startEdit(selected)} className="text-zinc-400 hover:text-fuchsia-400 transition-colors p-2">
                <Pencil className="w-4 h-4" />
              </button>
              <button onClick={() => del(selected.id)} className="text-zinc-400 hover:text-red-400 transition-colors p-2">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${CAT_COLORS[selected.category]}`}>
            {cat?.emoji} {cat?.label}
          </span>
          <span className="text-xs text-zinc-500">
            Actualizado: {new Date(selected.updatedAt).toLocaleDateString("es-AR")}
          </span>
        </div>
        <div
          className="prose prose-invert max-w-none text-zinc-300 leading-relaxed bg-zinc-900 border border-zinc-800 rounded-2xl p-6"
        >
          {selected.sections?.length ? renderSections(selected.sections) : <div dangerouslySetInnerHTML={{ __html: renderMarkdown(selected.content) }} />}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-3xl font-bold">Protocolos</h2>
          <p className="text-zinc-400 mt-1">Guías saludables de tu coach</p>
        </div>
        {isCoach && !showForm && (
          <button onClick={() => { setShowForm(true); setEditing(null); setForm({ title: "", content: "", category: "general", sections: [] }); }}
            className="flex items-center gap-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white px-4 py-2.5 rounded-xl font-bold transition-colors">
            <Plus className="w-4 h-4" /> Nuevo protocolo
          </button>
        )}
      </div>

      {/* Formulario coach */}
      {showForm && isCoach && (
        <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold">{editing ? "Editar protocolo" : "Nuevo protocolo"}</h3>
            <button onClick={() => { setShowForm(false); setEditing(null); }} className="text-zinc-500 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <input type="text" placeholder="Título *"
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-fuchsia-500"
          />
          <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-fuchsia-500">
            {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>)}
          </select>
          <textarea
            placeholder="Contenido (soporta Markdown básico: ## título, **negrita**, - lista, > cita)"
            value={form.content}
            onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
            rows={12}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-fuchsia-500 resize-none font-mono text-sm"
          />
          <div className="space-y-3 rounded-xl border border-zinc-700 bg-zinc-950/60 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h4 className="text-sm font-bold">Secciones opcionales</h4>
                <p className="text-xs text-zinc-500">Usalas para ordenar el protocolo sin escribir todo en un solo bloque.</p>
              </div>
              <button type="button" onClick={() => setForm((p) => ({ ...p, sections: [...p.sections, { id: crypto.randomUUID(), type: "text", content: "" }] }))}
                className="rounded-lg bg-zinc-800 px-3 py-2 text-xs font-bold text-zinc-300 hover:bg-zinc-700 hover:text-white">
                <Plus className="mr-1 inline h-3.5 w-3.5" />Agregar sección
              </button>
            </div>
            {form.sections.map((section, index) => (
              <div key={section.id} className="space-y-2 rounded-lg border border-zinc-800 p-3">
                <div className="flex items-center gap-2">
                  <select value={section.type} onChange={(e) => setForm((p) => ({ ...p, sections: p.sections.map((s) => s.id === section.id ? { ...s, type: e.target.value as SectionType } : s) }))}
                    className="min-w-0 flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white">
                    {(Object.keys(SECTION_LABELS) as SectionType[]).map((type) => <option key={type} value={type}>{SECTION_LABELS[type]}</option>)}
                  </select>
                  <button type="button" aria-label={`Eliminar sección ${index + 1}`} onClick={() => setForm((p) => ({ ...p, sections: p.sections.filter((s) => s.id !== section.id) }))} className="rounded-lg p-2 text-zinc-500 hover:bg-red-500/10 hover:text-red-400">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <textarea value={section.content} onChange={(e) => setForm((p) => ({ ...p, sections: p.sections.map((s) => s.id === section.id ? { ...s, content: e.target.value } : s) }))}
                  placeholder={section.type === "image" ? "https://..." : "Contenido de la sección"} rows={section.type === "list" ? 4 : 2}
                  className="w-full resize-none rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-fuchsia-500 focus:outline-none" />
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={save} disabled={saving || !form.title || (!form.content && !form.sections.some((section) => section.content.trim()))}
              className="flex items-center gap-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white px-5 py-2 rounded-lg font-bold text-sm disabled:opacity-50">
              <Save className="w-4 h-4" /> {saving ? "Guardando..." : "Guardar"}
            </button>
            <button onClick={() => { setShowForm(false); setEditing(null); }} className="text-zinc-400 hover:text-white text-sm px-4 py-2">Cancelar</button>
          </div>
        </div>
      )}

      {/* Busqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar protocolo..."
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-fuchsia-500 transition-colors" />
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilter("all")}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === "all" ? "bg-fuchsia-600 text-white" : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"}`}>
          Todos
        </button>
        {CATEGORIES.map((c) => (
          <button key={c.value} onClick={() => setFilter(c.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === c.value ? "bg-fuchsia-600 text-white" : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"}`}>
            {c.emoji} {c.label}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div className="space-y-3">
        {filtered.map((p) => {
          const cat = CATEGORIES.find((c) => c.value === p.category);
          return (
            <button key={p.id} onClick={() => setSelected(p)}
              className="w-full bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-2xl p-5 text-left transition-colors group">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${CAT_COLORS[p.category]} mb-2 inline-block`}>
                    {cat?.emoji} {cat?.label}
                  </span>
                  <h3 className="font-bold group-hover:text-fuchsia-400 transition-colors">{p.title}</h3>
                  <p className="text-zinc-500 text-sm mt-1 line-clamp-2">{p.content.replace(/[#*>-]/g, "").substring(0, 100)}...</p>
                </div>
                <BookOpen className="w-5 h-5 text-zinc-600 group-hover:text-fuchsia-400 transition-colors flex-shrink-0 mt-1" />
              </div>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-zinc-500">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Sin protocolos en esta categoría</p>
          </div>
        )}
      </div>
    </div>
  );
}

