"""The workshop's sample and output files."""

import hashlib
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
ORIGINALS = ROOT / "images"
OUTPUTS = ROOT / "edited images"
SOURCES = {
    "earth": "8f894b34149eca7be94d34edf0bd8ac19447ea7a4b9f124efd0130218f8b214e",
    "moon": "963716cc0c07cbbdcbbae58fd24215cb6b938102905be97c436c7d63c79fd88e",
    "mars": "470534d8b488278fdfc5e846adcfc16a9b6d8fb10f7a0be4fd1b723676fe6f8a",
}
OUTPUT_NAME = re.compile(r"(?:earth|moon|mars)-edited(?:-[0-9]{2,})?\.jpe?g")
MAX_BYTES = 5 * 1024 * 1024


def workspace_id():
    # A local label for matching an open gallery to this checkout.
    folder = ROOT.stat()
    return hashlib.sha256(f"{folder.st_dev}:{folder.st_ino}".encode()).hexdigest()[:10]


def digest(data):
    return hashlib.sha256(data).hexdigest()


def check_directory(folder):
    if not folder.is_dir() or folder.resolve() != folder:
        raise ValueError(f"Expected a real workshop directory called {folder.name}.")


def sample(photo):
    check_directory(ORIGINALS)
    path = ORIGINALS / (photo + ".jpg")
    if path.is_symlink() or not path.is_file() or path.stat().st_size > MAX_BYTES:
        raise ValueError(f"Missing or changed sample: {path.name}.")
    data = path.read_bytes()
    if digest(data) != SOURCES[photo]:
        raise ValueError(f"Missing or changed sample: {path.name}.")
    return data


def check():
    original_names = {f"{photo}.jpg" for photo in SOURCES}
    for folder in (ORIGINALS, OUTPUTS):
        check_directory(folder)
        for item in folder.iterdir():
            if item.is_symlink() or not item.is_file():
                raise ValueError(f"Unexpected item in {folder.name}. Inspect the folder off screen.")
            if item.name in {".DS_Store", ".gitignore"}:
                continue
            allowed = item.name in original_names if folder == ORIGINALS else OUTPUT_NAME.fullmatch(item.name)
            if not allowed:
                raise ValueError(f"Unexpected item in {folder.name}. Inspect the folder off screen.")
    for photo in SOURCES:
        sample(photo)


def save_new(photo, data):
    check_directory(OUTPUTS)
    if photo not in SOURCES:
        raise ValueError("Choose Earth, Moon, or Mars.")
    for version in range(1, 1000):
        suffix = "" if version == 1 else f"-{version:02}"
        path = OUTPUTS / f"{photo}-edited{suffix}.jpg"
        alternate = path.with_suffix(".jpeg")
        if alternate.exists() or alternate.is_symlink():
            continue
        try:
            stream = path.open("xb")
        except FileExistsError:
            continue
        try:
            with stream:
                stream.write(data)
        except OSError:
            path.unlink(missing_ok=True)
            raise
        return path
    raise ValueError(f"No unused version number for {photo}.")


def verify_output(name, data):
    check_directory(OUTPUTS)
    path = OUTPUTS / name
    if path.is_symlink() or not path.is_file() or path.stat().st_size != len(data):
        return False
    with path.open("rb") as stream:
        return stream.read(MAX_BYTES + 1) == data
