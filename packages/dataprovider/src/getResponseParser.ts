import { TypeKind, IntrospectionObjectType } from "graphql";
import { GET_LIST, GET_MANY, GET_MANY_REFERENCE } from "react-admin";
import getFinalType from "./utils/getFinalType";
import { IntrospectionResult, Resource } from "./constants/interfaces";
import { FetchType, QueryDialect } from "./types";

const sanitizeResource =
  (
    introspectionResults: IntrospectionResult,
    resource: Resource,
    shouldSanitizeLinkedResources: boolean = true,
  ) =>
  (data: { [key: string]: any } = {}): any => {
    return Object.keys(data).reduce((acc, key) => {
      if (key.startsWith("_")) {
        return acc;
      }

      const field = (resource.type as IntrospectionObjectType).fields.find(
        (f: any) => f.name === key,
      )!;
      const type = getFinalType(field.type);

      if (type.kind !== TypeKind.OBJECT) {
        return { ...acc, [field.name]: data[field.name] };
      }

      const linkedResource = introspectionResults.resources.find(
        (r) => r.type.name === type.name,
      );

      // FIXME: We might have to handle linked types which are not resources but will have to be careful about endless circular dependencies
      if (linkedResource && shouldSanitizeLinkedResources) {
        const linkedResourceData = data[field.name];
        if (Array.isArray(linkedResourceData)) {
          return {
            ...acc,
            [field.name]: linkedResourceData.map((obj) => ({ id: obj.id })),
          };
        }
        // IDK why is need introspectionResults should be skip property
        return {
          ...acc,
          [field.name]: {
            id: linkedResourceData?.id,
          },
        };
      }

      return { ...acc, [field.name]: data[field.name] };
    }, {});
  };

export default (
    introspectionResults: IntrospectionResult,
    {
      shouldSanitizeLinkedResources = true,
      queryDialect,
    }: { shouldSanitizeLinkedResources?: boolean; queryDialect: QueryDialect },
  ) =>
  (aorFetchType: FetchType, resource: Resource) =>
  (response: { [key: string]: any }) => {
    const sanitize = sanitizeResource(
      introspectionResults,
      resource,
      shouldSanitizeLinkedResources,
    );
    const data = response.data;

    const getTotal = () => {
      switch (queryDialect) {
        case "nexus-prisma":
          return response.data.total;
        case "typegraphql":
          return (response.data.total._count ?? response.data.total.count)._all;
      }
    };

    if (
      aorFetchType === GET_LIST ||
      aorFetchType === GET_MANY ||
      aorFetchType === GET_MANY_REFERENCE
    ) {
      return {
        data: response.data.items.map(sanitize),
        total: getTotal(),
      };
    }

    return { data: sanitize(data.data) };
  };
