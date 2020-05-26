import { createStoreBuilder, Flatten } from "../composition-store"
import { CategoryStore } from "./category"
import { globalData } from "./global-data"

export interface PostPayload {
  id: string
  title: string
  body?: string
  categoryId?: string
}

const postBuilder = createStoreBuilder((payload: PostPayload) => {
  const innerState = payload

  const references = {
    category: payload.categoryId !== undefined
      ? globalData.categories.get(payload.categoryId)
      : undefined
  }

  return {
    innerState,
    getters: {
      fullTitle: () => `${innerState.title} - ${references.category?.state.name}`
    },
    mutations: {
      SET_CATEGORY(category: CategoryStore) {
        innerState.categoryId = category.state.id
        references.category = category
      },
      SET_BODY(body: string) {
        payload.body = body
      },
    },
    references
  }
})

export type PostStore = Flatten<ReturnType<typeof postBuilder>>

// Actions

export async function savePostBody({ commit, state }: PostStore, body: string) {
  await new Promise(resolve => setTimeout(resolve, 50))
  // await httpSendSomewhere({ id: state.id, body })
  commit.SET_BODY(body)
}

// Some code as example

const post1 = postBuilder({
  id: "1",
  title: "Post #1",
  categoryId: "1",
})

post1.category?.commit.SET_NAME("yop")
