"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useState } from "react";

type QueryProviderProps = {
  children: React.ReactNode;
};

export default function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
	  () =>
		  new QueryClient(({
			  defaultOptions: {
				  queries: {
					  staleTime: 1000 * 30,
					  retry: 1,
				  },
			  },
		  })),
  );

  return (
	  <QueryClientProvider client={queryClient}>
		  {children}
	  </QueryClientProvider>
  );
}


