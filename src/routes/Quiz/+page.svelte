<script lang="ts">
  // @ts-nocheck
  import AppSelector from '$lib/components/AppSelector.svelte';
  import BirdApp from '$lib/components/BirdApp.svelte';
  import DogApp from '$lib/components/DogApp.svelte';
  import ShopApp from '$lib/components/Shop.svelte';
  import { onMount, afterUpdate } from 'svelte';
  import { authStore } from '$lib/components/stores/AuthStore';

  // Export data from the load function
  export let data;
  const { cards } = data;

  // --- Interfaces ---
  interface AppPosition { top: string; left: string; }
  interface AppContent { title: string; description: string; component: any; }
  interface App {
    id: string;
    emoji: string;
    where: AppPosition;
    content: AppContent;
    position?: { top: number; left: number; element?: HTMLElement; };
    centerPosition?: { x: number; y: number; };
    element?: HTMLElement;
    width?: number;
    height?: number;
  }
  // Interface for road connection data
  interface RoadConnection {
    app1: App;
    app2: App;
    shouldCurve?: boolean; // Flag based on angle
    pathData?: string;     // SVG path data for curves
  }
  // Interface for decoration elements
  interface Decoration {
    id: string;
    src: string; // Path to the SVG file (e.g., /tree.svg)
    position: { x: number; y: number };
    size: { width: number; height: number };
    rotation?: number; // Optional rotation in degrees
  }

  // --- App Definitions (with updated positions) ---
  let apps: App[] = [
    {
      id: 'rabbit', // Moved slightly down, kept left
      emoji: "/favicon.png",
      where: { top: '200px', left: '150px' },
      content: { title: "Rabbit App", description: "Hop into the Rabbit App!", component: DogApp }
    },
    {
      id: 'bird', // Moved down and further right
      emoji: "/store-svgrepo-com.svg",
      where: { top: '380px', left: '300px' },
      content: { title: "Bird App", description: "Welcome to the Bird App!", component: BirdApp }
    },
     {
      id: 'fish', // Moved further down, slightly right
      emoji: "/favicon.png",
      where: { top: '600px', left: '250px' },
      content: { title: "Fish App", description: "Dive into the Fish App!", component: DogApp }
    },
    {
      id: 'dog', // Kept top-ish, moved mid-left
      emoji: "/favicon.png",
      where: { top: '180px', left: '480px' },
      content: { title: "Dog App", description: "Welcome to the Dog App!", component: DogApp }
    },
    {
      id: 'bird2', // Mid-top, mid-right
      emoji: "/favicon.png",
      where: { top: '220px', left: '850px' },
      content: { title: "Bird App 2", description: "Welcome to the Bird App!", component: DogApp }
    },
     {
      id: 'turtle', // Mid-bottom, mid-right
      emoji: "/favicon.png",
      where: { top: '550px', left: '750px' },
      content: { title: "Turtle App", description: "Slow and steady in the Turtle App!", component: DogApp }
    },
    {
      id: 'shop', // Moved further right, adjusted top
      emoji: "/download.svg",
      where: { top: '400px', left: '1100px' },
      content: { title: "Shop", description: "Shop", component: ShopApp }
    },
  ];

  // --- Auth Store ---
  let user: import('@supabase/gotrue-js').User | null = null;
  authStore.subscribe(({ user: currentUser }) => {
    user = currentUser;
  });

  // --- State ---
  let roadConnections: RoadConnection[] = []; // Holds MST connections with curve data
  let positionsCalculated = false; // Flag for element positions readiness
  const svgWidth = 1920; // SVG/Canvas width
  const svgHeight = 1080; // SVG/Canvas height

  // --- State for Decorations ---
  let decorations: Decoration[] = [
    { id: 'tree1', src: '/tree.svg', position: { x: 250, y: 180 }, size: { width: 50, height: 70 }, rotation: -5 },
    { id: 'tree2', src: '/tree.svg', position: { x: 600, y: 120 }, size: { width: 60, height: 80 } },
    { id: 'rock1', src: '/rock.svg', position: { x: 400, y: 350 }, size: { width: 40, height: 30 }, rotation: 15 },
    { id: 'rock2', src: '/rock.svg', position: { x: 950, y: 200 }, size: { width: 35, height: 25 } },
    { id: 'tree3', src: '/tree.svg', position: { x: 1050, y: 480 }, size: { width: 55, height: 75 }, rotation: 8 },
    { id: 'bush1', src: '/bush.svg', position: { x: 180, y: 450 }, size: { width: 45, height: 40 } },
    { id: 'rock3', src: '/rock.svg', position: { x: 700, y: 600 }, size: { width: 50, height: 35 }, rotation: -10 },
    { id: 'tree4', src: '/tree.svg', position: { x: 50, y: 580 }, size: { width: 50, height: 70 } },
    { id: 'bush2', src: '/bush.svg', position: { x: 880, y: 350 }, size: { width: 40, height: 35 }, rotation: 20 },
    { id: 'tree5', src: '/tree.svg', position: { x: 1000, y: 300 }, size: { width: 50, height: 70 }, rotation: 3 },
  ];

  // --- Position Calculation (with Tolerance) --- // *** MODIFIED FUNCTION ***
  function getAppElementsAndPositions() {
    let changedOverall = false; // Renamed to avoid confusion with loop variable
    const tolerance = 0.5; // Tolerance in pixels. Adjust if needed.

    apps.forEach(app => {
      const element = document.getElementById(app.id);
      if (element) {
        const rect = element.getBoundingClientRect();
        const scrollX = window.scrollX || document.documentElement.scrollLeft;
        const scrollY = window.scrollY || document.documentElement.scrollTop;

        const newTop = rect.top + scrollY;
        const newLeft = rect.left + scrollX;
        const newCenterX = newLeft + rect.width / 2;
        const newCenterY = newTop + rect.height * 0.8; // Connect near bottom of icon

        let positionActuallyChanged = false;
        let centerActuallyChanged = false;

        // Check position with tolerance
        if (!app.position || Math.abs(app.position.top - newTop) > tolerance || Math.abs(app.position.left - newLeft) > tolerance) {
          app.position = { top: newTop, left: newLeft, element: element };
          // Update width/height only if position changed significantly
          app.width = rect.width;
          app.height = rect.height;
          positionActuallyChanged = true;
          changedOverall = true;
        }

        // Check center position with tolerance
        if (!app.centerPosition || Math.abs(app.centerPosition.x - newCenterX) > tolerance || Math.abs(app.centerPosition.y - newCenterY) > tolerance) {
           app.centerPosition = { x: newCenterX, y: newCenterY };
           centerActuallyChanged = true;
           changedOverall = true;
        }

        // Always ensure element reference is up-to-date if needed elsewhere
        app.element = element;

      } else {
        console.warn(`Element with id ${app.id} not found.`);
      }
    }); // End forEach

    if (changedOverall) {
      // Only recalculate if any app's position changed beyond tolerance
      positionsCalculated = apps.every(app => app.centerPosition);
      // Trigger reactivity ONLY if a meaningful change occurred
      apps = [...apps];
      console.log('App positions updated (beyond tolerance). All calculated:', positionsCalculated);
    }
    // else { console.log('App positions checked, no significant change detected.'); }

    return changedOverall; // Return if any position changed significantly
  }

  // --- Minimum Spanning Tree (MST) Logic ---
  function distance(app1: App, app2: App): number {
    if (!app1.centerPosition || !app2.centerPosition) return Infinity;
    const dx = app1.centerPosition.x - app2.centerPosition.x;
    const dy = app1.centerPosition.y - app2.centerPosition.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function calculateMST(): { app1: App; app2: App }[] {
    if (apps.length < 2) return [];
    const edges: { app1: App; app2: App; dist: number }[] = [];
    for (let i = 0; i < apps.length; i++) {
      for (let j = i + 1; j < apps.length; j++) {
        const dist = distance(apps[i], apps[j]);
        if (dist !== Infinity) { edges.push({ app1: apps[i], app2: apps[j], dist }); }
      }
    }
    edges.sort((a, b) => a.dist - b.dist);
    const mst: { app1: App; app2: App }[] = [];
    const parent: { [key: string]: string } = {};
    apps.forEach(app => { parent[app.id] = app.id; });
    function find(appId: string): string {
      if (parent[appId] === appId) { return appId; }
      return parent[appId] = find(parent[appId]);
    }
    function union(appId1: string, appId2: string): boolean {
      const root1 = find(appId1);
      const root2 = find(appId2);
      if (root1 !== root2) { parent[root1] = root2; return true; }
      return false;
    }
    for (const edge of edges) {
      if (union(edge.app1.id, edge.app2.id)) {
        mst.push({ app1: edge.app1, app2: edge.app2 });
        if (mst.length === apps.length - 1) break;
      }
    }
    // console.log("MST Calculated:", mst);
    return mst;
  }

  // --- Curve Calculation Helper ---
  function getCurvePathData(app1: App, app2: App, curveFactor = 0.2): string | null {
      if (!app1.centerPosition || !app2.centerPosition) return null;
      const x1 = app1.centerPosition.x;
      const y1 = app1.centerPosition.y;
      const x2 = app2.centerPosition.x;
      const y2 = app2.centerPosition.y;
      const midX = (x1 + x2) / 2;
      const midY = (y1 + y2) / 2;
      const dx = x2 - x1;
      const dy = y2 - y1;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len < 1) return `M ${x1} ${y1} L ${x2} ${y2}`; // Straight line for overlap
      const perpX = -dy / len;
      const perpY = dx / len;
      const offsetAmount = Math.min(len * curveFactor, 60); // Max curve offset
      const controlX = midX + perpX * offsetAmount;
      const controlY = midY + perpY * offsetAmount;
      return `M ${x1} ${y1} Q ${controlX} ${controlY} ${x2} ${y2}`;
  }

  // --- Update Roads Logic (MST + Angle-Based Curving) ---
  function updateRoads() {
      // Use the result of the tolerance-based check
      const positionsChangedSignificantly = getAppElementsAndPositions();

      if (positionsCalculated) {
          let needsMstRecalc = positionsChangedSignificantly || roadConnections.length === 0;
          let currentConnections: RoadConnection[];

          const processConnection = (conn: { app1: App, app2: App } | RoadConnection, isUpdate = false): RoadConnection => {
              let shouldCurve = false;
              let pathData = (isUpdate && (conn as RoadConnection).shouldCurve) ? (conn as RoadConnection).pathData : null;
              const app1 = isUpdate ? (apps.find(a => a.id === conn.app1.id) || conn.app1) : conn.app1;
              const app2 = isUpdate ? (apps.find(a => a.id === conn.app2.id) || conn.app2) : conn.app2;

              if (app1.centerPosition && app2.centerPosition) {
                  const x1 = app1.centerPosition.x;
                  const y1 = app1.centerPosition.y;
                  const x2 = app2.centerPosition.x;
                  const y2 = app2.centerPosition.y;
                  const dx = Math.abs(x2 - x1);
                  const dy = Math.abs(y2 - y1);
                  const minDelta = 1;
                  const straightnessThreshold = 0.25;

                  if (dx > minDelta || dy > minDelta) {
                      if (!(dx < minDelta || dy < minDelta)) {
                          const ratio = Math.min(dx, dy) / Math.max(dx, dy);
                          if (ratio >= straightnessThreshold) {
                              shouldCurve = true;
                          }
                      }
                  }

                  if (shouldCurve) {
                      pathData = getCurvePathData(app1, app2);
                      if (!pathData) shouldCurve = false;
                  } else {
                      pathData = null;
                  }
              } else {
                  shouldCurve = false;
                  pathData = null;
              }

              return {
                  app1: app1,
                  app2: app2,
                  shouldCurve: shouldCurve,
                  pathData: pathData
              };
          };

          // Only proceed if MST needs recalc OR positions changed significantly
          if (needsMstRecalc || positionsChangedSignificantly) {
              if (needsMstRecalc) {
                  console.log("Calculating MST and determining curves based on angle.");
                  let mst = calculateMST();
                  currentConnections = mst.map(conn => processConnection(conn, false));
              } else {
                  // Only positions changed significantly, just update paths
                  // console.log("Significant position change detected, recalculating path data.");
                  currentConnections = roadConnections.map(conn => processConnection(conn, true));
              }
              roadConnections = currentConnections; // Update reactive state
          }
          // Else: No significant change, do nothing to prevent further updates

      } else {
          // This might run if initial calculation didn't find all elements
          if (positionsChangedSignificantly) { // Check if the failed attempt still caused a 'change'
             console.warn("Positions not yet fully calculated but change detected. Will retry.");
             // Don't clear roads yet, wait for next afterUpdate
          } else {
             console.warn("Positions not yet calculated. Cannot generate roads.");
             roadConnections = [];
          }
      }
  }

  // --- Lifecycle Hooks ---
  onMount(() => {
    requestAnimationFrame(() => {
        updateRoads();
    });
  });

  afterUpdate(() => {
      // console.log("Running afterUpdate check...");
      // updateRoads is now smarter and should only cause further updates
      // if positions changed beyond tolerance.
      updateRoads();
  });

</script>

<div class="budy relative">
  <!-- SVG Container for Roads and Decorations -->
  <svg
    width={svgWidth}
    height={svgHeight}
    class="absolute top-0 left-0 z-0 road-svg"
    style="pointer-events: none;"
  >
    <!-- Layer 0: Decorations (Bottom) -->
    <g class="decorations">
       {#each decorations as deco (deco.id)}
         <image
           href={deco.src}
           x={deco.position.x}
           y={deco.position.y}
           width={deco.size.width}
           height={deco.size.height}
           transform={deco.rotation ? `rotate(${deco.rotation} ${deco.position.x + deco.size.width / 2} ${deco.position.y + deco.size.height / 2})` : ''}
           style="pointer-events: none;"
         />
       {/each}
    </g>

    <!-- Layer 1: Road Casings -->
    <g class="road-casings">
      {#each roadConnections as conn (conn.app1.id + '-' + conn.app2.id + '-casing')}
        {#if conn.app1.centerPosition && conn.app2.centerPosition}
          {#if conn.shouldCurve && conn.pathData}
             <path d={conn.pathData} class="road-casing" />
          {:else}
             <line
               x1={conn.app1.centerPosition.x} y1={conn.app1.centerPosition.y}
               x2={conn.app2.centerPosition.x} y2={conn.app2.centerPosition.y}
               class="road-casing"
             />
          {/if}
        {/if}
      {/each}
    </g>

    <!-- Layer 2: Main Road Surface -->
    <g class="road-lines">
      {#each roadConnections as conn (conn.app1.id + '-' + conn.app2.id + '-line')}
        {#if conn.app1.centerPosition && conn.app2.centerPosition}
           {#if conn.shouldCurve && conn.pathData}
              <path d={conn.pathData} class="road-line" />
           {:else}
              <line
                x1={conn.app1.centerPosition.x} y1={conn.app1.centerPosition.y}
                x2={conn.app2.centerPosition.x} y2={conn.app2.centerPosition.y}
                class="road-line"
              />
           {/if}
        {/if}
      {/each}
    </g>

    <!-- Layer 3: Middle Dashed Lines -->
    <g class="road-middle-lines">
       {#each roadConnections as conn (conn.app1.id + '-' + conn.app2.id + '-middle')}
         {#if conn.app1.centerPosition && conn.app2.centerPosition}
            {#if conn.shouldCurve && conn.pathData}
               <path d={conn.pathData} class="road-middle-line" />
            {:else}
               <line
                 x1={conn.app1.centerPosition.x} y1={conn.app1.centerPosition.y}
                 x2={conn.app2.centerPosition.x} y2={conn.app2.centerPosition.y}
                 class="road-middle-line"
               />
            {/if}
         {/if}
       {/each}
    </g>
  </svg>

  <!-- App Icons Container (Above SVG) -->
  <div style="position: relative; z-index: 1;">
    <AppSelector {apps} {cards} />
  </div>
</div>

<style>
  .budy {
    margin-top: -5.1rem;
    width: 100%;
    min-height: 104vh;
    position: relative;
    overflow: hidden;
    background-color: #B3D9A1;
  }

  .road-svg {
    display: block;
    position: absolute;
    top: 0;
    left: 0;
  }

  /* Shared styles */
  .road-casing,
  .road-line,
  .road-middle-line {
    fill: none;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  line.road-middle-line, path.road-middle-line {
     stroke-linecap: butt;
  }

  /* Specific styles */
  .road-casing {
    stroke: #4a4a4a;
    stroke-width: 12;
  }

  .road-line {
    stroke: #6e6e6e;
    stroke-width: 8;
  }

  .road-middle-line {
    stroke: #ffffff;
    stroke-width: 1.5;
    stroke-dasharray: 8 10;
  }

  .decorations image {
     opacity: 0.95;
  }

  /* App Icons */
  :global(.app-icon-wrapper) {
     position: absolute;
     z-index: 2;
  }
</style>