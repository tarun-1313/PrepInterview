import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// Initialize Firebase Admin SDK
function initFirebaseAdmin() {
  const apps = getApps();

  if (!apps.length) {
    try {
      const projectId = process.env.FIREBASE_PROJECT_ID;
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      let privateKey = process.env.FIREBASE_PRIVATE_KEY;
      
          // Handle private key formatting - ensure proper PEM format
      if (privateKey) {
        // Replace any literal \n with actual newlines (in case they were escaped)
        privateKey = privateKey.replace(/\\n/g, "\n");
        
        // Clean up any potential formatting issues
        privateKey = privateKey.trim();
        
        // Ensure the key has proper line endings and format
        if (!privateKey.includes("-----BEGIN PRIVATE KEY-----")) {
          console.error("Private key does not have proper PEM header");
        }
        if (!privateKey.includes("-----END PRIVATE KEY-----")) {
          console.error("Private key does not have proper PEM footer");
        }
        
        // If the key doesn't contain newlines, it might be a single-line format
        if (!privateKey.includes("\n")) {
          // Try to format it properly by adding newlines every 64 characters
          const keyContent = privateKey
            .replace(/-----BEGIN PRIVATE KEY-----/g, "")
            .replace(/-----END PRIVATE KEY-----/g, "")
            .trim();
          
          // Split into lines of 64 characters (standard PEM format)
          const formattedContent = keyContent.match(/.{1,64}/g)?.join("\n") || keyContent;
          
          privateKey = `-----BEGIN PRIVATE KEY-----\n${formattedContent}\n-----END PRIVATE KEY-----`;
          console.log("Formatted single-line private key to multi-line format");
        }
      }

      if (!projectId || !clientEmail || !privateKey) {
        console.error("Missing Firebase Admin environment variables:");
        console.error("FIREBASE_PROJECT_ID:", projectId ? "✓" : "✗");
        console.error("FIREBASE_CLIENT_EMAIL:", clientEmail ? "✓" : "✗");
        console.error("FIREBASE_PRIVATE_KEY:", privateKey ? "✓" : "✗");
        throw new Error("Missing required Firebase Admin environment variables");
      }

      // Log private key format for debugging (without exposing the actual key)
      console.log("Private key format check:");
      console.log("- Length:", privateKey.length);
      console.log("- Starts with -----BEGIN PRIVATE KEY-----:", privateKey.startsWith("-----BEGIN PRIVATE KEY-----"));
      console.log("- Ends with -----END PRIVATE KEY-----:", privateKey.endsWith("-----END PRIVATE KEY-----"));
      console.log("- Contains newlines:", privateKey.includes("\n"));
      console.log("- First 50 chars:", privateKey.substring(0, 50));
      console.log("- Last 50 chars:", privateKey.substring(privateKey.length - 50));

      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      console.log("Firebase Admin SDK initialized successfully");
    } catch (error) {
      console.error("Failed to initialize Firebase Admin SDK:", error);
      throw error;
    }
  }

  return {
    auth: getAuth(),
    db: getFirestore(),
  };
}

export const { auth, db } = initFirebaseAdmin();
