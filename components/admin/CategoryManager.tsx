'use client'

import { useState, useEffect } from 'react'
import type { Category } from '@/types'

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newCat, setNewCat] = useState({ name: '', slug: '', icon: '🎬', description: '', featured: false })

  useEffect(() => {
    fetchCategories()
  }, [])

  async function fetchCategories() {
    const res = await fetch('/api/categories')
    const data = await res.json()
    setCategories(data)
    setLoading(false)
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCat),
    })
    if (res.ok) {
      setNewCat({ name: '', slug: '', icon: '🎬', description: '', featured: false })
      fetchCategories()
    }
    setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure? This may affect prompts in this category.')) return
    const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' })
    if (res.ok) fetchCategories()
  }

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-10 bg-zinc-800 rounded-xl w-full" /></div>

  return (
    <div className="space-y-8">
      <form onSubmit={handleAdd} className="bg-zinc-950 p-6 rounded-3xl border border-zinc-800 space-y-4">
        <h3 className="text-white font-bold mb-2">Add New Category</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <input 
            type="text" 
            placeholder="Name (e.g. Education)" 
            value={newCat.name}
            onChange={e => setNewCat({ ...newCat, name: e.target.value, slug: e.target.value.toLowerCase().replace(/ /g, '-') })}
            className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm"
          />
          <input 
            type="text" 
            placeholder="Slug" 
            value={newCat.slug}
            readOnly
            className="px-4 py-2 bg-zinc-900/50 border border-zinc-800 rounded-xl text-sm text-zinc-500"
          />
          <input 
            type="text" 
            placeholder="Icon (Emoji)" 
            value={newCat.icon}
            onChange={e => setNewCat({ ...newCat, icon: e.target.value })}
            className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm"
          />
          <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl">
            <input 
              type="checkbox" 
              id="cat-featured"
              checked={newCat.featured}
              onChange={e => setNewCat({ ...newCat, featured: e.target.checked })}
              className="accent-indigo-500"
            />
            <label htmlFor="cat-featured" className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Featured</label>
          </div>
          <button 
            type="submit" 
            disabled={saving}
            className="bg-white text-black font-bold rounded-xl text-sm hover:bg-zinc-200"
          >
            {saving ? 'Adding...' : 'Add Category'}
          </button>
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map(cat => (
          <div key={cat.id} className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{cat.icon}</span>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-white font-bold text-sm">{cat.name}</p>
                  {cat.featured && <span className="text-[8px] bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded-full border border-indigo-500/20 font-black uppercase">Featured</span>}
                </div>
                <p className="text-xs text-zinc-500">/{cat.slug}</p>
              </div>
            </div>
            <button 
              onClick={() => handleDelete(cat.id)}
              className="text-zinc-600 hover:text-red-500 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
