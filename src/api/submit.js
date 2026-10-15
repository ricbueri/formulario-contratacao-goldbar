const SUBMIT_URLS = import.meta.env.DEV
  ? ["/api/submit", "http://127.0.0.1:3002/api/submit"]
  : ["/api/submit"];

function shouldTryNextUrl(response, urlIndex) {
  if (urlIndex >= SUBMIT_URLS.length - 1) return false;
  if (response.status === 404 || response.status === 502 || response.status === 503) return true;
  const type = response.headers.get("content-type") || "";
  if (!type.includes("application/json")) return true;
  return false;
}

export async function postFormSubmit(body) {
  let lastNetworkError = null;
  let lastResult = null;

  for (let i = 0; i < SUBMIT_URLS.length; i++) {
    const url = SUBMIT_URLS[i];
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = await response.json().catch(() => ({}));
      if (response.ok) return { response, payload };
      lastResult = { response, payload };
      if (shouldTryNextUrl(response, i)) continue;
      return lastResult;
    } catch (err) {
      lastNetworkError = err;
    }
  }

  if (lastResult) return lastResult;
  throw lastNetworkError || new TypeError("failed to fetch");
}
