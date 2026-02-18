import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

let csrfToken: string | null = null;

async function ensureCsrfToken() {
  if (csrfToken) return csrfToken;
  try {
    const res = await fetch("/api/csrf-token");
    if (res.ok) {
      const data = await res.json();
      csrfToken = data.csrfToken;
    }
  } catch (e) {
    console.error("Failed to fetch CSRF token", e);
  }
  return csrfToken;
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Ensure we have a CSRF token for state-changing requests
  if (method !== "GET" && !csrfToken) {
    await ensureCsrfToken();
  }

  const headers: Record<string, string> = data ? { "Content-Type": "application/json" } : {};
  if (csrfToken) {
    headers["CSRF-Token"] = csrfToken;
  }

  try {
    const res = await fetch(url, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    if (res.status === 403) {
      const text = await res.text();
      if (text.includes("CSRF")) {
        // Token might be invalid, retry once
        csrfToken = null;
        await ensureCsrfToken();
        if (csrfToken) headers["CSRF-Token"] = csrfToken;

        const retryRes = await fetch(url, {
          method,
          headers,
          body: data ? JSON.stringify(data) : undefined,
          credentials: "include",
        });
        await throwIfResNotOk(retryRes);
        return retryRes;
      }
    }

    await throwIfResNotOk(res);
    return res;
  } catch (error: any) {
    console.error("API Request Failed:", error);
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Network Error: Cannot connect to server. Please ensure the backend is running.");
    }
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
    async ({ queryKey }) => {
      const res = await fetch(queryKey.join("/") as string, {
        credentials: "include",
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      return await res.json();
    };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
