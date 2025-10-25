export default {
  fetch(request) {
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
    }

    return new Response(null, { status: 404 })
  },
} satisfies ExportedHandler<Env>
