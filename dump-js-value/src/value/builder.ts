import Base from "./base";
import {ObjectValue} from "./object";
import {SingletonValue} from "./singleton";
import {PrimitiveNumberValue} from "./number";
import {PrimitiveStringValue} from "./string";
import {SymbolValue} from "./symbol";
import {FunctionValue} from "./function";
import {BigIntValue} from "./bigint";

export const builder = (rawValue: unknown): Base<unknown> => {
  // console.log({ builder: rawValue, caller: new Error('x').stack })
  // throw 'x'

  if (rawValue === undefined) return new SingletonValue(rawValue)
  if (rawValue === null) return new SingletonValue(rawValue)
  if (typeof rawValue === 'boolean') return new SingletonValue(rawValue)

  if (typeof rawValue === 'bigint') return new BigIntValue(rawValue)
  if (typeof rawValue === 'function') return new FunctionValue(rawValue)
  if (typeof rawValue === 'number') return new PrimitiveNumberValue(rawValue)
  if (typeof rawValue === 'string') return new PrimitiveStringValue(rawValue)
  if (typeof rawValue === 'symbol') return new SymbolValue(rawValue)
  if (typeof rawValue === 'object') return new ObjectValue(rawValue)

  throw new Error(`value of unknown type '${typeof rawValue}'`)
}
