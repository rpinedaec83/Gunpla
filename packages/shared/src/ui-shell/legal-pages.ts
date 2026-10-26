/**
 * Legal Pages (Privacy Policy & Terms of Service)
 * Hardened compliance framework according to:
 * - Ley N° 29733 (Ley de Protección de Datos Personales de la República del Perú) y su Reglamento D.S. N° 003-2013-JUS.
 * - Ley N° 29571 (Código de Protección y Defensa del Consumidor de Perú - INDECOPI).
 * - Decreto Legislativo 822 (Ley sobre el Derecho de Autor de Perú).
 * - Estándares Iberoamericanos de Protección de Datos Personales (RIPD) y normativas LATAM (Colombia Ley 1581, México LFPDPPP, Chile Ley 19.628).
 * - Requisitos de Verificación de Marca y OAuth 2.0 de Google.
 */

export function renderPrivacyPolicy(tenantName: string, domain: string, contactEmail: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Política de Privacidad y Tratamiento de Datos Personales — ${tenantName}</title>
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
      line-height: 1.65;
      padding: 2.5rem 1rem;
    }
    .container {
      max-width: 860px;
      margin: 0 auto;
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 3rem 2.5rem;
      box-shadow: 0 12px 40px rgba(0,0,0,0.6);
    }
    .back-link {
      display: inline-block;
      margin-bottom: 1.5rem;
      color: var(--accent);
      text-decoration: none;
      font-weight: 600;
      font-size: 0.9rem;
    }
    .badge {
      display: inline-block;
      padding: 0.25rem 0.65rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      background: rgba(6, 182, 212, 0.15);
      color: var(--accent);
      border: 1px solid rgba(6, 182, 212, 0.3);
      margin-bottom: 1rem;
    }
    h1 { font-size: 2.2rem; margin-bottom: 0.5rem; color: #fff; letter-spacing: -0.02em; }
    .updated { font-size: 0.85rem; color: var(--muted); margin-bottom: 2rem; border-bottom: 1px solid var(--border); padding-bottom: 1rem; }
    h2 { font-size: 1.3rem; margin-top: 2rem; margin-bottom: 0.8rem; color: #fff; border-left: 3px solid var(--accent); padding-left: 0.75rem; }
    h3 { font-size: 1.05rem; margin-top: 1.2rem; margin-bottom: 0.5rem; color: #f1f5f9; }
    p, ul, ol { margin-bottom: 1.1rem; font-size: 0.95rem; color: #cbd5e1; }
    ul, ol { padding-left: 1.6rem; }
    li { margin-bottom: 0.5rem; }
    strong { color: #fff; }
    a { color: var(--accent); text-decoration: underline; }
    .notice-box {
      background: rgba(239, 68, 68, 0.08);
      border: 1px solid rgba(239, 68, 68, 0.25);
      border-radius: 8px;
      padding: 1.25rem;
      margin: 1.5rem 0;
    }
    .notice-box h3 { color: #f87171; margin-top: 0; }
    .footer { margin-top: 3rem; padding-top: 1.5rem; border-top: 1px solid var(--border); font-size: 0.85rem; color: var(--muted); text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <a href="/" class="back-link">← Volver a la página principal</a>
    <div class="badge">Marco Legal Perú & LATAM • Ley N° 29733</div>
    <h1>Política de Privacidad y Protección de Datos Personales</h1>
    <div class="updated">Última actualización y entrada en vigencia: 24 de Octubre de 2026</div>

    <p>La presente <strong>Política de Privacidad</strong> regula el tratamiento de datos personales realizado por la plataforma digital <strong>${tenantName}</strong> (en adelante, "la Plataforma"), accesible a través del nombre de dominio <a href="https://${domain}">https://${domain}</a> y sus subdominios asociados, en estricto cumplimiento con la <strong>Ley N° 29733 de la República del Perú (Ley de Protección de Datos Personales)</strong>, su Reglamento aprobado mediante <strong>Decreto Supremo N° 003-2013-JUS</strong>, y los estándares de protección de datos personales vigentes en Latinoamérica.</p>

    <div class="notice-box">
      <h3>Declaración de Consentimiento Libre, Previo, Expreso e Informado</h3>
      <p style="margin-bottom:0;">Al registrar una cuenta, iniciar sesión a través del servicio de Google Sign-In (OAuth 2.0) o interactuar con cualquiera de las funciones de la Plataforma, el usuario declara haber leído, comprendido y otorgado su <strong>consentimiento expreso</strong> para que sus datos personales sean tratados conforme a las finalidades legítimas aquí estipuladas.</p>
    </div>

    <h2>1. Identidad y Domicilio del Responsable del Banco de Datos</h2>
    <p>El banco de datos personales de usuarios y modelistas es administrado por el equipo operativo de <strong>${tenantName}</strong>, con domicilio de contacto para efectos legales y de notificaciones en la ciudad de Lima, República del Perú, y correo electrónico oficial de contacto: <a href="mailto:${contactEmail}">${contactEmail}</a>.</p>

    <h2>2. Edad Mínima de Consentimiento y Protección de Menores</h2>
    <p>De conformidad con el Artículo 27 del Reglamento de la Ley N° 29733:</p>
    <ul>
      <li><strong>Regla General (14 años cumplidos):</strong> Los adolescentes mayores de catorce (14) años pueden otorgar válidamente su consentimiento para el tratamiento de sus datos personales en servicios digitales de la sociedad de la información, siempre que la información se brinde en un lenguaje claro y comprensible.</li>
      <li><strong>Menores de 14 años:</strong> La Plataforma <strong>no recopila conscientemente datos personales de menores de catorce (14) años sin el consentimiento previo, expreso y verificable de sus padres, tutores o representantes legales</strong>. Si detectamos una cuenta creada por un menor de 14 años sin autorización acreditada, procederemos a la inmediata eliminación de sus datos y registros.</li>
      <li><strong>Sección de Compraventa / Bazar / Marketplace:</strong> La participación en transacciones de compra, venta o permuta de kits entre modelistas está reservada exclusivamente a personas con plena capacidad de ejercicio civil (mayores de 18 años).</li>
    </ul>

    <h2>3. Categorías de Datos Personales Recopilados</h2>
    <p>La Plataforma únicamente recopila datos estrictamente necesarios, pertinentes y no excesivos para la operativa de modelismo:</p>
    <ul>
      <li><strong>Datos de Autenticación con Google (OAuth 2.0 / OIDC):</strong> Identificador único de Google (sub/ID de usuario), correo electrónico validado por Google, nombre completo público y URL de fotografía de perfil. <em>En ningún caso accedemos ni almacenamos contraseñas de Google, contactos, archivos privados de Google Drive ni correos personales de Gmail.</em></li>
      <li><strong>Datos de Registro Local:</strong> Nombre de usuario (alias/handle), nombre para mostrar público, dirección de correo electrónico y contraseña protegida mediante funciones criptográficas unidireccionales de derivación de claves (bcrypt/Argon2).</li>
      <li><strong>Datos de Actividad de Modelismo y Taller (Workbench):</strong> Inventario de maquetas registradas (Stash), estado de ensamblaje, marcas y códigos de pinturas en rack, fórmulas de dilución, y bitácoras paso a paso de armado.</li>
      <li><strong>Datos Técnicos de Navegación:</strong> Dirección IP de origen, tipo de navegador, registros de auditoría de seguridad y marcas de tiempo, tratados para prevención de ciberataques y auditoría de votaciones.</li>
    </ul>

    <h2>4. Finalidades del Tratamiento de Datos</h2>
    <p>Los datos personales son tratados exclusivamente para:</p>
    <ol>
      <li>Gestionar el alta de cuenta y autenticar la identidad del modelista.</li>
      <li>Permitir la administración del inventario personal de maquetas, pinturas y recetas de acabado.</li>
      <li>Publicar bitácoras de armado y exhibir las obras en la galería comunitaria según la voluntad del usuario.</li>
      <li>Garantizar la transparencia y prevenir la duplicación fraudulenta de votos en concursos y torneos.</li>
      <li>Facilitar la comunicación técnica, alertas de servicio y restablecimiento de credenciales.</li>
    </ol>
    <p><strong>Bajo ninguna circunstancia ${tenantName} comercializa, arrienda, cede ni lucra con la venta de bases de datos o información personal de los usuarios a terceros.</strong></p>

    <h2>5. Transferencia Transfronteriza de Datos Personales</h2>
    <p>En cumplimiento del Artículo 15 de la Ley N° 29733 y el Artículo 33 de su Reglamento, se informa que para la prestación óptima de los servicios, la Plataforma realiza <strong>flujo transfronterizo de datos</strong> hacia proveedores de infraestructura en la nube que garantizan estándares internacionales de seguridad (cifrado en reposo y en tránsito):</p>
    <ul>
      <li><strong>Cloudflare Inc. (EE.UU.):</strong> Servicios de red perimetral, túnel seguro, cortafuegos web (WAF) y mitigación de ataques distribuidos (DDoS).</li>
      <li><strong>Google LLC (EE.UU.):</strong> Servicios de identidad federada Google Identity Services (OAuth 2.0).</li>
      <li><strong>Resend Inc. (EE.UU.):</strong> Servicios de entrega transaccional de correos electrónicos de bienvenida y seguridad.</li>
    </ul>

    <h2>6. Medidas de Seguridad de la Información</h2>
    <p>Implementamos salvaguardas técnicas, legales y organizativas conforme a los lineamientos de la Directiva de Seguridad de la Información de la Autoridad Nacional de Protección de Datos Personales (ANPD Perú):</p>
    <ul>
      <li>Cifrado universal en tránsito mediante protocolos criptográficos modernos TLS 1.3 / HTTPS.</li>
      <li>Tokens de sesión JSON Web Token (JWT) firmados criptográficamente con tiempo de expiración controlado.</li>
      <li>Almacenamiento de base de datos relacional PostgreSQL con políticas estrictas de segmentación multitenant y acceso con mínimos privilegios.</li>
    </ul>

    <h2>7. Ejercicio de Derechos ARCO (Acceso, Rectificación, Cancelación y Oposición)</h2>
    <p>Todo usuario titular de datos personales tiene derecho a ejercer sus derechos de <strong>Acceso, Rectificación, Cancelación y Oposición (ARCO)</strong>, consagrados en la Ley N° 29733:</p>
    <ul>
      <li><strong>Acceso:</strong> Conocer qué datos personales suyos obran en nuestros registros y las condiciones de su tratamiento.</li>
      <li><strong>Rectificación:</strong> Solicitar la actualización o corrección de datos inexactos o incompletos.</li>
      <li><strong>Cancelación (Supresión / Derecho al Olvido):</strong> Solicitar la eliminación total de su cuenta y borrado de sus datos personales cuando hayan dejado de ser necesarios para la finalidad para la que fueron recabados.</li>
      <li><strong>Oposición:</strong> Oponerse al tratamiento de sus datos cuando existan motivos fundados y legítimos.</li>
    </ul>
    <p><strong>Procedimiento ARCO:</strong> Para ejercer cualquiera de estos derechos, el titular debe remitir una solicitud al correo <a href="mailto:${contactEmail}">${contactEmail}</a> con el asunto <em>"Ejercicio de Derechos ARCO - [Nombre de Usuario]"</em>, adjuntando copia simple de su documento de identidad (DNI, Carné de Extranjería o Pasaporte) para verificar la titularidad. Las solicitudes serán atendidas dentro de los plazos máximos establecidos por la legislación peruana (10 a 20 días hábiles).</p>

    <h2>8. Uso de Cookies y Almacenamiento Local</h2>
    <p>La Plataforma no utiliza cookies de rastreo publicitario invasivo ni de intermediarios comerciales. Únicamente se emplea almacenamiento local en el navegador (<code>localStorage</code>) estrictamente necesario para preservar el token de sesión autenticada del usuario mientras navega entre los distintos módulos del taller.</p>

    <h2>9. Modificaciones a la Presente Política</h2>
    <p>Nos reservamos el derecho de actualizar la presente Política de Privacidad para adecuarla a reformas normativas o mejoras operativas. Las modificaciones sustanciales serán notificadas a través de la interfaz web de la Plataforma.</p>

    <div class="footer">
      © 2026 ${tenantName}. Conforme a la Ley N° 29733 y normativa de la República del Perú.
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
  <title>Términos y Condiciones del Servicio — ${tenantName}</title>
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
      line-height: 1.65;
      padding: 2.5rem 1rem;
    }
    .container {
      max-width: 860px;
      margin: 0 auto;
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 3rem 2.5rem;
      box-shadow: 0 12px 40px rgba(0,0,0,0.6);
    }
    .back-link {
      display: inline-block;
      margin-bottom: 1.5rem;
      color: var(--accent);
      text-decoration: none;
      font-weight: 600;
      font-size: 0.9rem;
    }
    .badge {
      display: inline-block;
      padding: 0.25rem 0.65rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      background: rgba(239, 68, 68, 0.15);
      color: var(--primary);
      border: 1px solid rgba(239, 68, 68, 0.3);
      margin-bottom: 1rem;
    }
    h1 { font-size: 2.2rem; margin-bottom: 0.5rem; color: #fff; letter-spacing: -0.02em; }
    .updated { font-size: 0.85rem; color: var(--muted); margin-bottom: 2rem; border-bottom: 1px solid var(--border); padding-bottom: 1rem; }
    h2 { font-size: 1.3rem; margin-top: 2rem; margin-bottom: 0.8rem; color: #fff; border-left: 3px solid var(--primary); padding-left: 0.75rem; }
    h3 { font-size: 1.05rem; margin-top: 1.2rem; margin-bottom: 0.5rem; color: #f1f5f9; }
    p, ul, ol { margin-bottom: 1.1rem; font-size: 0.95rem; color: #cbd5e1; }
    ul, ol { padding-left: 1.6rem; }
    li { margin-bottom: 0.5rem; }
    strong { color: #fff; }
    a { color: var(--accent); text-decoration: underline; }
    .legal-alert {
      background: rgba(239, 68, 68, 0.08);
      border: 1px solid rgba(239, 68, 68, 0.25);
      border-radius: 8px;
      padding: 1.25rem;
      margin: 1.5rem 0;
    }
    .legal-alert h3 { color: #f87171; margin-top: 0; }
    .footer { margin-top: 3rem; padding-top: 1.5rem; border-top: 1px solid var(--border); font-size: 0.85rem; color: var(--muted); text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <a href="/" class="back-link">← Volver a la página principal</a>
    <div class="badge">Condiciones Contractuales • Perú & LATAM</div>
    <h1>Términos y Condiciones del Servicio</h1>
    <div class="updated">Última actualización y entrada en vigencia: 24 de Octubre de 2026</div>

    <p>El presente documento constituye un contrato vinculante entre cualquier persona que acceda, navegue o utilice los servicios de la plataforma web <strong>${tenantName}</strong> (en adelante, "el Usuario" y "la Plataforma" respectivamente), accesible en el dominio <a href="https://${domain}">https://${domain}</a>. La utilización de la Plataforma implica la <strong>aceptación plena, expresa y sin reservas</strong> de todos y cada uno de los términos aquí estipulados.</p>

    <h2>1. Capacidad Legal y Requisitos de Edad</h2>
    <ul>
      <li><strong>Edad Mínima para Participación General:</strong> La Plataforma está dirigida a aficionados al modelismo mayores de catorce (14) años. Los menores de entre 14 y 17 años declaran contar con la supervisión de sus padres o tutores legales.</li>
      <li><strong>Capacidad para Transacciones en el Bazar:</strong> Para publicar anuncios de venta, realizar compras o acordar comisiones remuneradas de pintura o ensamblaje, el Usuario declara expresamente ser <strong>mayor de edad (18 años cumplidos)</strong> con plena capacidad civil para obligarse conforme al Código Civil peruano y las leyes de su país de residencia.</li>
    </ul>

    <h2>2. Propiedad Intelectual de Imágenes y Licencia de Uso Concedida por el Usuario</h2>
    <p>De conformidad con el <strong>Decreto Legislativo N° 822 (Ley sobre el Derecho de Autor de la República del Perú)</strong> y los convenios internacionales sobre propiedad intelectual:</p>
    <ul>
      <li><strong>Titularidad de las Obras:</strong> El Usuario conserva en todo momento la titularidad originaria y los derechos de autor sobre las fotografías de sus maquetas, dioramas, bitácoras de armado y textos que cargue en la Plataforma.</li>
      <li><strong>Licencia Voluntaria para la Plataforma:</strong> Al subir cualquier imagen o contenido, el Usuario concede a <strong>${tenantName}</strong> una <strong>licencia no exclusiva, gratuita, de alcance mundial y revocable</strong>, con la única y exclusiva finalidad de almacenar, procesar, adaptar dimensiones para visualización web y exhibir públicamente las imágenes dentro de la galería comunitaria, perfiles de modelistas y eventos de la Plataforma.</li>
      <li><strong>Garantía de Autoría y Cláusula de Indemnidad Obligatoria:</strong> El Usuario garantiza de manera formal y bajo su exclusiva responsabilidad que:
        <ol style="margin-top:0.5rem;">
          <li>Es el autor legítimo de las fotografías cargadas o cuenta con autorización documental expresa de su titular.</li>
          <li>Las imágenes no vulneran derechos de autor, derechos de imagen de terceros, secretos comerciales ni normas de orden público.</li>
          <li><strong>Indemnidad (Hold Harmless):</strong> El Usuario se compromete a <strong>mantener indemne, defender y liberar de toda responsabilidad a ${tenantName}, sus administradores, fundadores y operadores técnicos</strong> frente a cualquier demanda, reclamo judicial o extrajudicial, procedimiento administrativo ante INDECOPI, indemnización por daños, multas o costas legales que pudieran originarse por la infracción de derechos de terceros derivada del contenido cargado por el Usuario.</li>
        </ol>
      </li>
    </ul>

    <h2>3. Descargo de Marcas Comerciales de Terceros (Fair Use / Uso Nominativo)</h2>
    <div class="legal-alert">
      <h3>Aviso sobre Marcas Registradas y Exención de Afiliación Oficial</h3>
      <p style="margin-bottom:0;">
        Los nombres comerciales, marcas registradas y derechos de diseño tales como <strong>"Gundam", "Gunpla", "Bandai Spirits", "Mobile Suit Gundam", "Tamiya", "Mr. Hobby", "Hasegawa"</strong> y cualesquiera otras marcas o denominaciones que aparezcan en los catálogos o bitácoras son propiedad exclusiva de sus respectivos titulares corporativos (incluyendo Bandai Namco Holdings Inc., Sotsu/Sunrise y sus filiales).
        <br><br>
        <strong>${tenantName} es una plataforma comunitaria independiente creada por y para aficionados y modelistas a escala.</strong> Su mención se realiza al amparo del principio de <strong>uso nominativo leal</strong> con fines estrictamente descriptivos, educativos, de catalogación y libre apreciación del hobby, sin que exista patrocinio comercial, asociación, respaldo ni vinculación económica oficial con los titulares de dichas marcas.
      </p>
    </div>

    <h2>4. Régimen del Bazar Comunitario y Marketplace P2P (Exclusión de Responsabilidad)</h2>
    <p>Conforme a la <strong>Ley N° 29571 (Código de Protección y Defensa del Consumidor de Perú)</strong>, se deja expresa constancia del rol de la Plataforma en las operaciones entre usuarios:</p>
    <ul>
      <li><strong>Intermediación Tecnológica Pasiva:</strong> La sección de Bazar y Directorio de Comisiones opera exclusivamente como un tablón comunitario de avisos para poner en contacto directo a modelistas particulares (intercambio Persona a Persona / P2P).</li>
      <li><strong>Ausencia de Relación de Consumo con la Plataforma:</strong> ${tenantName} <strong>no interviene como parte compradora, vendedora ni comisionista</strong> en los acuerdos convenidos entre particulares, no percibe comisiones por transacción, no procesa cobros ni retiene pagos, y no custodia productos físicos.</li>
      <li><strong>Exención de Garantías de Compraventa:</strong> La autenticidad, calidad, estado de las piezas, completitud de los kits, envíos, despachos y transferencias monetarias son responsabilidad única y directa de los usuarios involucrados en la transacción.</li>
    </ul>

    <h2>5. Procedimiento de Notificación y Retirada de Infracciones (Notice & Takedown)</h2>
    <p>Respetamos plenamente la propiedad intelectual de terceros. Si cualquier persona natural o jurídica considera de buena fe que una imagen, bitácora o contenido publicado en la Plataforma infringe sus derechos de autor o de propiedad industrial, puede solicitar su retiro inmediato remitiendo una notificación formal a <a href="mailto:${contactEmail}">${contactEmail}</a> con los siguientes datos:</p>
    <ol>
      <li>Identificación de la obra o derecho protegido presuntamente infringido.</li>
      <li>Enlace URL exacto donde se localiza el contenido en controversia.</li>
      <li>Acreditación fehaciente de la titularidad o representación legal.</li>
      <li>Declaración de veracidad bajo responsabilidad civil y penal.</li>
    </ol>
    <p>Una vez recibida la comunicación fundada, el equipo de administración procederá a la deshabilitación precautoria del contenido en un plazo no mayor a 48 horas hábiles.</p>

    <h2>6. Reglas de Conducta y Moderación</h2>
    <p>Constituyen causales de suspensión inmediata o eliminación definitiva de la cuenta, sin derecho a indemnización ni reclamo:</p>
    <ul>
      <li>El uso de bots, scripts automatizados o mecanismos de votación fraudulenta en concursos comunitarios.</li>
      <li>La publicación de material con contenido obsceno, discriminatorio, violento o que promueva actividades ilícitas.</li>
      <li>El acoso, difamación o conducta hostil hacia otros constructores o modelistas.</li>
      <li>Cualquier intento de alteración, sobrecarga o vulneración de los sistemas y bases de datos de la Plataforma.</li>
    </ul>

    <h2>7. Limitación de Responsabilidad</h2>
    <p>En la máxima medida permitida por la legislación aplicable, ${tenantName} no será responsable por interrupciones imprevistas del servicio derivadas de eventos de fuerza mayor, ataques cibernéticos a gran escala, fallas de proveedores de telecomunicaciones o pérdida accidental de información técnica de proyectos no respaldada localmente por el Usuario.</p>

    <h2>8. Ley Aplicable y Jurisdicción Competente</h2>
    <p>Para la interpretación, validez y ejecución de los presentes Términos y Condiciones, las partes se someten de manera expresa a las <strong>leyes de la República del Perú</strong>. Ante cualquier controversia o discrepancia jurídica que no pueda ser resuelta de mutuo acuerdo de forma amistosa en un plazo de 30 días, las partes renuncian expresamente a cualquier otro fuero que pudiera corresponderles por razón de sus domicilios presentes o futuros y se someten a la competencia territorial de los <strong>Jueces y Tribunales del Distrito Judicial de Lima, Perú</strong>.</p>

    <div class="footer">
      © 2026 ${tenantName}. Conforme al Código Civil peruano, Ley N° 29571 y D.Leg. 822.
    </div>
  </div>
</body>
</html>`;
}

/**
 * Friendly Institutional Page for Suspended or Archived Communities
 */
export function renderInstitutionalSuspensionPage(
  tenantName: string,
  domain: string,
  status: string,
  reason?: string,
  contactEmail?: string,
  alternativeUrl?: string,
  alternativeName?: string
): string {
  const isArchived = status === 'archived';
  const badgeColor = isArchived ? '#ef4444' : '#eab308';
  const badgeBg = isArchived ? 'rgba(239, 68, 68, 0.15)' : 'rgba(234, 179, 8, 0.15)';
  const badgeBorder = isArchived ? 'rgba(239, 68, 68, 0.4)' : 'rgba(234, 179, 8, 0.4)';
  const statusLabel = isArchived ? 'Comunidad Archivada' : 'Portal en Pausa Administrativa';
  const safeContact = contactEmail || 'rpinedaec83@gmail.com';

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${statusLabel} — ${tenantName}</title>
  <style>
    :root {
      --bg: #080c14;
      --card: #111827;
      --border: rgba(255, 255, 255, 0.1);
      --text: #e2e8f0;
      --muted: #94a3b8;
      --primary: #3b82f6;
      --accent: #06b6d4;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 1.5rem;
    }
    .institutional-box {
      max-width: 640px;
      width: 100%;
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 2.5rem;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7);
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    .institutional-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: ${badgeColor};
      background: ${badgeBg};
      border: 1px solid ${badgeBorder};
      padding: 0.35rem 0.85rem;
      border-radius: 9999px;
      margin-bottom: 1.5rem;
    }
    .portal-title {
      font-size: 1.85rem;
      font-weight: 800;
      color: #fff;
      margin-bottom: 0.75rem;
      line-height: 1.25;
    }
    .portal-desc {
      font-size: 0.95rem;
      color: var(--muted);
      margin-bottom: 1.75rem;
      line-height: 1.6;
    }
    .reason-box {
      background: rgba(255, 255, 255, 0.03);
      border: 1px dashed var(--border);
      border-radius: 10px;
      padding: 1rem 1.25rem;
      margin-bottom: 1.75rem;
      text-align: left;
    }
    .reason-label {
      font-size: 0.72rem;
      text-transform: uppercase;
      font-weight: 700;
      color: ${badgeColor};
      margin-bottom: 0.35rem;
    }
    .reason-text {
      font-size: 0.88rem;
      color: #f1f5f9;
      font-style: italic;
    }
    .data-guarantee {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      background: rgba(16, 185, 129, 0.08);
      border: 1px solid rgba(16, 185, 129, 0.25);
      border-radius: 10px;
      padding: 1rem;
      margin-bottom: 2rem;
      text-align: left;
      font-size: 0.82rem;
      color: #a7f3d0;
    }
    .actions-row {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      align-items: center;
    }
    .btn-action {
      display: inline-block;
      width: 100%;
      padding: 0.85rem 1.5rem;
      border-radius: 8px;
      font-weight: 700;
      text-decoration: none;
      font-size: 0.92rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .btn-primary-action {
      background: var(--primary);
      color: #fff;
      border: none;
    }
    .btn-primary-action:hover {
      background: #2563eb;
      transform: translateY(-1px);
    }
    .contact-note {
      font-size: 0.78rem;
      color: var(--muted);
      margin-top: 1.5rem;
    }
    .contact-note a {
      color: var(--accent);
      text-decoration: none;
    }
    .admin-toggle-link {
      font-size: 0.72rem;
      color: #64748b;
      cursor: pointer;
      margin-top: 1.5rem;
      display: inline-block;
      text-decoration: underline;
    }
    .admin-toggle-link:hover { color: #94a3b8; }
    #admin-login-box {
      display: none;
      margin-top: 1.25rem;
      padding: 1.25rem;
      border-top: 1px solid var(--border);
      text-align: left;
    }
    .admin-input {
      width: 100%;
      padding: 0.6rem 0.8rem;
      background: #0f172a;
      border: 1px solid #334155;
      border-radius: 6px;
      color: #fff;
      font-size: 0.85rem;
      margin-bottom: 0.75rem;
    }
  </style>
</head>
<body>
  <div class="institutional-box">
    <div class="institutional-badge">
      <span>${isArchived ? 'ARCHIVADO' : 'EN MANTENIMIENTO'}</span>
      <span>${statusLabel}</span>
    </div>

    <h1 class="portal-title">${tenantName}</h1>

    <p class="portal-desc">
      El acceso a este portal de comunidad se encuentra momentáneamente restringido por disposición administrativa o labores de mantenimiento programado en la plataforma.
    </p>

    <div class="reason-box">
      <div class="reason-label">Motivo Registrado:</div>
      <div class="reason-text">
        ${reason ? String(reason) : 'Labores técnicas de balanceo de catálogos y mantenimiento preventivo de servidores.'}
      </div>
    </div>

    <div class="data-guarantee">
      <span>🛡️</span>
      <div>
        <strong>Resguardo de Información de Taller:</strong> Todos los inventarios de maquetas (Stash), bitácoras paso a paso y fórmulas de pinturas se encuentran almacenados y asegurados con copias de seguridad de nivel empresarial.
      </div>
    </div>

    <div class="actions-row">
      ${
        alternativeUrl
          ? `<a href="${alternativeUrl}" class="btn-action btn-primary-action">Explorar Comunidad Alternativa (${alternativeName || 'Portal Activo'}) &rarr;</a>`
          : ''
      }
    </div>

    <p class="contact-note">
      Para coordinaciones de reapertura o asistencia técnica, comunícate con la administración central al correo:
      <br>
      <a href="mailto:${safeContact}"><strong>${safeContact}</strong></a>
    </p>

    <span class="admin-toggle-link" onclick="document.getElementById('admin-login-box').style.display = 'block'">
      ¿Eres el Administrador Todopoderoso? Acceso de Super Admin
    </span>

    <div id="admin-login-box">
      <div style="font-size: 0.8rem; font-weight: 700; color: #fff; margin-bottom: 0.5rem;">Acceso de Super Administrador</div>
      <p style="font-size: 0.75rem; color: #94a3b8; margin-bottom: 0.75rem;">Ingresa tus credenciales para administrar y reactivar el portal.</p>
      <input id="sa-email" class="admin-input" type="text" placeholder="Correo (rpinedaec83@gmail.com)" value="rpinedaec83@gmail.com" />
      <input id="sa-pass" class="admin-input" type="password" placeholder="Contraseña de Super Admin" />
      <button class="btn-action btn-primary-action" onclick="handleSuperAdminBypass()" style="padding: 0.5rem 1rem; font-size: 0.82rem;">Autenticar y Acceder</button>
      <div id="sa-err" style="color: #f87171; font-size: 0.75rem; margin-top: 0.5rem; display: none;"></div>
    </div>
  </div>

  <script>
    async function handleSuperAdminBypass() {
      const email = document.getElementById('sa-email').value;
      const pass = document.getElementById('sa-pass').value;
      const err = document.getElementById('sa-err');
      err.style.display = 'none';

      try {
        const res = await fetch('/api/v1/auth/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: email, password: pass })
        });
        const data = await res.json();
        if (!res.ok) {
          err.textContent = data.detail || 'Credenciales inválidas.';
          err.style.display = 'block';
          return;
        }
        localStorage.setItem('${domain}_sso_token', data.token);
        localStorage.setItem('${domain}_sso_user', JSON.stringify(data.user));
        document.cookie = 'gunpla_sa_token=' + data.token + '; path=/; max-age=86400';
        window.location.reload();
      } catch (e) {
        err.textContent = 'Error de conexión con la API.';
        err.style.display = 'block';
      }
    }
  </script>
</body>
</html>`;
}
