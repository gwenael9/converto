import { createClient } from "urql";
import { cacheExchange } from "@urql/core";
import { multipartFetchExchange } from "@urql/exchange-multipart-fetch";

const isDevelopment = process.env.NODE_ENV === "development";
const GRAPHQL_ENDPOINT = isDevelopment
  ? "http://localhost:4000/graphql"
  : "/graphql";

export const client = createClient({
  url: GRAPHQL_ENDPOINT,
  requestPolicy: "cache-and-network",
  exchanges: [cacheExchange, multipartFetchExchange],
  fetchOptions: {
    headers: {
      "content-type": "application/json",
      "apollo-require-preflight": "true",
    },
  },
});
