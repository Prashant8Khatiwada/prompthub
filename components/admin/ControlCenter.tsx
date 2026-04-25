'use client'

import { useState } from 'react'
import SettingsForm from './SettingsForm'
import type { Creator } from '@/types'

interface Props {
  creator: Creator
}

export default function ControlCenter({ creator }: Props) {
  const [activeTab, setActiveTab] = useState<'profile' | 'integrations'>('profile')

  const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'integrations', label: 'Integrations', icon: '🔌' },
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Tabs Header */}
      <div className="flex items-center gap-2 p-1.5 bg-zinc-900 border border-zinc-800 rounded-2xl w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id
                ? 'bg-zinc-800 text-white shadow-lg'
                : 'text-zinc-500 hover:text-zinc-300'
              }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl">
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">Public Profile</h2>
              <p className="text-zinc-500 text-sm">How you appear to the world on your discovery hub.</p>
            </div>
            <SettingsForm defaultValues={creator} section="profile" />
          </div>
        )}

        {activeTab === 'integrations' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">Integrations</h2>
              <p className="text-zinc-500 text-sm">Securely connect your social API keys for automated features.</p>
            </div>
            <SettingsForm defaultValues={creator} section="integrations" />
          </div>
        )}
      </div>
    </div>
  )
}
