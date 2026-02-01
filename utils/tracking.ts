
interface TrackEventProps {
  category: string;
  action: string;
  label?: string;
  value?: number;
}

declare global {
    interface Window {
        dataLayer: any[];
    }
}

export const trackEvent = ({ category, action, label, value }: TrackEventProps) => {
  try {
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: 'custom_event',
        eventCategory: category,
        eventAction: action,
        eventLabel: label,
        eventValue: value,
      });
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.log('Tracking Event (Dev):', { category, action, label, value });
      }
    }
  } catch (error) {
    console.error('Error tracking event:', error);
  }
};

/**
 * Generates a unique ID for the lead.
 * Combines timestamp and random string.
 */
const generateLeadId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
};

/**
 * Extracts UTM source and medium from the URL.
 * Returns format: 'source/medium' or 'direct/none' if not found.
 */
const getLeadSource = (): string => {
    if (typeof window === 'undefined') return 'unknown';
    
    const urlParams = new URLSearchParams(window.location.search);
    const source = urlParams.get('utm_source');
    const medium = urlParams.get('utm_medium');

    if (source && medium) {
        return `${source}/${medium}`;
    } else if (source) {
        return `${source}/unknown`;
    } else {
        return 'direct/none';
    }
};

/**
 * Tracks a lead generation event to Google Tag Manager.
 * @param carModel - The model of the car (e.g., 'KMC-T8') or 'Consult' for general inquiries.
 */
export const trackLeadGeneration = (carModel: string) => {
    try {
        const leadId = generateLeadId();
        const leadSource = getLeadSource();
        // Normalize car model to match ID format (e.g., "KMC T8" -> "KMC-T8")
        const formattedCarModel = carModel === 'Consult' ? 'Consult' : carModel.replace(/\s+/g, '-');

        if (typeof window !== 'undefined') {
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
                'event': 'generate_lead',
                'car_model': formattedCarModel,
                'lead_source': leadSource,
                'lead_id': leadId
            });

            if (process.env.NODE_ENV === 'development') {
                console.log('Lead Generated (Dev):', {
                    event: 'generate_lead',
                    car_model: formattedCarModel,
                    lead_source: leadSource,
                    lead_id: leadId
                });
            }
        }
    } catch (error) {
        console.error('Error tracking lead generation:', error);
    }
};
