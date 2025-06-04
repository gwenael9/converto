"use client";

import { Provider } from "urql";
import { client } from "../../lib/graphql";

export function GraphQLProvider({ children }: { children: React.ReactNode }) {
  return <Provider value={client}>{children}</Provider>;
}
