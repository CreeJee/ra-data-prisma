import { IntrospectionType } from "graphql";
import camelCase from "lodash-es/camelCase";
import pluralize from "pluralize";
import { Options } from "ra-data-graphql";
import {
  CREATE,
  DELETE,
  DELETE_MANY,
  GET_LIST,
  GET_MANY,
  GET_MANY_REFERENCE,
  GET_ONE,
  UPDATE,
  UPDATE_MANY,
} from "react-admin";
import { OurOptions, QueryDialect } from "../types";
import { makePrefixedFullName } from "./makePrefixedFullName";

export const makeIntrospectionOptions = (
  options: OurOptions,
): Options["introspection"] => {
  const prefix = (s: string) => makePrefixedFullName(s, options?.aliasPrefix);

  const mutationOperationNames: Record<QueryDialect, object> = {
    "nexus-prisma": {
      [CREATE]: (resource: IntrospectionType) =>
        prefix(`createOne${resource.name}`),
      [UPDATE]: (resource: IntrospectionType) =>
        prefix(`updateOne${resource.name}`),
      [DELETE]: (resource: IntrospectionType) =>
        prefix(`deleteOne${resource.name}`),
    },
    typegraphql: {
      [CREATE]: (resource: IntrospectionType) =>
        prefix(`create${resource.name}`),
      [UPDATE]: (resource: IntrospectionType) =>
        prefix(`update${resource.name}`),
      [DELETE]: (resource: IntrospectionType) =>
        prefix(`delete${resource.name}`),
    },
  };

  return {
    operationNames: {
      [GET_LIST]: (resource: IntrospectionType) =>
        prefix(`${pluralize(camelCase(resource.name))}`),
      [GET_ONE]: (resource: IntrospectionType) =>
        prefix(`${camelCase(resource.name)}`),
      [GET_MANY]: (resource: IntrospectionType) =>
        prefix(`${pluralize(camelCase(resource.name))}`),
      [GET_MANY_REFERENCE]: (resource: IntrospectionType) =>
        prefix(`${pluralize(camelCase(resource.name))}`),
      [UPDATE_MANY]: (resource: IntrospectionType) =>
        prefix(`updateMany${resource.name}`),
      [DELETE_MANY]: (resource: IntrospectionType) =>
        prefix(`deleteMany${resource.name}`),
      ...mutationOperationNames[options.queryDialect],
    },
    exclude: undefined,
    include: undefined,
    ...options.introspection,
  };
};
