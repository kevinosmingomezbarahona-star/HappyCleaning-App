# HappyCleaning-App — Plan Maestro de Implementación

> **Objetivo:** Transformar la app de un prototipo genérico a una herramienta operativa real para el hogar, centrada en reducción de fricción, responsabilidad fotográfica y conocimiento específico de la familia.

---

## Fase 1: Rediseño Radical UI/UX (Anti-Sobrecarga Cognitiva)
- [ ] **Eliminar la vista de lista genérica.** Cambiar a diseño "Mobile-First" (tarjetas grandes, íconos Lucide).
- [ ] **Implementar el flujo de auditoría visual:** La UI debe exigir 3 pasos para cada tarea:
    1. **Subir foto "Antes":** Captura obligatoria del estado inicial.
    2. **Leer instrucciones/suministros:** Despliegue de micro-instrucciones y materiales necesarios.
    3. **Subir foto "Después":** Captura final para validar la completitud.

## Fase 2: Granularidad de Tareas (Knowledge Base Familiar)
- [ ] **Reestructurar las `Work_Orders` con instrucciones microscópicas.** Ejemplos obligatorios:
    - **Lavar trastes:** "Usar agua hirviendo para la manteca/mal olor y limpiar orillas del fregadero con cepillo."
    - **Baños:** "Restregar con detergente inodoro, paredes y piso."
    - **Arenero:** "Sacar heces cada 12h. Solo Limpiador Enzimático. PROHIBIDO cloro/amoníaco."

## Fase 3: Infraestructura de Almacenamiento (Storage)
- [ ] **Configurar el bucket `task-audits`** en Supabase para alojar las fotografías de evidencia (Antes/Después).

---

## Fase 4: Siembra de Datos Reales y Esquema (Supabase)

### 4.1 Miembros del Hogar
- [ ] Insertar los 5 miembros en la tabla `household_member`:
  - Ninive (admin)
  - Osmin (member)
  - Kevin (member)
  - Marilyn (member)
  - Mirza (member)

### 4.2 Los 10 Gatos (con Género)
- [ ] Agregar columna `gender` a la tabla `cat` (male/female).
- [ ] Insertar los 10 gatos:
  - **Machos:** Dayson, Tom, Jerry, Oliver, Ricky, Felix, Topo.
  - **Hembras:** Brittney, Daisy, Brisa.

### 4.3 Tareas Iniciales
- [ ] Cargar las micro-tareas definidas en la Fase 2 en la base de datos.

---

## Fase 5: Inmersión Emocional y Polish Visual (Smooth UI)
- [x] **Splash Screen de Tributo:** Crear una pantalla de carga inicial de 3 segundos con fondo oscuro y un texto minimalista, centrado y elegante: "En memoria y homenaje a Dayson y Harry. Compañeros fieles." que se desvanezca suavemente (efecto fade-out) antes de revelar la app.
- [x] **Avatares Fotográficos:** Modificar los componentes para que gatos y humanos utilicen fotos reales recortadas en círculos (`avatarUrl`), reemplazando los emojis/íconos por defecto. Las tareas completadas deben mostrar visualmente el rostro de quien las ejecutó.
- [x] **El Pasillo de Honor:** Crear una sección solemne y discreta al final del Panel Principal con avatares en escala de grises para recordar permanentemente a las mascotas fallecidas: Dayson, Harry y Toby (perro, 2024).
- [x] **Tarjetas Mobile-First:** Transformar las listas horizontales de tareas en Tarjetas (Cards) amplias con sombras (`shadow-md`, `rounded-2xl`), espaciado táctil generoso y efectos de transición suaves (`hover:scale-105`, animaciones de estado) para que la experiencia sea fluida y satisfactoria.

---

## Fase 6: Autenticación y Seguridad (Supabase Auth)
- [ ] Construir pantalla de Login/Registro (`AuthScreen.tsx`).
- [ ] Proteger las rutas de la app: Si no hay usuario logueado en Supabase, mostrar solo la pantalla de Splash/Tributo y luego el Login.
- [ ] Vincular el `auth.uid()` del usuario logueado con la tabla `household_member` para saber quién está usando la app.

---

## Fase 7: Santuario del Recuerdo y Limpieza de UI
- [ ] Eliminar la redundancia visual: La pestaña "Panel" (Dashboard) NO debe mostrar el grid de gatos. Solo debe mostrar las métricas, progreso y al final, una nueva sección llamada "Santuario del Recuerdo".
- [ ] Santuario del Recuerdo: Aquí vivirán las tarjetas en escala de grises de Dayson, Harry y Toby.
- [ ] La pestaña "Hogar" (Tareas) será el único lugar donde aparezcan los gatos activos (ya que su limpieza de areneros es una tarea) y el feed de tareas.
- [ ] Actualizar los mocks: Dayson se mueve de gatos activos al Santuario (campo `status: 'remembered'`).

---

## Fase 8: Diseño Sonoro (Dopamina UI)
- [ ] Integrar la API de Audio HTML5 para reproducir sonidos cortos y agradables (estilo Duolingo) en dos acciones críticas:
  1. Al hacer clic en un botón de acción.
  2. Al completar exitosamente una tarea.

---

## Estado del Proyecto

| Fase | Estado | Prioridad |
|------|--------|-----------|
| Fase 1: Rediseño UI/UX | 🔴 Pendiente | **INMEDIATA** |
| Fase 2: Granularidad KB | 🔴 Pendiente | Alta |
| Fase 3: Storage | 🔴 Pendiente | Alta |
| Fase 4: Datos Reales | 🟡 En Progreso | Alta |
| Fase 5: Inmersión Emocional (Smooth UI) | ✅ Completada | — |
| Fase 6: Autenticación y Seguridad | 🟡 En Progreso | **INMEDIATA** |
| Fase 7: Santuario del Recuerdo y Limpieza UI | 🟡 En Progreso | Alta |
| Fase 8: Diseño Sonoro | 🔴 Pendiente | Media |

