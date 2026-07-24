import { useEffect, useState, useRef } from 'react'
import { Save, Check, Eye, EyeOff, Cog } from 'lucide-react'
import pb from '../lib/pocketbase'

interface Setting {
  id: string
  key: string
  value: string
  description: string
}

// Settings that should be masked as password fields
const SECRET_KEYS = ['payfast_merchant_key', 'payfast_passphrase', 'evolution_api_key']

// Setting descriptions for better UX
const SETTING_LABELS: Record<string, { label: string; hint?: string }> = {
  business_name: { label: 'Business Name' },
  business_hours: { label: 'Operating Hours', hint: 'e.g. Thu-Sun 11:00-18:00' },
  cancellation_admin_fee: { label: 'Cancellation Admin Fee (Rands)', hint: 'Admin fee retained on deposit cancellation' },
  cancellation_hours_before: { label: 'Cancellation Window (hours)', hint: 'Hours before game when cancellation is allowed' },
  default_currency: { label: 'Default Currency', hint: 'ISO code e.g. ZAR' },
  default_reset_buffer: { label: 'Reset Buffer (minutes)', hint: 'Time between games for room reset' },
  game_duration: { label: 'Game Duration (minutes)' },
  payfast_merchant_id: { label: 'Merchant ID', hint: 'Payfast merchant ID' },
  payfast_merchant_key: { label: 'Merchant Key', hint: 'Payfast merchant key (secret)' },
  payfast_passphrase: { label: 'Passphrase', hint: 'Payfast passphrase (secret)' },
  payfast_mode: { label: 'Payment Mode', hint: 'sandbox or live' },
  evolution_api_url: { label: 'API URL', hint: 'Evolution API base URL' },
  evolution_api_key: { label: 'API Key', hint: 'Evolution API key (secret)' },
  evolution_instance: { label: 'Instance Name', hint: 'Evolution API instance' },
  whatsapp_enabled: { label: 'Enable WhatsApp', hint: 'true or false' },
  reminder_hours_before: { label: 'Reminder Hours', hint: 'Hours before game to send reminder' },
  waiver_enabled: { label: 'Enable Waivers', hint: 'true or false' },
  waiver_hours_before: { label: 'Waiver Reminder Hours', hint: 'Hours before game to send waiver link' },
}

const GROUP_ORDER = ['General', 'Payfast', 'WhatsApp', 'Evolution API']

export default function Settings() {
  const [settings, setSettings] = useState<Setting[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({})
  const initRef = useRef(false)

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

  // Initialize collapsed state for groups with all empty values
  useEffect(() => {
    if (initRef.current || settings.length === 0) return
    initRef.current = true

    const initial: Record<string, boolean> = {}
    const grouped = settings.reduce<Record<string, Setting[]>>((acc, s) => {
      const group = s.key.startsWith('payfast') ? 'Payfast' :
                    s.key.startsWith('evolution') ? 'Evolution API' :
                    s.key.startsWith('whatsapp') || s.key.startsWith('reminder') ? 'WhatsApp' :
                    s.key.startsWith('waiver') ? 'WhatsApp' :
                    'General'
      if (!acc[group]) acc[group] = []
      acc[group].push(s)
      return acc
    }, {})

    for (const [group, items] of Object.entries(grouped)) {
      if (['Evolution API', 'WhatsApp'].includes(group) && items.every(s => !s.value.trim())) {
        initial[group] = true
      }
    }
    setCollapsedGroups(initial)
  }, [settings])

  const updateSetting = (id: string, value: string) => {
    setSettings(prev => prev.map(s => s.id === id ? { ...s, value } : s))
  }

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    try {
      for (const s of settings) {
        await pb.collection('settings').update(s.id, { value: s.value })
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
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
                  s.key.startsWith('waiver') ? 'WhatsApp' :
                  'General'
    if (!acc[group]) acc[group] = []
    acc[group].push(s)
    return acc
  }, {})

  const sortedGroups = Object.entries(grouped).sort(([a], [b]) => {
    return GROUP_ORDER.indexOf(a) - GROUP_ORDER.indexOf(b)
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Settings</h1>
          <p className="text-gray-500 mt-1">Configure your booking system</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm transition-all ${
            saved
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'btn-gr8'
          }`}
        >
          {saved ? (
            <><Check size={16} /> Saved!</>
          ) : (
            <><Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}</>
          )}
        </button>
      </div>

      <div className="space-y-8">
        {sortedGroups.map(([group, items]) => {
          const isCollapsed = collapsedGroups[group]

          return (
            <div key={group} className="card-dark">
              <div className="flex items-center gap-3 mb-4">
                {group === 'Payfast' && <span className="text-lg">💳</span>}
                {group === 'WhatsApp' && <span className="text-lg">📱</span>}
                {group === 'Evolution API' && <span className="text-lg">🔗</span>}
                {group === 'General' && <span className="text-lg">⚙️</span>}
                <h2 className="text-lg font-bold text-white">{group}</h2>
              </div>
              {isCollapsed ? (
                <div className="bg-white/5 border border-dashed border-gray-700 rounded-lg p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-gray-400 text-sm">
                        {group === 'Evolution API'
                          ? 'Not configured — set up to enable WhatsApp notifications'
                          : 'Not configured — set up WhatsApp messaging features'}
                      </p>
                    </div>
                    <button
                      onClick={() => setCollapsedGroups(prev => ({ ...prev, [group]: false }))}
                      className="btn-gr8 px-4 py-2 text-sm flex items-center gap-2 shrink-0"
                    >
                      <Cog size={14} />
                      Configure
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map(s => {
                    const meta = SETTING_LABELS[s.key]
                    const isSecret = SECRET_KEYS.includes(s.key)
                    const isPassword = isSecret && !showSecrets[s.key]

                    return (
                      <div key={s.id} className="flex flex-col gap-1">
                        <label className="text-sm text-gray-400 font-medium">
                          {meta?.label || s.description || s.key}
                        </label>
                        <div className="relative">
                          <input
                            type={isPassword ? 'password' : 'text'}
                            value={s.value}
                            onChange={e => updateSetting(s.id, e.target.value)}
                            className="w-full bg-white/5 border border-gray-700 rounded-lg px-4 py-2.5 pr-10 text-white text-sm focus:outline-none focus:border-gr8-red transition-colors"
                            placeholder={meta?.hint || s.key}
                          />
                          {isSecret && (
                            <button
                              type="button"
                              onClick={() => setShowSecrets(prev => ({ ...prev, [s.key]: !prev[s.key] }))}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                            >
                              {showSecrets[s.key] ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          )}
                        </div>
                        {meta?.hint && !isSecret && (
                          <p className="text-xs text-gray-600">{meta.hint}</p>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
