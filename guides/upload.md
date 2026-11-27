# Upload the edited copies

1. Use Codex’s built-in browser. Check the exact URL `http://127.0.0.1:8765/` and the **Mission Photo Upload** heading. **Check workspace** shows an identifier from this checkout. Compare it with the identifier from the `demo check` or `demo serve` terminal output if you might have multiple workshop receivers.
2. Use the built-in browser’s documented file-picker capability. Start waiting for its filechooser event before clicking **Choose edited JPEGs**. Pass only the exact saved paths. Check the selected filenames or the visible count beside **Choose Files**. If the capability is unavailable, request the documented user handoff in that same tab. Ask the participant to select the recorded paths from **edited images**.
3. Submit **Upload images** once. Verify the visible **Received N of N images** result and the expected names, byte counts, and SHA-256 fingerprints. For a partial batch, note the receipts before retrying only the missing copies. The page displays the latest batch.

The receipt is a local exercise. The server does not publish or keep a second copy of the upload.
