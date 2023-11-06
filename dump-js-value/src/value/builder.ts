import Base from "./base";
import {ObjectValue} from "./object";
import {SingletonValue} from "./singleton";
import {PrimitiveNumberValue} from "./number";
import {PrimitiveStringValue} from "./string";
import {SymbolValue} from "./symbol";
import {FunctionValue} from "./function";
import {BigIntValue} from "./bigint";

export const builder = (v: unknown): Base<unknown> => {
  // throw 'x'

  if (v === undefined) return new SingletonValue(v)
  if (v === null) return new SingletonValue(v)
  if (typeof v === 'boolean') return new SingletonValue(v)

  if (typeof v === 'bigint') return new BigIntValue(v)
  if (typeof v === 'function') return new FunctionValue(v)
  if (typeof v === 'number') return new PrimitiveNumberValue(v)
  if (typeof v === 'string') return new PrimitiveStringValue(v)
  if (typeof v === 'symbol') return new SymbolValue(v)
  if (typeof v === 'object') return new ObjectValue(v)
  throw new Error(`value of unknown type '${typeof v}'`)
}
