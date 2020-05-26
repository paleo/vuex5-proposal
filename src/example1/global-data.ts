import { createStore, Flatten } from "../composition-store"
import { categoryBuilder, CategoryPayload } from "./category"

export const globalData = createStore(() => {
  const categories = new Map([
    {
      id: "1",
      name: "Flowers"
    },
    {
      id: "2",
      name: "Animals"
    },
  ].map(item => ([item.id, categoryBuilder(item)])))

  const mutations = {
    ADD_CATEGORY(payload: CategoryPayload) {
      categories.set(payload.id, categoryBuilder(payload))
    },
  }

  return {
    mutations,
    references: { categories },
  }
})

export type GlobalDataStore = Flatten<typeof globalData>

