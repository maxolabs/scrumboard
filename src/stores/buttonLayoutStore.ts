import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { DEFAULT_BUTTONS } from '@/lib/constants'
import type { ButtonConfig, ButtonColor } from '@/lib/types'

interface ButtonLayoutState {
  buttons: ButtonConfig[]
  loading: boolean
  loaded: boolean
  load: () => Promise<void>
  save: () => Promise<void>
  moveButton: (fromIndex: number, toIndex: number) => void
  toggleButton: (id: string) => void
  resetToDefaults: () => void
  addCustomButton: (label: string, type: 'custom_note' | 'custom_team', color?: ButtonColor) => void
  updateCustomButtonColor: (id: string, color: ButtonColor) => void
  removeButton: (id: string) => void
}

function normalizeButtons(layout?: ButtonConfig[]) {
  const source = layout?.length ? layout : DEFAULT_BUTTONS
  const merged = source.map(btn => {
    const defaultBtn = DEFAULT_BUTTONS.find(def => def.id === btn.id)
    const isCustom = btn.type === 'custom_note' || btn.type === 'custom_team'
    const shouldUseDefaultSemanticColor = !isCustom && (!btn.color || btn.color === 'default')

    return {
      ...defaultBtn,
      ...btn,
      color: shouldUseDefaultSemanticColor
        ? (defaultBtn?.color ?? 'default')
        : (btn.color ?? defaultBtn?.color ?? 'default'),
      visible: btn.visible ?? true,
    }
  })

  const missingDefaults = DEFAULT_BUTTONS.filter(def => !merged.some(btn => btn.id === def.id))
  return [...merged, ...missingDefaults.map(btn => ({ ...btn }))]
}

export const useButtonLayoutStore = create<ButtonLayoutState>((set, get) => ({
  buttons: DEFAULT_BUTTONS,
  loading: false,
  loaded: false,

  load: async () => {
    if (get().loaded || get().loading) return
    set({ loading: true })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      set({ loading: false })
      return
    }

    const { data } = await supabase
      .from('button_layouts')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_default', true)
      .single()

    if (data?.layout) {
      const buttons = normalizeButtons(data.layout as ButtonConfig[])
      set({ buttons, loading: false, loaded: true })
    } else {
      const buttons = DEFAULT_BUTTONS.map(btn => ({ ...btn }))
      await supabase.from('button_layouts').insert({
        user_id: user.id,
        name: 'Default',
        layout: buttons,
        is_default: true,
      })
      set({ buttons, loading: false, loaded: true })
    }
  },

  save: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { buttons } = get()
    await supabase
      .from('button_layouts')
      .upsert(
        {
          user_id: user.id,
          name: 'Default',
          layout: buttons as unknown as Record<string, unknown>[],
          is_default: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,is_default' },
      )
  },

  moveButton: (fromIndex, toIndex) => {
    const buttons = [...get().buttons]
    const [moved] = buttons.splice(fromIndex, 1)
    buttons.splice(toIndex, 0, moved)
    set({ buttons })
    get().save()
  },

  toggleButton: (id) => {
    const buttons = get().buttons.map(btn =>
      btn.id === id ? { ...btn, visible: !btn.visible } : btn,
    )
    set({ buttons })
    get().save()
  },

  resetToDefaults: () => {
    set({ buttons: DEFAULT_BUTTONS.map(btn => ({ ...btn })) })
    get().save()
  },

  addCustomButton: (label, type, color = 'default') => {
    const id = crypto.randomUUID()
    const newBtn: ButtonConfig = { id, category: id, label, type, color, visible: true }
    set({ buttons: [...get().buttons, newBtn] })
    get().save()
  },

  updateCustomButtonColor: (id, color) => {
    const buttons = get().buttons.map(btn =>
      btn.id === id && (btn.type === 'custom_note' || btn.type === 'custom_team')
        ? { ...btn, color }
        : btn,
    )
    set({ buttons })
    get().save()
  },

  removeButton: (id) => {
    set({ buttons: get().buttons.filter(btn => btn.id !== id) })
    get().save()
  },
}))
