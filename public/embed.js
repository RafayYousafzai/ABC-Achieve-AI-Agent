(function() {
  // Prevent duplicate insertion
  if (document.getElementById('ellie-chat-container')) return;

  console.log('[Ellie Embed] Script loaded.');

  const WIDGET_BASE_URL = 'https://ellie-abcachieve-agent.vercel.app';
  let baseUrl = WIDGET_BASE_URL;

  try {
    const scriptElement = document.currentScript || (function() {
      const scripts = document.getElementsByTagName('script');
      return scripts[scripts.length - 1];
    })();
    if (scriptElement && scriptElement.src) {
      const url = new URL(scriptElement.src);
      if (url.hostname === 'localhost' || url.hostname.endsWith('.vercel.app')) {
        baseUrl = url.origin;
      }
    }
  } catch (e) {
    console.error('[Ellie Embed] Error deriving baseUrl:', e);
  }

  console.log('[Ellie Embed] Derived baseUrl:', baseUrl);

  // Desired state tracking
  let currentState = 'closed';

  const STATES = {
    closed: {
      width: '90px',
      height: '90px',
      bottom: '16px',
      right: '16px',
      pointerEvents: 'none'
    },
    open_desktop: {
      width: '480px',
      height: '670px',
      bottom: '16px',
      right: '16px',
      pointerEvents: 'auto'
    },
    open_mobile: {
      width: '100%',
      height: '100%',
      bottom: '0px',
      right: '0px',
      pointerEvents: 'auto'
    }
  };

  // Helper to force styles on container and iframe
  function applyStyles() {
    const s = STATES[currentState];
    if (!s) return;

    // Apply strict styles to the container div
    container.style.cssText = `
      position: fixed !important;
      z-index: 2147483647 !important;
      border: none !important;
      overflow: hidden !important;
      background: transparent !important;
      margin: 0 !important;
      padding: 0 !important;
      box-shadow: none !important;
      max-width: none !important;
      max-height: none !important;
      display: block !important;
      box-sizing: border-box !important;
      top: auto !important;
      left: auto !important;
      transform: none !important;
      width: ${s.width} !important;
      height: ${s.height} !important;
      min-width: ${s.width} !important;
      min-height: ${s.height} !important;
      max-width: ${s.width} !important;
      max-height: ${s.height} !important;
      bottom: ${s.bottom} !important;
      right: ${s.right} !important;
      pointer-events: ${s.pointerEvents} !important;
    `;

    // Apply strict styles to the iframe
    iframe.style.cssText = `
      width: 100% !important;
      height: 100% !important;
      min-width: 100% !important;
      min-height: 100% !important;
      max-width: 100% !important;
      max-height: 100% !important;
      border: none !important;
      background: transparent !important;
      pointer-events: auto !important;
      margin: 0 !important;
      padding: 0 !important;
      box-shadow: none !important;
      display: block !important;
      box-sizing: border-box !important;
    `;
  }

  // Create elements
  const container = document.createElement('div');
  container.id = 'ellie-chat-container';

  const iframe = document.createElement('iframe');
  iframe.id = 'ellie-chat-iframe';
  iframe.src = `${baseUrl}/widget`;
  iframe.allow = 'clipboard-read; clipboard-write; camera; microphone';

  const allowedOrigin = new URL(iframe.src).origin;
  console.log('[Ellie Embed] Iframe Src:', iframe.src);
  console.log('[Ellie Embed] Allowed Origin:', allowedOrigin);

  container.appendChild(iframe);

  // Set up MutationObserver to protect elements against style hijacking
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === 'attributes' && (mutation.attributeName === 'style' || mutation.attributeName === 'class')) {
        observer.disconnect();
        applyStyles();
        startObserving();
      }
    });
  });

  function startObserving() {
    observer.observe(container, { attributes: true, attributeFilter: ['style', 'class'] });
    observer.observe(iframe, { attributes: true, attributeFilter: ['style', 'class'] });
  }

  // Safe injection method that guarantees document.body is available
  function injectWidget() {
    if (document.getElementById('ellie-chat-container')) return;
    document.body.appendChild(container);
    applyStyles();
    startObserving();
    // Hard enforcer loop in case a layout script tries to override via styling properties
    setInterval(applyStyles, 500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectWidget);
  } else {
    injectWidget();
  }

  // Listen to messages from the widget
  window.addEventListener('message', function(event) {
    if (!event.data || event.data.type !== 'ellie-chat-widget') return;

    console.log('[Ellie Embed] Received widget event from origin:', event.origin, 'with data:', event.data);

    if (event.origin !== allowedOrigin) {
      console.warn('[Ellie Embed] Blocked event due to origin mismatch. Expected:', allowedOrigin, 'Got:', event.origin);
      return;
    }

    const isOpen = event.data.isOpen;
    const isMobile = window.innerWidth < 640;

    if (!isOpen) {
      console.log('[Ellie Embed] Transition to closed state (90x90)');
      currentState = 'closed';
    } else {
      console.log('[Ellie Embed] Transition to open state. Mobile:', isMobile);
      currentState = isMobile ? 'open_mobile' : 'open_desktop';
    }

    applyStyles();
  });
})();
