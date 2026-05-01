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

## Estado del Proyecto

| Fase | Estado | Prioridad |
|------|--------|-----------|
| Fase 1: Rediseño UI/UX | 🔴 Pendiente | **INMEDIATA** |
| Fase 2: Granularidad KB | 🔴 Pendiente | Alta |
| Fase 3: Storage | 🔴 Pendiente | Alta |
| Fase 4: Datos Reales | 🟡 En Progreso | Alta |
