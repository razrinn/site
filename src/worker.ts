export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    if (url.pathname.startsWith('/giscus')) {
      const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }

      if (request.method === 'OPTIONS') {
        return new Response(null, {
          headers: corsHeaders,
        })
      }

      if (request.method === 'GET') {
        const response = await env.ASSETS.fetch(request)
        const newHeaders = new Headers(response.headers)
        Object.entries(corsHeaders).forEach(([key, value]) => {
          newHeaders.set(key, value)
        })
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: newHeaders,
        })
      }
    }

    return new Response(null, { status: 404 })
  },
} satisfies ExportedHandler<Env>
