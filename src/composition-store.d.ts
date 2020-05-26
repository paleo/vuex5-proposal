// -- Implementation --

export function createStore<
  F extends () => StoreImplementation
>(builder: F): Store<ReturnType<F>>

export function createStoreBuilder<
  F extends (...args: any[]) => StoreImplementation
>(builder: F): (...args: Parameters<F>) => Store<ReturnType<F>>

export interface StoreImplementation {
  innerState?: object
  getters?: { [name: string]: GetterImplementation }
  mutations?: { [name: string]: MutationImplementation }
  references?: { [name: string]: ReferenceImplementation | undefined }
}

export type GetterImplementation = () => any
export type MutationImplementation = (payload?: any) => void

export type ReferenceImplementation = AnyStore | Array<AnyStore> | Map<any, AnyStore> | Set<AnyStore>

// -- Result --

export type Store<I extends StoreImplementation> = {
  readonly state: State<I>
  readonly commit: Commit<OrEmpty<I["mutations"]>>
  readonly st: CompositionStoreTools<I>
  readonly readonly: ReadonlyStore<I>
} & ToReferences<OrEmpty<I["references"]>>

export type AnyStore = Store<any>

export type ReadonlyStore<I extends StoreImplementation>
  = {
    readonly state: State<I>
  } & ToReadonlyReferences<OrEmpty<I["references"]>>

export type State<
  I extends StoreImplementation
  >
  = Flatten<Readonly<OrEmpty<I["innerState"]>> & ToGetters<OrEmpty<I["getters"]>>>

export type Commit<I extends { [name: string]: MutationImplementation }> = {
  readonly [K in keyof I]: Parameters<I[K]>[0] extends undefined
  ? (() => void)
  : Extract<Parameters<I[K]>[0], undefined> extends never
  ? ((payload: Parameters<I[K]>[0]) => void)
  : ((payload?: Parameters<I[K]>[0]) => void)
}

export type ToReferences<I extends { [name: string]: ReferenceImplementation | undefined }> = {
  readonly [K in keyof I]: I[K] extends Array<AnyStore> ? readonly I[K][number][]
  : I[K] extends Map<any, AnyStore> ? ReadonlyMap<MapKeyTypeOf<I[K]>, MapValueTypeOf<I[K]>>
  : I[K] extends Set<AnyStore> ? ReadonlySet<SetValueTypeOf<I[K]>>
  // : I[K] extends AnyStore ? I[K]
  : Extract<I[K], undefined> extends never ? Extract<I[K], AnyStore>
  : Extract<I[K], AnyStore> | undefined
}

export type ToReadonlyReferences<I extends { [name: string]: ReferenceImplementation | undefined }> = {
  readonly [K in keyof I]: I[K] extends Array<AnyStore> ? readonly I[K][number]["readonly"][]
  : I[K] extends Map<any, AnyStore> ? ReadonlyMap<MapKeyTypeOf<I[K]>, MapValueTypeOf<I[K]>["readonly"]>
  : I[K] extends Set<AnyStore> ? ReadonlySet<SetValueTypeOf<I[K]>["readonly"]>
  // : I[K] extends AnyStore ? I[K]["readonly"]
  : Extract<I[K], undefined> extends never ? Extract<I[K], AnyStore>["readonly"]
  : Extract<I[K], AnyStore>["readonly"] | undefined
}

export type ToGetters<I extends { [name: string]: GetterImplementation }> = {
  readonly [K in keyof I]: ReturnType<I[K]>
}

export interface CompositionStoreTools<
  I extends StoreImplementation,
  M extends { [name: string]: MutationImplementation } = OrEmpty<I["mutations"]>
  > {
  readonly watch: WatchMutation<I, M> & WatchAllMutation<I, M>
}

export type WatchMutation<
  I extends StoreImplementation,
  M extends { [name: string]: MutationImplementation }
  > = {
    [K in keyof M]: (listener: MutationListener<I, M, K & string>) => WatchHandle
  }

export type WatchAllMutation<
  I extends StoreImplementation,
  M extends { [name: string]: MutationImplementation }
  > = {
    (listener: MutationListener<I, M, keyof M & string>): WatchHandle
  }

export interface WatchHandle {
  unwatch(): void
  setSafeResponsible?(type: string, instance: object): void
}

export type MutationListener<
  I extends StoreImplementation,
  M extends { [name: string]: MutationImplementation },
  N extends string
  >
  = (ev: { payload: Parameters<M[N]>[0], store: Store<I>, mutationName: N }) => void

type OrEmpty<T> = T extends {} ? T : {}
type MapKeyTypeOf<T extends Map<any, any>> = T extends Map<infer V, any> ? V : any
type MapValueTypeOf<T extends Map<any, any>> = T extends Map<any, infer V> ? V : any
type SetValueTypeOf<T extends Set<any>> = T extends Set<infer V> ? V : any

export type Flatten<T> =
  T extends Function ? T
  : T extends object ? (
    T extends infer O ? { [K in keyof O]: O[K] }
    : never
  )
  : T
