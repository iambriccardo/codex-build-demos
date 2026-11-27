import AppKit
import CoreText
import ImageIO
import UniformTypeIdentifiers

struct Recipe {
    let crop: (left: Double, top: Double, right: Double, bottom: Double)
    let clockwise: Bool
    let caption: String
    let alignRight: Bool
}

let recipes = [
    "earth": Recipe(crop: (0.05, 0.05, 0.05, 0.05), clockwise: true, caption: "Earth", alignRight: false),
    "moon": Recipe(crop: (0.04, 0, 0.04, 0.07), clockwise: false, caption: "Apollo 11 · 1969", alignRight: true),
    "mars": Recipe(crop: (0.12, 0, 0, 0), clockwise: true, caption: "Curiosity", alignRight: false),
]

func fail(_ message: String) -> Never {
    FileHandle.standardError.write(Data((message + "\n").utf8))
    exit(EXIT_FAILURE)
}

guard CommandLine.arguments.count == 3 else { fail("Expected one input and one output.") }
let source = URL(fileURLWithPath: CommandLine.arguments[1])
let destination = URL(fileURLWithPath: CommandLine.arguments[2])
guard let recipe = recipes[source.deletingPathExtension().lastPathComponent],
      let input = CGImageSourceCreateWithURL(source as CFURL, nil),
      let image = CGImageSourceCreateImageAtIndex(input, 0, nil) else {
    fail("Could not open the workshop JPEG.")
}

let left = (Double(image.width) * recipe.crop.left).rounded()
let right = (Double(image.width) * recipe.crop.right).rounded()
let top = (Double(image.height) * recipe.crop.top).rounded()
let bottom = (Double(image.height) * recipe.crop.bottom).rounded()
let region = CGRect(x: left, y: top, width: Double(image.width) - left - right,
                    height: Double(image.height) - top - bottom)
guard let crop = image.cropping(to: region),
      let canvas = CGContext(data: nil, width: crop.height, height: crop.width, bitsPerComponent: 8,
                             bytesPerRow: 0, space: CGColorSpace(name: CGColorSpace.sRGB)!,
                             bitmapInfo: CGImageAlphaInfo.noneSkipLast.rawValue) else {
    fail("Could not crop the workshop JPEG.")
}

let width = CGFloat(canvas.width)
let height = CGFloat(canvas.height)
canvas.saveGState()
if recipe.clockwise {
    canvas.translateBy(x: 0, y: height)
    canvas.rotate(by: -.pi / 2)
} else {
    canvas.translateBy(x: width, y: 0)
    canvas.rotate(by: .pi / 2)
}
canvas.draw(crop, in: CGRect(x: 0, y: 0, width: crop.width, height: crop.height))
canvas.restoreGState()

let fontSize = max(23, min(width, height) * 0.042)
let inset = fontSize * 0.65
let text = NSAttributedString(string: recipe.caption, attributes: [
    .font: NSFont.systemFont(ofSize: fontSize, weight: .semibold),
    .foregroundColor: NSColor.white,
])
let line = CTLineCreateWithAttributedString(text)
let textWidth = CGFloat(CTLineGetTypographicBounds(line, nil, nil, nil))
let labelWidth = textWidth + inset * 2
let labelHeight = fontSize * 1.6
let label = CGRect(x: recipe.alignRight ? width - inset - labelWidth : inset,
                   y: height - inset - labelHeight, width: labelWidth, height: labelHeight)
canvas.setFillColor(gray: 0, alpha: 0.8)
canvas.addPath(CGPath(roundedRect: label, cornerWidth: inset / 2, cornerHeight: inset / 2, transform: nil))
canvas.fillPath()
canvas.textPosition = CGPoint(x: label.minX + inset, y: label.minY + fontSize * 0.49)
CTLineDraw(line, canvas)

guard let rendered = canvas.makeImage(),
      let encoder = CGImageDestinationCreateWithURL(destination as CFURL, UTType.jpeg.identifier as CFString, 1, nil) else {
    fail("Could not prepare the edited JPEG.")
}
CGImageDestinationAddImage(encoder, rendered, [kCGImageDestinationLossyCompressionQuality: 0.9] as CFDictionary)
guard CGImageDestinationFinalize(encoder) else { fail("Could not save the edited JPEG.") }
