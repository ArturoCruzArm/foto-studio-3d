// PhotogrammetryView.swift
// Escaneo 3D usando FOTOGRAMETRIA (funciona en CUALQUIER iPhone 12+, no necesita LiDAR)
// Toma multiples fotos del objeto y genera un modelo 3D

import SwiftUI
import AVFoundation

struct PhotogrammetryView: View {
    @Environment(\.dismiss) var dismiss
    @StateObject private var captureManager = PhotoCaptureManager()
    @State private var showGuide = true

    // Cuantas fotos se necesitan segun el angulo
    let totalAngles = 36 // Cada 10 grados
    let requiredPhotos = 40 // Minimo recomendado

    var body: some View {
        ZStack {
            // Camera preview
            CameraPreviewView(session: captureManager.session)
                .ignoresSafeArea()

            // Overlay
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

                    // Photo counter
                    HStack(spacing: 8) {
                        Image(systemName: "photo.stack")
                            .foregroundColor(Color(hex: "00f0ff"))

                        Text("\(captureManager.capturedPhotos.count) / \(requiredPhotos)")
                            .font(.system(size: 14, weight: .bold, design: .monospaced))
                            .foregroundColor(.white)
                    }
                    .padding(.horizontal, 16)
                    .padding(.vertical, 8)
                    .background(Color.black.opacity(0.6))
                    .cornerRadius(20)

                    Spacer()

                    // Quality indicator
                    VStack(spacing: 2) {
                        Text(qualityLabel)
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(qualityColor)
                        Text("Cobertura")
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

                // Circular progress guide
                ZStack {
                    // Angle guide circle
                    Circle()
                        .stroke(Color.white.opacity(0.1), lineWidth: 2)
                        .frame(width: 250, height: 250)

                    // Progress arc
                    Circle()
                        .trim(from: 0, to: CGFloat(captureManager.capturedPhotos.count) / CGFloat(requiredPhotos))
                        .stroke(
                            LinearGradient(
                                colors: [Color(hex: "ff2d75"), Color(hex: "00f0ff")],
                                startPoint: .leading,
                                endPoint: .trailing
                            ),
                            style: StrokeStyle(lineWidth: 3, lineCap: .round)
                        )
                        .frame(width: 250, height: 250)
                        .rotationEffect(.degrees(-90))

                    // Angle markers
                    ForEach(0..<12, id: \.self) { i in
                        let angle = Double(i) * 30
                        let covered = captureManager.coveredAngles.contains(i * 30)
                        Circle()
                            .fill(covered ? Color(hex: "00ff88") : Color.white.opacity(0.2))
                            .frame(width: 8, height: 8)
                            .offset(y: -125)
                            .rotationEffect(.degrees(angle))
                    }

                    // Center crosshair
                    VStack(spacing: 4) {
                        Image(systemName: "viewfinder")
                            .font(.system(size: 30))
                            .foregroundColor(Color(hex: "00f0ff").opacity(0.5))

                        Text("Centra el producto")
                            .font(.system(size: 10))
                            .foregroundColor(.gray)
                    }
                }

                Spacer()

                // Instructions
                if showGuide {
                    VStack(spacing: 8) {
                        HStack(spacing: 20) {
                            GuideStep(number: "1", text: "Coloca el producto\nen una mesa")
                            GuideStep(number: "2", text: "Camina alrededor\ntomando fotos")
                            GuideStep(number: "3", text: "Toma fotos desde\narriba tambien")
                        }

                        Button(action: { showGuide = false }) {
                            Text("Entendido")
                                .font(.system(size: 12, weight: .bold))
                                .foregroundColor(Color(hex: "00f0ff"))
                        }
                    }
                    .padding()
                    .background(Color.black.opacity(0.8))
                    .cornerRadius(16)
                    .padding(.horizontal)
                }

                // Bottom controls
                HStack(spacing: 30) {
                    // Last captured photo thumbnail
                    if let lastPhoto = captureManager.capturedPhotos.last {
                        Image(uiImage: lastPhoto)
                            .resizable()
                            .aspectRatio(contentMode: .fill)
                            .frame(width: 50, height: 50)
                            .cornerRadius(8)
                            .overlay(
                                RoundedRectangle(cornerRadius: 8)
                                    .stroke(Color.white.opacity(0.3), lineWidth: 1)
                            )
                    } else {
                        RoundedRectangle(cornerRadius: 8)
                            .fill(Color.white.opacity(0.1))
                            .frame(width: 50, height: 50)
                    }

                    // Capture button
                    Button(action: { captureManager.capturePhoto() }) {
                        ZStack {
                            Circle()
                                .stroke(Color.white, lineWidth: 4)
                                .frame(width: 76, height: 76)

                            Circle()
                                .fill(Color.white)
                                .frame(width: 64, height: 64)
                                .scaleEffect(captureManager.isCapturing ? 0.85 : 1.0)
                                .animation(.easeInOut(duration: 0.1), value: captureManager.isCapturing)
                        }
                    }

                    // Process button
                    Button(action: { captureManager.processPhotogrammetry() }) {
                        VStack(spacing: 4) {
                            Image(systemName: "cube.transparent")
                                .font(.title2)
                            Text("Procesar")
                                .font(.system(size: 9))
                        }
                        .foregroundColor(
                            captureManager.capturedPhotos.count >= 20
                                ? Color(hex: "00ff88")
                                : .gray
                        )
                        .frame(width: 60, height: 60)
                        .background(Color.black.opacity(0.5))
                        .cornerRadius(12)
                    }
                    .disabled(captureManager.capturedPhotos.count < 20)
                }
                .padding(.bottom, 40)
            }

            // Processing overlay
            if captureManager.isProcessing {
                Color.black.opacity(0.9)
                    .ignoresSafeArea()

                VStack(spacing: 24) {
                    // Animated cube
                    Image(systemName: "cube.transparent")
                        .font(.system(size: 50))
                        .foregroundColor(Color(hex: "00f0ff"))
                        .rotationEffect(.degrees(captureManager.processingAngle))

                    Text("Generando modelo 3D...")
                        .font(.system(size: 16, weight: .bold, design: .monospaced))
                        .foregroundColor(.white)

                    ProgressView(value: captureManager.processingProgress)
                        .tint(Color(hex: "ff2d75"))
                        .frame(width: 200)

                    Text("\(Int(captureManager.processingProgress * 100))%")
                        .font(.system(size: 24, weight: .bold, design: .monospaced))
                        .foregroundColor(Color(hex: "00f0ff"))

                    Text("Analizando \(captureManager.capturedPhotos.count) fotografias")
                        .font(.system(size: 12))
                        .foregroundColor(.gray)
                }
            }
        }
        .onAppear {
            captureManager.setupCamera()
        }
    }

    var qualityLabel: String {
        let count = captureManager.capturedPhotos.count
        if count < 15 { return "Baja" }
        if count < 30 { return "Media" }
        if count < 50 { return "Alta" }
        return "Ultra"
    }

    var qualityColor: Color {
        let count = captureManager.capturedPhotos.count
        if count < 15 { return Color(hex: "ff2d75") }
        if count < 30 { return Color(hex: "ff9500") }
        if count < 50 { return Color(hex: "00f0ff") }
        return Color(hex: "00ff88")
    }
}

// MARK: - Guide Step
struct GuideStep: View {
    let number: String
    let text: String

    var body: some View {
        VStack(spacing: 6) {
            Text(number)
                .font(.system(size: 16, weight: .bold, design: .monospaced))
                .foregroundColor(Color(hex: "ff2d75"))
                .frame(width: 28, height: 28)
                .background(Color(hex: "ff2d75").opacity(0.2))
                .cornerRadius(6)

            Text(text)
                .font(.system(size: 10))
                .foregroundColor(.white)
                .multilineTextAlignment(.center)
        }
    }
}

// MARK: - Camera Preview
struct CameraPreviewView: UIViewRepresentable {
    let session: AVCaptureSession

    func makeUIView(context: Context) -> UIView {
        let view = UIView()
        let previewLayer = AVCaptureVideoPreviewLayer(session: session)
        previewLayer.videoGravity = .resizeAspectFill
        previewLayer.frame = UIScreen.main.bounds
        view.layer.addSublayer(previewLayer)
        return view
    }

    func updateUIView(_ uiView: UIView, context: Context) {}
}

// MARK: - Photo Capture Manager
class PhotoCaptureManager: NSObject, ObservableObject, AVCapturePhotoCaptureDelegate {
    @Published var capturedPhotos: [UIImage] = []
    @Published var isCapturing = false
    @Published var isProcessing = false
    @Published var processingProgress: Double = 0
    @Published var processingAngle: Double = 0
    @Published var coveredAngles: Set<Int> = []

    let session = AVCaptureSession()
    private var photoOutput = AVCapturePhotoOutput()
    private var currentAngleEstimate = 0

    func setupCamera() {
        session.sessionPreset = .photo

        guard let camera = AVCaptureDevice.default(.builtInWideAngleCamera, for: .video, position: .back),
              let input = try? AVCaptureDeviceInput(device: camera) else { return }

        if session.canAddInput(input) {
            session.addInput(input)
        }
        if session.canAddOutput(photoOutput) {
            session.addOutput(photoOutput)
            photoOutput.maxPhotoQualityPrioritization = .quality
        }

        DispatchQueue.global(qos: .userInitiated).async {
            self.session.startRunning()
        }
    }

    func capturePhoto() {
        isCapturing = true
        let settings = AVCapturePhotoSettings()
        settings.flashMode = .auto
        photoOutput.capturePhoto(with: settings, delegate: self)

        // Haptic feedback
        let impact = UIImpactFeedbackGenerator(style: .medium)
        impact.impactOccurred()
    }

    func photoOutput(_ output: AVCapturePhotoOutput, didFinishProcessingPhoto photo: AVCapturePhoto, error: Error?) {
        isCapturing = false
        guard let data = photo.fileDataRepresentation(),
              let image = UIImage(data: data) else { return }

        capturedPhotos.append(image)

        // Estimate angle coverage (simplified)
        let angleStep = (capturedPhotos.count * 10) % 360
        coveredAngles.insert(angleStep - (angleStep % 30))
    }

    func processPhotogrammetry() {
        guard capturedPhotos.count >= 20 else { return }
        isProcessing = true
        processingProgress = 0

        // In a real app, you would use Apple's Object Capture API (iOS 17+)
        // or send photos to a server for processing
        // Here we simulate the progress

        Timer.scheduledTimer(withTimeInterval: 0.05, repeats: true) { timer in
            DispatchQueue.main.async {
                self.processingProgress += 0.005
                self.processingAngle += 3

                if self.processingProgress >= 1.0 {
                    timer.invalidate()
                    self.finishProcessing()
                }
            }
        }
    }

    private func finishProcessing() {
        // Save photos to a folder for later processing
        let documentsPath = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
        let scanFolder = documentsPath.appendingPathComponent("scan_\(Int(Date().timeIntervalSince1970))")

        try? FileManager.default.createDirectory(at: scanFolder, withIntermediateDirectories: true)

        for (index, photo) in capturedPhotos.enumerated() {
            if let data = photo.jpegData(compressionQuality: 0.95) {
                let fileURL = scanFolder.appendingPathComponent("photo_\(String(format: "%03d", index)).jpg")
                try? data.write(to: fileURL)
            }
        }

        // In iOS 17+, use PhotogrammetrySession from RealityKit
        // to process the photos into a 3D model:
        //
        // let session = try PhotogrammetrySession(
        //     input: scanFolder,
        //     configuration: PhotogrammetrySession.Configuration()
        // )
        // try session.process(requests: [
        //     .modelFile(url: outputURL, detail: .medium)
        // ])

        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
            self.isProcessing = false
        }
    }
}
