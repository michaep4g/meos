# Image Fetcher App

An iOS application that fetches images from a specified endpoint and uploads them to an AWS API Gateway endpoint.

## Features

- Fetches images from `192.13.13.13/capture.jpg` every second
- Displays the fetched image in the app interface
- Uploads the image to `https://your-api-id.execute-api.us-east-1.amazonaws.com/prod/upload`
- Provides status updates on the fetching and uploading process
- Allows starting and stopping the fetching process

## Requirements

- iOS 14.0+
- Xcode 12.0+
- Swift 5.0+

## Installation

1. Clone or download this repository
2. Open `ImageFetcherApp.xcodeproj` in Xcode
3. Build and run the app on your device or simulator

## Configuration

The app is pre-configured with the following endpoints:

- Fetch URL: `http://192.13.13.13/capture.jpg`
- Upload URL: `https://your-api-id.execute-api.us-east-1.amazonaws.com/prod/upload`

To modify these endpoints, update the URL constants in `ViewController.swift`:

```swift
private let fetchURL = URL(string: "http://192.13.13.13/capture.jpg")!
private let uploadURL = URL(string: "https://your-api-id.execute-api.us-east-1.amazonaws.com/prod/upload")!
```

## Usage

1. Launch the app
2. Press the "Start" button to begin fetching and uploading images
3. The status label will display the current operation status
4. The image view will display the most recently fetched image
5. Press the "Stop" button to halt the process

## Network Security

The app includes the necessary App Transport Security (ATS) exceptions in Info.plist to allow HTTP connections to the image source. In a production environment, it's recommended to use HTTPS for all network connections.

## License

This project is available under the MIT license.
