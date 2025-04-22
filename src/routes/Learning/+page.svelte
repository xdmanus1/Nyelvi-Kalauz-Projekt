<script lang="ts">
  // @ts-nocheck
  import AppSelector from '$lib/components/AppSelector.svelte';
  import LibApp from '$lib/components/Lib.svelte';
  import DogApp from '$lib/components/Shop.svelte'; // Assuming DogApp is actually Shop
  import ShopApp from '$lib/components/Shop.svelte';
  import { onMount, afterUpdate, onDestroy } from 'svelte';
  import { authStore } from '$lib/components/stores/AuthStore'; // Import store
  import LanguageDialog from '$lib/components/LangSelect.svelte';

  export let data; // Assuming data comes from a load function or prop
  const cards = data?.cards || [];

  // --- Reference Design Dimensions ---
  const designWidth = 1920; const designHeight = 1080;

  // --- Interfaces ---
  interface AppPosition { top: string; left: string; }
  interface AppRenderedPosition { top: number; left: number; }
  interface AppCenterPosition { x: number; y: number; }
  interface AppContent { title: string; description: string; component: any; }
  interface App { id: string; emoji: string; where: AppPosition; content: AppContent; renderedPosition?: AppRenderedPosition; centerPosition?: AppCenterPosition; element?: HTMLElement; widthPx?: number; heightPx?: number; }
  interface RoadConnection { app1: App; app2: App; shouldCurve?: boolean; pathData?: string; }
  interface Decoration { id: string; src: string; position: { x: number; y: number }; size: { width: number; height: number }; rotation?: number; }

  // --- Helper Functions ---
  const pxToPercent = (value: number, dimension: 'width' | 'height'): string => `${((value / (dimension === 'width' ? designWidth : designHeight)) * 100).toFixed(2)}%`;
  const pxToPercentNum = (value: number, dimension: 'width' | 'height'): number => (value / (dimension === 'width' ? designWidth : designHeight) * 100);

  // --- App Definitions ---
  let apps: App[] = [
     { id: 'library', emoji: "library-big.svg", where: { top: pxToPercent(380, 'height'), left: pxToPercent(300, 'width') }, content: { title: "Library", description: "Library", component: LibApp } },
     { id: 'fish', emoji: "/favicon.png", where: { top: pxToPercent(600, 'height'), left: pxToPercent(250, 'width') }, content: { title: "Fish (Placeholder)", description: "Desc", component: DogApp } }, // Changed title
     { id: 'shop', emoji: "/store.svg", where: { top: pxToPercent(900, 'height'), left: pxToPercent(1300, 'width') }, content: { title: "Shop", description: "Shop", component: ShopApp } },
     // Add other apps back if needed
  ];

  // --- Auth Store Subscription ---
  let user: import('@supabase/gotrue-js').User | null = null;
  let lastVisitedAppId: string | null = null; // <-- State to hold the ID from store
  const unsubscribeAuth = authStore.subscribe(({ user: currentUser, lastVisitedAppId: lvai }) => {
    user = currentUser;
    lastVisitedAppId = lvai; // <-- Update local state when store changes
    // console.log("Learning Page: Auth Store Update -> User:", !!user, "LastVisited:", lastVisitedAppId); // Debug log
  });
  // Unsubscribe when component is destroyed
  onDestroy(unsubscribeAuth);

  // --- State for Roads/Layout ---
  let roadConnections: RoadConnection[] = [];
  let positionsCalculated = false;
  let layoutContainerElement: HTMLElement | null = null;

  // --- Decorations ---
  let decorations: Decoration[] = [ /* ... same large list as before ... */
    { id: 'tree1', src: '/tree.svg', position: { x: pxToPercentNum(250, 'width'), y: pxToPercentNum(180, 'height') }, size: { width: pxToPercentNum(80, 'width'), height: pxToPercentNum(112, 'height') }, rotation: -5 }, { id: 'tree2', src: '/tree.svg', position: { x: pxToPercentNum(600, 'width'), y: pxToPercentNum(120, 'height') }, size: { width: pxToPercentNum(60, 'width'), height: pxToPercentNum(80, 'height') } }, { id: 'rock1', src: '/rock.svg', position: { x: pxToPercentNum(400, 'width'), y: pxToPercentNum(350, 'height') }, size: { width: pxToPercentNum(40, 'width'), height: pxToPercentNum(30, 'height') }, rotation: 15 }, { id: 'rock2', src: '/rock.svg', position: { x: pxToPercentNum(950, 'width'), y: pxToPercentNum(200, 'height') }, size: { width: pxToPercentNum(35, 'width'), height: pxToPercentNum(25, 'height') } }, { id: 'tree3', src: '/tree.svg', position: { x: pxToPercentNum(1050, 'width'), y: pxToPercentNum(480, 'height') }, size: { width: pxToPercentNum(55, 'width'), height: pxToPercentNum(75, 'height') }, rotation: 8 }, { id: 'bush1', src: '/bush.svg', position: { x: pxToPercentNum(180, 'width'), y: pxToPercentNum(450, 'height') }, size: { width: pxToPercentNum(45, 'width'), height: pxToPercentNum(40, 'height') } }, { id: 'rock3', src: '/rock.svg', position: { x: pxToPercentNum(700, 'width'), y: pxToPercentNum(600, 'height') }, size: { width: pxToPercentNum(50, 'width'), height: pxToPercentNum(35, 'height') }, rotation: -10 }, { id: 'tree4', src: '/tree.svg', position: { x: pxToPercentNum(50, 'width'), y: pxToPercentNum(580, 'height') }, size: { width: pxToPercentNum(50, 'width'), height: pxToPercentNum(70, 'height') } }, { id: 'bush2', src: '/bush.svg', position: { x: pxToPercentNum(880, 'width'), y: pxToPercentNum(350, 'height') }, size: { width: pxToPercentNum(40, 'width'), height: pxToPercentNum(35, 'height') }, rotation: 20 }, { id: 'tree5', src: '/tree.svg', position: { x: pxToPercentNum(1000, 'width'), y: pxToPercentNum(300, 'height') }, size: { width: pxToPercentNum(50, 'width'), height: pxToPercentNum(70, 'height') }, rotation: 3 }, { id: 'tree6', src: '/tree.svg', position: { x: pxToPercentNum(1450, 'width'), y: pxToPercentNum(150, 'height') }, size: { width: pxToPercentNum(85, 'width'), height: pxToPercentNum(115, 'height') }, rotation: 4 }, { id: 'rock4', src: '/rock.svg', position: { x: pxToPercentNum(150, 'width'), y: pxToPercentNum(850, 'height') }, size: { width: pxToPercentNum(55, 'width'), height: pxToPercentNum(36, 'height') }, rotation: -8 }, { id: 'bush3', src: '/bush.svg', position: { x: pxToPercentNum(1300, 'width'), y: pxToPercentNum(400, 'height') }, size: { width: pxToPercentNum(60, 'width'), height: pxToPercentNum(55, 'height') } }, { id: 'tree7', src: '/tree.svg', position: { x: pxToPercentNum(1750, 'width'), y: pxToPercentNum(550, 'height') }, size: { width: pxToPercentNum(80, 'width'), height: pxToPercentNum(110, 'height') }, rotation: -3 }, { id: 'rock5', src: '/rock.svg', position: { x: pxToPercentNum(550, 'width'), y: pxToPercentNum(900, 'height') }, size: { width: pxToPercentNum(72, 'width'), height: pxToPercentNum(48, 'height') }, rotation: 12 }, { id: 'bush4', src: '/bush.svg', position: { x: pxToPercentNum(1600, 'width'), y: pxToPercentNum(800, 'height') }, size: { width: pxToPercentNum(48, 'width'), height: pxToPercentNum(42, 'height') }, rotation: -15 }, { id: 'tree8', src: '/tree.svg', position: { x: pxToPercentNum(100, 'width'), y: pxToPercentNum(100, 'height') }, size: { width: pxToPercentNum(55, 'width'), height: pxToPercentNum(80, 'height') } }, { id: 'rock6', src: '/rock.svg', position: { x: pxToPercentNum(750, 'width'), y: pxToPercentNum(850, 'height') }, size: { width: pxToPercentNum(36, 'width'), height: pxToPercentNum(24, 'height') } }, { id: 'tree9', src: '/tree.svg', position: { x: pxToPercentNum(1400, 'width'), y: pxToPercentNum(950, 'height') }, size: { width: pxToPercentNum(66, 'width'), height: pxToPercentNum(90, 'height') }, rotation: 6 }, { id: 'bush5', src: '/bush.svg', position: { x: pxToPercentNum(850, 'width'), y: pxToPercentNum(80, 'height') }, size: { width: pxToPercentNum(42, 'width'), height: pxToPercentNum(36, 'height') } }, { id: 'rock7', src: '/rock.svg', position: { x: pxToPercentNum(1150, 'width'), y: pxToPercentNum(700, 'height') }, size: { width: pxToPercentNum(48, 'width'), height: pxToPercentNum(34, 'height') }, rotation: 25 }, { id: 'tree10', src: '/tree.svg', position: { x: pxToPercentNum(350, 'width'), y: pxToPercentNum(720, 'height') }, size: { width: pxToPercentNum(72, 'width'), height: pxToPercentNum(102, 'height') }, rotation: -7 },
  ];

  // --- Position/Road Calculation Functions ---
  function getAppElementsAndPositions() { /* ... same ... */
      if (!layoutContainerElement) return false; let changedOverall = false; const tolerance = 1.0; const containerRect = layoutContainerElement.getBoundingClientRect(); if (containerRect.width === 0 || containerRect.height === 0) return false; const scaleX = designWidth / containerRect.width; const scaleY = designHeight / containerRect.height; apps.forEach(app => { const element = document.getElementById(app.id); if (element) { const rect = element.getBoundingClientRect(); const newLeftPx = rect.left - containerRect.left; const newTopPx = rect.top - containerRect.top; const currentWidthPx = rect.width; const currentHeightPx = rect.height; const newCenterXPx = newLeftPx + currentWidthPx / 2; const newCenterYPx = newTopPx + currentHeightPx * 0.8; const newSvgCenterX = newCenterXPx * scaleX; const newSvgCenterY = newCenterYPx * scaleY; if (!app.renderedPosition || Math.abs(app.renderedPosition.top - newTopPx) > 0.5 || Math.abs(app.renderedPosition.left - newLeftPx) > 0.5) { app.renderedPosition = { top: newTopPx, left: newLeftPx }; app.widthPx = currentWidthPx; app.heightPx = currentHeightPx; } if (!app.centerPosition || Math.abs(app.centerPosition.x - newSvgCenterX) > tolerance || Math.abs(app.centerPosition.y - newSvgCenterY) > tolerance) { app.centerPosition = { x: newSvgCenterX, y: newSvgCenterY }; changedOverall = true; } app.element = element; } }); if (changedOverall) { positionsCalculated = apps.every(app => app.centerPosition); apps = [...apps]; } return changedOverall;
  }
  function distance(app1: App, app2: App): number { /* ... same ... */
      if (!app1.centerPosition || !app2.centerPosition) return Infinity; const dx = app1.centerPosition.x - app2.centerPosition.x; const dy = app1.centerPosition.y - app2.centerPosition.y; return Math.sqrt(dx * dx + dy * dy);
  }
  function calculateMST(): { app1: App; app2: App }[] { /* ... same ... */
      if (apps.length < 2) return []; const edges: { app1: App; app2: App; dist: number }[] = []; for (let i = 0; i < apps.length; i++) { for (let j = i + 1; j < apps.length; j++) { const dist = distance(apps[i], apps[j]); if (dist !== Infinity) { edges.push({ app1: apps[i], app2: apps[j], dist }); } } } edges.sort((a, b) => a.dist - b.dist); const mst: { app1: App; app2: App }[] = []; const parent: { [key: string]: string } = {}; apps.forEach(app => { parent[app.id] = app.id; }); function find(appId: string): string { if (parent[appId] === appId) { return appId; } return parent[appId] = find(parent[appId]); } function union(appId1: string, appId2: string): boolean { const root1 = find(appId1); const root2 = find(appId2); if (root1 !== root2) { parent[root1] = root2; return true; } return false; } for (const edge of edges) { if (union(edge.app1.id, edge.app2.id)) { mst.push({ app1: edge.app1, app2: edge.app2 }); if (mst.length === apps.length - 1) break; } } return mst;
  }
  function getCurvePathData(app1: App, app2: App, curveFactor = 0.2): string | null { /* ... same ... */
      if (!app1.centerPosition || !app2.centerPosition) return null; const x1 = app1.centerPosition.x; const y1 = app1.centerPosition.y; const x2 = app2.centerPosition.x; const y2 = app2.centerPosition.y; const midX = (x1 + x2) / 2; const midY = (y1 + y2) / 2; const dx = x2 - x1; const dy = y2 - y1; const len = Math.sqrt(dx * dx + dy * dy); if (len < 1) return `M ${x1} ${y1} L ${x2} ${y2}`; const perpX = -dy / len; const perpY = dx / len; const offsetAmount = Math.min(len * curveFactor, 60); const controlX = midX + perpX * offsetAmount; const controlY = midY + perpY * offsetAmount; return `M ${x1} ${y1} Q ${controlX} ${controlY} ${x2} ${y2}`;
  }
  function updateRoads() { /* ... same ... */
      const positionsChangedSignificantly = getAppElementsAndPositions(); if (positionsCalculated) { let needsMstRecalc = positionsChangedSignificantly || roadConnections.length === 0; let newConnections: RoadConnection[]; const processConnection = (conn: { app1: App, app2: App } | RoadConnection, isUpdate = false): RoadConnection => { let shouldCurve = false; let pathData = (isUpdate && (conn as RoadConnection).shouldCurve && (conn as RoadConnection).pathData) ? (conn as RoadConnection).pathData : null; const currentApp1 = apps.find(a => a.id === conn.app1.id) || conn.app1; const currentApp2 = apps.find(a => a.id === conn.app2.id) || conn.app2; if (currentApp1.centerPosition && currentApp2.centerPosition) { const x1 = currentApp1.centerPosition.x; const y1 = currentApp1.centerPosition.y; const x2 = currentApp2.centerPosition.x; const y2 = currentApp2.centerPosition.y; const dx = Math.abs(x2 - x1); const dy = Math.abs(y2 - y1); const minDelta = 1; const straightnessThreshold = 0.25; if (dx > minDelta || dy > minDelta) { if (!(dx < minDelta || dy < minDelta)) { const ratio = Math.min(dx, dy) / Math.max(dx, dy); if (ratio >= straightnessThreshold) { shouldCurve = true; } } } if (shouldCurve) { if (!pathData || positionsChangedSignificantly) { pathData = getCurvePathData(currentApp1, currentApp2); } if (!pathData) shouldCurve = false; } else { pathData = null; } } else { shouldCurve = false; pathData = null; } return { app1: currentApp1, app2: currentApp2, shouldCurve: shouldCurve, pathData: pathData }; }; if (needsMstRecalc || positionsChangedSignificantly) { if (needsMstRecalc) { let mst = calculateMST(); newConnections = mst.map(conn => processConnection(conn, false)); } else { newConnections = roadConnections.map(conn => processConnection(conn, true)); } roadConnections = newConnections; } }
  }

  // --- Lifecycle Hooks ---
  let resizeObserver: ResizeObserver | null = null;
  let initialUpdateDone = false;

  onMount(() => {
    const initialTimeout = setTimeout(() => { if (layoutContainerElement) { updateRoads(); initialUpdateDone = true; } }, 150);
    if (layoutContainerElement) { resizeObserver = new ResizeObserver(() => { requestAnimationFrame(updateRoads); }); resizeObserver.observe(layoutContainerElement); }
    updateBgColor(); window.addEventListener('resize', updateBgColor);
    return () => { clearTimeout(initialTimeout); if (resizeObserver && layoutContainerElement) resizeObserver.unobserve(layoutContainerElement); resizeObserver = null; window.removeEventListener('resize', updateBgColor); /* Unsubscribe handled by onDestroy above */ };
  });
  afterUpdate(() => { if (!initialUpdateDone && layoutContainerElement) { requestAnimationFrame(() => { updateRoads(); initialUpdateDone = true; }); } if (initialUpdateDone && roadConnections.length !== apps.length -1 && apps.length > 1) { requestAnimationFrame(updateRoads); } });

  // --- Background color ---
  let windowWidth: number = 0;
  let bgColor: string = '#B3D9A1';
  const updateBgColor = () => { windowWidth = window.innerWidth; bgColor = windowWidth < 768 ? '#03020' : '#B3D9A1'; };
  let showDialog = false;
</script>

<!-- Components -->
<LanguageDialog bind:show={showDialog} />

<!-- Page Structure -->
<div class="page-container" style="background-color: {bgColor};">
  {#if windowWidth < 768}
    <div class="mobile-message"> <p>Please view on a larger screen for the interactive map.</p> </div>
  {:else}
    <div class="layout-container" style="max-width: {designWidth}px; aspect-ratio: {designWidth} / {designHeight};" bind:this={layoutContainerElement}>
      <!-- SVG for Roads and Decorations -->
      <svg viewBox="0 0 {designWidth} {designHeight}" preserveAspectRatio="xMidYMid meet" class="road-svg">
        <g class="decorations"> {#each decorations as deco (deco.id)} <image href={deco.src} x={`${deco.position.x}%`} y={`${deco.position.y}%`} width={`${deco.size.width}%`} height={`${deco.size.height}%`} transform={deco.rotation ? `rotate(${deco.rotation} ${deco.position.x + deco.size.width / 2}% ${deco.position.y + deco.size.height / 2}%)` : ''} /> {/each} </g>
        <g class="road-casings"> {#each roadConnections as conn (conn.app1.id + '-' + conn.app2.id + '-casing')} {#if conn.app1.centerPosition && conn.app2.centerPosition} {#if conn.shouldCurve && conn.pathData} <path d={conn.pathData} class="road-casing" /> {:else} <line x1={conn.app1.centerPosition.x} y1={conn.app1.centerPosition.y} x2={conn.app2.centerPosition.x} y2={conn.app2.centerPosition.y} class="road-casing" /> {/if} {/if} {/each} </g>
        <g class="road-lines"> {#each roadConnections as conn (conn.app1.id + '-' + conn.app2.id + '-line')} {#if conn.app1.centerPosition && conn.app2.centerPosition} {#if conn.shouldCurve && conn.pathData} <path d={conn.pathData} class="road-line" /> {:else} <line x1={conn.app1.centerPosition.x} y1={conn.app1.centerPosition.y} x2={conn.app2.centerPosition.x} y2={conn.app2.centerPosition.y} class="road-line" /> {/if} {/if} {/each} </g>
        <g class="road-middle-lines"> {#each roadConnections as conn (conn.app1.id + '-' + conn.app2.id + '-middle')} {#if conn.app1.centerPosition && conn.app2.centerPosition} {#if conn.shouldCurve && conn.pathData} <path d={conn.pathData} class="road-middle-line" /> {:else} <line x1={conn.app1.centerPosition.x} y1={conn.app1.centerPosition.y} x2={conn.app2.centerPosition.x} y2={conn.app2.centerPosition.y} class="road-middle-line" /> {/if} {/if} {/each} </g>
      </svg>

      <!-- App Selector Component (Handles Icons and Open App View) -->
      <!-- Pass the last visited app ID from the store down -->
      <AppSelector {apps} {cards} initialAppId={lastVisitedAppId} />

    </div>
  {/if}
</div>

<style>
  /* ... All styles remain the same as the previous version ... */
  .page-container { margin-top: -5.1rem; width: 100%; min-height: 104vh; position: relative; overflow: hidden; display: flex; justify-content: center; align-items: center; }
  .mobile-message { padding: 2rem; text-align: center; color: #eee; }
  .layout-container { position: relative; width: 95%; margin: auto; overflow: visible; }
  .road-svg { display: block; position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 0; }
  /* Removed .apps-overlay as AppSelector handles its own container now */
  .road-casing, .road-line, .road-middle-line { fill: none; stroke-linecap: round; stroke-linejoin: round; }
  line.road-middle-line, path.road-middle-line { stroke-linecap: butt; }
  .road-casing { stroke: #4a4a4a; stroke-width: 32; }
  .road-line { stroke: #6e6e6e; stroke-width: 28; }
  .road-middle-line { stroke: #ffffff; stroke-width: 4.5; stroke-dasharray: 10 10; }
  .decorations image { opacity: 0.95; pointer-events: none; }
  /* Global styles for app icons are handled by AppSelector's <style> tag now */
</style>