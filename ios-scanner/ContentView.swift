// ContentView.swift
// Studio3DScanner - App para escanear productos en 3D
// Compatible con iPhone 14 (fotogrametria) y iPhone 14 Pro (LiDAR)

import SwiftUI
import ARKit

struct ContentView: View {
    @State private var selectedMode: ScanMode = .photo
    @State private var showScanner = false
    @State private var hasLiDAR = ARWorldTrackingConfiguration.supportsSceneReconstruction(.mesh)

    enum ScanMode: String, CaseIterable {
        case lidar = "LiDAR"
        case photo = "Fotogrametria"
    }

    var body: some View {
        NavigationView {
            ZStack {
                // Background gradient
                LinearGradient(
                    gradient: Gradient(colors: [
                        Color(hex: "0a0a0f"),
                        Color(hex: "12121a"),
                        Color(hex: "0a0a0f")
                    ]),
                    startPoint: .top,
                    endPoint: .bottom
                )
                .ignoresSafeArea()

                VStack(spacing: 30) {
                    // Header
                    VStack(spacing: 8) {
                        Text("STUDIO 3D")
                            .font(.system(size: 32, weight: .black, design: .monospaced))
                            .foregroundColor(Color(hex: "00f0ff"))

                        Text("SCANNER")
                            .font(.system(size: 16, weight: .bold, design: .monospaced))
                            .foregroundColor(Color(hex: "ff2d75"))
                            .tracking(8)

                        Text("Escanea tus productos para exhibirlos en 3D")
                            .font(.subheadline)
                            .foregroundColor(.gray)
                            .multilineTextAlignment(.center)
                            .padding(.top, 4)
                    }
                    .padding(.top, 40)

                    // Device info
                    DeviceInfoCard(hasLiDAR: hasLiDAR)

                    // Mode selector
                    VStack(spacing: 12) {
                        Text("MODO DE ESCANEO")
                            .font(.system(size: 11, weight: .bold, design: .monospaced))
                            .foregroundColor(.gray)
                            .tracking(3)

                        HStack(spacing: 12) {
                            ForEach(ScanMode.allCases, id: \.self) { mode in
                                ModeButton(
                                    title: mode.rawValue,
                                    icon: mode == .lidar ? "sensor.tag.radiowaves.forward" : "camera.viewfinder",
                                    isSelected: selectedMode == mode,
                                    isDisabled: mode == .lidar && !hasLiDAR
                                ) {
                                    if mode == .lidar && !hasLiDAR { return }
                                    withAnimation(.spring()) {
                                        selectedMode = mode
                                    }
                                }
                            }
                        }
                    }

                    // Product type selector
                    ProductTypeGrid()

                    Spacer()

                    // Scan button
                    Button(action: { showScanner = true }) {
                        HStack(spacing: 12) {
                            Image(systemName: "cube.transparent")
                                .font(.title2)
                            Text("INICIAR ESCANEO")
                                .font(.system(size: 16, weight: .bold, design: .monospaced))
                                .tracking(2)
                        }
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .frame(height: 56)
                        .background(
                            LinearGradient(
                                colors: [Color(hex: "ff2d75"), Color(hex: "7b2dff"), Color(hex: "00f0ff")],
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                        .cornerRadius(16)
                        .shadow(color: Color(hex: "ff2d75").opacity(0.4), radius: 15, y: 5)
                    }
                    .padding(.horizontal)
                    .padding(.bottom, 30)
                }
            }
            .navigationBarHidden(true)
            .fullScreenCover(isPresented: $showScanner) {
                if selectedMode == .lidar {
                    LiDARScannerView()
                } else {
                    PhotogrammetryView()
                }
            }
        }
    }
}

// MARK: - Device Info Card
struct DeviceInfoCard: View {
    let hasLiDAR: Bool

    var body: some View {
        HStack(spacing: 16) {
            Image(systemName: hasLiDAR ? "iphone.radiowaves.left.and.right" : "iphone")
                .font(.title)
                .foregroundColor(Color(hex: hasLiDAR ? "00ff88" : "00f0ff"))

            VStack(alignment: .leading, spacing: 4) {
                Text(UIDevice.current.name)
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(.white)

                HStack(spacing: 6) {
                    Circle()
                        .fill(Color(hex: hasLiDAR ? "00ff88" : "ff9500"))
                        .frame(width: 8, height: 8)

                    Text(hasLiDAR ? "LiDAR Disponible" : "Solo Fotogrametria")
                        .font(.system(size: 12))
                        .foregroundColor(.gray)
                }
            }

            Spacer()
        }
        .padding()
        .background(Color.white.opacity(0.05))
        .cornerRadius(14)
        .overlay(
            RoundedRectangle(cornerRadius: 14)
                .stroke(Color.white.opacity(0.08), lineWidth: 1)
        )
        .padding(.horizontal)
    }
}

// MARK: - Mode Button
struct ModeButton: View {
    let title: String
    let icon: String
    let isSelected: Bool
    let isDisabled: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(spacing: 8) {
                Image(systemName: icon)
                    .font(.title2)
                Text(title)
                    .font(.system(size: 11, weight: .bold, design: .monospaced))
                    .tracking(1)
            }
            .foregroundColor(isDisabled ? .gray.opacity(0.3) : isSelected ? .white : .gray)
            .frame(maxWidth: .infinity)
            .frame(height: 80)
            .background(
                isSelected
                    ? LinearGradient(colors: [Color(hex: "ff2d75").opacity(0.2), Color(hex: "7b2dff").opacity(0.2)],
                                     startPoint: .topLeading, endPoint: .bottomTrailing)
                    : LinearGradient(colors: [Color.white.opacity(0.03), Color.white.opacity(0.03)],
                                     startPoint: .topLeading, endPoint: .bottomTrailing)
            )
            .cornerRadius(12)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(
                        isSelected ? Color(hex: "ff2d75").opacity(0.5) : Color.white.opacity(0.06),
                        lineWidth: 1
                    )
            )
        }
        .disabled(isDisabled)
    }
}

// MARK: - Product Type Grid
struct ProductTypeGrid: View {
    @State private var selectedProduct: String = "album"

    let products = [
        ("album", "Album", "book.closed"),
        ("caja", "Caja Fotolibro", "shippingbox"),
        ("usb", "USB", "externaldrive.connected.to.line.below"),
        ("usbbox", "Caja USB", "archivebox"),
    ]

    var body: some View {
        VStack(spacing: 12) {
            Text("PRODUCTO A ESCANEAR")
                .font(.system(size: 11, weight: .bold, design: .monospaced))
                .foregroundColor(.gray)
                .tracking(3)

            LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 10), count: 4), spacing: 10) {
                ForEach(products, id: \.0) { product in
                    Button(action: {
                        withAnimation(.spring()) {
                            selectedProduct = product.0
                        }
                    }) {
                        VStack(spacing: 6) {
                            Image(systemName: product.2)
                                .font(.title3)
                            Text(product.1)
                                .font(.system(size: 9, weight: .medium))
                        }
                        .foregroundColor(selectedProduct == product.0 ? Color(hex: "00f0ff") : .gray)
                        .frame(maxWidth: .infinity)
                        .frame(height: 65)
                        .background(
                            selectedProduct == product.0
                                ? Color(hex: "00f0ff").opacity(0.08)
                                : Color.white.opacity(0.03)
                        )
                        .cornerRadius(10)
                        .overlay(
                            RoundedRectangle(cornerRadius: 10)
                                .stroke(
                                    selectedProduct == product.0 ? Color(hex: "00f0ff").opacity(0.3) : Color.clear,
                                    lineWidth: 1
                                )
                        )
                    }
                }
            }
        }
        .padding(.horizontal)
    }
}

// MARK: - Color Extension
extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 6:
            (a, r, g, b) = (255, (int >> 16) & 0xFF, (int >> 8) & 0xFF, int & 0xFF)
        case 8:
            (a, r, g, b) = ((int >> 24) & 0xFF, (int >> 16) & 0xFF, (int >> 8) & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

#Preview {
    ContentView()
}
