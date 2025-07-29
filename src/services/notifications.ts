
'use server';
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_WHATSAPP_FROM_NUMBER;
const adminNumber = process.env.ADMIN_WHATSAPP_TO_NUMBER;

let client: twilio.Twilio | null = null;

function getClient(): twilio.Twilio | null {
    // Return existing client if already initialized
    if (client) {
        return client;
    }

    // Initialize only if all credentials are provided
    if (accountSid && authToken && fromNumber && adminNumber) {
        try {
            client = twilio(accountSid, authToken);
            return client;
        } catch (e) {
            console.error("Failed to initialize Twilio client. Please check your credentials.", e);
            return null;
        }
    }
    
    // If credentials are not set, return null
    return null;
}


/**
 * Sends a notification message to the admin's WhatsApp number.
 * Fails gracefully if the service is not configured.
 * @param message The text message to send.
 */
export async function sendWhatsAppNotification(message: string) {
    const twilioClient = getClient();
    
    if (!twilioClient) {
        // Silently fail in production if not configured
        return;
    }

    // fromNumber and adminNumber are guaranteed to be present if getClient() returns a client.
    try {
        await twilioClient.messages.create({
            body: message,
            from: `whatsapp:${fromNumber}`,
            to: `whatsapp:${adminNumber}`
        });
    } catch (error) {
        // Log the error but don't let it crash the main application flow
        console.error("Failed to send WhatsApp notification via Twilio:", error);
    }
}
