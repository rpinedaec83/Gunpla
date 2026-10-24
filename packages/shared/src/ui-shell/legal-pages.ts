/**
 * Legal Pages (Privacy Policy & Terms of Service)
 * Fully compliant with Google OAuth 2.0 / OIDC verification standards.
 */

export function renderPrivacyPolicy(tenantName: string, domain: string, contactEmail: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Política de Privacidad — ${tenantName}</title>
  <style>
    :root {
      --bg: #080c14;
      --card: #111827;
      --border: rgba(255, 255, 255, 0.1);
      --text: #e2e8f0;
      --muted: #94a3b8;
      --primary: #ef4444;
      --accent: #06b6d4;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      padding: 2rem 1rem;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 2.5rem;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    }
    .back-link {
      display: inline-block;
      margin-bottom: 1.5rem;
      color: var(--accent);
      text-decoration: none;
      font-weight: 600;
      font-size: 0.9rem;
    }
    h1 { font-size: 2rem; margin-bottom: 0.5rem; color: #fff; }
    .updated { font-size: 0.85rem; color: var(--muted); margin-bottom: 2rem; }
    h2 { font-size: 1.25rem; margin-top: 1.8rem; margin-bottom: 0.75rem; color: #fff; border-bottom: 1px solid var(--border); padding-bottom: 0.4rem; }
    p, ul { margin-bottom: 1rem; font-size: 0.95rem; color: #cbd5e1; }
    ul { padding-left: 1.5rem; }
    li { margin-bottom: 0.5rem; }
    a { color: var(--accent); }
    .footer { margin-top: 2.5rem; padding-top: 1.5rem; border-top: 1px solid var(--border); font-size: 0.85rem; color: var(--muted); text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <a href="/" class="back-link">← Volver a ${tenantName}</a>
    <h1>Política de Privacidad</h1>
    <div class="updated">Última actualización: 24 de Octubre de 2026</div>

    <p>En <strong>${tenantName}</strong> (accesible desde <a href="https://${domain}">https://${domain}</a>), una de nuestras prioridades fundamentales es la privacidad de nuestros visitantes y modelistas. Este documento detalla los tipos de información que recopilamos, cómo la usamos y las medidas implementadas para protegerla.</p>

    <h2>1. Información que Recopilamos</h2>
    <p>Para proporcionar las herramientas de gestión de Stash, Workbench, bitácoras de armado y participación comunitaria, recopilamos:</p>
    <ul>
      <li><strong>Datos de Autenticación con Google (Google Sign-In / OAuth 2.0):</strong> Cuando decides iniciar sesión a través de Google, solicitamos acceso a tu perfil básico (nombre, correo electrónico verificado y fotografía de perfil pública). No accedemos a tus contraseñas de Google, contactos, archivos de Drive ni correos privados.</li>
      <li><strong>Datos de Perfil de Modelista:</strong> Nombre público o pseudónimo, biografía, enlaces a redes sociales y preferencias de escalas y categorías.</li>
      <li><strong>Contenido Generado por el Usuario:</strong> Información de tus kits en Stash, recetas de pinturas, bitácoras de armado y fotografías subidas a la plataforma.</li>
    </ul>

    <h2>2. Cómo Usamos tu Información</h2>
    <p>Utilizamos la información recopilada para:</p>
    <ul>
      <li>Autenticar y proteger el acceso a tu cuenta personal.</li>
      <li>Sincronizar tus bitácoras de armado, fotos de proyectos y estado de kits.</li>
      <li>Vincular automáticamente tus credenciales entre nuestros portales asociados (Gunpla Collector y PlamoScale).</li>
      <li>Enviar notificaciones esenciales de servicio y confirmaciones de registro.</li>
      <li>Mantener la seguridad, integridad y prevención de abuso en los concursos comunitarios y votaciones.</li>
    </ul>

    <h2>3. Divulgación y Compartición de Datos</h2>
    <p><strong>${tenantName} nunca vende, alquila ni comercializa tus datos personales a terceros.</strong> Tus datos solo son procesados por nuestra infraestructura interna de base de datos segura y los proveedores de infraestructura esenciales (servicios en la nube y autenticación de Google) bajo estrictos estándares de confidencialidad.</p>

    <h2>4. Seguridad y Retención de Datos</h2>
    <p>Implementamos cifrado en tránsito mediante HTTPS/TLS, almacenamiento seguro en bases de datos PostgreSQL con políticas de acceso restringido y tokens JWT firmados criptográficamente para las sesiones.</p>

    <h2>5. Tus Derechos de Privacidad</h2>
    <p>Tienes el derecho en cualquier momento de acceder, corregir, exportar o solicitar la eliminación total de tu cuenta y los datos asociados a tu perfil. Para ejercer cualquiera de estos derechos, contáctanos directamente a <a href="mailto:${contactEmail}">${contactEmail}</a>.</p>

    <h2>6. Contacto</h2>
    <p>Si tienes preguntas o inquietudes sobre esta Política de Privacidad, puedes escribirnos a:</p>
    <p><strong>Correo electrónico:</strong> <a href="mailto:${contactEmail}">${contactEmail}</a><br>
    <strong>Plataforma:</strong> ${tenantName} (<a href="https://${domain}">https://${domain}</a>)</p>

    <div class="footer">
      © 2026 ${tenantName}. Todos los derechos reservados.
    </div>
  </div>
</body>
</html>`;
}

export function renderTermsOfService(tenantName: string, domain: string, contactEmail: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Condiciones del Servicio — ${tenantName}</title>
  <style>
    :root {
      --bg: #080c14;
      --card: #111827;
      --border: rgba(255, 255, 255, 0.1);
      --text: #e2e8f0;
      --muted: #94a3b8;
      --primary: #ef4444;
      --accent: #06b6d4;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      padding: 2rem 1rem;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 2.5rem;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    }
    .back-link {
      display: inline-block;
      margin-bottom: 1.5rem;
      color: var(--accent);
      text-decoration: none;
      font-weight: 600;
      font-size: 0.9rem;
    }
    h1 { font-size: 2rem; margin-bottom: 0.5rem; color: #fff; }
    .updated { font-size: 0.85rem; color: var(--muted); margin-bottom: 2rem; }
    h2 { font-size: 1.25rem; margin-top: 1.8rem; margin-bottom: 0.75rem; color: #fff; border-bottom: 1px solid var(--border); padding-bottom: 0.4rem; }
    p, ul { margin-bottom: 1rem; font-size: 0.95rem; color: #cbd5e1; }
    ul { padding-left: 1.5rem; }
    li { margin-bottom: 0.5rem; }
    a { color: var(--accent); }
    .footer { margin-top: 2.5rem; padding-top: 1.5rem; border-top: 1px solid var(--border); font-size: 0.85rem; color: var(--muted); text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <a href="/" class="back-link">← Volver a ${tenantName}</a>
    <h1>Condiciones del Servicio</h1>
    <div class="updated">Última actualización: 24 de Octubre de 2026</div>

    <p>Bienvenido a <strong>${tenantName}</strong>. Al acceder o utilizar nuestra plataforma web ubicada en <a href="https://${domain}">https://${domain}</a>, aceptas cumplir y estar sujeto a las siguientes condiciones de uso.</p>

    <h2>1. Uso de la Plataforma</h2>
    <p>${tenantName} es un espacio digital diseñado para la comunidad de modelismo a escala y Gunpla, ofreciendo catálogo de kits, gestión de inventario personal (Stash), bitácoras de armado y exhibición de obras.</p>
    <ul>
      <li>Debes ser mayor de 13 años para registrar una cuenta.</li>
      <li>Eres responsable de mantener la seguridad y confidencialidad de tu cuenta y sesión.</li>
      <li>Te comprometes a utilizar la plataforma con fines lícitos y respetuosos con otros miembros de la comunidad.</li>
    </ul>

    <h2>2. Propiedad Intelectual y Contenido del Usuario</h2>
    <p>Conservas todos los derechos de autor sobre las fotografías, descripciones y bitácoras que subas a ${tenantName}. Al publicar contenido, otorgas a ${tenantName} una licencia no exclusiva para mostrar tus proyectos dentro de la galería pública y funciones de la comunidad.</p>
    <p>Los nombres, logotipos y referencias a marcas comerciales (como Gundam, Bandai, Tamiya, Mr. Hobby) pertenecen a sus respectivos propietarios y se utilizan únicamente con fines ilustrativos y de catalogación para el hobby.</p>

    <h2>3. Reglas de Conducta Comunitaria</h2>
    <p>Queda estrictamente prohibido:</p>
    <ul>
      <li>Subir material que infrinja derechos de autor de terceros o que sea ofensivo, difamatorio o inapropiado.</li>
      <li>Intentar vulnerar la seguridad, realizar ingeniería inversa o interrumpir el funcionamiento de los servicios o APIs.</li>
      <li>Crear cuentas falsas o manipular los sistemas de votación comunitaria en los concursos.</li>
    </ul>

    <h2>4. Modificación o Cancelación del Servicio</h2>
    <p>Nos reservamos el derecho de suspender o cancelar cuentas que violen estas condiciones, así como actualizar las características de la plataforma para mejorar la experiencia de los modelistas.</p>

    <h2>5. Limitación de Responsabilidad</h2>
    <p>${tenantName} se proporciona "tal cual" y "según disponibilidad". No nos hacemos responsables de daños indirectos derivados del uso de la plataforma o la pérdida temporal de acceso.</p>

    <h2>6. Contacto</h2>
    <p>Para cualquier consulta legal o aclaración sobre estas Condiciones del Servicio, comunícate con nosotros a:</p>
    <p><strong>Correo electrónico:</strong> <a href="mailto:${contactEmail}">${contactEmail}</a></p>

    <div class="footer">
      © 2026 ${tenantName}. Todos los derechos reservados.
    </div>
  </div>
</body>
</html>`;
}
