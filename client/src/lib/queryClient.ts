import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0, // Always consider data stale
      gcTime: 0, // Don't cache queries
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Default fetcher function for react-query
export const apiRequest = async (url: string, options?: RequestInit) => {
  console.log("API Request:", url, options);
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  console.log("API Response:", response.status, response.statusText);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error("API Error Response:", errorText);
    throw new Error(`Request failed: ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  console.log("API Response Data:", data);
  return data;
};