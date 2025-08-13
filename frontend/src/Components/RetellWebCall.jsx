import React, { useEffect, useRef, useState } from "react";
import { RetellWebClient } from "retell-client-js-sdk";

console.log("=== RETELL: RetellWebClient import check ===");
console.log("RetellWebClient:", RetellWebClient);
console.log("RetellWebClient type:", typeof RetellWebClient);

const RetellWebCall = ({ agentId, onCallEnd, accessToken }) => {
  const [callStatus, setCallStatus] = useState("initializing");
  const [error, setError] = useState(null);
  const [retellClient, setRetellClient] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const webCallRef = useRef(null);

  useEffect(() => {
    console.log("=== RETELL: useEffect triggered ===");
    console.log("Agent ID:", agentId);
    console.log("Access Token present:", !!accessToken);
    console.log("Call status:", callStatus);

    if (!agentId) {
      console.log("ERROR: No agent ID provided");
      return;
    }

    if (!accessToken) {
      console.log("ERROR: No access token provided");
      setError("Access token is required");
      setCallStatus("error");
      return;
    }

    // Validate access token format
    if (typeof accessToken !== "string" || accessToken.length < 10) {
      console.log("ERROR: Invalid access token format");
      console.log("Access token type:", typeof accessToken);
      console.log("Access token length:", accessToken?.length);
      setError("Invalid access token format");
      setCallStatus("error");
      return;
    }

    const initializeRetellCall = async () => {
      try {
        console.log("=== RETELL: Initializing Retell web call ===");
        console.log("Agent ID:", agentId);
        console.log("Access Token length:", accessToken?.length);

        // Request microphone permissions first
        console.log("=== RETELL: Requesting microphone permissions ===");
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: false,
          });
          console.log("=== RETELL: Microphone permission granted ===");
          // Stop the stream immediately as we just needed permission
          stream.getTracks().forEach((track) => track.stop());
        } catch (permissionError) {
          console.error("=== RETELL: Microphone permission denied ===");
          console.error("Permission error:", permissionError);
          setError(
            "Microphone access is required for voice calls. Please allow microphone access and try again."
          );
          setCallStatus("error");
          return;
        }

        // Get available audio devices
        console.log("=== RETELL: Getting available audio devices ===");
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioDevices = devices.filter(
          (device) => device.kind === "audioinput"
        );
        console.log("Available audio devices:", audioDevices);

        if (audioDevices.length === 0) {
          console.error("=== RETELL: No audio devices found ===");
          setError(
            "No microphone devices found. Please connect a microphone and try again."
          );
          setCallStatus("error");
          return;
        }

        console.log(
          "=== RETELL: Using audio device:",
          audioDevices[0].label || audioDevices[0].deviceId
        );

        // Initialize Retell web client
        const client = new RetellWebClient();

        console.log("RetellWebClient created successfully");
        setRetellClient(client);

        // Set up event listeners
        client.on("call_started", () => {
          console.log("=== RETELL: Call started event received ===");
          setCallStatus("active");
        });

        client.on("call_ended", () => {
          console.log("=== RETELL: Call ended event received ===");
          if (onCallEnd) {
            onCallEnd();
          }
        });

        client.on("error", (error) => {
          console.error("=== RETELL: Call error event received ===");
          console.error("Error details:", error);
          setError(error.message || "An error occurred during the call");
          setCallStatus("error");
        });

        // Wait a moment for client to be fully initialized
        console.log("=== RETELL: Waiting for client initialization... ===");
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Start the call using the access token
        console.log("=== RETELL: Starting call with access token ===");
        await client.startCall({
          accessToken: accessToken,
          // Remove device configuration for now to avoid issues
          // sampleRate: 24000, // Optional: set sample rate
          // captureDeviceId: audioDevices[0].deviceId, // Use the first available audio device
          // playbackDeviceId: "default", // Use default playback device
          // emitRawAudioSamples: false, // Optional: whether to emit raw audio
        });

        console.log("=== RETELL: Call start initiated successfully ===");
      } catch (error) {
        console.error("=== RETELL: Failed to initialize Retell call ===");
        console.error("Error details:", error);
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
        setError(error.message || "Failed to initialize voice call");
        setCallStatus("error");
      }
    };

    initializeRetellCall();

    // Cleanup
    return () => {
      console.log("=== RETELL: Cleanup function called ===");
      if (retellClient) {
        console.log("Stopping Retell call...");
        retellClient.stopCall();
      }
    };
  }, [agentId, accessToken, onCallEnd, retryCount]);

  const handleEndCall = () => {
    if (retellClient) {
      retellClient.stopCall();
    }
    setCallStatus("ending");
    setTimeout(() => {
      if (onCallEnd) {
        onCallEnd();
      }
    }, 1000);
  };

  if (callStatus === "initializing") {
    return (
      <div className="w-full h-full flex flex-col">
        <div className="flex justify-between items-center p-4 bg-gray-50 border-b">
          <h3 className="text-lg font-medium text-gray-800">
            Voice Interview in Progress
          </h3>
          <button
            onClick={handleEndCall}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            End Call
          </button>
        </div>

        <div
          className="flex-1 w-full bg-gray-50 flex items-center justify-center"
          style={{ minHeight: "500px" }}
        >
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-6"></div>
            <p className="text-gray-600 text-lg mb-2">
              Initializing voice call...
            </p>
            <p className="text-gray-500 text-sm">
              Setting up your interview session
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (callStatus === "active") {
    return (
      <div className="w-full h-full flex flex-col">
        <div className="flex justify-between items-center p-4 bg-gray-50 border-b">
          <h3 className="text-lg font-medium text-gray-800">
            Voice Interview Active
          </h3>
          <button
            onClick={handleEndCall}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            End Call
          </button>
        </div>

        <div
          className="flex-1 w-full bg-gray-50 flex items-center justify-center"
          style={{ minHeight: "500px" }}
        >
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <svg
                className="w-10 h-10 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-800 mb-4">
              Interview in Progress
            </h3>
            <p className="text-gray-600 mb-4">
              You are now speaking with the AI interviewer. Answer the questions
              clearly and take your time.
            </p>
            <div className="bg-green-100 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 text-sm">
                <strong>Tip:</strong> Speak clearly and provide detailed answers
                for better feedback.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (callStatus === "error") {
    return (
      <div className="w-full h-full flex flex-col">
        <div className="flex justify-between items-center p-4 bg-gray-50 border-b">
          <h3 className="text-lg font-medium text-gray-800">
            Voice Interview Error
          </h3>
          <button
            onClick={handleEndCall}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Close
          </button>
        </div>

        <div
          className="flex-1 w-full bg-gray-50"
          style={{ minHeight: "500px" }}
        >
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-800 mb-4">
                Connection Error
              </h3>
              <p className="text-gray-600 mb-4">
                Unable to connect to the voice interview service. This could be
                due to:
              </p>
              <ul className="text-sm text-gray-600 mb-4 space-y-1">
                <li>• Invalid or expired access token</li>
                <li>• Network connectivity issues</li>
                <li>• Retell service temporarily unavailable</li>
                <li>• Microphone permissions not granted</li>
              </ul>
              {error && (
                <div className="bg-red-100 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-red-800 text-sm">
                    <strong>Error:</strong> {error}
                  </p>
                </div>
              )}
              <button
                onClick={() => {
                  console.log("=== RETELL: Retry button clicked ===");
                  console.log("Current agentId:", agentId);
                  console.log("Current accessToken present:", !!accessToken);
                  setCallStatus("initializing");
                  setError(null);
                  setRetryCount((prev) => prev + 1);
                  console.log(
                    "Incrementing retry count to force re-initialization"
                  );
                }}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                Retry Connection
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default RetellWebCall;
