const form = document.querySelector("form");
const picker = document.querySelector("#photos-input");
const uploadButton = form.querySelector("button");
const status = document.querySelector("#status");
const photos = document.querySelector("#photos");
const checkButton = document.querySelector("#check-workspace");
const workspaceStatus = document.querySelector("#workspace-status");
const outputName = /^(earth|moon|mars)-edited(-[0-9]{2,})?\.jpe?g$/;
const previews = [];

checkButton.addEventListener("click", async () => {
  checkButton.disabled = true;
  workspaceStatus.textContent = "Checking…";
  try {
    const response = await fetch("/workspace", { signal: AbortSignal.timeout(8000) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error);
    workspaceStatus.textContent = `Workspace ${result.workspace} · Earth, Moon and Mars verified · ${result.output} ready.`;
  } catch (error) {
    workspaceStatus.textContent = error.message;
  } finally {
    checkButton.disabled = false;
  }
});

function showReceipt(file, receipt) {
  const item = document.createElement("li");
  const image = document.createElement("img");
  image.alt = receipt.name;
  image.src = URL.createObjectURL(file);
  previews.push(image.src);

  const details = document.createElement("div");
  details.className = "details";
  const filename = document.createElement("strong");
  filename.textContent = receipt.name;
  const size = document.createElement("span");
  size.className = "receipt";
  size.textContent = `Received · ${receipt.size.toLocaleString("en-US")} bytes`;
  const hash = document.createElement("div");
  hash.className = "hash";
  hash.textContent = `SHA-256 ${receipt.sha256}`;
  details.append(filename, size, hash);
  item.append(image, details);
  photos.append(item);
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const files = [...picker.files];
  if (!files.length || files.length > 3 || files.some(file => !outputName.test(file.name)) ||
      new Set(files.map(file => file.name)).size !== files.length) {
    status.textContent = "Choose up to three distinct edited Earth, Moon, or Mars JPEGs.";
    return;
  }
  picker.disabled = uploadButton.disabled = true;
  photos.replaceChildren();
  previews.splice(0).forEach(url => URL.revokeObjectURL(url));
  status.textContent = "Uploading…";
  const errors = [];
  try {
    for (const file of files) {
      try {
        const response = await fetch("/upload", {
          method: "POST",
          headers: { "Content-Type": "image/jpeg", "X-Demo-Filename": file.name },
          body: file,
          signal: AbortSignal.timeout(8000),
        });
        const receipt = await response.json();
        if (!response.ok) throw new Error(receipt.error);
        if (receipt.name !== file.name || receipt.size !== file.size || !/^[a-f0-9]{64}$/.test(receipt.sha256)) {
          throw new Error("The receipt did not match the selected file.");
        }
        showReceipt(file, receipt);
      } catch (error) {
        errors.push(`${file.name} · ${error.message}`);
      }
    }
    const received = `Received ${files.length - errors.length} of ${files.length} images.`;
    status.textContent = [received, ...errors].join(" ");
  } finally {
    picker.disabled = uploadButton.disabled = false;
  }
});
