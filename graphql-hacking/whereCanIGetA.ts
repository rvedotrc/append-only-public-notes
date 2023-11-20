import * as fs from "fs";
import {ConstValueNode, FieldDefinitionNode, InputValueDefinitionNode, parse, TypeNode} from "graphql";

const schemaFile = '/Users/revans/Downloads/schema.docs.graphql'

const text = fs.readFileSync(schemaFile)
const schema = parse(text.toString())

const typeNodeToString = (t: TypeNode): string => {
  if (t.kind === 'NamedType') {
    // return `<TypeNode ${t.kind} ${t.name.value}>`
    return t.name.value
  } else if (t.kind === 'NonNullType') {
    // return `<TypeNode ${t.kind} of ${typeNodeToString(t.type)}>`
    return `${typeNodeToString(t.type)}!`
  } else if (t.kind === 'ListType') {
    // return `<TypeNode ${t.kind}>`
    return `[${typeNodeToString(t.type)}]`
  } else {
    throw 'never'
  }
}

const constValueToString = (v: ConstValueNode): string => {
  // return `(${v.name})`

  if (v.kind === 'IntValue') {
    return v.value
  } else if (v.kind === 'FloatValue') {
    return v.value
  } else if (v.kind === 'StringValue') {
    return JSON.stringify(v.value)
  } else if (v.kind === 'BooleanValue') {
    return v.value.toString()
  } else if (v.kind === 'NullValue') {
    return 'null'
  } else if (v.kind === 'EnumValue') {
    return v.value
  } else if (v.kind === 'ListValue') {
    return `[${v.values.map(constValueToString).join(", ")}]`
  } else if (v.kind === 'ObjectValue') {
    return `{${v.fields.map(f => `${f.name.value}: ${constValueToString(f.value)}`).join(", ")}}`
  } else {
    throw 'never'
  }
}

const inputValueDefinitionToString = (d: InputValueDefinitionNode): string => {
  const equalsDefault = d.defaultValue !== undefined
    ? ` = ${constValueToString(d.defaultValue)}`
    : ''
  return `${d.name.value}: ${typeNodeToString(d.type)}${equalsDefault}`
}

const inputValueDefinitionsToString = (d: readonly InputValueDefinitionNode[] | undefined): string => {
  if (d === undefined) return ''
  if (d.length === 0) return ''

  return `(${
    d.map(inputValueDefinitionToString).join(", ")
  })`
}

const fieldDefinitionToString = (f: FieldDefinitionNode): string => {
  // return `<Field ${f.name.value} type=${typeNodeToString(f.type)}>`
  return `${f.name.value}${inputValueDefinitionsToString(f.arguments)}: ${typeNodeToString(f.type)}`
}

const fieldDefinitionsToString = (d: readonly FieldDefinitionNode[] | undefined): string => {
  if (d === undefined) return ''
  if (d.length === 0) return ''

  return `{${
    d.map(fieldDefinitionToString).join(", ")
  }}`
}

for (const x of schema.definitions) {
  if (x.kind === 'ObjectTypeDefinition') {
    console.log(`<ObjectTypeDefinition n=${x.name.value} {\n  ${x.fields?.map(fieldDefinitionToString).join('\n  ')}\n}>`)
    // TODO: directives, description, interfaces
  } else if (x.kind === 'UnionTypeDefinition') {
    console.log(`<UnionTypeDefinition ${x.name.value} = ${x.types?.map(typeNodeToString).join(' | ')}>`)
    // TODO: directives, description
  } else if (x.kind === 'InterfaceTypeDefinition') {
    console.log(`<InterfaceTypeDefinition ${x.name.value} = ${fieldDefinitionsToString(x.fields)}>`)
    // TODO: directives, description, interfaces
  } else if (x.kind === 'DirectiveDefinition') {
    // meh
  } else if (x.kind === 'ScalarTypeDefinition') {
    console.log(`<ScalarTypeDefinition ${x.name.value}>`)
  } else if (x.kind === 'InputObjectTypeDefinition') {
    console.log(`<InputObjectTypeDefinition n=${x.name.value} {\n  ${inputValueDefinitionsToString(x.fields)}\n}>`)
  } else if (x.kind === 'EnumTypeDefinition') {
    console.log(`<EnumTypeDefinition ${x.name.value} = ${x.values?.map(v => v.name.value).join(' | ')}>`)
  } else {
    throw `? unknown kind ${x.kind}`
  }
}
