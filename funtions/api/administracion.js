export async function onRequestGet(context){

  try{

    const { results } = await context.env.DB.prepare(
      `SELECT id, nombre, telefono, correo, mensaje, fecha, estado
       FROM solicitudes
       ORDER BY fecha DESC
       LIMIT 100`
    ).all()

    return new Response(JSON.stringify(results),{
      headers:{ "Content-Type":"application/json" }
    })

  }catch(err){

    console.error(err)

    return new Response(JSON.stringify({
      error:"Error consultando base"
    }),{
      status:500
    })

  }

}
