# Plan de Migracion - HomeForce a Google Antigravity

## Resumen Arquitectonico

### Stack Tecnologico
- **Frontend**: React 18 + TypeScript, Vite 5, Tailwind CSS 3, Lucide React (iconos)
- **Base de Datos**: Supabase (PostgreSQL con RLS)
- **Patron de Diseno**: Chatbot-first (interfaz conversacional como componente central)
- **Gamificacion**: Marco Octalysis (Racha, Cofre, XP, Monedas del Hogar)

### Estructura del Proyecto

```
src/
  App.tsx                          # Layout principal con navegacion por pestanas
  types/index.ts                   # Tipos TypeScript para todas las entidades
  data/mockData.ts                 # Datos iniciales simulados (5 miembros, 10 gatos, tareas)
  lib/
    supabase.ts                    # Cliente singleton de Supabase
    fairDivision.ts                # Algoritmo de Division Justa (Discrete Adjusted Winner + EF1)
    inventory.ts                   # Logica de deduccion de consumibles y niveles de stock
  components/
    ChatAgent.tsx                  # Agente conversacional proactivo (componente central)
    GamifiedDashboard.tsx          # Tablero de gamificacion (desutilidad, racha, cofre)
    CatStatusGrid.tsx              # Estado visual de los 10 gatos con alerta de amoniaco
    WaterCutBanner.tsx             # Banner de emergencia UMAPS
    UmapsTaskList.tsx              # Lista de tareas con bloqueo geofisico UMAPS
    BountyMarketPanel.tsx          # Mercado de recompensas (subasta de tareas)
    InventoryPanel.tsx             # Panel de inventario con indicadores de stock
```

### Navegacion
La app usa 3 pestanas controladas por estado React (`activeTab`):
1. **Chat** - Interfaz conversacional con el bot HomeForce
2. **Panel** - Panel Principal con metricas, gatos, tareas, gamificacion
3. **Hogar** - Panel Rapido con acceso directo a gatos, tareas, inventario, UMAPS

---

## Los 10 Gatos

### Machos (7)
| Nombre | Emoji | Notas |
|--------|-------|-------|
| Dayson | 🐱 | |
| Tom | 🐱 | |
| Jerry | 🐱 | |
| Oliver | 🐱 | |
| Ricky | 🐱 | |
| Felix | 🐱 | |
| Topo | 🐱 | |

### Hembras (3)
| Nombre | Emoji | Notas |
|--------|-------|-------|
| Brittney | 🐈 | |
| Daisy | 🐈 | |
| Brisa | 🐈 | |

### Logica de Estado
- **Feliz**: Arenero limpio hace menos de 8 horas
- **Neutral**: Arenero limpio hace 8-12 horas
- **Triste/Alerta Amoniaco**: Arenero sin limpiar hace 12+ horas. Se activa la alerta visual de amoniaco volatil con riesgo respiratorio para todos los gatos.

---

## Algoritmo de Division Justa

### Discrete Adjusted Winner (EF1 + Pareto)

El algoritmo asigna tareas a los 5 miembros del hogar basandose en su **desutilidad** (nivel de preferencia):

| Nivel | Significado | Valor |
|-------|-------------|-------|
| 1 | Preferido | Baja desutilidad |
| 2 | Neutral | Desutilidad media |
| 3 | Aversion | Alta desutilidad |

### Funcionamiento
1. Se calcula la desutilidad de cada tarea para cada miembro segun sus preferencias (`task_preference`)
2. Las tareas se ordenan por maxima desutilidad (las mas disputadas primero)
3. Cada tarea se asigna al miembro con menor **costo ajustado**: `desutilidad * (1 + tareas_asignadas * 0.3) + carga_total * 0.2`
4. Se verifica **EF1** (Envy-Freeness up to 1 item): ningun miembro envidia a otro por mas de 1 tarea
5. Se verifica **Optimalidad de Pareto**: no existe reasignacion que mejore a alguien sin empeorar a otro

### Miembros y Preferencias
| Miembro | Preferido | Neutral | Aversion |
|---------|-----------|---------|----------|
| Ninive | Areneros | Cocina, Seco | Banos |
| Osmin | Pisos, Cocina, Seco | - | Areneros |
| Kevin | Pisos, Basura | Lavado, Seco | - |
| Marilyn | Lavado | Banos, Seco | Pisos |
| Mirza | Basura, Seco | Areneros, Cocina | - |

### Metrica del Grafico
El grafico de "Carga Asumida" muestra **puntos de desutilidad** (no cantidad de tareas), demostrando que la distribucion es matematicamente justa.

---

## Checklist de Migracion a Google Antigravity

### Fase 1: Conectar Supabase
- [ ] Crear proyecto Supabase en Google Antigravity
- [ ] Configurar variables de entorno (`.env`):
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- [ ] Verificar conexion del cliente Supabase desde el frontend
- [ ] Probar lectura de datos desde las tablas

### Fase 2: Aplicar Politicas RLS (Row Level Security)
- [ ] Ejecutar migracion `create_household_schema` (creacion de tablas)
- [ ] Ejecutar migracion `fix_rls_policies` (politicas restrictivas)
- [ ] Verificar que todas las tablas tienen RLS habilitado
- [ ] Probar que usuarios no autenticados no pueden acceder a datos
- [ ] Probar que solo admins pueden modificar activos, inventario y UMAPS
- [ ] Probar que miembros solo pueden actualizar sus propias tareas y recompensas
- [ ] Verificar politica de gatos: solo miembros del hogar pueden actualizar

### Fase 3: Integrar Agentes de Antigravity
- [ ] Conectar Agente de Inventario para deduccion automatica de consumibles
  - [ ] Trigger: al completar "Limpiar areneros" -> deducir Arena de Tofu y Limpiador Enzimatico
  - [ ] Trigger: al completar tareas con consumibles -> deducir del `product_inventory`
  - [ ] Alerta automatica cuando stock baja del umbral minimo
- [ ] Conectar Agente del Algoritmo Matematico para Division Justa
  - [ ] Ejecutar `discreteAdjustedWinner` al iniciar el dia o al crear nuevas tareas
  - [ ] Persistir asignaciones en `work_order.assigned_to`
  - [ ] Notificar al chatbot sobre la distribucion resultante
  - [ ] Calcular y mostrar score de equidad en tiempo real
- [ ] Conectar Agente de Estado de Gatos
  - [ ] Evaluar `last_litter_cleaned` cada hora para actualizar `mood`
  - [ ] Activar alerta de amoniaco cuando pase 12+ horas sin limpieza
  - [ ] Actualizar estado visual de los 10 gatos en el frontend

### Fase 4: Autenticacion
- [ ] Configurar Supabase Auth (email/password)
- [ ] Crear perfiles en `household_member` al registrar usuarios
- [ ] Vincular `auth.uid()` con los IDs de miembros existentes
- [ ] Probar flujos de login/logout desde el frontend

### Fase 5: Datos Reales
- [ ] Insertar los 10 gatos reales en la tabla `cat`
- [ ] Insertar los 5 miembros del hogar en `household_member`
- [ ] Cargar preferencias de tareas en `task_preference`
- [ ] Cargar inventario inicial en `product_inventory`
- [ ] Reemplazar `mockData.ts` con llamadas a Supabase en tiempo real

### Fase 6: Edge Functions
- [ ] Desplegar Edge Function para deduccion automatica de inventario
- [ ] Desplegar Edge Function para calculo de Division Justa
- [ ] Desplegar Edge Function para evaluacion de estado de gatos
- [ ] Configurar secrets para las Edge Functions
