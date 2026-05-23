# Plan de solución: Errores en `src/pages/personalize.astro`

## Diagnóstico

### Problema 1: Los clics en categorías no funcionan (anillos, collares, etc.)

**Causa raíz:** El bloque `<script>` en la línea 330 contiene **sintaxis de TypeScript** (type annotations) pero **no tiene el atributo `lang="ts"`**. En Astro, `<script>` sin `lang="ts"` se procesa como JavaScript plano, y las anotaciones de tipo NO son válidas en JavaScript.

Líneas problemáticas:
- [`Record<string, string[]>`](src/pages/personalize.astro:335) — type annotation inválida en JS
- [`Array<{ url: string; name: string }>`](src/pages/personalize.astro:338) — type annotation inválida en JS
- [Typed state object `{ step: number; ... }`](src/pages/personalize.astro:343) — type annotation inválida en JS
- [`goToStep(newStep: number)`](src/pages/personalize.astro:412) — type annotation inválida en JS

**Consecuencia:** El navegador lanza un `SyntaxError` al intentar parsear el script, y **todo el JavaScript deja de ejecutarse**. Por eso ningún clic funciona, ni siquiera en el paso 1.

### Problema 2: Error "progressFill is possibly null"

**Causa raíz:** El proyecto usa [`astro/tsconfigs/strict`](tsconfig.json:2) que habilita `strictNullChecks`. La función [`document.getElementById("progress-fill")`](src/pages/personalize.astro:357) retorna `HTMLElement | null`.

Aunque existe un [guard clause](src/pages/personalize.astro:378) que valida nulidad, el error aparece porque:
1. **El script falla antes** de llegar al guard clause (por el Problema 1), así que TypeScript/el editor nunca evalúa el narrowing.
2. El IDE detecta la sintaxis TS inválida y muestra el error de `progressFill` como falso positivo, o alternativamente el type checker de Astro procesa parcialmente el archivo y encuentra `progressFill` sin narrowing efectivo.

### Problema 3 (Potencial): Eventos de charms (dijes) atados antes de renderizar

Actualmente los charms se renderizan en [`charmsGrid.innerHTML = ...`](src/pages/personalize.astro:396) y los eventos se atan en [`charmsGrid.querySelectorAll(".charm-card")`](src/pages/personalize.astro:530). Ambos ocurren durante `DOMContentLoaded`, en orden secuencial, por lo que **funciona correctamente**. No requiere cambio.

---

## Solución

### Paso 1: Agregar `lang="ts"` al `<script>` tag

Cambiar:
```astro
<script>
```
a:
```astro
<script lang="ts">
```

Esto le indica a Astro que procese el bloque como TypeScript, permitiendo las anotaciones de tipo.

### Paso 2: Corregir tipos para strict null checks

El tipo de `progressFill` después del guard clause es `HTMLElement` (no null), pero para mayor claridad y para eliminar cualquier warnig del editor, podemos:

1. Usar el operador `!` (non-null assertion) al declarar la variable:
```ts
const progressFill = document.getElementById("progress-fill")!;
```

O mejor aún, mantener el guard clause existente (que ya es correcto) y confiar en el narrowing de TypeScript.

**Recomendación:** No cambiar el guard clause. Ya es correcto. Con `lang="ts"`, TypeScript aplicará control flow narrowing y `progressFill` será `HTMLElement` después del guard.

### Paso 3: Verificar imágenes de dijes

Los archivos de los dijes son `.png` y el glob pattern [`/src/assets/productos/*.{jpeg,jpg,png}`](src/pages/personalize.astro:8) SÍ incluye `.png`. Las funciones [`getImageUrl("dije_corazon_oro")`](src/pages/personalize.astro:37) usan `key.includes(filename)` que hace matching parcial, por lo que `"dije_corazon_oro"` coincide con `"dije_corazon_oro_1779243944941.png"`. **Funciona correctamente.**

### Paso 4: Probar la solución

1. Ejecutar `npm run dev` (o el comando de desarrollo)
2. Verificar que la página carga sin errores en consola
3. Hacer clic en cada categoría y confirmar navegación a paso 2
4. Seleccionar una base y confirmar navegación a paso 3
5. Seleccionar un dije y verificar que el botón "Ver Resultado Final" se habilita
6. Verificar que el flujo completo funciona

---

## Resumen de cambios

| Archivo | Cambio | Líneas |
|---------|--------|--------|
| `src/pages/personalize.astro` | Agregar `lang="ts"` al `<script>` | 330 |
| `src/pages/personalize.astro` | (Opcional) Agregar `!` en `progressFill` si persiste warning | 357 |