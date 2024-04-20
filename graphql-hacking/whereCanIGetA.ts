import * as fs from "fs";
import {Kind, parse, TypeNode} from "graphql";

const schemaFile = '/Users/revans/Downloads/schema.docs.graphql'

const text = fs.readFileSync(schemaFile)
const schema = parse(text.toString())

// > schema.definitions.map(d => d.kind).reduce((a, b) => ({...a, [b]: (a[b] || 0) + 1}), {})
// {
//   DirectiveDefinition: 3,
//   InputObjectTypeDefinition: 328,
//   ObjectTypeDefinition: 859,
//   InterfaceTypeDefinition: 45,
//   EnumTypeDefinition: 217,
//   UnionTypeDefinition: 42,
//   ScalarTypeDefinition: 12
// }

// schema.definitions.filter(d => d.kind === 'ScalarTypeDefinition').map((v: any) => ({ name: v.name.value, kind: v.description.value }))

// UnionTypeDefinition => u.name.value, u.description.value, u.types[] (.kind = "NamedType" .name.value)

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

// const seen = new Set<string>()

const whereCanIFindA = (typeName: string, depth: number, prefix = '', seen: Set<string> = new Set()): void => {
  if (typeName === 'Query' || typeName === 'Mutation') {
    console.log(`${prefix} ${typeName} ROOT`)
    return
  }

  if (seen.has(typeName)) {
    console.log(`${prefix} (already processed ${typeName})}`)
    return
  }

  const copyOfSeen = new Set(seen)
  copyOfSeen.add(typeName)

  for (const d of schema.definitions) {
    if (d.kind === 'ObjectTypeDefinition') {
      for (const f of (d.fields || [])) {
        if (typeContainsA(f.type, typeName)) {
          console.log(`${prefix} T ${d.name.value} F ${f.name.value} => T ${typeName}`)
          if (depth > 1) whereCanIFindA(d.name.value, depth - 1, prefix + `.f.${f.name.value}`, copyOfSeen)
        }
      }

      if (d.interfaces?.some(t => t.name.value === typeName)) {
        console.log(`${prefix} T ${d.name.value} implements ${typeName}`)
        if (depth > 1) whereCanIFindA(d.name.value, depth - 1, prefix + `.i.${d}`, copyOfSeen)
      }
    }
  }
}

whereCanIFindA(process.argv[2], Number(process.argv[3]))
