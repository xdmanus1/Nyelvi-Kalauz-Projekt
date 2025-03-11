<script lang="ts">
  // @ts-nocheck
  import AppSelector from '$lib/components/AppSelector.svelte';
  import BirdApp from '$lib/components/BirdApp.svelte';
  import DogApp from '$lib/components/DogApp.svelte';
  import ShopApp from '$lib/components/Shop.svelte'; 
  import { onMount } from 'svelte';
  
  // Export data from the load function
  export let data;
  const { cards } = data;
  
  interface AppPosition {
    top: string;
    left: string;
  }
  
  interface AppContent {
    title: string;
    description: string;
    component: any;
  }
  
  interface App {
    emoji: string;
    where: AppPosition;
    content: AppContent;
    id?: string;
    position?: {
      top: number;
      left: number;
    };
    centerPosition?: {  // Added for storing the center position
      top: number;
      left: number;
    };
    element?: HTMLElement; // Store the DOM element reference
    isEdge?: boolean;
    width?: number; // Store element width
    height?: number; // Store element height
    connections?: number; // Track number of connections
  }
  
  // Add ids to the apps for reference when creating connections
  let apps: App[] = [
    {
      id: 'bird',
      emoji: "/store-svgrepo-com.svg",
      where: { top: '50%', left: '10%' },
      content: {
        title: "Bird App",
        description: "Welcome to the Bird App!",
        component: BirdApp
      }
    },
    {
      id: 'shop',
      emoji: "/download.svg",
      where: { top: '60%', left: '90%' },
      content: {
        title: "Shop",
        description: "Shop",
        component: ShopApp
      }
    },
    {
      id: 'dog',
      emoji: "/favicon.png",
      where: { top: '20%', left: '30%' },
      content: {
        title: "Dog App",
        description: "Welcome to the Dog App!",
        component: DogApp
      }
    },
    {
      id: 'bird2',
      emoji: "/favicon.png",
      where: { top: '20%', left: '50%' },
      content: {
        title: "Bird App",
        description: "Welcome to the Bird App!",
        component: DogApp
      }
    },
    {
      id: 'fish',
      emoji: "/favicon.png",
      where: { top: '60%', left: '20%' },
      content: {
        title: "Fish App",
        description: "Dive into the Fish App!",
        component: DogApp
      }
    },
    {
      id: 'turtle',
      emoji: "/favicon.png",
      where: { top: '40%', left: '70%' },
      content: {
        title: "Turtle App",
        description: "Slow and steady in the Turtle App!",
        component: DogApp
      }
    },
    {
      id: 'rabbit',
      emoji: "/favicon.png",
      where: { top: '30%', left: '10%' },
      content: {
        title: "Rabbit App",
        description: "Hop into the Rabbit App!",
        component: DogApp
      }
    }
    // Add more apps as needed
  ];
  
  interface Connection {
    from: string;
    to: string;
    path?: string;
    distance?: number;
    importance?: number; // Added to determine road width
  }
  
  // Store the connections
  let connections: Connection[] = [];
  let containerWidth = 0;
  let containerHeight = 0;
  let resizeObserver: ResizeObserver | null = null;
  
  // Calculate the absolute position of an app based on its percentage values
  function calculateAbsolutePosition(app: App, containerWidth: number, containerHeight: number) {
    const topPercent = parseFloat(app.where.top);
    const leftPercent = parseFloat(app.where.left);
    
    return {
      top: (containerHeight * topPercent) / 100,
      left: (containerWidth * leftPercent) / 100
    };
  }
  
  // Calculate distance between two apps based on their center positions
  function calculateDistance(app1: App, app2: App): number {
    if (!app1.centerPosition || !app2.centerPosition) return Infinity;
    
    const dx = app1.centerPosition.left - app2.centerPosition.left;
    const dy = app1.centerPosition.top - app2.centerPosition.top;
    return Math.sqrt(dx * dx + dy * dy);
  }
  
  // Check if an app is on the edge of the screen
  function isEdgeApp(app: App, containerWidth: number, containerHeight: number): boolean {
    if (!app.position) return false;
    
    const edgeThreshold = 0.15; // 15% from any edge is considered an edge
    
    return (
      app.position.left < containerWidth * edgeThreshold || 
      app.position.left > containerWidth * (1 - edgeThreshold) || 
      app.position.top < containerHeight * edgeThreshold || 
      app.position.top > containerHeight * (1 - edgeThreshold)
    );
  }
  
  // Improved line intersection detection
  function doLinesIntersect(line1Start, line1End, line2Start, line2End) {
    // CCW function to determine counter-clockwise orientation
    function ccw(A, B, C) {
      return (C.top - A.top) * (B.left - A.left) > (B.top - A.top) * (C.left - A.left);
    }
    
    // Check if the line segments intersect
    return ccw(line1Start, line2Start, line2End) !== ccw(line1End, line2Start, line2End) && 
           ccw(line1Start, line1End, line2Start) !== ccw(line1Start, line1End, line2End);
  }
  function generateRoadPath(fromApp: App, toApp: App): string {
    if (!fromApp.centerPosition || !toApp.centerPosition) return '';
    
    const fromPos = fromApp.centerPosition;
    const toPos = toApp.centerPosition;
    
    // Calculate vector from source to target
    const dx = toPos.left - fromPos.left;
    const dy = toPos.top - fromPos.top;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // For very short distances, use a straight line to avoid weird curves
    if (distance < 50) {
      return `M ${fromPos.left} ${fromPos.top} L ${toPos.left} ${toPos.top}`;
    }
    
    // Create a natural curve that doesn't bend too much
    // The control point is perpendicular to the line between points
    const perpX = -dy / distance * (distance * 0.1); // 10% of distance for curve height
    const perpY = dx / distance * (distance * 0.1);
    
    const controlX = (fromPos.left + toPos.left) / 2 + perpX;
    const controlY = (fromPos.top + toPos.top) / 2 + perpY;
    
    // Create a quadratic curve path
    return `M ${fromPos.left} ${fromPos.top} Q ${controlX} ${controlY}, ${toPos.left} ${toPos.top}`;
  }
  
  // Updated onMount code to ensure we get accurate positions
  onMount(() => {
    const container = document.querySelector('.budy');
    if (container) {
      // Initial setup
      containerWidth = container.clientWidth;
      containerHeight = container.clientHeight;
      
      // Calculate absolute positions and identify edge apps
      apps = apps.map(app => {
        const position = calculateAbsolutePosition(app, containerWidth, containerHeight);
        const isEdge = isEdgeApp(app, containerWidth, containerHeight);
        return { ...app, position, isEdge, connections: 0 };
      });
      
      // Set up app center positions with improved timing
      setupAppCenterPositions();
      
      // Add window resize handling to reposition everything when the window size changes
      const handleResize = () => {
        if (container) {
          containerWidth = container.clientWidth;
          containerHeight = container.clientHeight;
          
          // Recalculate positions
          apps = apps.map(app => {
            const position = calculateAbsolutePosition(app, containerWidth, containerHeight);
            const isEdge = isEdgeApp(app, containerWidth, containerHeight);
            return { ...app, position, isEdge, connections: 0, centerPosition: undefined, element: undefined };
          });
          
          // Reestablish center positions and connections
          setupAppCenterPositions();
        }
      };
      
      window.addEventListener('resize', handleResize);
      
      // Clean up event listener on component destroy
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  });
  
  // Improved function to check if a connection would cross existing connections
  function wouldCrossExistingConnections(
    fromApp: App,
    toApp: App,
    existingConnections: Connection[],
    appMap: Map<string, App>
  ): boolean {
    if (!fromApp.centerPosition || !toApp.centerPosition) return true;
    
    // For simplicity, we'll use straight lines to check intersections
    for (const conn of existingConnections) {
      // Skip if this connection shares an endpoint with our new connection
      if (conn.from === fromApp.id || conn.from === toApp.id || 
          conn.to === fromApp.id || conn.to === toApp.id) {
        continue;
      }
      
      const connFromApp = appMap.get(conn.from);
      const connToApp = appMap.get(conn.to);
      
      if (!connFromApp?.centerPosition || !connToApp?.centerPosition) continue;
      
      // Check if the straight line segments intersect
      if (doLinesIntersect(
        fromApp.centerPosition,
        toApp.centerPosition,
        connFromApp.centerPosition,
        connToApp.centerPosition
      )) {
        return true; // Would cross
      }
    }
    
    return false; // No crossing
  }
  
  // New function to determine if a node is isolated (has no close neighbors)
  function isIsolatedNode(app: App, apps: App[], maxDistance: number): boolean {
    for (const otherApp of apps) {
      if (app.id === otherApp.id) continue;
      
      const distance = calculateDistance(app, otherApp);
      if (distance <= maxDistance) {
        return false; // Has at least one close neighbor
      }
    }
    return true; // No close neighbors
  }
  
  // Improved algorithm to create a network with more connections
  function createNetworkGraph(apps: App[]): Connection[] {
    if (apps.length <= 1) return [];
    
    // Initialize all apps with 0 connections
    apps.forEach(app => {
      app.connections = 0;
    });
    
    // Map for quick app lookup by ID
    const appMap = new Map<string, App>();
    for (const app of apps) {
      appMap.set(app.id, app);
    }
    
    // Initialize all potential connections
    const potentialConnections: Connection[] = [];
    
    for (let i = 0; i < apps.length; i++) {
      for (let j = i + 1; j < apps.length; j++) {
        const distance = calculateDistance(apps[i], apps[j]);
        potentialConnections.push({
          from: apps[i].id,
          to: apps[j].id,
          distance: distance,
          // Importance will determine road width - shorter connections are more important
          importance: 1 / (distance + 1)
        });
      }
    }
    
    // Sort connections by distance (shortest first)
    potentialConnections.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
    
    // Constants for network design - scaled based on container size
    const scaleFactor = Math.min(containerWidth, containerHeight) / 1000;
    const BASE_ISOLATION_DISTANCE = 200;
    const BASE_MAX_DISTANCE_LIMIT = 300;
    
    // Scaled constants
    const ISOLATION_DISTANCE = BASE_ISOLATION_DISTANCE * scaleFactor;
    const MAX_DISTANCE_LIMIT = BASE_MAX_DISTANCE_LIMIT * scaleFactor;
    
    // Fixed constants
    const MAX_CONNECTIONS_NORMAL = 5;  // Maximum connections for regular nodes
    const MAX_CONNECTIONS_EDGE = 3;    // Maximum connections for edge nodes
    
    // Implement a proper Minimum Spanning Tree (Kruskal's algorithm)
    const finalConnections: Connection[] = [];
    const connectedSets: Set<string>[] = [];
    
    // First ensure network connectivity with MST
    for (const conn of potentialConnections) {
      // Find sets containing the endpoints
      let fromSetIndex = -1;
      let toSetIndex = -1;
      
      for (let i = 0; i < connectedSets.length; i++) {
        if (connectedSets[i].has(conn.from)) fromSetIndex = i;
        if (connectedSets[i].has(conn.to)) toSetIndex = i;
      }
      
      // Both nodes already in the same set - adding this edge would create a cycle
      if (fromSetIndex !== -1 && fromSetIndex === toSetIndex) {
        continue;
      }
      
      // Check if this connection would cross any existing connections
      const fromApp = appMap.get(conn.from);
      const toApp = appMap.get(conn.to);
      
      if (wouldCrossExistingConnections(fromApp, toApp, finalConnections, appMap)) {
        continue; // Skip if it would create a crossing
      }
      
      // Add the connection
      finalConnections.push(conn);
      
      // Increment connection count for the apps
      if (fromApp) fromApp.connections = (fromApp.connections || 0) + 1;
      if (toApp) toApp.connections = (toApp.connections || 0) + 1;
      
      // Update connected sets
      if (fromSetIndex === -1 && toSetIndex === -1) {
        // Both nodes not in any set yet
        connectedSets.push(new Set([conn.from, conn.to]));
      } else if (fromSetIndex === -1) {
        // Add 'from' node to 'to' node's set
        connectedSets[toSetIndex].add(conn.from);
      } else if (toSetIndex === -1) {
        // Add 'to' node to 'from' node's set
        connectedSets[fromSetIndex].add(conn.to);
      } else {
        // Merge the two sets
        for (const node of connectedSets[toSetIndex]) {
          connectedSets[fromSetIndex].add(node);
        }
        connectedSets.splice(toSetIndex, 1);
      }
    }
    
    // Check for isolated nodes and ensure they connect to their nearest neighbor
    for (const app of apps) {
      if (app.connections === 0 || isIsolatedNode(app, apps, ISOLATION_DISTANCE)) {
        // Find nearest neighbor
        let nearestApp = null;
        let minDistance = Infinity;
        
        for (const otherApp of apps) {
          if (app.id === otherApp.id) continue;
          
          const distance = calculateDistance(app, otherApp);
          if (distance < minDistance) {
            // Check if this connection would cross existing ones
            if (!wouldCrossExistingConnections(app, otherApp, finalConnections, appMap)) {
              minDistance = distance;
              nearestApp = otherApp;
            }
          }
        }
        
        if (nearestApp) {
          // Add connection to nearest neighbor if not already connected
          const alreadyConnected = finalConnections.some(conn => 
            (conn.from === app.id && conn.to === nearestApp.id) || 
            (conn.from === nearestApp.id && conn.to === app.id)
          );
          
          if (!alreadyConnected) {
            finalConnections.push({
              from: app.id,
              to: nearestApp.id,
              distance: minDistance,
              importance: 1 / (minDistance + 1) * 1.5 // Higher importance for isolated node connections
            });
            
            // Update connection counts
            app.connections = (app.connections || 0) + 1;
            nearestApp.connections = (nearestApp.connections || 0) + 1;
          }
        }
      }
    }
    
    // Add additional connections to create a more connected network
    for (const conn of potentialConnections) {
      // Skip if this connection is already added
      if (finalConnections.some(c => 
        (c.from === conn.from && c.to === conn.to) || 
        (c.from === conn.to && c.to === conn.from)
      )) {
        continue;
      }
      
      // Skip if distance is too great
      if (conn.distance > MAX_DISTANCE_LIMIT) {
        continue;
      }
      
      const fromApp = appMap.get(conn.from);
      const toApp = appMap.get(conn.to);
      
      if (!fromApp || !toApp) continue;
      
      // Skip if it would create a crossing
      if (wouldCrossExistingConnections(fromApp, toApp, finalConnections, appMap)) {
        continue;
      }
      
      // Limit the number of connections per app based on position
      const fromMaxConn = fromApp.isEdge ? MAX_CONNECTIONS_EDGE : MAX_CONNECTIONS_NORMAL;
      const toMaxConn = toApp.isEdge ? MAX_CONNECTIONS_EDGE : MAX_CONNECTIONS_NORMAL;
      
      if (fromApp.connections < fromMaxConn && toApp.connections < toMaxConn) {
        finalConnections.push(conn);
        
        // Update connection counts
        fromApp.connections += 1;
        toApp.connections += 1;
      }
    }
    
    return finalConnections;
  }
  // Function to find app elements and calculate their center positions
  function findAppElementsAndSetCenters() {
    // Default app size if we can't find the actual element
    const defaultAppSize = { width: 50, height: 50 };
  
    // Get the container element and its bounding rectangle
    const container = document.querySelector('.budy');
    if (!container) return false;
    const containerRect = container.getBoundingClientRect();
    containerWidth = containerRect.width;
    containerHeight = containerRect.height;
  
    // Find all app elements in the DOM
    const appElements = document.querySelectorAll('.app-selector-item');
    
    if (appElements.length === 0) return false;
    
    // Create a map of elements by position for more accurate matching
    const elementPositionMap = new Map();
    
    appElements.forEach(element => {
      const rect = element.getBoundingClientRect();
      const relativeLeft = rect.left - containerRect.left;
      const relativeTop = rect.top - containerRect.top;
      
      // Store by position string
      elementPositionMap.set(`${relativeLeft.toFixed(0)},${relativeTop.toFixed(0)}`, {
        element,
        rect,
        center: {
          left: relativeLeft + rect.width / 2,
          top: relativeTop + rect.height / 2
        }
      });
    });
    
    // Match DOM elements to our app objects
    let allMatched = true;
    apps.forEach(app => {
      if (!app.position) {
        // Calculate absolute position if not already done
        app.position = calculateAbsolutePosition(app, containerWidth, containerHeight);
        app.isEdge = isEdgeApp(app, containerWidth, containerHeight);
      }
      
      // Try to find the element closest to the calculated position
      let closestElement = null;
      let minDistance = Infinity;
      
      for (const [_, data] of elementPositionMap.entries()) {
        const distance = Math.sqrt(
          Math.pow(data.center.left - app.position.left, 2) + 
          Math.pow(data.center.top - app.position.top, 2)
        );
        
        if (distance < minDistance) {
          minDistance = distance;
          closestElement = data;
        }
      }
      
      if (closestElement && minDistance < 100) { // Use a reasonable threshold
        // Remove this element from the map so it's not matched again
        elementPositionMap.delete(`${closestElement.center.left.toFixed(0)},${closestElement.center.top.toFixed(0)}`);
        
        // Store the element reference and its size
        app.element = closestElement.element;
        app.width = closestElement.rect.width;
        app.height = closestElement.rect.height;
        
        // Store the center position - this is key for proper connection placement
        app.centerPosition = {
          left: closestElement.center.left,
          top: closestElement.center.top
        };
      } else {
        // If no matching element found, use the calculated position
        app.width = defaultAppSize.width;
        app.height = defaultAppSize.height;
        app.centerPosition = {
          left: app.position.left + defaultAppSize.width / 2,
          top: app.position.top + defaultAppSize.height / 2
        };
        allMatched = false;
      }
    });
    
    return allMatched;
  }
  
  // Function to generate connections once we have center positions
  function generateConnections() {
    // Fix any duplicate IDs
    const appIds = new Set();
    apps.forEach((app, index) => {
      if (appIds.has(app.id)) {
        app.id = `${app.id}_${index}`;
      }
      appIds.add(app.id);
    });
    
    // Create network graph connections (more connected network)
    connections = createNetworkGraph(apps);
    
    // Generate road paths for each connection
    connections = connections.map(conn => {
      const fromApp = apps.find(app => app.id === conn.from);
      const toApp = apps.find(app => app.id === conn.to);
      
      if (fromApp && toApp) {
        return {
          ...conn,
          path: generateRoadPath(fromApp, toApp)
        };
      }
      return conn;
    });
    
    // Force a refresh
    connections = [...connections];
  }
  
  // Set up viewport sizing and rendering based on current screen size
  function updateLayoutAndRender() {
    const container = document.querySelector('.budy');
    if (!container) return;
    
    // Get current container dimensions
    containerWidth = container.clientWidth;
    containerHeight = container.clientHeight;
    
    // Scale road width based on container size
    const scaleFactor = Math.min(containerWidth, containerHeight) / 1000;
    
    // Calculate absolute positions and identify edge apps
    apps = apps.map(app => {
      const position = calculateAbsolutePosition(app, containerWidth, containerHeight);
      const isEdge = isEdgeApp(app, containerWidth, containerHeight);
      return { ...app, position, isEdge, connections: 0 };
    });
    
    // Setup center positions and generate connections
    findAppElementsAndSetCenters();
    generateConnections();
  }
  
  function setupAppCenterPositions() {
    // Try multiple times with increasing delays to ensure elements are fully rendered
    let attempts = 0;
    const maxAttempts = 5;
    const attemptWithDelay = (delay) => {
      setTimeout(() => {
        if (findAppElementsAndSetCenters()) {
          generateConnections();
        } else if (attempts < maxAttempts) {
          attempts++;
          attemptWithDelay(delay * 1.5); // Increase delay for next attempt
        } else {
          // Final fallback if elements never found correctly
          console.warn("Could not find all app elements, using fallback positioning");
          apps.forEach(app => {
            if (!app.centerPosition) {
              app.centerPosition = {
                left: app.position.left + 25,
                top: app.position.top + 25
              };
            }
          });
          generateConnections();
        }
      }, delay);
    };
    
    // Start first attempt with short delay
    attemptWithDelay(100);
  }
  
  
  
  // Handle window resize events
  function handleResize() {
    // Clear existing connections
    connections = [];
    
    // Update layout and regenerate connections
    updateLayoutAndRender();
  }
  
  // Generate the roads when the component mounts
  onMount(() => {
    // Initial setup
    updateLayoutAndRender();
    
    // Setup center positions after a short delay to allow AppSelector to render
    setTimeout(() => {
      setupAppCenterPositions();
    }, 100);
    
    // Set up a resize observer to handle container size changes
    const container = document.querySelector('.budy');
    if (container && 'ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(debounce(() => {
        handleResize();
      }, 250)); // Debounce to prevent excessive recalculations
      
      resizeObserver.observe(container);
    } else {
      // Fallback to window resize event
      window.addEventListener('resize', debounce(() => {
        handleResize();
      }, 250));
    }
    
    return () => {
      // Clean up event listeners and observers
      if (resizeObserver) {
        resizeObserver.disconnect();
      } else {
        window.removeEventListener('resize', handleResize);
      }
    };
  });
  
  // Debounce helper to limit how often a function can be called
  function debounce(func, wait) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }
  
  // Calculate road width based on container size and connection importance
  function calculateRoadWidth(importance) {
    const baseWidth = 10;
    const importanceMultiplier = 15;
    
    // Scale width based on container size
    const scaleFactor = Math.min(containerWidth, containerHeight) / 1000;
    const scaledBaseWidth = baseWidth * Math.max(0.5, Math.min(2, scaleFactor));
    const scaledMultiplier = importanceMultiplier * Math.max(0.5, Math.min(2, scaleFactor));
    
    return scaledBaseWidth + (importance || 0) * scaledMultiplier;
  }

  import { authStore } from '$lib/components/stores/AuthStore';

  let user: import('@supabase/gotrue-js').User | null = null;
    authStore.subscribe(({ user: currentUser }) => {
    user = currentUser;
    });
  // Access betaFeatures directly
  console.log(user?.user_metadata.beta_features || false);
  </script>
  
  <div class="budy relative">
    <!-- SVG layer for the roads (positioned below apps) -->
     {#if user?.user_metadata.beta_features || false}
  
    <svg class="absolute top-0 left-0 w-full h-full" style="z-index: 1;">
      {#each connections as connection}
        {#if connection.path}
          <path
            d={connection.path}
            stroke="#333"
            stroke-width={calculateRoadWidth(connection.importance)}
            fill="none"
            stroke-linecap="round"
          />
          
          <path
            d={connection.path}
            stroke="white"
            stroke-width={2 * Math.max(0.5, Math.min(2, Math.min(containerWidth, containerHeight) / 1000))}
            fill="none"
            stroke-dasharray="8,16"
            stroke-linecap="round"
          />
        {/if}
      {/each}
    </svg>
 
    {/if}
    <!-- AppSelector component (positioned above roads) -->
    <div style="position: relative; z-index: 2;">
      <AppSelector {apps} cards={cards} />
    </div>
  </div>
 
  <style>
    .budy {
      /* background-image: url('$lib/components/map.png'); */
      margin-top: -5.1rem;
      width: 100%;
      height: 100vh;
      position: relative;
    }
  </style>