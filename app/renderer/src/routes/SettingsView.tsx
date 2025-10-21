import { useEffect, useState } from 'react';
import type { SettingsSchema } from '../../shared/schema';
import clsx from 'classnames';

interface SettingsViewProps {
  settings: SettingsSchema;
  onChange(settings: SettingsSchema): void;
  searchEngines: { id: string; name?: string }[];
}

const accentOptions = ['#7c3aed', '#22d3ee', '#f472b6', '#f97316', '#a855f7'];

export function SettingsView({ settings, onChange, searchEngines }: SettingsViewProps) {
  const [form, setForm] = useState(settings);

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  function update<K extends keyof SettingsSchema>(key: K, value: SettingsSchema[K]) {
    const next = { ...form, [key]: value };
    setForm(next);
    onChange(next);
  }

  return (
    <div className="h-full overflow-y-auto p-8 space-y-8 bg-black/40">
      <section className="glass-panel border border-white/5 rounded-3xl p-6 space-y-4">
        <header className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Apparence</h2>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm text-white/60">Thème</label>
            <div className="flex gap-2">
              {(['dark', 'light'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => update('theme', mode)}
                  className={clsx('px-4 py-2 rounded-2xl border transition', {
                    'border-accent/60 bg-accent/20': form.theme === mode,
                    'border-white/10 hover:border-white/20': form.theme !== mode,
                  })}
                >
                  {mode === 'dark' ? 'Sombre' : 'Clair'}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-white/60">Couleur d'accent</label>
            <div className="flex gap-3">
              {accentOptions.map((color) => (
                <button
                  key={color}
                  onClick={() => update('accentColor', color)}
                  className="w-10 h-10 rounded-full border-4 border-white/10"
                  style={{ background: color, borderColor: form.accentColor === color ? '#fff' : 'transparent' }}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SliderField
            label="Flou des panneaux"
            value={form.panelBlur}
            min={5}
            max={25}
            onChange={(value) => update('panelBlur', value)}
          />
          <SliderField
            label="Opacité des panneaux"
            value={form.panelOpacity}
            min={0.3}
            max={0.95}
            step={0.05}
            onChange={(value) => update('panelOpacity', value)}
          />
          <SliderField
            label="Limite CPU (%)"
            value={form.cpuLimit}
            min={20}
            max={100}
            onChange={(value) => update('cpuLimit', value)}
          />
          <SliderField
            label="Limite RAM (Mo)"
            value={form.ramLimit}
            min={512}
            max={16384}
            step={256}
            onChange={(value) => update('ramLimit', value)}
          />
        </div>
      </section>
      <section className="glass-panel border border-white/5 rounded-3xl p-6 space-y-4">
        <header>
          <h2 className="text-lg font-semibold">Navigation</h2>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm text-white/60">Moteur de recherche</label>
            <select
              value={form.searchEngine}
              onChange={(event) => update('searchEngine', event.target.value)}
              className="w-full rounded-2xl bg-white/5 px-4 py-2 border border-white/10 text-white"
            >
              {searchEngines.map((engine) => (
                <option key={engine.id} value={engine.id} className="bg-surface text-white">
                  {engine.name ?? engine.id}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-white/60">Page d'accueil</label>
            <input
              value={form.homepage}
              onChange={(event) => update('homepage', event.target.value)}
              className="w-full rounded-2xl bg-white/5 px-4 py-2 border border-white/10"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-white/60">Fond vidéo</label>
            <input
              value={form.backgroundVideo ?? ''}
              onChange={(event) => update('backgroundVideo', event.target.value || null)}
              className="w-full rounded-2xl bg-white/5 px-4 py-2 border border-white/10"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function SliderField({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange(value: number): void;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm text-white/60 flex justify-between">
        <span>{label}</span>
        <span className="text-white/80">{value}</span>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full"
      />
    </div>
  );
}
