# App Scanner 3D para iPhone (LiDAR + Fotogrametria)

## Requisitos
- Mac con macOS 13+
- Xcode 15+
- iPhone 14 Pro/Pro Max (para LiDAR) o cualquier iPhone 12+ (fotogrametria)
- Cuenta de Apple Developer ($99/año) o cuenta gratuita (testing personal)

## Pasos para crear el proyecto en Xcode

1. Abre Xcode
2. File > New > Project
3. Selecciona: iOS > App
4. Nombre: "Studio3DScanner"
5. Interface: SwiftUI
6. Language: Swift
7. Copia los archivos .swift de esta carpeta al proyecto

## Archivos del proyecto
- `ContentView.swift` - Vista principal con selector de modo
- `LiDARScannerView.swift` - Escaneo con sensor LiDAR
- `PhotogrammetryView.swift` - Escaneo con fotos (sin LiDAR)
- `ModelPreviewView.swift` - Previsualizacion del modelo 3D
- `ExportManager.swift` - Exportacion a .glb/.usdz/.obj

## Permisos requeridos en Info.plist
- NSCameraUsageDescription: "Necesitamos la camara para escanear objetos en 3D"
- NSPhotoLibraryUsageDescription: "Para guardar los modelos 3D"

## Notas
- El framework Object Capture de Apple (fotogrametria) requiere iOS 17+
- ARKit + LiDAR funciona desde iOS 14+
- Para exportar .glb necesitas la libreria GLTFSceneKit o Reality Converter
