# Codex Build Demos

Open a sample photo, crop and rotate it, add a caption or a sketch, save a new JPEG, then upload the copy to a page on your laptop. The three photos are included. The upload page needs no API key or package install.

## Setup with one prompt

Open **Codex in the ChatGPT desktop app** and paste the prompt below. Codex checks for Git and Python 3.9 or newer, installs any missing prerequisites, and stops when the workspace is ready. Then you can ask for your first edit. [Codex project setup](https://learn.chatgpt.com/docs/projects).

```text
Set up Codex Build Demos on my laptop from https://github.com/iambriccardo/codex-build-demos.git. Do the setup with your local tools. I authorize you to clone this repo and install Git or Python 3.9+ if either is missing.

1. Check for Git and a working Python 3.9+ interpreter. Use them if present. Install only missing prerequisites using the platform's trusted package manager or official installer. On macOS, use Homebrew if already installed, or Apple's Command Line Tools for Git and the official python.org installer for Python. On Windows, use the official packages through WinGet if available. On Linux, use the distribution's package manager. Let me handle any required installer approvals. If you do not have local tools, tell me to open this prompt in desktop Codex.
2. If I already opened a checkout of this exact repo, use it. Otherwise, clone into a new codex-build-demos folder under Codex Workshops in my home folder. If that destination already contains this repo, reuse it and fast-forward only a clean main branch that tracks origin/main. Preserve existing files and stop if the path is occupied by something else.
3. Use the clone as your working folder and read its AGENTS.md. Run python3 -B demo check there (Windows: py -3 -B demo check, or python -B demo check). The check verifies the sample files and the edits folder. If I need to open the clone as a local project to continue, tell me which folder to open.
4. Stop after setup. Do not start the local server, open Finder or a browser, run the demo, or edit any photo. If the check passes, say: “Workshop ready. Which photos would you like to edit? You can say ‘Edit these two pictures’ to start with Earth and Moon.” Wait for my next message.
```

When Codex says ready, reply **“Edit these two pictures.”** On macOS, Codex opens the checkout’s **images** folder directly in Finder, then opens Earth and Moon, edit and save new copies in Preview, and upload the copies using its built-in browser. You can also ask for one photo by name or give your own caption. If Codex asks you to open the cloned folder as a local project, open it and continue with the edit prompt there.

## Clone it yourself

If you prefer Git, clone the [repo](https://github.com/iambriccardo/codex-build-demos) from a folder where you keep projects:

```sh
git clone https://github.com/iambriccardo/codex-build-demos.git
```

Open **codex-build-demos** as a local project in Codex and say **“Prepare this workshop.”** After the readiness check, reply with your edit.

## Choose how to edit

- **In the browser.** Say **“Use the browser-only route. Edit these two pictures.”** This is the default on laptops other than Macs. You can also work through the [browser steps](guides/browser.md) by hand.
- **On macOS, use Finder and Preview, then upload in the browser.** Enable **Computer use** in the app’s settings. Say **“Edit these two pictures.”** Codex opens the demo folder itself. The app may ask for Screen Recording, Accessibility, and access to those two apps. [Computer Use setup](https://learn.chatgpt.com/docs/computer-use).

Both routes save new JPEGs in **edited images**. Look for thumbnails and receipts in Mission Photo Upload in Codex’s built-in browser. If Codex cannot keep a terminal running when the edit starts, it will ask you to run `python3 demo serve` from the clone (Windows: `py -3 demo serve` or `python demo serve`). Keep that terminal open during the edit and press Ctrl+C when finished.

## Try another round

| Prompt | What you should see |
| --- | --- |
| “Edit the astronaut and label it ‘First steps’.” | A rotated Moon image with your caption and a new versioned filename. |
| “Edit the rover. Keep the orientation, label it ‘Curiosity’, and draw an arrow pointing at the rover.” | A landscape photo with a caption and an arrow. |
| “Edit Earth. Add a short sketch stroke near the edge of the globe and skip upload.” | A new JPEG with a visible mark in **edited images**. |
| “Use the saved Moon edit from this chat. Add an outline around the astronaut and upload the new copy.” | A new JPEG beside the previous edit, with a separate receipt. Native Preview route. |

If the browser asks you to choose files, Codex can hand the tab to you with the exact names to select. Use only those files. If Preview opens a save location outside the demo or the save sheet cannot be observed, pause screen sharing. Save the duplicate in **edited images** yourself, then tell Codex its exact filename so it can verify it before uploading.

## How the local page works

**Mission Photo Upload** accepts only the demo’s named JPEGs under **edited images** and verifies their exact bytes. It shows a thumbnail and a SHA-256 fingerprint for each receipt. The receiver listens on your laptop only and discards each upload after verifying it. The browser-only editor’s **Save new JPEG** writes the working copy to **edited images**. Git ignores the copies.

Keep this checkout for the workshop samples and their edits. The agent instructions scope the workflow. For a projected demo, close unrelated windows before sharing. A separate user account containing only workshop data gives stronger isolation for whole-desktop sharing.

## Terminal replay on a Mac

To show the default result if a live edit stalls, stop the live run and enter `python3 demo replay` in this checkout. The Swift script crops, rotates, and captions Earth and Moon. It saves fresh copies and checks the receipts in Terminal. It needs the Mac Swift toolchain and runs without a model. For a single image, use `python3 demo replay mars`. The browser and native routes let you apply the custom edits above.

Run `python3 demo check` any time to verify the starter files. If port 8765 is busy, stop any earlier workshop receiver you launched and rerun `python3 demo serve`. The agent will pause if the page does not match the checkout.

[Photo credits](image-sources.md) · [Preview annotation shortcuts](guides/preview.md) · [Browser upload guide](guides/upload.md).
