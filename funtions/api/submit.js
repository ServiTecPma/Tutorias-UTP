export async function onRequestPost(context){
  try{
    const formData = await context.request.formData()
    const nombre = formData.get("nombre")
    const telefono = formData.get("telefono")
    const correo = formData.get("correo")
    const mensaje = formData.get("mensaje")
    /* validar campos */
    if(!nombre || !telefono || !correo){
      return new Response(
        JSON.stringify({
          ok:false,
          error:"Campos obligatorios faltantes"
        }),
        {
          status:400,
          headers:{ "Content-Type":"application/json" }
        }
      )
    }
    const fecha = new Date().toISOString()
    const ip = context.request.headers.get("CF-Connecting-IP") || "unknown"
    const country = context.request.headers.get("CF-IPCountry") || "unknown"
    /* guardar en D1 */
    const result = await context.env.DB.prepare(
      `INSERT INTO solicitudes
       (nombre,telefono,correo,mensaje,fecha,ip)
       VALUES (?1,?2,?3,?4,?5,?6)`
    )
    .bind(nombre,telefono,correo,mensaje,fecha,ip)
    .run()
    const id = result.meta.last_row_id
    /* ENVIAR EMAIL (RESEND) */
    const apiKey = context.env.RESEND_API_KEY
    const html = `
    <div style="font-family:Arial,sans-serif;background:#f4f4f4;padding:20px">
    <div style="
    max-width:600px;
    margin:auto;
    background:#ffffff;
    border-radius:10px;
    overflow:hidden;
    box-shadow:0 0 10px rgba(0,0,0,0.1);
    ">
    <div style="
    background:#0b3d91;
    color:white;
    padding:15px;
    text-align:center;
    ">
    <img src="https://servitec-pma.pages.dev/assets/img/ServiTec.png"
    style="height:50px"><br>
    <h2>ServiTec Pma</h2>
    Nueva solicitud #${id}
    </div>
    <div style="padding:20px">
    <b>Nombre:</b> ${nombre}<br><br>
    <b>Teléfono:</b> ${telefono}<br><br>
    <b>Correo:</b> ${correo}<br><br>
    <b>Mensaje:</b><br>
    ${mensaje}<br><br>
    <b>Fecha:</b> ${fecha}<br>
    <b>IP:</b> ${ip}<br>
    <b>País:</b> ${country}<br><br>
    <a href="https://wa.me/${telefono}"
    style="
    display:inline-block;
    padding:10px 15px;
    background:#25D366;
    color:white;
    text-decoration:none;
    border-radius:5px;
    font-weight:bold;
    ">
    Abrir WhatsApp
    </a>
    </div>
    <div style="
    background:#eee;
    padding:10px;
    text-align:center;
    font-size:12px;
    color:#555;
    ">
    Sistema automático ServiTec
    </div>
    </div>
    </div>
    `
      await fetch("https://api.resend.com/emails",{
        method:"POST",
        headers:{
          "Authorization":`Bearer ${apiKey}`,
          "Content-Type":"application/json"
        },body:JSON.stringify({
          from:"onboarding@resend.dev",
          to:["didiersanto686@gmail.com"],
          subject:`Nueva solicitud #${id} | ServiTec`,
          html:html
        })
      }
    )
    return new Response(
      JSON.stringify({
        ok:true,
        message:"Solicitud guardada"
      }),
      {
        headers:{ "Content-Type":"application/json" }
      }
    )
  }catch(error){
    console.error(error)
    return new Response(
      JSON.stringify({
        ok:false,
        error:"Error interno"
      }),
      {
        status:500,
        headers:{ "Content-Type":"application/json" }
      }
    )
  }
}
