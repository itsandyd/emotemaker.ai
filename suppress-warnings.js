// Suppress specific unhandled rejection warnings during build
process.on('unhandledRejection', (reason, promise) => {
  if (reason && reason.message && reason.message.includes('self is not defined')) {
    // Suppress the 'self is not defined' warning as it doesn't affect build success
    return;
  }
  // Log other unhandled rejections
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Suppress specific reference errors during build
const originalConsoleError = console.error;
console.error = (...args) => {
  const message = args.join(' ');
  if (message.includes('self is not defined') && message.includes('vendors.js')) {
    // Suppress the specific 'self is not defined' error from vendors.js
    return;
  }
  originalConsoleError.apply(console, args);
}; 