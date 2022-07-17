import merge from "lodash-es/merge";
import buildRaGraphqlDataProvider from "ra-data-graphql";
import {
  DataProvider,
  DELETE,
  DELETE_MANY,
  LegacyDataProvider,
  UPDATE,
  UPDATE_MANY,
} from "react-admin";
import { buildQueryFactory } from "./buildQuery";
import { Options, OurOptions } from "./types";

import { makeIntrospectionOptions } from "./utils/makeIntrospectionOptions";

export const defaultOurOptions: OurOptions = {
  queryDialect: "nexus-prisma",
};

export const defaultOptions: Options = {
  clientOptions: { uri: "/graphql" },
  ...defaultOurOptions,
};

const buildDataProvider = (options: Options): Promise<DataProvider> => {
  const fullOptions = merge({}, defaultOptions, options);
  return buildRaGraphqlDataProvider(
    merge(
      {},
      {
        buildQuery: buildQueryFactory,
        introspection: makeIntrospectionOptions(fullOptions),
      },
      fullOptions,
    ),
  );
};

export default buildDataProvider;
