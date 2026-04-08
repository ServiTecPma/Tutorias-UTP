export async function onRequestPost(context){

  const { request, env } = context

  const body = await request.json()
  const password = body.password

  if(password === env.ADMIN_PASSWORD){

    return new Response(JSON.stringify({
      ok:true,
      token:"servitec-admin"
    }),{
      headers:{ "Content-Type":"application/json" }
    })

  }

  return new Response(JSON.stringify({
    ok:false
  }),{status:401})

}
