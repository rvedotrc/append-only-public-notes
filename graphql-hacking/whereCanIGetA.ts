import * as fs from "fs";
import {Kind, parse, TypeNode} from "graphql";

const schemaFile = '/Users/revans/Downloads/schema.docs.graphql'

const text = fs.readFileSync(schemaFile)
const schema = parse(text.toString())

const typeContainsA = (f: TypeNode, typeName: string): boolean => {
  if (f.kind === Kind.NAMED_TYPE) {
    return f.name.value === typeName;
  } else if (f.kind === Kind.NON_NULL_TYPE) {
    return typeContainsA(f.type, typeName);
  } else if (f.kind === Kind.LIST_TYPE) {
    return typeContainsA(f.type, typeName);
  }

  throw 'never'
}

const seen = new Set<string>()

const whereCanIFindA = (typeName: string, depth: number, prefix = ''): void => {
  if (typeName === 'Query' || typeName === 'Mutation') {
    console.log(`${prefix}Query`)
    return
  }

  if (seen.has(typeName)) {
    console.log(`${prefix}(already processed ${typeName})}`)
    return
  }

  seen.add(typeName)

  for (const d of schema.definitions) {
    if (d.kind === 'ObjectTypeDefinition') {
      for (const f of (d.fields || [])) {
        if (typeContainsA(f.type, typeName)) {
          console.log(`${prefix}T ${d.name.value} F ${f.name.value} => T ${typeName}`)
          if (depth > 1) whereCanIFindA(d.name.value, depth - 1, prefix + '  ')
        }
      }

      if (d.interfaces?.some(t => t.name.value === typeName)) {
        console.log(`${prefix}T ${d.name.value} implements ${typeName}`)
        if (depth > 1) whereCanIFindA(d.name.value, depth - 1, prefix + '  ')
      }
    }
  }
}

whereCanIFindA(process.argv[2], Number(process.argv[3]))
