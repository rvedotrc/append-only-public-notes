import Value from "./value/base";

export class Connection {
  private readonly _to: WeakRef<Value<unknown>>

  constructor(
    public readonly kind: string,
    to: Value<unknown>,
    public readonly propertyName: string | symbol | undefined = undefined
  ) {
    this._to = new WeakRef(to)
  }

  public get to(): Value<unknown> {
    const to = this._to.deref() as Value<unknown> | undefined // Why the need to recast?
    if (to === undefined) throw new Error('Weak reference is broken')
    return to;
  }
}
