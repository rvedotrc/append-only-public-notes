import Value from "./value/base";

export class Connection {
  public readonly kind: string
  private readonly _to: WeakRef<Value<unknown>>

  constructor(kind: string, to: Value<unknown>) {
    this.kind = kind
    this._to = new WeakRef(to)
  }

  public get to(): Value<unknown> {
    const to = this._to.deref() as Value<unknown> | undefined // Why the need to recast?
    if (to === undefined) throw new Error('Weak reference is broken')
    return to;
  }
}
