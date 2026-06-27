import Foundation
import PDFKit

guard CommandLine.arguments.count >= 3 else {
  fputs("Usage: swift scripts/extract-pdf-text.swift input.pdf output.txt\n", stderr)
  exit(2)
}

let inputURL = URL(fileURLWithPath: CommandLine.arguments[1])
let outputURL = URL(fileURLWithPath: CommandLine.arguments[2])

guard let document = PDFDocument(url: inputURL) else {
  fputs("Unable to open PDF: \(inputURL.path)\n", stderr)
  exit(1)
}

var output = ""
for pageIndex in 0..<document.pageCount {
  output += "\n--- PAGE \(pageIndex + 1) ---\n"
  if let text = document.page(at: pageIndex)?.string {
    output += text
    if !text.hasSuffix("\n") { output += "\n" }
  }
}

try output.write(to: outputURL, atomically: true, encoding: .utf8)
print("Wrote \(outputURL.path)")
