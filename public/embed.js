(function() {
  // Prevent duplicate insertion
  if (document.getElementById('ellie-chat-container')) return;

  // Determine current script location to dynamically get the deployed app URL
  const scriptElement = document.currentScript;
  const baseUrl = scriptElement ? new URL(scriptElement.src).origin : '';

  // 1. Create the container div
  const container = document.createElement('div');
  container.id = 'ellie-chat-container';
  Object.assign(container.style, {
    position: 'fixed',
    bottom: '16px',
    right: '16px',
    zIndex: '999999',
    border: 'none',
    overflow: 'hidden',
    background: 'transparent',
    transition: 'width 0.3s ease, height 0.3s ease',
    width: '90px',
    height: '90px',
    pointerEvents: 'none'
  });

  // 2. Create the iframe
  const iframe = document.createElement('iframe');
  iframe.id = 'ellie-chat-iframe';
  iframe.src = `${baseUrl}/widget`;
  iframe.allow = 'clipboard-read; clipboard-write; camera; microphone';
  Object.assign(iframe.style, {
    width: '100%',
    height: '100%',
    border: 'none',
    background: 'transparent',
    pointerEvents: 'auto'
  });

  container.appendChild(iframe);
  document.body.appendChild(container);

  // 3. Listen to messages from the widget
  window.addEventListener('message', function(event) {
    if (baseUrl && event.origin !== baseUrl) return;

    if (event.data && event.data.type === 'ellie-chat-widget') {
      const isOpen = event.data.isOpen;
      const isMessageEmpty = event.data.isMessageEmpty;
      const isMobile = window.innerWidth < 640;

      if (!isOpen) {
        // Closed state
        container.style.width = '90px';
        container.style.height = '90px';
        container.style.bottom = '16px';
        container.style.right = '16px';
        container.style.pointerEvents = 'none';
      } else {
        // Open state
        container.style.pointerEvents = 'auto';
        if (isMobile) {
          container.style.width = '100%';
          container.style.height = '100%';
          container.style.bottom = '0px';
          container.style.right = '0px';
        } else {
          container.style.width = '480px';
          container.style.bottom = '16px';
          container.style.right = '16px';
          if (isMessageEmpty) {
            container.style.height = '300px';
          } else {
            container.style.height = '670px';
          }
        }
      }
    }
  });
})();
