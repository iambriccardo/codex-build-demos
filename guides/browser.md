# Browser-only photo editing

For a Codex run, open the checkout as a local project and say **“Use the browser-only route. Edit these two pictures.”** Codex starts the local receiver when the edit needs it.

To do the exercise by hand, open a terminal in the cloned folder and start the receiver with Python 3.9 or newer.

```sh
python3 -B demo serve
```

On Windows, use `py -3 -B demo serve` or `python -B demo serve`. Leave the terminal open while you edit and upload, then press Ctrl+C in the terminal to stop the receiver.

1. Open `http://127.0.0.1:8765/editor`. Choose Earth, Moon, or Mars and click **Open sample**. Verify the photo name and dimensions.
2. The four crop fields and caption start with the recipe for that photo. Click **Apply crop** and confirm the change. Click **Rotate right** for Earth or **Rotate left** for Moon, then **Add caption**. For Mars, rotate right unless asked to keep the orientation.
3. If asked for extra marks, set **Across (%)** and **Down (%)** to place the mark relative to the displayed photo. Use **Add arrow** or **Add outline**. For a short example stroke use **Add sample sketch**. To draw your own stroke, check **Sketch directly on the photo** and drag inside the image. To start again, reopen the sample.
4. Click **Save new JPEG** and record the exact filename from the status message. The editor writes new versions to this checkout’s **edited images** folder. Repeat for each requested sample and finish all saves.
5. Click **Go to upload** and verify the destination is `http://127.0.0.1:8765/`. In a Codex run, follow the [upload guide](upload.md). By hand, use **Choose edited JPEGs** to select the new copies from **edited images**, click **Upload images**, and check for the **Received N of N images** message.

Keep the order **open → edit → save → upload**. This editor opens only the three included samples.
