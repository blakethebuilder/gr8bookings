import { useEffect, useState } from 'react'
import { Save } from 'lucide-react'
import pb from '../lib/pocketbase'

interface Setting {
  id: string
  key: string
  value: string
  description: string
}

export default function Settings() {
  const [settings, setSettings] = useState<Setting[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const s = await pb.collection('settings').getFullList<Setting>({ sort: 'key' })
        setSettings(s)
      } catch (e) {
        console.error('Failed to load settings:', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const updateSetting = (id: string, value: string) => {
    setSettings(prev => prev.map(s => s.id === id ? { ...s, value } : s))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      for (const s of settings) {
        await pb.collection('settings').update(s.id, { value: s.value })
      }
    } catch (e) {
      console.error('Failed to save:', e)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading settings...</div>
      </div>
    )
  }

  const grouped = settings.reduce<Record<string, Setting[]>>((acc, s) => {
    const group = s.key.startsWith('payfast') ? 'Payfast' :
                  s.key.startsWith('evolution') ? 'Evolution API' :
                  s.key.startsWith('whatsapp') || s.key.startsWith('reminder') ? 'WhatsApp' :
                  'General'
    if (!acc[group]) acc[group] = []
    acc[group].push(s)
    return acc
  }, {})

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-white">Settings</h1>
          <p className="text-gray-500 mt-1">Configure your booking system</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-gr8 flex items-center gap-2"
        >
          <Save size={16} />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="space-y-8">
        {Object.entries(grouped).map(([group, items]) => (
          <div key={group} className="card-dark">
            <h2 className="text-lg font-bold text-white mb-4">{group}</h2>
            <div className="space-y-4">
              {items.map(s => (
                <div key={s.id} className="flex flex-col gap-1">
                  <label className="text-sm text-gray-400 font-medium">{s.description || s.key}</label>
                  <input
                    type="text"
                    value={s.value}
                    onChange={e => updateSetting(s.id, e.target.value)}
                    className="bg-white/5 border border-gray-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-gr8-red transition-colors"
                    placeholder={s.key}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
