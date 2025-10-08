import UIKit

class ViewController: UIViewController {
    
    // UI Elements
    private let statusLabel = UILabel()
    private let imageView = UIImageView()
    private let startStopButton = UIButton(type: .system)
    
    // Properties
    private var timer: Timer?
    private let fetchURL = URL(string: "http://192.13.13.13/capture.jpg")!
    private let uploadURL = URL(string: "https://your-api-id.execute-api.us-east-1.amazonaws.com/prod/upload")!
    private var isRunning = false
    private let session = URLSession.shared
    
    override func viewDidLoad() {
        super.viewDidLoad()
        setupUI()
    }
    
    private func setupUI() {
        view.backgroundColor = .white
        title = "Image Fetcher"
        
        // Configure image view
        imageView.contentMode = .scaleAspectFit
        imageView.backgroundColor = .lightGray
        imageView.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(imageView)
        
        // Configure status label
        statusLabel.text = "Ready"
        statusLabel.textAlignment = .center
        statusLabel.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(statusLabel)
        
        // Configure button
        startStopButton.setTitle("Start", for: .normal)
        startStopButton.addTarget(self, action: #selector(toggleFetching), for: .touchUpInside)
        startStopButton.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(startStopButton)
        
        // Layout constraints
        NSLayoutConstraint.activate([
            statusLabel.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor, constant: 20),
            statusLabel.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 20),
            statusLabel.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -20),
            
            imageView.topAnchor.constraint(equalTo: statusLabel.bottomAnchor, constant: 20),
            imageView.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 20),
            imageView.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -20),
            imageView.heightAnchor.constraint(equalTo: view.heightAnchor, multiplier: 0.6),
            
            startStopButton.topAnchor.constraint(equalTo: imageView.bottomAnchor, constant: 20),
            startStopButton.centerXAnchor.constraint(equalTo: view.centerXAnchor)
        ])
    }
    
    @objc private func toggleFetching() {
        if isRunning {
            stopFetching()
        } else {
            startFetching()
        }
    }
    
    private func startFetching() {
        isRunning = true
        startStopButton.setTitle("Stop", for: .normal)
        statusLabel.text = "Fetching images..."
        
        // Create and start the timer
        timer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { [weak self] _ in
            self?.fetchAndUploadImage()
        }
        
        // Fire immediately for the first time
        fetchAndUploadImage()
    }
    
    private func stopFetching() {
        isRunning = false
        timer?.invalidate()
        timer = nil
        startStopButton.setTitle("Start", for: .normal)
        statusLabel.text = "Stopped"
    }
    
    private func fetchAndUploadImage() {
        // Step 1: Fetch the image
        let task = session.dataTask(with: fetchURL) { [weak self] data, response, error in
            guard let self = self else { return }
            
            // Handle errors
            if let error = error {
                self.updateStatus("Error fetching: \(error.localizedDescription)")
                return
            }
            
            // Check for valid data
            guard let data = data, let image = UIImage(data: data) else {
                self.updateStatus("Invalid image data received")
                return
            }
            
            // Update UI with the fetched image
            DispatchQueue.main.async {
                self.imageView.image = image
                self.updateStatus("Image fetched, uploading...")
            }
            
            // Step 2: Upload the image
            self.uploadImage(data: data)
        }
        
        task.resume()
    }
    
    private func uploadImage(data: Data) {
        // Create the upload request
        var request = URLRequest(url: uploadURL)
        request.httpMethod = "POST"
        request.setValue("image/jpeg", forHTTPHeaderField: "Content-Type")
        request.setValue("Bearer 6f569874-e494-4840-bafa-e6db0f7922c2", forHTTPHeaderField: "Authorization")
        request.httpBody = data
        
        let task = session.dataTask(with: request) { [weak self] data, response, error in
            guard let self = self else { return }
            
            // Handle errors
            if let error = error {
                self.updateStatus("Upload error: \(error.localizedDescription)")
                return
            }
            
            // Check response status
            if let httpResponse = response as? HTTPURLResponse {
                if (200...299).contains(httpResponse.statusCode) {
                    self.updateStatus("Upload successful")
                } else {
                    self.updateStatus("Upload failed: HTTP \(httpResponse.statusCode)")
                }
            }
        }
        
        task.resume()
    }
    
    private func updateStatus(_ message: String) {
        DispatchQueue.main.async {
            self.statusLabel.text = message
            print(message)
        }
    }
}
