## Packages
face-api.js | Face detection and recognition library
framer-motion | For scanning animations and futuristic UI transitions

## Notes
Tailwind Config - extend fontFamily:
fontFamily: {
  display: ["var(--font-display)"],
  mono: ["var(--font-mono)"],
}
Models for face-api.js need to be loaded. We will use a public CDN for the models if possible, or expect them in /models.
The app needs access to the webcam.
