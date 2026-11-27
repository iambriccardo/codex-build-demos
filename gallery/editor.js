const recipes = {
  earth: { crop: [5, 5, 5, 5], caption: "Earth", corner: "left", mark: [63, 40] },
  moon: { crop: [4, 4, 0, 7], caption: "Apollo 11 · 1969", corner: "right", mark: [55, 44] },
  mars: { crop: [12, 0, 0, 0], caption: "Curiosity", corner: "left", mark: [54, 45] },
};

const byId = id => document.getElementById(id);
const canvas = document.querySelector("canvas");
const pen = canvas.getContext("2d");
const editor = document.querySelector(".editor-grid");
const status = byId("editor-status");
const save = byId("save");
const photoCaption = byId("photo-caption");
const cropInputs = ["left", "right", "top", "bottom"].map(byId);
const fields = [...document.querySelectorAll(".edit")];
const freehand = byId("freehand");
let photo;
let previousPoint;

for (const field of fields) field.disabled = true;

function describe(message) {
  photoCaption.textContent = `${photo[0].toUpperCase() + photo.slice(1)} · ${canvas.width} × ${canvas.height} px`;
  status.textContent = message;
}

function changed(message) {
  save.disabled = false;
  describe(message);
}

byId("open-form").addEventListener("submit", async event => {
  event.preventDefault();
  editor.inert = true;
  const selected = byId("sample").value;
  const recipe = recipes[selected];
  try {
    const image = new Image();
    image.src = `/images/${selected}.jpg`;
    await image.decode();
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    pen.drawImage(image, 0, 0);
    photo = selected;
    canvas.hidden = false;
    for (const [index, input] of cropInputs.entries()) input.value = recipe.crop[index];
    byId("caption").value = recipe.caption;
    byId("corner").value = recipe.corner;
    [byId("mark-x").value, byId("mark-y").value] = recipe.mark;
    for (const field of fields) field.disabled = false;
    freehand.checked = false;
    canvas.classList.remove("sketching");
    save.disabled = true;
    describe("Sample opened. Your original is read-only.");
  } catch {
    status.textContent = "The sample couldn’t be opened. Check the workshop files.";
  } finally {
    editor.inert = false;
  }
});

function snapshot() {
  const copy = document.createElement("canvas");
  copy.width = canvas.width;
  copy.height = canvas.height;
  copy.getContext("2d").drawImage(canvas, 0, 0);
  return copy;
}

byId("crop").addEventListener("click", () => {
  const [left, right, top, bottom] = cropInputs.map(input => input.valueAsNumber);
  if (cropInputs.some(input => !input.checkValidity() || !Number.isFinite(input.valueAsNumber)) ||
      left + right >= 98 || top + bottom >= 98) {
    status.textContent = "Enter four percentages that leave part of the photo visible.";
    return;
  }
  const x = Math.round(canvas.width * left / 100);
  const y = Math.round(canvas.height * top / 100);
  const width = canvas.width - x - Math.round(canvas.width * right / 100);
  const height = canvas.height - y - Math.round(canvas.height * bottom / 100);
  if (width <= 0 || height <= 0 || (width === canvas.width && height === canvas.height)) {
    status.textContent = "Choose a crop that changes the size and leaves at least one pixel.";
    return;
  }
  const copy = snapshot();
  canvas.width = width;
  canvas.height = height;
  pen.drawImage(copy, x, y, width, height, 0, 0, width, height);
  changed("Crop applied.");
});

function rotate(clockwise) {
  const copy = snapshot();
  canvas.width = copy.height;
  canvas.height = copy.width;
  pen.translate(canvas.width / 2, canvas.height / 2);
  pen.rotate((clockwise ? 1 : -1) * Math.PI / 2);
  pen.drawImage(copy, -copy.width / 2, -copy.height / 2);
  pen.resetTransform();
  changed(clockwise ? "Rotated right." : "Rotated left.");
}

byId("rotate-left").addEventListener("click", () => rotate(false));
byId("rotate-right").addEventListener("click", () => rotate(true));

byId("add-caption").addEventListener("click", () => {
  const label = byId("caption").value.trim();
  if (!label) {
    status.textContent = "Enter a caption first.";
    return;
  }
  const unit = Math.min(canvas.width, canvas.height);
  const fontSize = Math.max(1, Math.round(unit * .045));
  const padding = Math.max(1, Math.round(unit * .02));
  pen.font = `600 ${fontSize}px system-ui, sans-serif`;
  pen.textAlign = "left";
  pen.textBaseline = "middle";
  const width = Math.max(1, Math.min(pen.measureText(label).width, canvas.width - padding * 4));
  const x = byId("corner").value === "right" ? canvas.width - width - padding * 3 : padding;
  pen.fillStyle = "rgba(15, 12, 28, .84)";
  pen.fillRect(x, padding, width + padding * 2, fontSize + padding * 2);
  pen.fillStyle = "white";
  pen.fillText(label, x + padding, padding * 2 + fontSize / 2, width);
  changed(`Caption added · ${label}`);
});

function markPosition() {
  const x = Math.max(15, Math.min(85, byId("mark-x").valueAsNumber || 54)) / 100;
  const y = Math.max(15, Math.min(85, byId("mark-y").valueAsNumber || 47)) / 100;
  return [x * canvas.width, y * canvas.height];
}

function trace(draw) {
  const width = Math.max(2, Math.min(canvas.width, canvas.height) * .008);
  pen.beginPath();
  draw();
  pen.lineCap = pen.lineJoin = "round";
  pen.strokeStyle = "#fff";
  pen.lineWidth = width * 1.7;
  pen.stroke();
  pen.strokeStyle = "#5538ec";
  pen.lineWidth = width;
  pen.stroke();
}

byId("arrow").addEventListener("click", () => {
  const [x, y] = markPosition();
  const length = Math.min(canvas.width, canvas.height) * .18;
  const direction = x > canvas.width / 2 ? -1 : 1;
  trace(() => {
    pen.moveTo(x + direction * length, y + length * .55);
    pen.lineTo(x, y);
    pen.lineTo(x + direction * length * .36, y + length * .04);
    pen.moveTo(x, y);
    pen.lineTo(x + direction * length * .23, y + length * .34);
  });
  changed("Arrow added.");
});

byId("outline").addEventListener("click", () => {
  const [x, y] = markPosition();
  const radius = Math.min(canvas.width, canvas.height) * .095;
  trace(() => pen.ellipse(x, y, radius, radius * .78, 0, 0, Math.PI * 2));
  changed("Outline added.");
});

byId("stroke").addEventListener("click", () => {
  const [x, y] = markPosition();
  const length = Math.min(canvas.width, canvas.height) * .08;
  trace(() => {
    pen.moveTo(x - length, y + length * .3);
    pen.quadraticCurveTo(x - length * .23, y - length, x, y);
    pen.quadraticCurveTo(x + length * .23, y + length, x + length, y - length * .3);
  });
  changed("Sample sketch added.");
});

function pointer(event) {
  const rect = canvas.getBoundingClientRect();
  return [(event.clientX - rect.left) * canvas.width / rect.width,
          (event.clientY - rect.top) * canvas.height / rect.height];
}

freehand.addEventListener("change", () => canvas.classList.toggle("sketching", freehand.checked));
canvas.addEventListener("pointerdown", event => {
  if (!freehand.checked || !event.isPrimary || event.button !== 0) return;
  canvas.setPointerCapture(event.pointerId);
  previousPoint = pointer(event);
});
canvas.addEventListener("pointermove", event => {
  if (!previousPoint || !event.isPrimary) return;
  const next = pointer(event);
  trace(() => {
    pen.moveTo(...previousPoint);
    pen.lineTo(...next);
  });
  previousPoint = next;
  changed("Sketch added.");
});
canvas.addEventListener("lostpointercapture", () => { previousPoint = undefined; });

save.addEventListener("click", async () => {
  editor.inert = true;
  status.textContent = "Saving…";
  try {
    const jpeg = await new Promise(resolve => canvas.toBlob(resolve, "image/jpeg", .9));
    if (!jpeg) throw new Error("The browser couldn’t encode a JPEG.");
    const response = await fetch("/save", {
      method: "POST",
      headers: { "Content-Type": "image/jpeg", "X-Demo-Photo": photo },
      body: jpeg,
      signal: AbortSignal.timeout(8000),
    });
    const receipt = await response.json();
    if (!response.ok) throw new Error(receipt.error);
    save.disabled = true;
    status.textContent = `Saved ${receipt.name} in edited images.`;
  } catch (error) {
    status.textContent = error.message;
  } finally {
    editor.inert = false;
  }
});
