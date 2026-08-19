"""Minimal pure-stdlib PNG encoder (no third-party deps).

Used only to generate a tiny raster fallback image required by the OOXML
SVG-embedding extension (Word needs *a* raster blip to point at even when it
actually renders the SVG). Also usable to read width/height back out of any
PNG/JPEG file the user supplies (screenshots) without needing Pillow.
"""
import struct
import zlib


def _chunk(tag: bytes, data: bytes) -> bytes:
    return (
        struct.pack(">I", len(data))
        + tag
        + data
        + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
    )


def write_solid_png(path: str, width: int, height: int, rgb=(226, 232, 240)):
    """Writes a flat solid-colour PNG (used as the SVG fallback placeholder)."""
    sig = b"\x89PNG\r\n\x1a\n"
    ihdr = struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0)
    row = bytes([0]) + bytes(rgb) * width
    raw = row * height
    idat = zlib.compress(raw, 9)
    with open(path, "wb") as f:
        f.write(sig)
        f.write(_chunk(b"IHDR", ihdr))
        f.write(_chunk(b"IDAT", idat))
        f.write(_chunk(b"IEND", b""))


def png_size(path: str):
    with open(path, "rb") as f:
        data = f.read(33)
    if data[:8] != b"\x89PNG\r\n\x1a\n":
        raise ValueError("not a PNG")
    width, height = struct.unpack(">II", data[16:24])
    return width, height


def jpeg_size(path: str):
    with open(path, "rb") as f:
        data = f.read()
    if data[:2] != b"\xff\xd8":
        raise ValueError("not a JPEG")
    i = 2
    while i < len(data):
        if data[i] != 0xFF:
            i += 1
            continue
        marker = data[i + 1]
        if marker in (0xC0, 0xC1, 0xC2, 0xC3):
            height, width = struct.unpack(">HH", data[i + 5 : i + 9])
            return width, height
        if marker in (0xD8, 0xD9):
            i += 2
            continue
        seg_len = struct.unpack(">H", data[i + 2 : i + 4])[0]
        i += 2 + seg_len
    raise ValueError("SOF marker not found")


def image_size(path: str):
    lower = path.lower()
    if lower.endswith(".png"):
        return png_size(path)
    if lower.endswith((".jpg", ".jpeg")):
        return jpeg_size(path)
    raise ValueError(f"unsupported image type: {path}")


if __name__ == "__main__":
    write_solid_png("test_placeholder.png", 400, 300)
    print("wrote test_placeholder.png", png_size("test_placeholder.png"))
