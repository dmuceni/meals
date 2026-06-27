import CoreGraphics
import Foundation
import ImageIO
import PDFKit
import UniformTypeIdentifiers

guard CommandLine.arguments.count >= 3 else {
  fputs("Usage: swift scripts/render-pdf-pages.swift input.pdf output-dir\n", stderr)
  exit(2)
}

let inputURL = URL(fileURLWithPath: CommandLine.arguments[1])
let outputDir = URL(fileURLWithPath: CommandLine.arguments[2], isDirectory: true)
try FileManager.default.createDirectory(at: outputDir, withIntermediateDirectories: true)

guard let document = PDFDocument(url: inputURL) else {
  fputs("Unable to open PDF: \(inputURL.path)\n", stderr)
  exit(1)
}

for pageIndex in 0..<document.pageCount {
  guard let page = document.page(at: pageIndex) else { continue }
  let bounds = page.bounds(for: .mediaBox)
  let scale: CGFloat = 3.0
  let width = Int(bounds.width * scale)
  let height = Int(bounds.height * scale)
  let colorSpace = CGColorSpaceCreateDeviceRGB()

  guard let context = CGContext(
    data: nil,
    width: width,
    height: height,
    bitsPerComponent: 8,
    bytesPerRow: 0,
    space: colorSpace,
    bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue
  ) else { continue }

  context.setFillColor(CGColor(gray: 1, alpha: 1))
  context.fill(CGRect(x: 0, y: 0, width: width, height: height))
  context.saveGState()
  context.scaleBy(x: scale, y: scale)
  page.draw(with: .mediaBox, to: context)
  context.restoreGState()

  guard let image = context.makeImage() else { continue }
  let outputURL = outputDir.appendingPathComponent("page-\(pageIndex + 1).png")
  guard let destination = CGImageDestinationCreateWithURL(outputURL as CFURL, UTType.png.identifier as CFString, 1, nil) else { continue }
  CGImageDestinationAddImage(destination, image, nil)
  CGImageDestinationFinalize(destination)
  print("Wrote \(outputURL.path)")
}
