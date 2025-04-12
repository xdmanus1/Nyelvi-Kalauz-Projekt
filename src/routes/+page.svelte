<script lang="ts">
  // @ts-nocheck
  import AppSelector from '$lib/components/AppSelector.svelte'; // Adjust path if needed
  // Import other app components (BirdApp, DogApp, ShopApp) if they are used DIRECTLY here,
  // otherwise they are only needed by AppSelector
  import LibApp from '$lib/components/Lib.svelte';
  import MusApp from '$lib/components/Museum.svelte';
  import ShopApp from '$lib/components/Shop.svelte';
  import { onMount, afterUpdate, onDestroy } from 'svelte';
  import { authStore } from '$lib/components/stores/AuthStore';

  export let data; // Assuming data comes from a load function or prop
  const cards = data?.cards || []; // Use cards from data if available

  // --- Reference Design Dimensions (Keep Fixed!) ---
  const designWidth = 1920;
  const designHeight = 1080;

  // --- Interfaces (Ensure these match your actual definitions) ---
  interface AppPosition { top: string; left: string; }
  interface AppRenderedPosition { top: number; left: number; }
  interface AppCenterPosition { x: number; y: number; }
  interface AppContent { title: string; description: string; component: any; } // 'any' for Svelte component constructor

  interface App {
    id: string;
    emoji: string; // Used as identifier in AppSelector
    where: AppPosition; // Relative CSS position (%)
    content: AppContent;
    renderedPosition?: AppRenderedPosition;
    centerPosition?: AppCenterPosition; // VIEWBOX coordinates
    element?: HTMLElement;
    widthPx?: number;
    heightPx?: number;
  }
  interface RoadConnection {
    app1: App;
    app2: App;
    shouldCurve?: boolean;
    pathData?: string;
  }
  interface Decoration {
    id: string;
    src: string;
    position: { x: number; y: number }; // %
    size: { width: number; height: number }; // %
    rotation?: number;
  }

  // --- Helper Functions ---
  const pxToPercent = (value: number, dimension: 'width' | 'height'): string => {
    const relativeTo = dimension === 'width' ? designWidth : designHeight;
    return `${((value / relativeTo) * 100).toFixed(2)}%`;
  };
  const pxToPercentNum = (value: number, dimension: 'width' | 'height'): number => {
      const relativeTo = dimension === 'width' ? designWidth : designHeight;
      return (value / relativeTo * 100);
  };

  // --- App Definitions (MUST include component constructor for AppSelector) ---
  // Make sure the component values are actual Svelte component imports
  // You might need to import DogApp, BirdApp, ShopApp at the top
  let apps: App[] = [
    //  { id: 'rabbit', emoji: "/favicon.png", where: { top: pxToPercent(200, 'height'), left: pxToPercent(150, 'width') }, content: { title: "Rabbit App", description: "Desc", component: DogApp } },
     { id: 'library', emoji: "library-big.svg", where: { top: pxToPercent(380, 'height'), left: pxToPercent(300, 'width') }, content: { title: "Library", description: "Library", component: LibApp } },
     { id: 'museum', emoji: "/landmark.svg", where: { top: pxToPercent(600, 'height'), left: pxToPercent(250, 'width') }, content: { title: "Museum", description: "Museum", component: MusApp } },
    //  { id: 'dog', emoji: "/favicon.png", where: { top: pxToPercent(180, 'height'), left: pxToPercent(480, 'width') }, content: { title: "Dog App", description: "Desc", component: DogApp } },
    //  { id: 'bird2', emoji: "/favicon.png", where: { top: pxToPercent(220, 'height'), left: pxToPercent(850, 'width') }, content: { title: "Bird App 2", description: "Desc", component: DogApp } },
    //  { id: 'turtle', emoji: "/favicon.png", where: { top: pxToPercent(550, 'height'), left: pxToPercent(750, 'width') }, content: { title: "Turtle App", description: "Desc", component: DogApp } },
     { id: 'shop', emoji: "/store.svg", where: { top: pxToPercent(900, 'height'), left: pxToPercent(1300, 'width') }, content: { title: "Shop", description: "Shop", component: ShopApp } },
  ];

  // --- Auth Store ---
  let user: import('@supabase/gotrue-js').User | null = null;
  authStore.subscribe(({ user: currentUser }) => { user = currentUser; });

  // --- State ---
  let roadConnections: RoadConnection[] = [];
  let positionsCalculated = false;
  let layoutContainerElement: HTMLElement | null = null;

  // --- Decorations (Example with larger tree1) ---
  let decorations: Decoration[] = [
  // --- Original Decorations ---
  { id: 'tree1', src: '/tree.svg', position: { x: pxToPercentNum(250, 'width'), y: pxToPercentNum(180, 'height') }, size: { width: pxToPercentNum(80, 'width'), height: pxToPercentNum(112, 'height') }, rotation: -5 }, // Made larger previously
  { id: 'tree2', src: '/tree.svg', position: { x: pxToPercentNum(600, 'width'), y: pxToPercentNum(120, 'height') }, size: { width: pxToPercentNum(60, 'width'), height: pxToPercentNum(80, 'height') } },
  { id: 'rock1', src: '/rock.svg', position: { x: pxToPercentNum(400, 'width'), y: pxToPercentNum(350, 'height') }, size: { width: pxToPercentNum(40, 'width'), height: pxToPercentNum(30, 'height') }, rotation: 15 },
  { id: 'rock2', src: '/rock.svg', position: { x: pxToPercentNum(950, 'width'), y: pxToPercentNum(200, 'height') }, size: { width: pxToPercentNum(35, 'width'), height: pxToPercentNum(25, 'height') } },
  { id: 'tree3', src: '/tree.svg', position: { x: pxToPercentNum(1050, 'width'), y: pxToPercentNum(480, 'height') }, size: { width: pxToPercentNum(55, 'width'), height: pxToPercentNum(75, 'height') }, rotation: 8 },
  { id: 'bush1', src: '/bush.svg', position: { x: pxToPercentNum(180, 'width'), y: pxToPercentNum(450, 'height') }, size: { width: pxToPercentNum(45, 'width'), height: pxToPercentNum(40, 'height') } },
  { id: 'rock3', src: '/rock.svg', position: { x: pxToPercentNum(700, 'width'), y: pxToPercentNum(600, 'height') }, size: { width: pxToPercentNum(50, 'width'), height: pxToPercentNum(35, 'height') }, rotation: -10 },
  { id: 'tree4', src: '/tree.svg', position: { x: pxToPercentNum(50, 'width'), y: pxToPercentNum(580, 'height') }, size: { width: pxToPercentNum(50, 'width'), height: pxToPercentNum(70, 'height') } },
  { id: 'bush2', src: '/bush.svg', position: { x: pxToPercentNum(880, 'width'), y: pxToPercentNum(350, 'height') }, size: { width: pxToPercentNum(40, 'width'), height: pxToPercentNum(35, 'height') }, rotation: 20 },
  { id: 'tree5', src: '/tree.svg', position: { x: pxToPercentNum(1000, 'width'), y: pxToPercentNum(300, 'height') }, size: { width: pxToPercentNum(50, 'width'), height: pxToPercentNum(70, 'height') }, rotation: 3 },

  // --- New Decorations (Spread out and Enlarged) ---
  { id: 'tree6', src: '/tree.svg', position: { x: pxToPercentNum(1450, 'width'), y: pxToPercentNum(150, 'height') }, size: { width: pxToPercentNum(85, 'width'), height: pxToPercentNum(115, 'height') }, rotation: 4 }, // Top Right Area - Larger
  { id: 'rock4', src: '/rock.svg', position: { x: pxToPercentNum(150, 'width'), y: pxToPercentNum(850, 'height') }, size: { width: pxToPercentNum(55, 'width'), height: pxToPercentNum(36, 'height') }, rotation: -8 }, // Bottom Left Area - Larger
  { id: 'bush3', src: '/bush.svg', position: { x: pxToPercentNum(1300, 'width'), y: pxToPercentNum(400, 'height') }, size: { width: pxToPercentNum(60, 'width'), height: pxToPercentNum(55, 'height') } }, // Mid-Right Area - Larger
  { id: 'tree7', src: '/tree.svg', position: { x: pxToPercentNum(1750, 'width'), y: pxToPercentNum(550, 'height') }, size: { width: pxToPercentNum(80, 'width'), height: pxToPercentNum(110, 'height') }, rotation: -3 }, // Far Right Area - Larger
  { id: 'rock5', src: '/rock.svg', position: { x: pxToPercentNum(550, 'width'), y: pxToPercentNum(900, 'height') }, size: { width: pxToPercentNum(72, 'width'), height: pxToPercentNum(48, 'height') }, rotation: 12 }, // Mid-Bottom Area - Larger
  { id: 'bush4', src: '/bush.svg', position: { x: pxToPercentNum(1600, 'width'), y: pxToPercentNum(800, 'height') }, size: { width: pxToPercentNum(48, 'width'), height: pxToPercentNum(42, 'height') }, rotation: -15 }, // Bottom Right Area - Larger
  { id: 'tree8', src: '/tree.svg', position: { x: pxToPercentNum(100, 'width'), y: pxToPercentNum(100, 'height') }, size: { width: pxToPercentNum(55, 'width'), height: pxToPercentNum(80, 'height') } }, // Top Left Area - Larger
  { id: 'rock6', src: '/rock.svg', position: { x: pxToPercentNum(750, 'width'), y: pxToPercentNum(850, 'height') }, size: { width: pxToPercentNum(36, 'width'), height: pxToPercentNum(24, 'height') } }, // Bottom Mid Area (small rock) - Larger
  { id: 'tree9', src: '/tree.svg', position: { x: pxToPercentNum(1400, 'width'), y: pxToPercentNum(950, 'height') }, size: { width: pxToPercentNum(66, 'width'), height: pxToPercentNum(90, 'height') }, rotation: 6 }, // Low Mid-Right Area - Larger
  { id: 'bush5', src: '/bush.svg', position: { x: pxToPercentNum(850, 'width'), y: pxToPercentNum(80, 'height') }, size: { width: pxToPercentNum(42, 'width'), height: pxToPercentNum(36, 'height') } }, // Top Center-Right Area (small bush) - Larger
  { id: 'rock7', src: '/rock.svg', position: { x: pxToPercentNum(1150, 'width'), y: pxToPercentNum(700, 'height') }, size: { width: pxToPercentNum(48, 'width'), height: pxToPercentNum(34, 'height') }, rotation: 25 }, // Mid-Right Lower Area - Larger
  { id: 'tree10', src: '/tree.svg', position: { x: pxToPercentNum(350, 'width'), y: pxToPercentNum(720, 'height') }, size: { width: pxToPercentNum(72, 'width'), height: pxToPercentNum(102, 'height') }, rotation: -7 }, // Lower Left-Mid Area - Larger
];

  // --- Position Calculation & Coordinate Conversion ---
  // (This function remains exactly the same as the previous correct version)
  function getAppElementsAndPositions() {
    if (!layoutContainerElement) return false;
    let changedOverall = false;
    const tolerance = 1.0;
    const containerRect = layoutContainerElement.getBoundingClientRect();
    if (containerRect.width === 0 || containerRect.height === 0) return false;
    const scaleX = designWidth / containerRect.width;
    const scaleY = designHeight / containerRect.height;

    apps.forEach(app => {
      // IMPORTANT: Assumes AppSelector renders the clickable element (button or div) with id={app.id}
      const element = document.getElementById(app.id);
      if (element) {
        const rect = element.getBoundingClientRect();
        const newLeftPx = rect.left - containerRect.left;
        const newTopPx = rect.top - containerRect.top;
        const currentWidthPx = rect.width;
        const currentHeightPx = rect.height;
        const newCenterXPx = newLeftPx + currentWidthPx / 2;
        // Adjust connection point Y based on your visual preference (e.g., 0.8 for bottom)
        const newCenterYPx = newTopPx + currentHeightPx * 0.8;

        const newSvgCenterX = newCenterXPx * scaleX;
        const newSvgCenterY = newCenterYPx * scaleY;

        if (!app.renderedPosition || Math.abs(app.renderedPosition.top - newTopPx) > 0.5 || Math.abs(app.renderedPosition.left - newLeftPx) > 0.5) {
           app.renderedPosition = { top: newTopPx, left: newLeftPx };
           app.widthPx = currentWidthPx;
           app.heightPx = currentHeightPx;
        }
        if (!app.centerPosition || Math.abs(app.centerPosition.x - newSvgCenterX) > tolerance || Math.abs(app.centerPosition.y - newSvgCenterY) > tolerance) {
           app.centerPosition = { x: newSvgCenterX, y: newSvgCenterY };
           changedOverall = true;
        }
        app.element = element;
      } else {
        // Warning might appear initially until AppSelector renders
        // console.warn(`Element with id ${app.id} not found during position check.`);
      }
    });

    if (changedOverall) {
      positionsCalculated = apps.every(app => app.centerPosition);
      apps = [...apps]; // Trigger reactivity
      // console.log('App SVG positions updated. All calculated:', positionsCalculated);
    }
    return changedOverall;
  }

  // --- MST Logic (distance, calculateMST) ---
  // (These functions remain exactly the same, using app.centerPosition)
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
     function find(appId: string): string { /* ... */ if (parent[appId] === appId) { return appId; } return parent[appId] = find(parent[appId]); }
     function union(appId1: string, appId2: string): boolean { /* ... */ const root1 = find(appId1); const root2 = find(appId2); if (root1 !== root2) { parent[root1] = root2; return true; } return false; }
     for (const edge of edges) {
       if (union(edge.app1.id, edge.app2.id)) {
         mst.push({ app1: edge.app1, app2: edge.app2 });
         if (mst.length === apps.length - 1) break;
       }
     }
     return mst;
   }

  // --- Curve Calculation (getCurvePathData) ---
  // (This function remains exactly the same, using app.centerPosition)
   function getCurvePathData(app1: App, app2: App, curveFactor = 0.2): string | null {
       if (!app1.centerPosition || !app2.centerPosition) return null;
       const x1 = app1.centerPosition.x; const y1 = app1.centerPosition.y;
       const x2 = app2.centerPosition.x; const y2 = app2.centerPosition.y;
       const midX = (x1 + x2) / 2; const midY = (y1 + y2) / 2;
       const dx = x2 - x1; const dy = y2 - y1;
       const len = Math.sqrt(dx * dx + dy * dy);
       if (len < 1) return `M ${x1} ${y1} L ${x2} ${y2}`;
       const perpX = -dy / len; const perpY = dx / len;
       const offsetAmount = Math.min(len * curveFactor, 60); // Max offset in viewBox units
       const controlX = midX + perpX * offsetAmount; const controlY = midY + perpY * offsetAmount;
       return `M ${x1} ${y1} Q ${controlX} ${controlY} ${x2} ${y2}`;
   }


  // --- Update Roads Logic ---
  // (This function remains exactly the same, relying on getAppElementsAndPositions)
   function updateRoads() {
       const positionsChangedSignificantly = getAppElementsAndPositions();
       if (positionsCalculated) {
           let needsMstRecalc = positionsChangedSignificantly || roadConnections.length === 0;
           let newConnections: RoadConnection[];
           const processConnection = (conn: { app1: App, app2: App } | RoadConnection, isUpdate = false): RoadConnection => {
               let shouldCurve = false;
               let pathData = (isUpdate && (conn as RoadConnection).shouldCurve && (conn as RoadConnection).pathData) ? (conn as RoadConnection).pathData : null;
               const currentApp1 = apps.find(a => a.id === conn.app1.id) || conn.app1;
               const currentApp2 = apps.find(a => a.id === conn.app2.id) || conn.app2;
               if (currentApp1.centerPosition && currentApp2.centerPosition) {
                   const x1 = currentApp1.centerPosition.x; const y1 = currentApp1.centerPosition.y;
                   const x2 = currentApp2.centerPosition.x; const y2 = currentApp2.centerPosition.y;
                   const dx = Math.abs(x2 - x1); const dy = Math.abs(y2 - y1);
                   const minDelta = 1; const straightnessThreshold = 0.25;
                   if (dx > minDelta || dy > minDelta) {
                       if (!(dx < minDelta || dy < minDelta)) {
                           const ratio = Math.min(dx, dy) / Math.max(dx, dy);
                           if (ratio >= straightnessThreshold) { shouldCurve = true; }
                       }
                   }
                   if (shouldCurve) {
                       if (!pathData || positionsChangedSignificantly) { pathData = getCurvePathData(currentApp1, currentApp2); }
                       if (!pathData) shouldCurve = false;
                   } else { pathData = null; }
               } else { shouldCurve = false; pathData = null; }
               return { app1: currentApp1, app2: currentApp2, shouldCurve: shouldCurve, pathData: pathData };
           }; // end processConnection
           if (needsMstRecalc || positionsChangedSignificantly) {
               if (needsMstRecalc) {
                   let mst = calculateMST();
                   newConnections = mst.map(conn => processConnection(conn, false));
               } else {
                   newConnections = roadConnections.map(conn => processConnection(conn, true));
               }
               roadConnections = newConnections;
           }
       } else { /* Positions not ready */ }
   } // end updateRoads


  // --- Lifecycle Hooks ---
  let resizeObserver: ResizeObserver | null = null;
  let initialUpdateDone = false;

  onMount(() => {
    const initialTimeout = setTimeout(() => {
      if (layoutContainerElement) {
        updateRoads(); // First calculation attempt
        initialUpdateDone = true;
      }
    }, 150); // Slightly longer delay just in case

    if (layoutContainerElement) {
        resizeObserver = new ResizeObserver(() => { requestAnimationFrame(updateRoads); });
        resizeObserver.observe(layoutContainerElement);
    }

    updateBgColor();
    window.addEventListener('resize', updateBgColor);

    return () => { // Cleanup
      clearTimeout(initialTimeout);
      if (resizeObserver && layoutContainerElement) resizeObserver.unobserve(layoutContainerElement);
      resizeObserver = null;
      window.removeEventListener('resize', updateBgColor);
    };
  });

  afterUpdate(() => {
    // Attempt initial update if mount failed but container exists now
    if (!initialUpdateDone && layoutContainerElement) {
        requestAnimationFrame(() => {
            updateRoads();
            initialUpdateDone = true;
        });
    }
    // Check if roads need update due to apps array changing (e.g. dynamic add/remove)
    // This is a simplistic check; more robust might involve comparing app IDs/positions
    if (initialUpdateDone && roadConnections.length !== apps.length -1 && apps.length > 1) {
       console.log("App count changed, triggering road update.");
       requestAnimationFrame(updateRoads);
    }
  });

  // --- Background color logic ---
  let windowWidth: number = 0;
  let bgColor: string = '#B3D9A1';
  const updateBgColor = () => {
      windowWidth = window.innerWidth;
      bgColor = windowWidth < 768 ? '#03020' : '#B3D9A1';
  };
  import LanguageDialog from '$lib/components/LangSelect.svelte'; // adjust path as needed
  let showDialog = false;
</script>
<LanguageDialog bind:show={showDialog} />

<!-- Main container -->
<div class="page-container" style="background-color: {bgColor};">

  {#if windowWidth < 768}
    <div class="mobile-message">
        <p>Please view on a larger screen for the interactive map.</p>
    </div>
  {:else}
    <!-- Scalable Layout Container -->
    <div class="layout-container" style="    max-width: {designWidth}px;
    aspect-ratio: {designWidth} / {designHeight};" bind:this={layoutContainerElement}>
      <!-- SVG Container -->
      <svg
        viewBox="0 0 {designWidth} {designHeight}"
        preserveAspectRatio="xMidYMid meet"
        class="road-svg"
      >
         <!-- Decorations -->
         <g class="decorations">
           {#each decorations as deco (deco.id)}
             <image
               href={deco.src}
               x={`${deco.position.x}%`} y={`${deco.position.y}%`}
               width={`${deco.size.width}%`} height={`${deco.size.height}%`}
               transform={deco.rotation ? `rotate(${deco.rotation} ${deco.position.x + deco.size.width / 2}% ${deco.position.y + deco.size.height / 2}%)` : ''}
             />
           {/each}
         </g>
         <!-- Roads -->
         <g class="road-casings">
            {#each roadConnections as conn (conn.app1.id + '-' + conn.app2.id + '-casing')} {#if conn.app1.centerPosition && conn.app2.centerPosition} {#if conn.shouldCurve && conn.pathData} <path d={conn.pathData} class="road-casing" /> {:else} <line x1={conn.app1.centerPosition.x} y1={conn.app1.centerPosition.y} x2={conn.app2.centerPosition.x} y2={conn.app2.centerPosition.y} class="road-casing" /> {/if} {/if} {/each}
          </g>
          <g class="road-lines">
            {#each roadConnections as conn (conn.app1.id + '-' + conn.app2.id + '-line')} {#if conn.app1.centerPosition && conn.app2.centerPosition} {#if conn.shouldCurve && conn.pathData} <path d={conn.pathData} class="road-line" /> {:else} <line x1={conn.app1.centerPosition.x} y1={conn.app1.centerPosition.y} x2={conn.app2.centerPosition.x} y2={conn.app2.centerPosition.y} class="road-line" /> {/if} {/if} {/each}
          </g>
          <g class="road-middle-lines">
             {#each roadConnections as conn (conn.app1.id + '-' + conn.app2.id + '-middle')} {#if conn.app1.centerPosition && conn.app2.centerPosition} {#if conn.shouldCurve && conn.pathData} <path d={conn.pathData} class="road-middle-line" /> {:else} <line x1={conn.app1.centerPosition.x} y1={conn.app1.centerPosition.y} x2={conn.app2.centerPosition.x} y2={conn.app2.centerPosition.y} class="road-middle-line" /> {/if} {/if} {/each}
          </g>
      </svg>

      <!-- App Icons Container (Overlay) -->
      
      <AppSelector {apps} {cards} />
    </div> <!-- End layout-container -->
    {/if}
    
  </div> <!-- End page-container -->
  <div class="apps-overlay">
     <!-- Render AppSelector directly inside the overlay -->
     <!-- It will position its icons absolutely within this div -->
     
    </div>
  
<style>
  .page-container {
    margin-top: -5.1rem;
    width: 100%;
    min-height: 104vh;
    position: relative;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .mobile-message { padding: 2rem; text-align: center; color: #eee; }

  .layout-container {
    position: relative;
    width: 95%;
    margin: auto;
    overflow: visible; /* Changed to visible incase icons slightly overlap edges */
  }

  .road-svg {
    display: block; position: absolute; top: 0; left: 0;
    width: 100%; height: 100%;
    pointer-events: none; z-index: 0;
  }

  .apps-overlay {
      position: absolute; top: 0; left: 0;
      width: 100%; height: 100%;
      pointer-events: none; /* Overlay doesn't block */
      z-index: 1; /* Above SVG, below popups */
      /* border: 1px solid blue; */ /* Debugging */
  }

  /* --- Global Styles for App Icons Rendered by AppSelector --- */
  /* Targets the class AppSelector should add to its icon buttons/divs */
 :global(.app-icon-wrapper) {
     position: absolute !important; /* MUST be absolute */
     z-index: 2; /* Above roads, below open app */
     pointer-events: auto; /* Icons are clickable */
     /* Center the icon horizontally, place connection point near bottom vertically */
     transform: translate(-50%, -80%);
     /* Define base size - AppSelector might override with inline styles if needed */
     width: 50px;
     height: 50px;
     cursor: pointer;
     transition: transform 0.2s ease-out;
     border-radius: 8px;
     /* background-color: rgba(255, 0, 0, 0.2); */ /* Debugging */
  }

  :global(.app-icon-wrapper:hover) {
      /* Keep the same translate, only scale */
      transform: translate(-50%, -80%) scale(1.15);
      /* box-shadow: 0 0 15px rgba(255, 255, 255, 0.7); */
  }

  :global(.app-icon-wrapper img) { /* Style the image inside */
      display: block;
      width: 100%;
      height: 100%;
      object-fit: contain;
  }

  /* --- Road & Decoration Styles (Remain the same) --- */
  .road-casing, .road-line, .road-middle-line { fill: none; stroke-linecap: round; stroke-linejoin: round; /* vector-effect: non-scaling-stroke; */ }
  line.road-middle-line, path.road-middle-line { stroke-linecap: butt; }
  .road-casing { stroke: #4a4a4a; stroke-width: 32; }
  .road-line { stroke: #6e6e6e; stroke-width: 28; }
  .road-middle-line { stroke: #ffffff; stroke-width: 4.5; stroke-dasharray: 10 10; }
  .decorations image { opacity: 0.95; pointer-events: none; }

  /* --- Styles for AppSelector's OPEN state (Full screen overlay) --- */
  /* These styles are now effectively controlled by AppSelector's internal styles */
  /* If AppSelector's styles are scoped, they won't conflict. If global, prefix them */
  /* Example if AppSelector styles were global: */
  /*
  :global(.app-selector-open-app) { ... }
  :global(.app-selector-app-content) { ... }
  :global(.app-selector-close-button) { ... }
  */

</style>