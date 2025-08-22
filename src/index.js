// Main entry point that can work as both server and module
import 'dotenv/config';
import { generatePalette } from './server.js';

// Export the core functionality
export { generatePalette };

// If run directly, start the server
if (import.meta.url === `file://${process.argv[1]}`) {
  import('./server-start.js').then(module => {
    module.startServer();
  }).catch(console.error);
}
