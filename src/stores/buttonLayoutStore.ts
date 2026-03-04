import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { DEFAULT_BUTTONS } from '@/lib/constants'
import type { ButtonConfig } from '@/lib/types'

interface ButtonLayoutState {
  buttons: ButtonConfig[]
  loading: boolean
  loaded: boolean
  load: () => Promise<void>
  save: () => Promise<void>
  moveButton: (fromIndex: number, toIndex: number) => void
  toggleButton: (id: string) => void
  resetToDefaults: () => void
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
      set({ buttons: data.layout as ButtonConfig[], loading: false, loaded: true })
    } else {
      // Seed default layout for this user
      await supabase.from('button_layouts').insert({
        user_id: user.id,
        name: 'Default',
        layout: DEFAULT_BUTTONS,
        is_default: true,
      })
      set({ buttons: [...DEFAULT_BUTTONS], loading: false, loaded: true })
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
}))
