// LiDARScannerView.swift
// Escaneo 3D usando el sensor LiDAR del iPhone 14 Pro/Pro Max
// Usa ARKit + RealityKit para capturar la geometria del objeto

import SwiftUI
import RealityKit
import ARKit

struct LiDARScannerView: View {
    @Environment(\.dismiss) var dismiss
    @StateObject private var scanManager = LiDARScanManager()

    var body: some View {
        ZStack {
            // AR View
            LiDARARViewContainer(scanManager: scanManager)
                .ignoresSafeArea()

            // Overlay UI
            VStack {
                // Top bar
                HStack {
                    Button(action: { dismiss() }) {
                        Image(systemName: "xmark")
                            .font(.title3)
                            .foregroundColor(.white)
                            .frame(width: 44, height: 44)
                            .background(Color.black.opacity(0.5))
                            .clipShape(Circle())
                    }

                    Spacer()

                    // Status indicator
                    HStack(spacing: 8) {
                        Circle()
                            .fill(scanManager.isScanning ? Color(hex: "ff2d75") : Color(hex: "00ff88"))
                            .frame(width: 10, height: 10)
                            .overlay(
                                Circle()
                                    .stroke(Color.white.opacity(0.3), lineWidth: 1)
                            )

                        Text(scanManager.statusText)
                            .font(.system(size: 12, weight: .bold, design: .monospaced))
                            .foregroundColor(.white)
                    }
                    .padding(.horizontal, 16)
                    .padding(.vertical, 8)
                    .background(Color.black.opacity(0.6))
                    .cornerRadius(20)

                    Spacer()

                    // Point count
                    VStack(alignment: .trailing, spacing: 2) {
                        Text("\(scanManager.vertexCount)")
                            .font(.system(size: 14, weight: .bold, design: .monospaced))
                            .foregroundColor(Color(hex: "00f0ff"))
                        Text("vertices")
                            .font(.system(size: 9))
                            .foregroundColor(.gray)
                    }
                    .padding(.horizontal, 12)
                    .padding(.vertical, 6)
                    .background(Color.black.opacity(0.5))
                    .cornerRadius(10)
                }
                .padding()

                Spacer()

                // Scanning guide
                if !scanManager.isScanning {
                    VStack(spacing: 12) {
                        Image(systemName: "cube.transparent")
                            .font(.system(size: 40))
                            .foregroundColor(Color(hex: "00f0ff"))

                        Text("Apunta al producto y\nmuevete lentamente alrededor")
                            .font(.system(size: 14))
                            .foregroundColor(.white)
                            .multilineTextAlignment(.center)

                        Text("El LiDAR capturara la geometria automaticamente")
                            .font(.system(size: 11))
                            .foregroundColor(.gray)
                    }
                    .padding(24)
                    .background(Color.black.opacity(0.7))
                    .cornerRadius(16)
                }

                Spacer()

                // Bottom controls
                HStack(spacing: 20) {
                    // Wireframe toggle
                    Button(action: { scanManager.toggleWireframe() }) {
                        VStack(spacing: 4) {
                            Image(systemName: scanManager.showWireframe ? "square.grid.3x3.fill" : "square.grid.3x3")
                                .font(.title2)
                            Text("Malla")
                                .font(.system(size: 9))
                        }
                        .foregroundColor(scanManager.showWireframe ? Color(hex: "00f0ff") : .white)
                        .frame(width: 60, height: 60)
                        .background(Color.black.opacity(0.5))
                        .cornerRadius(12)
                    }

                    // Main scan/stop button
                    Button(action: {
                        if scanManager.isScanning {
                            scanManager.stopScanning()
                        } else {
                            scanManager.startScanning()
                        }
                    }) {
                        ZStack {
                            Circle()
                                .stroke(
                                    LinearGradient(
                                        colors: [Color(hex: "ff2d75"), Color(hex: "7b2dff"), Color(hex: "00f0ff")],
                                        startPoint: .topLeading,
                                        endPoint: .bottomTrailing
                                    ),
                                    lineWidth: 4
                                )
                                .frame(width: 80, height: 80)

                            if scanManager.isScanning {
                                RoundedRectangle(cornerRadius: 6)
                                    .fill(Color(hex: "ff2d75"))
                                    .frame(width: 30, height: 30)
                            } else {
                                Circle()
                                    .fill(
                                        LinearGradient(
                                            colors: [Color(hex: "ff2d75"), Color(hex: "7b2dff")],
                                            startPoint: .topLeading,
                                            endPoint: .bottomTrailing
                                        )
                                    )
                                    .frame(width: 64, height: 64)

                                Image(systemName: "sensor.tag.radiowaves.forward")
                                    .font(.title2)
                                    .foregroundColor(.white)
                            }
                        }
                    }

                    // Export button
                    Button(action: { scanManager.exportModel() }) {
                        VStack(spacing: 4) {
                            Image(systemName: "square.and.arrow.up")
                                .font(.title2)
                            Text("Exportar")
                                .font(.system(size: 9))
                        }
                        .foregroundColor(scanManager.canExport ? Color(hex: "00ff88") : .gray)
                        .frame(width: 60, height: 60)
                        .background(Color.black.opacity(0.5))
                        .cornerRadius(12)
                    }
                    .disabled(!scanManager.canExport)
                }
                .padding(.bottom, 40)
            }

            // Export progress
            if scanManager.isExporting {
                Color.black.opacity(0.8)
                    .ignoresSafeArea()

                VStack(spacing: 20) {
                    ProgressView()
                        .scaleEffect(1.5)
                        .tint(Color(hex: "00f0ff"))

                    Text("Procesando modelo 3D...")
                        .font(.system(size: 14, weight: .bold, design: .monospaced))
                        .foregroundColor(.white)

                    Text("Esto puede tomar unos segundos")
                        .font(.system(size: 12))
                        .foregroundColor(.gray)
                }
                .padding(30)
                .background(Color(hex: "12121a"))
                .cornerRadius(20)
            }
        }
    }
}

// MARK: - AR View Container
struct LiDARARViewContainer: UIViewRepresentable {
    let scanManager: LiDARScanManager

    func makeUIView(context: Context) -> ARView {
        let arView = ARView(frame: .zero)

        // Configure AR session for LiDAR scanning
        let config = ARWorldTrackingConfiguration()
        config.sceneReconstruction = .mesh
        config.environmentTexturing = .automatic
        config.planeDetection = [.horizontal, .vertical]

        if ARWorldTrackingConfiguration.supportsFrameSemantics(.sceneDepth) {
            config.frameSemantics.insert(.sceneDepth)
        }

        arView.session.run(config)
        arView.session.delegate = scanManager
        arView.environment.sceneUnderstanding.options = [.occlusion, .receivesLighting]

        scanManager.arView = arView
        return arView
    }

    func updateUIView(_ uiView: ARView, context: Context) {}
}

// MARK: - Scan Manager
class LiDARScanManager: NSObject, ObservableObject, ARSessionDelegate {
    @Published var isScanning = false
    @Published var statusText = "Listo para escanear"
    @Published var vertexCount = 0
    @Published var showWireframe = false
    @Published var canExport = false
    @Published var isExporting = false

    weak var arView: ARView?
    private var meshAnchors: [ARMeshAnchor] = []

    func startScanning() {
        isScanning = true
        statusText = "Escaneando..."
        meshAnchors.removeAll()
    }

    func stopScanning() {
        isScanning = false
        statusText = "Escaneo completado"
        canExport = meshAnchors.count > 0
    }

    func toggleWireframe() {
        showWireframe.toggle()
        if showWireframe {
            arView?.debugOptions.insert(.showSceneUnderstanding)
        } else {
            arView?.debugOptions.remove(.showSceneUnderstanding)
        }
    }

    func exportModel() {
        guard !meshAnchors.isEmpty else { return }
        isExporting = true

        DispatchQueue.global(qos: .userInitiated).async { [weak self] in
            guard let self = self else { return }

            // Convert mesh anchors to exportable format
            // In production, use ModelIO to create .usdz or .obj
            let meshVertices = self.meshAnchors.reduce(0) { total, anchor in
                total + anchor.geometry.vertices.count
            }

            // Create OBJ file data
            var objContent = "# Studio3DScanner Export\n"
            objContent += "# Vertices: \(meshVertices)\n"
            objContent += "# Producto escaneado con LiDAR\n\n"

            for anchor in self.meshAnchors {
                let vertices = anchor.geometry.vertices
                let faces = anchor.geometry.faces
                let transform = anchor.transform

                // Write vertices
                for i in 0..<vertices.count {
                    let vertex = vertices.buffer.contents()
                        .advanced(by: vertices.offset + vertices.stride * i)
                        .assumingMemoryBound(to: SIMD3<Float>.self)
                        .pointee

                    let worldVertex = transform * SIMD4<Float>(vertex.x, vertex.y, vertex.z, 1)
                    objContent += "v \(worldVertex.x) \(worldVertex.y) \(worldVertex.z)\n"
                }

                // Write faces
                let faceIndices = faces.buffer.contents()
                for i in 0..<faces.count {
                    let offset = faces.indexCountPerPrimitive * i
                    let ptr = faceIndices.advanced(by: offset * MemoryLayout<UInt32>.stride)
                        .assumingMemoryBound(to: UInt32.self)
                    let i1 = ptr[0] + 1
                    let i2 = ptr[1] + 1
                    let i3 = ptr[2] + 1
                    objContent += "f \(i1) \(i2) \(i3)\n"
                }
            }

            // Save to documents directory
            let documentsPath = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
            let fileName = "scan_\(Int(Date().timeIntervalSince1970)).obj"
            let fileURL = documentsPath.appendingPathComponent(fileName)

            try? objContent.write(to: fileURL, atomically: true, encoding: .utf8)

            // Also export as USDZ using ModelIO if available
            self.exportAsUSDZ(meshAnchors: self.meshAnchors, to: documentsPath)

            DispatchQueue.main.async {
                self.isExporting = false
                self.statusText = "Exportado: \(fileName)"
            }
        }
    }

    private func exportAsUSDZ(meshAnchors: [ARMeshAnchor], to directory: URL) {
        // ModelIO export for .usdz format
        // This creates a file compatible with Three.js GLTFLoader
        // after conversion with Apple's Reality Converter tool

        let fileName = "scan_\(Int(Date().timeIntervalSince1970)).usdz"
        let fileURL = directory.appendingPathComponent(fileName)

        // In production, use MDLAsset to create proper USDZ
        // For now, the OBJ export is the primary output
        print("USDZ export path: \(fileURL.path)")
    }

    // MARK: - ARSessionDelegate
    func session(_ session: ARSession, didAdd anchors: [ARAnchor]) {
        guard isScanning else { return }
        for anchor in anchors {
            if let meshAnchor = anchor as? ARMeshAnchor {
                meshAnchors.append(meshAnchor)
                DispatchQueue.main.async {
                    self.vertexCount += meshAnchor.geometry.vertices.count
                }
            }
        }
    }

    func session(_ session: ARSession, didUpdate anchors: [ARAnchor]) {
        guard isScanning else { return }
        for anchor in anchors {
            if let meshAnchor = anchor as? ARMeshAnchor {
                if let index = meshAnchors.firstIndex(where: { $0.identifier == meshAnchor.identifier }) {
                    let oldCount = meshAnchors[index].geometry.vertices.count
                    meshAnchors[index] = meshAnchor
                    let newCount = meshAnchor.geometry.vertices.count
                    DispatchQueue.main.async {
                        self.vertexCount += (newCount - oldCount)
                    }
                }
            }
        }
    }
}
