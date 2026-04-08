export async function onRequestPost(context){
try{
const body =
await context.request.json()
const id = body.id
const estado = body.estado
await context.env.DB.prepare(
`UPDATE solicitudes
SET estado=?1
WHERE id=?2`
)
.bind(estado,id)
.run()
return new Response(
JSON.stringify({ ok:true })
)
}catch(err){
return new Response(
JSON.stringify({ ok:false }),
{ status:500 }
)
}
}
