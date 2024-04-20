// 'Meh' on cyclic references, for now

export interface ObjectSettings {
  isFrozen: boolean
  isSealed: boolean
  isExtensible: boolean
}

const getTypeOf = (v: unknown) => typeof v

export interface Value {
  typeOf: ReturnType<typeof getTypeOf>
  nameWhateverThatMeans: string
  isWellKnown: boolean
  objectProperties?: ObjectSettings
  // maybe more to add here

  prototypeConnection?: PrototypeConnection
  propertyConnections?: Record<PropertyKey, PropertyConnection>
}

export interface PrototypeConnection {
  from: Value // redundant
  to: Value
}

export type PropertyConnection = {
  propertyKey: PropertyKey // redundant
  from: Value
  value?: Value
  getter?: Value
  setter?: Value
} & Pick<PropertyDescriptor, 'enumerable' | 'configurable' | 'writable'>
