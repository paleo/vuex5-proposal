import { createStoreBuilder, Flatten } from "../composition-store";

export interface CategoryPayload {
  id: string
  name: string
}

export const categoryBuilder = createStoreBuilder((payload: CategoryPayload) => {
  const innerState = payload

  const getters = {
    double: () => innerState.name + innerState.name,
  }

  const mutations = {
    SET_NAME(name: string) {
      innerState.name = name
    },
  }

  return {
    innerState,
    getters,
    mutations,
  }
})

export type CategoryStore = Flatten<ReturnType<typeof categoryBuilder>>

// Some code as example

const category1 = categoryBuilder({
  id: "1",
  name: "Flowers"
})

category1.commit.SET_NAME("New name")

// category1.state.name = "Other name" // ERROR: readonly property 'name'
