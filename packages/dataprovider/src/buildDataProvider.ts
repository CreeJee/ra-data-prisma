import merge from "lodash-es/merge";
import buildRaGraphqlDataProvider from "ra-data-graphql";
import { DataProvider } from "react-admin";
import { buildQueryFactory } from "./buildQuery";
import { Options, OurOptions } from "./types";

import { makeIntrospectionOptions } from "./utils/makeIntrospectionOptions";

export const defaultOurOptions: OurOptions = {
  queryDialect: "typegraphql",
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
        buildQuery: buildQueryFactory(options),
        introspection: makeIntrospectionOptions(fullOptions),
      },
      fullOptions,
    ),
  );
};

export default buildDataProvider;
