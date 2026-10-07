const RETRY_DELAY_MS = 200;

function requestMethod(input: RequestInfo | URL, init?: RequestInit) {
  if (init?.method) return init.method.toUpperCase();
  if (typeof Request !== 'undefined' && input instanceof Request) return input.method.toUpperCase();
  return 'GET';
}

export async function fetchWithSingleNetworkRetry(input: RequestInfo | URL, init?: RequestInit) {
  try {
    return await fetch(input, init);
  } catch (error) {
    const method = requestMethod(input, init);
    const aborted = init?.signal?.aborted === true;

    if (aborted || (method !== 'GET' && method !== 'HEAD')) {
      throw error;
    }

    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    return fetch(input, init);
  }
}

export function isRetryableAuthNetworkError(error: {
  name?: string;
  status?: number;
}) {
  return error.name === 'AuthRetryableFetchError' || error.status === 0;
}
