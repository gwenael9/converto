import { createClient } from "urql";
import { cacheExchange, fetchExchange } from "@urql/core";
import { multipartFetchExchange } from "@urql/exchange-multipart-fetch";

const GRAPHQL_ENDPOINT = "http://localhost:4000/graphql";

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
