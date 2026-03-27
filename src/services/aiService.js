export const generateItinerary = async (trip, setGenerating) => {
  setGenerating(true);
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const isMockMode = !apiKey || apiKey.trim() === '';

    const destinationsStr = trip.destinations ? trip.destinations.join(', ') : trip.destination;
    const prompt = `Generate a comprehensive, day-by-day travel itinerary for a trip to ${destinationsStr} from ${trip.startDate} to ${trip.endDate}. We are traveling with ${trip.peopleCount} people. Our total budget is $${trip.budgetAmount || trip.budget}. Our travel style is ${trip.travelStyle}. We are interested in: ${trip.interests?.join(', ')}. 
    
    IMPORTANT: Return ONLY a raw JSON array. Do not wrap it in markdown backticks. 
    Format identically to this structure:
    [
      {
        "day": "Day 1",
        "theme": "Arrival & Acclimation",
        "morning": { "activity": "Airport Arrival", "description": "Settle into your hotel." },
        "afternoon": { "activity": "City Center Walk", "description": "Explore the main plaza." },
        "evening": { "activity": "Welcome Dinner", "description": "Enjoy local cuisine." }
      }
    ]
    `;

    if (isMockMode) {
      await new Promise(r => setTimeout(r, 2000));
      return [
        {
          day: "Day 1",
          theme: "Welcome to Paradise",
          morning: { activity: "Arrival & Check-in", description: "Settle into your beautiful resort and enjoy a welcome drink by the pool." },
          afternoon: { activity: "Coastal Walk", description: "Take a relaxed stroll down the coastline to acclimatize to the tropical weather." },
          evening: { activity: "Sunset Dinner", description: "Enjoy fresh seafood cuisine at a local beachfront restaurant celebrating your arrival." }
        },
        {
          day: "Day 2",
          theme: "Adventure Awaits",
          morning: { activity: "Snorkeling Tour", description: "Head out early to explore vibrant coral reefs and marine life." },
          afternoon: { activity: "Local Market Visit", description: "Discover unique souvenirs and taste street food delicacies." },
          evening: { activity: "Cultural Show", description: "Attend a traditional fire-dancing and local music performance." }
        }
      ];
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });
    
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    
    let rawText = data.candidates[0].content.parts[0].text;
    rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(rawText);

  } catch (error) {
    console.error("Failed to generate itinerary:", error);
    throw error;
  } finally {
    setGenerating(false);
  }
};
