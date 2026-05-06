// Test stub for the `server-only` package.
// In production, importing 'server-only' from a client component triggers a
// build error. Vitest doesn't enforce that boundary, so we resolve the import
// to this empty module so server-side modules can be imported under test.
export {};
