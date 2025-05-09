<script lang="ts">
  // @ts-nocheck - Keep if necessary, but try to resolve type issues if possible
  import AppSelector from '$lib/components/AppSelector.svelte';
  // Import actual app components
  import LibApp from '$lib/components/Lib.svelte';
  import MusApp from '$lib/components/Museum.svelte';
  import ShopApp from '$lib/components/Shop.svelte';
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
    import { toast } from "svelte-sonner";
  // Add other app component imports here if used (e.g., DogApp, BirdApp)
  // import DogApp from '$lib/components/DogApp.svelte';

  import { onMount, afterUpdate, onDestroy } from 'svelte';
  import { authStore } from '$lib/components/stores/AuthStore'; // Ensure correct path
  import { page } from '$app/stores';
  import LanguageDialog from '$lib/components/LangSelect.svelte'; // Adjust path if needed

  export let data;
  const cards = data?.cards || [];

  // --- Reference Design Dimensions ---
  const designWidth = 1920;
  const designHeight = 1080;

  // --- Interfaces ---
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

  // --- App Definitions ---
  let apps: App[] = [
     // Example apps - replace with your actual app definitions
     // { id: 'dog', emoji: "/dog-icon.svg", where: { top: pxToPercent(180, 'height'), left: pxToPercent(480, 'width') }, content: { title: "Dog App", description: "Desc", component: DogApp } },
     { id: 'library', emoji: "/library-big.svg", where: { top: pxToPercent(380, 'height'), left: pxToPercent(300, 'width') }, content: { title: "Library", description: "Library", component: LibApp } },
     { id: 'museum', emoji: "/landmark.svg", where: { top: pxToPercent(600, 'height'), left: pxToPercent(250, 'width') }, content: { title: "Museum", description: "Museum", component: MusApp } },
     { id: 'shop', emoji: "/store.svg", where: { top: pxToPercent(900, 'height'), left: pxToPercent(1300, 'width') }, content: { title: "Shop", description: "Shop", component: ShopApp } },
     // Add all your other apps here
  ];

  // --- Auth Store ---
  let user: import('@supabase/gotrue-js').User | null = null;
  authStore.subscribe(({ user: currentUser }) => { user = currentUser; });

  // --- State ---
  let roadConnections: RoadConnection[] = [];
  let positionsCalculated = false;
  let layoutContainerElement: HTMLElement | null = null;
  let appIdFromUrl: string | null = null; // To hold the app ID from the query param

  // --- Decorations ---
  let decorations: Decoration[] = [
    // --- Your full list of decorations ---
    { id: 'tree1', src: '/tree.svg', position: { x: pxToPercentNum(250, 'width'), y: pxToPercentNum(180, 'height') }, size: { width: pxToPercentNum(80, 'width'), height: pxToPercentNum(112, 'height') }, rotation: -5 },
    { id: 'tree2', src: '/tree.svg', position: { x: pxToPercentNum(600, 'width'), y: pxToPercentNum(120, 'height') }, size: { width: pxToPercentNum(60, 'width'), height: pxToPercentNum(80, 'height') } },
    { id: 'rock1', src: '/rock.svg', position: { x: pxToPercentNum(400, 'width'), y: pxToPercentNum(350, 'height') }, size: { width: pxToPercentNum(40, 'width'), height: pxToPercentNum(30, 'height') }, rotation: 15 },
    { id: 'rock2', src: '/rock.svg', position: { x: pxToPercentNum(950, 'width'), y: pxToPercentNum(200, 'height') }, size: { width: pxToPercentNum(35, 'width'), height: pxToPercentNum(25, 'height') } },
    { id: 'tree3', src: '/tree.svg', position: { x: pxToPercentNum(1050, 'width'), y: pxToPercentNum(480, 'height') }, size: { width: pxToPercentNum(55, 'width'), height: pxToPercentNum(75, 'height') }, rotation: 8 },
    { id: 'bush1', src: '/bush.svg', position: { x: pxToPercentNum(180, 'width'), y: pxToPercentNum(450, 'height') }, size: { width: pxToPercentNum(45, 'width'), height: pxToPercentNum(40, 'height') } },
    { id: 'rock3', src: '/rock.svg', position: { x: pxToPercentNum(700, 'width'), y: pxToPercentNum(600, 'height') }, size: { width: pxToPercentNum(50, 'width'), height: pxToPercentNum(35, 'height') }, rotation: -10 },
    { id: 'tree4', src: '/tree.svg', position: { x: pxToPercentNum(50, 'width'), y: pxToPercentNum(580, 'height') }, size: { width: pxToPercentNum(50, 'width'), height: pxToPercentNum(70, 'height') } },
    { id: 'bush2', src: '/bush.svg', position: { x: pxToPercentNum(880, 'width'), y: pxToPercentNum(350, 'height') }, size: { width: pxToPercentNum(40, 'width'), height: pxToPercentNum(35, 'height') }, rotation: 20 },
    { id: 'tree5', src: '/tree.svg', position: { x: pxToPercentNum(1000, 'width'), y: pxToPercentNum(300, 'height') }, size: { width: pxToPercentNum(50, 'width'), height: pxToPercentNum(70, 'height') }, rotation: 3 },
    { id: 'tree6', src: '/tree.svg', position: { x: pxToPercentNum(1450, 'width'), y: pxToPercentNum(150, 'height') }, size: { width: pxToPercentNum(85, 'width'), height: pxToPercentNum(115, 'height') }, rotation: 4 },
    { id: 'rock4', src: '/rock.svg', position: { x: pxToPercentNum(150, 'width'), y: pxToPercentNum(850, 'height') }, size: { width: pxToPercentNum(55, 'width'), height: pxToPercentNum(36, 'height') }, rotation: -8 },
    { id: 'bush3', src: '/bush.svg', position: { x: pxToPercentNum(1300, 'width'), y: pxToPercentNum(400, 'height') }, size: { width: pxToPercentNum(60, 'width'), height: pxToPercentNum(55, 'height') } },
    { id: 'tree7', src: '/tree.svg', position: { x: pxToPercentNum(1750, 'width'), y: pxToPercentNum(550, 'height') }, size: { width: pxToPercentNum(80, 'width'), height: pxToPercentNum(110, 'height') }, rotation: -3 },
    { id: 'rock5', src: '/rock.svg', position: { x: pxToPercentNum(550, 'width'), y: pxToPercentNum(900, 'height') }, size: { width: pxToPercentNum(72, 'width'), height: pxToPercentNum(48, 'height') }, rotation: 12 },
    { id: 'bush4', src: '/bush.svg', position: { x: pxToPercentNum(1600, 'width'), y: pxToPercentNum(800, 'height') }, size: { width: pxToPercentNum(48, 'width'), height: pxToPercentNum(42, 'height') }, rotation: -15 },
    { id: 'tree8', src: '/tree.svg', position: { x: pxToPercentNum(100, 'width'), y: pxToPercentNum(100, 'height') }, size: { width: pxToPercentNum(55, 'width'), height: pxToPercentNum(80, 'height') } },
    { id: 'rock6', src: '/rock.svg', position: { x: pxToPercentNum(750, 'width'), y: pxToPercentNum(850, 'height') }, size: { width: pxToPercentNum(36, 'width'), height: pxToPercentNum(24, 'height') } },
    { id: 'tree9', src: '/tree.svg', position: { x: pxToPercentNum(1400, 'width'), y: pxToPercentNum(950, 'height') }, size: { width: pxToPercentNum(66, 'width'), height: pxToPercentNum(90, 'height') }, rotation: 6 },
    { id: 'bush5', src: '/bush.svg', position: { x: pxToPercentNum(850, 'width'), y: pxToPercentNum(80, 'height') }, size: { width: pxToPercentNum(42, 'width'), height: pxToPercentNum(36, 'height') } },
    { id: 'rock7', src: '/rock.svg', position: { x: pxToPercentNum(1150, 'width'), y: pxToPercentNum(700, 'height') }, size: { width: pxToPercentNum(48, 'width'), height: pxToPercentNum(34, 'height') }, rotation: 25 },
    { id: 'tree10', src: '/tree.svg', position: { x: pxToPercentNum(350, 'width'), y: pxToPercentNum(720, 'height') }, size: { width: pxToPercentNum(72, 'width'), height: pxToPercentNum(102, 'height') }, rotation: -7 },
  ];

  // --- Position Calculation & Coordinate Conversion ---
  function getAppElementsAndPositions() {
    if (!layoutContainerElement) return false;
    let changedOverall = false;
    const tolerance = 1.0; // SVG units tolerance for change detection
    const containerRect = layoutContainerElement.getBoundingClientRect();
    // Avoid calculations if container has no dimensions (can happen initially)
    if (containerRect.width === 0 || containerRect.height === 0) return false;

    const scaleX = designWidth / containerRect.width;
    const scaleY = designHeight / containerRect.height;

    apps.forEach(app => {
      // Target the clickable element rendered by AppSelector (button with id={app.id})
      const element = document.getElementById(app.id);
      if (element) {
        const rect = element.getBoundingClientRect();
        // Calculate position relative to the layout container
        const newLeftPx = rect.left - containerRect.left;
        const newTopPx = rect.top - containerRect.top;
        const currentWidthPx = rect.width;
        const currentHeightPx = rect.height;

        // Center point in pixels relative to container
        const newCenterXPx = newLeftPx + currentWidthPx / 2;
        // Adjust connection point Y (e.g., 80% down from top)
        const newCenterYPx = newTopPx + currentHeightPx * 0.8;

        // Convert pixel center to SVG viewBox coordinates
        const newSvgCenterX = newCenterXPx * scaleX;
        const newSvgCenterY = newCenterYPx * scaleY;

        // Update rendered pixel position if significantly changed
        if (!app.renderedPosition || Math.abs(app.renderedPosition.top - newTopPx) > 0.5 || Math.abs(app.renderedPosition.left - newLeftPx) > 0.5) {
           app.renderedPosition = { top: newTopPx, left: newLeftPx };
           app.widthPx = currentWidthPx;
           app.heightPx = currentHeightPx;
           // Note: No need to mark changedOverall here, only SVG position matters for roads
        }
        // Update SVG center position if significantly changed
        if (!app.centerPosition || Math.abs(app.centerPosition.x - newSvgCenterX) > tolerance || Math.abs(app.centerPosition.y - newSvgCenterY) > tolerance) {
           app.centerPosition = { x: newSvgCenterX, y: newSvgCenterY };
           changedOverall = true; // Mark change if SVG position updated
        }
        app.element = element; // Store reference if needed later
      } else {
        // This might log warnings initially until AppSelector renders elements
        // console.warn(`Element with id ${app.id} not found during position check.`);
      }
    });

    if (changedOverall) {
      positionsCalculated = apps.every(app => !!app.centerPosition); // Check if ALL apps have positions
      apps = [...apps]; // Trigger Svelte reactivity by creating a new array reference
      // console.log('App SVG positions updated. All calculated:', positionsCalculated);
    }
    return changedOverall;
  }

  // --- MST Logic (distance, calculateMST) ---
   function distance(app1: App, app2: App): number {
     if (!app1.centerPosition || !app2.centerPosition) return Infinity; // Cannot calculate if positions are missing
     const dx = app1.centerPosition.x - app2.centerPosition.x;
     const dy = app1.centerPosition.y - app2.centerPosition.y;
     return Math.sqrt(dx * dx + dy * dy);
   }

   function calculateMST(): { app1: App; app2: App }[] {
     if (!apps || apps.length < 2) return [];

     const validApps = apps.filter(app => !!app.centerPosition); // Only consider apps with calculated positions
     if (validApps.length < 2) return [];

     const edges: { app1: App; app2: App; dist: number }[] = [];
     for (let i = 0; i < validApps.length; i++) {
       for (let j = i + 1; j < validApps.length; j++) {
         const dist = distance(validApps[i], validApps[j]);
         if (dist !== Infinity) {
             edges.push({ app1: validApps[i], app2: validApps[j], dist });
         }
       }
     }

     edges.sort((a, b) => a.dist - b.dist); // Sort edges by distance

     const mst: { app1: App; app2: App }[] = []; // Minimum Spanning Tree edges
     const parent: { [key: string]: string } = {}; // For Union-Find algorithm

     // Initialize parent of each node to itself
     validApps.forEach(app => { parent[app.id] = app.id; });

     // Find the root parent of a node (with path compression)
     function find(appId: string): string {
         if (parent[appId] === appId) {
             return appId;
         }
         // Path compression: set parent directly to the root
         return parent[appId] = find(parent[appId]);
     }

     // Union two sets (returns true if union happened, false if already in same set)
     function union(appId1: string, appId2: string): boolean {
         const root1 = find(appId1);
         const root2 = find(appId2);
         if (root1 !== root2) {
             parent[root1] = root2; // Merge sets by making one root parent of the other
             return true;
         }
         return false;
     }

     // Kruskal's algorithm: Add edges in increasing order of weight if they connect different components
     for (const edge of edges) {
       if (union(edge.app1.id, edge.app2.id)) {
         mst.push({ app1: edge.app1, app2: edge.app2 });
         // Stop when we have (N-1) edges for N nodes
         if (mst.length === validApps.length - 1) break;
       }
     }
     return mst;
   }

  // --- Curve Calculation (getCurvePathData) ---
   function getCurvePathData(app1: App, app2: App, curveFactor = 0.2): string | null {
       if (!app1.centerPosition || !app2.centerPosition) return null; // Need positions

       const x1 = app1.centerPosition.x; const y1 = app1.centerPosition.y;
       const x2 = app2.centerPosition.x; const y2 = app2.centerPosition.y;

       const midX = (x1 + x2) / 2; const midY = (y1 + y2) / 2;
       const dx = x2 - x1; const dy = y2 - y1;
       const len = Math.sqrt(dx * dx + dy * dy);

       // If points are too close, draw a straight line
       if (len < 1) return `M ${x1} ${y1} L ${x2} ${y2}`;

       // Calculate perpendicular vector (normalized)
       const perpX = -dy / len; const perpY = dx / len;

       // Calculate control point offset (proportional to length, but capped)
       const maxOffset = 60; // Max curve offset in SVG units
       const offsetAmount = Math.min(len * curveFactor, maxOffset);

       // Calculate control point coordinates
       const controlX = midX + perpX * offsetAmount;
       const controlY = midY + perpY * offsetAmount;

       // Return SVG path data for quadratic Bezier curve
       return `M ${x1} ${y1} Q ${controlX} ${controlY} ${x2} ${y2}`;
   }

  // --- Update Roads Logic ---
   function updateRoads() {
       // Ensure elements are found and positions calculated first
       const positionsChangedSignificantly = getAppElementsAndPositions();

       if (positionsCalculated) { // Only proceed if all app positions are known
           // Determine if MST needs recalculation (first time, or if positions changed)
           let needsMstRecalc = positionsChangedSignificantly || roadConnections.length === 0 || roadConnections.length !== apps.filter(a => !!a.centerPosition).length - 1;

           let newConnections: RoadConnection[];

           // Helper to process a connection (either new or existing)
           const processConnection = (connInput: { app1: App, app2: App } | RoadConnection, isUpdate = false): RoadConnection => {
               let conn: RoadConnection = isUpdate ? (connInput as RoadConnection) : { app1: connInput.app1, app2: connInput.app2 };
               let shouldCurve = false;
               let pathData: string | null = conn.shouldCurve && conn.pathData && isUpdate ? conn.pathData : null; // Keep existing path if just updating curve status

               // Get the potentially updated app objects from the main 'apps' array
               const currentApp1 = apps.find(a => a.id === conn.app1.id) || conn.app1;
               const currentApp2 = apps.find(a => a.id === conn.app2.id) || conn.app2;

               // Calculate path data only if positions exist
               if (currentApp1.centerPosition && currentApp2.centerPosition) {
                   const x1 = currentApp1.centerPosition.x; const y1 = currentApp1.centerPosition.y;
                   const x2 = currentApp2.centerPosition.x; const y2 = currentApp2.centerPosition.y;

                   const dx = Math.abs(x2 - x1);
                   const dy = Math.abs(y2 - y1);

                   // Thresholds for deciding to curve vs. draw straight line
                   const minDelta = 1; // Minimum difference to consider curving
                   const straightnessThreshold = 0.25; // Ratio of min(dx, dy) / max(dx, dy)

                   // Decide if it should curve (not perfectly horizontal or vertical)
                   if (dx > minDelta || dy > minDelta) { // Avoid tiny lines
                       if (!(dx < minDelta || dy < minDelta)) { // Neither strictly horizontal nor vertical
                           const ratio = Math.min(dx, dy) / Math.max(dx, dy);
                           if (ratio >= straightnessThreshold) {
                               shouldCurve = true;
                           }
                       }
                   }

                   // Calculate path data if curving is needed (or if positions changed significantly)
                   if (shouldCurve) {
                       // Recalculate path if needed (new, positions changed, or no path exists)
                       if (!pathData || positionsChangedSignificantly || !isUpdate) {
                           pathData = getCurvePathData(currentApp1, currentApp2);
                           if (!pathData) shouldCurve = false; // Fallback if curve calculation fails
                       }
                   } else {
                       pathData = null; // Straight line, no 'd' attribute needed for <line>
                   }
               } else {
                   // Cannot draw if positions are missing
                   shouldCurve = false;
                   pathData = null;
               }
               return { app1: currentApp1, app2: currentApp2, shouldCurve: shouldCurve, pathData: pathData };
           }; // end processConnection

           // Recalculate MST or update existing connections
           if (needsMstRecalc) {
               // console.log("Recalculating MST and processing connections.");
               let mst = calculateMST();
               newConnections = mst.map(conn => processConnection(conn, false));
           } else if (positionsChangedSignificantly) {
               // console.log("Positions changed, reprocessing existing connections.");
               // Only re-process existing connections if positions changed but MST structure is likely the same
               newConnections = roadConnections.map(conn => processConnection(conn, true));
           } else {
               // If nothing changed, keep existing connections
               newConnections = roadConnections;
           }

           // Update the main roadConnections state if changes occurred
           if (newConnections !== roadConnections) {
               roadConnections = newConnections;
           }
       } else {
           // console.log("Positions not calculated yet, skipping road update.");
       }
   } // end updateRoads

  // --- Lifecycle Hooks ---
  let resizeObserver: ResizeObserver | null = null;
  let initialUpdateDone = false;
  let mountCheckTimeout: number | null = null;

  onMount(() => {
    // Check for Query Parameter
    const urlParams = $page.url.searchParams;
    const openAppParam = urlParams.get('openApp');
    if (openAppParam) {
        console.log(`+page.svelte: Found openApp parameter: ${openAppParam}`);
        appIdFromUrl = openAppParam; // Set state variable

        // Clean up URL using replaceState
        const currentPath = $page.url.pathname;
        requestAnimationFrame(() => {
             if (window.history && window.history.replaceState) {
                history.replaceState(history.state, '', currentPath);
                // console.log(`+page.svelte: Cleaned URL query parameter.`);
             }
        });
    }

    // Delay initial road update slightly to allow DOM elements (icons) to render
    mountCheckTimeout = window.setTimeout(() => {
      if (layoutContainerElement) {
        // console.log("Attempting initial road update after mount timeout.");
        updateRoads(); // First calculation attempt
        initialUpdateDone = true;
      } else {
        console.warn("Layout container not found after mount timeout.");
      }
    }, 200); // Increased delay slightly

    // Setup ResizeObserver
    if (layoutContainerElement) {
        resizeObserver = new ResizeObserver(() => {
            // Use rAF to debounce resize updates and sync with browser rendering
            requestAnimationFrame(updateRoads);
        });
        resizeObserver.observe(layoutContainerElement);
    }

    updateBgColor(); // Initial background color set
    window.addEventListener('resize', updateBgColor);

    return () => { // Cleanup
      if (mountCheckTimeout) clearTimeout(mountCheckTimeout);
      if (resizeObserver && layoutContainerElement) resizeObserver.unobserve(layoutContainerElement);
      resizeObserver = null;
      window.removeEventListener('resize', updateBgColor);
    };
  });

  afterUpdate(() => {
    // Attempt initial update if mount logic failed but container exists now
    if (!initialUpdateDone && layoutContainerElement) {
        // console.log("Attempting road update in afterUpdate.");
        requestAnimationFrame(() => { // Ensure it runs after DOM updates
            updateRoads();
            initialUpdateDone = true; // Mark as done even if it fails, prevent loops
        });
    }
    // Optional: Check if roads need update due to apps array changing dynamically
    // This is a basic check; more robust logic might be needed depending on how 'apps' changes
    const validAppsCount = apps.filter(a => !!a.centerPosition).length;
    if (initialUpdateDone && validAppsCount > 1 && roadConnections.length !== validAppsCount - 1 ) {
       // console.log("App/position count changed, triggering road update.");
       requestAnimationFrame(updateRoads);
    }
  });

  // --- Background color logic ---
  let windowWidth: number = 0;
  let bgColor: string = '#B3D9A1'; // Default desktop
  const updateBgColor = () => {
      if (typeof window !== 'undefined') {
        windowWidth = window.innerWidth;
        bgColor = windowWidth < 768 ? '#03020' : '#B3D9A1'; // Mobile vs Desktop
      }
  };
  // Ensure called on mount for initial value
  onMount(() => { updateBgColor(); });

  let showDialog = false; // For LanguageDialog

  function shouldOpenDialog(): boolean {
    if (typeof window === 'undefined') return false;

    if (user) {
      return !user.user_metadata?.language_from || !user.user_metadata?.language_to;
    } else {
      return !localStorage.getItem('selectedLanguage');
    }
  }

  // Add this reactive statement to control dialog visibility
  $: {
    if (typeof window !== 'undefined') {
      const shouldShow = shouldOpenDialog();
      showDialog = shouldShow;
    }
  }

  // --- NEW: Event Handler for App Opening ---
  function handleAppOpened(event: CustomEvent<{ appId: string }>) {
    const appId = event.detail.appId;
    if (appId) {
      console.log(`+page.svelte: appOpened event received for ID: ${appId}. Calling authStore update.`);
      // Call the authStore method to update the last visited app ID in Supabase
      authStore.updateLastVisitedApp(appId);
    } else {
      console.warn("+page.svelte: appOpened event received without an appId.");
    }
  }
  // --- END NEW HANDLER ---
  $: {
        if (typeof window !== 'undefined') { // Ensure runs only in browser
            const currentUrlParams = $page.url.searchParams;
            const currentOpenAppParam = currentUrlParams.get('openApp');

            console.log(`+page.svelte REACTION: currentOpenAppParam from $page.url: ${currentOpenAppParam}`);

            // Update appIdFromUrl ONLY if the param exists and is different
            // from the value currently held in state. This prevents loops.
            if (currentOpenAppParam && currentOpenAppParam !== appIdFromUrl) {
                console.log(`+page.svelte REACTION: Updating appIdFromUrl from ${appIdFromUrl} to ${currentOpenAppParam}`);
                appIdFromUrl = currentOpenAppParam;

                // Clean up the URL again after reacting to the change caused by goto
                const currentPath = $page.url.pathname;
                requestAnimationFrame(() => {
                     if (window.history && window.history.replaceState) {
                        history.replaceState(history.state, '', currentPath);
                        console.log(`+page.svelte REACTION: Cleaned URL parameter.`);
                     }
                });
            }
            // Optional: Handle case where param is removed from URL but appIdFromUrl still holds old value
            // else if (!currentOpenAppParam && appIdFromUrl) {
            //  console.log(`+page.svelte REACTION: Clearing appIdFromUrl because param removed`);
            //  appIdFromUrl = null;
            // }
        }
    }

  
  // Add these state variables
  let showDevTools = false;
  let showDevTools1 = "";
  let betaFeatures = false;
  
  // Add this subscription
  authStore.subscribe(store => {
    betaFeatures = store.betaFeatures === true;
  });
  
  // Add these dev functions
  function toggleLangDialog() {
    showDialog = !showDialog;
  }
  
  function forceOpenLangDialog() {
    // Clear any existing selection
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('selectedLanguage');
    }
    // Force dialog open
    showDialog = true;
  }
  
  function resetLanguageSelection() {
    if (user) {
      // Reset user metadata
      authStore.updateUserLanguage({ from: '', to: '' });
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('selectedLanguage');
    }
    showDialog = true;
  }
  
  function passtest() {
    if (showDevTools1 === "xdmanus1") {
      // Perform the action you want when the password is correct
      toast.success("Password is correct!");
      showDevTools = true;
    } else {
      // Handle incorrect password
      toast.error("Incorrect password.");
    }
  }
  function handleKeyDown(event: KeyboardEvent) {
        if (event.key === 'Enter') {
            passtest();
        }
    }
</script>

<LanguageDialog bind:show={showDialog} />

<!-- Main container -->
<div class="page-container" style="background-color: {bgColor};">

  {#if betaFeatures}
<div class="dev-tools backdrop-blur-md">
  <h3>Dev Tools (Beta)</h3>
  {#if !showDevTools}
  <Input
                        bind:value={showDevTools1}
                        class="mt-1"
                        aria-invalid={null}
                        on:keydown={handleKeyDown}
                        placeholder="Enter password"
                        type="password"
                    />
                    <Button class="mt-2" on:click={passtest}> Login</Button>              
  {/if}
  {#if showDevTools}
  <div class="dev-buttons">
    <Button on:click={toggleLangDialog}>{showDialog ? 'Hide' : 'Show'} Lang Dialog</Button>
    
    <!-- <Button on:click={forceOpenLangDialog}>
      Force Open Dialog
    </Button> -->
    <Button on:click={resetLanguageSelection}>
      Reset Language
    </Button>
  </div>
  {/if}
</div>
{/if}
  {#if windowWidth < 768 && typeof window !== 'undefined' }
    <div class="mobile-message z-40">
        <p>Please view on a larger screen for the interactive map.</p>
        <!-- Consider adding basic mobile navigation/content here -->
    </div>
  {:else if typeof window !== 'undefined'}
    <!-- Scalable Layout Container -->
    <div class="layout-container" style="max-width: {designWidth}px; aspect-ratio: {designWidth} / {designHeight};aspect-ratio: {designWidth} / {designHeight};
    max-width: calc(100vh * ({designWidth} / {designHeight}));
    max-height: calc(100vw * ({designHeight} / {designWidth}));
    max-width: min(95%, {designWidth}px);" bind:this={layoutContainerElement}>
      <!-- SVG Container for Roads and Decorations -->
      <svg
        viewBox="0 0 {designWidth} {designHeight}"
        preserveAspectRatio="xMidYMid meet"
        class="road-svg"
        aria-hidden="true" 
      >
         <!-- Decorations Layer (Rendered first, behind roads) -->
         <g class="decorations">
           {#each decorations as deco (deco.id)}
             <image
               href={deco.src}
               x={`${deco.position.x}%`} y={`${deco.position.y}%`}
               width={`${deco.size.width}%`} height={`${deco.size.height}%`}
               transform={deco.rotation ? `rotate(${deco.rotation} ${deco.position.x + deco.size.width / 2}% ${deco.position.y + deco.size.height / 2}%)` : ''}
               style="transform-origin: {deco.position.x + deco.size.width / 2}% {deco.position.y + deco.size.height / 2}%;" 
             />
           {/each}
         </g>
         <!-- Roads Layer (Rendered above decorations) -->
         <!-- Road Casings (Thick outer line) -->
         <g class="road-casings">
            {#each roadConnections as conn (conn.app1.id + '-' + conn.app2.id + '-casing')}
                {#if conn.app1.centerPosition && conn.app2.centerPosition}
                    {#if conn.shouldCurve && conn.pathData}
                        <path d={conn.pathData} class="road-casing" />
                    {:else}
                        <line x1={conn.app1.centerPosition.x} y1={conn.app1.centerPosition.y} x2={conn.app2.centerPosition.x} y2={conn.app2.centerPosition.y} class="road-casing" />
                    {/if}
                {/if}
            {/each}
          </g>
          <!-- Road Lines (Inner main line) -->
          <g class="road-lines">
            {#each roadConnections as conn (conn.app1.id + '-' + conn.app2.id + '-line')}
                {#if conn.app1.centerPosition && conn.app2.centerPosition}
                    {#if conn.shouldCurve && conn.pathData}
                        <path d={conn.pathData} class="road-line" />
                    {:else}
                        <line x1={conn.app1.centerPosition.x} y1={conn.app1.centerPosition.y} x2={conn.app2.centerPosition.x} y2={conn.app2.centerPosition.y} class="road-line" />
                    {/if}
                {/if}
            {/each}
          </g>
          <!-- Road Middle Dashed Lines -->
          <g class="road-middle-lines">
             {#each roadConnections as conn (conn.app1.id + '-' + conn.app2.id + '-middle')}
                 {#if conn.app1.centerPosition && conn.app2.centerPosition}
                    {#if conn.shouldCurve && conn.pathData}
                        <path d={conn.pathData} class="road-middle-line" />
                    {:else}
                        <line x1={conn.app1.centerPosition.x} y1={conn.app1.centerPosition.y} x2={conn.app2.centerPosition.x} y2={conn.app2.centerPosition.y} class="road-middle-line" />
                    {/if}
                 {/if}
             {/each}
          </g>
      </svg>

      <!-- AppSelector Component (Overlayed on top of SVG) -->
      <!-- Listen for the custom event -->
      <AppSelector
        {apps}
        {cards}
        initialOpenAppId={appIdFromUrl}
        on:appOpened={handleAppOpened}
      />

    </div> <!-- End layout-container -->
  {/if} <!-- End check for desktop width -->

</div> <!-- End page-container -->


<style>

.dev-tools {
    position: fixed;
    top: 120px;
    right: 20px;
    background: rgba(0,0,0,0.8);
    color: white;
    padding: 1rem;
    border-radius: 8px;
    z-index: 9999;
  }
  
  .dev-buttons {
    display: flex;
    gap: 0.5rem;
    flex-direction: column;
  }
  
  .dev-tools button {
    padding: 0.5rem;
    background: #444;
    border: none;
    color: white;
    cursor: pointer;
    border-radius: 4px;
  }
  
  .dev-tools button:hover {
    background: #666;
  }
  /* Base page styling */
/* Ensure the container is relative and the inline background-color isn't interfering */
.page-container {
    position: relative;
    margin-top: -5.1rem; /* Offset for navbar height */
    width: 100%;
    min-height: 104vh;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #B3D9A1; /* This may be adjusted as needed */
}

/* Force the background image via the pseudo-element */
.page-container::before {
    content: '';
    position: absolute !important;
    top: 0; 
    left: 0;
    width: 100% !important;
    height: 100% !important;
    background-image: url('/grass.png') !important;
    background-size: 15% !important;

    opacity: 0.6 !important; /* Adjust transparency as needed */
    pointer-events: none;
    z-index: 0; /* Ensure it's behind your content */
}
  /* Message for small screens */
  .mobile-message {
      padding: 2rem;
      text-align: center;
      color: #eee; /* Assumes dark mobile background */
      width: 100%;
  }

  /* Container for the map layout */
  .layout-container {
    position: relative; /* For absolute positioning of children */
    width: 95%; /* Responsive width */
    /* Use aspect-ratio for modern browsers */
    
    margin: auto; /* Center horizontally */
    overflow: visible; /* Allow icon hover effects to extend */
  }

  /* SVG styling */
  .road-svg {
    display: block; /* Remove extra space below */
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 100%;
    pointer-events: none; /* Allow clicks through SVG */
    z-index: 0; /* Base layer */
  }

  /* Road styling */
  .road-casing, .road-line, .road-middle-line {
      fill: none;
      stroke-linecap: round;
      stroke-linejoin: round;
      /* Consider non-scaling-stroke if needed */
      /* vector-effect: non-scaling-stroke; */
  }
  line.road-middle-line, path.road-middle-line {
      stroke-linecap: butt; /* For dashed lines */
  }
  .road-casing { stroke: #4a4a4a; stroke-width: 32; }
  .road-line { stroke: #6e6e6e; stroke-width: 28; }
  .road-middle-line {
      stroke: #ffffff;
      stroke-width: 4.5;
      stroke-dasharray: 15 15; /* Dash pattern */
  }

  /* Decoration styling */
  .decorations image {
      opacity: 0.95;
      pointer-events: none; /* Decorations don't block clicks */
      /* Improve rendering quality */
      image-rendering: pixelated; /* Or 'crisp-edges' depending on style */
  }

  /* :global styles are needed for elements rendered inside AppSelector */
  /* These styles are defined here but apply globally to matching selectors */
  :global(.app-icon-wrapper) { /* Assuming AppSelector uses this class */
     position: absolute !important;
     z-index: 2; /* Above roads */
     pointer-events: auto; /* Icons are clickable */
     transform: translate(-50%, -80%);
     width: 50px; height: 50px;
     cursor: pointer;
     transition: transform 0.2s ease-out;
     border-radius: 8px; /* Example */
  }

  :global(.app-icon-wrapper:hover) {
      transform: translate(-50%, -80%) scale(1.15);
  }

  :global(.app-icon-wrapper img) {
      display: block;
      width: 100%; height: 100%;
      object-fit: contain;
  }

</style>