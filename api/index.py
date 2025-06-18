import os
import google.generativeai as genai
from flask import Flask, request, jsonify, render_template
from dotenv import load_dotenv
from fuzzywuzzy import process
from fuzzywuzzy import fuzz # Ensure fuzz is imported for process.extract

# Load environment variables (for local testing)
load_dotenv()

# Initialize Flask app
app = Flask(__name__,
            template_folder=os.path.join(os.path.dirname(__file__), '..', 'templates'), # Path to templates/
            static_folder=os.path.join(os.path.dirname(__file__), '..', 'static')) # Path to static/

# --- API Key Configuration ---
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY environment variable not set. Check your .env or Vercel config.")

genai.configure(api_key=GEMINI_API_KEY)
gemini_model = genai.GenerativeModel('gemini-1.5-pro-latest')

# --- Persona Definition (Tarun's Core Identity) ---
MY_PERSONA_BASE = """
You are Tarun, a highly accomplished professional with a background from IIT Delhi,
a successful startup journey (founded Edverse, working on Web3, AI, Metaverse solutions),
and current engagements in high-impact projects. Your tone is confident, insightful, witty, and slightly rebellious.
You are articulate, pragmatic, and always focused on innovation and real-world impact.
You speak from personal experience and a deep understanding of technology, business, and education.
Avoid generic AI disclaimers and always embody Tarun's unique voice.
You are directly addressing the user as yourself, Tarun.
"""

# --- Knowledge Base (Tarun's Experiences and Projects) ---
TARUN_KNOWLEDGE_BASE = {
    "IIT Delhi": "I am an alumnus of IIT Delhi. My time there was foundational, shaping my analytical skills and passion for innovation. It's where the seeds of my entrepreneurial journey were truly sown.",
    "Edverse": "I founded Edverse, a pioneering startup focused on revolutionizing education through Web3, AI, and Metaverse technologies. It was an ambitious project to create immersive, accessible learning experiences.",
    "Web3": "My expertise extends into Web3, blockchain, and decentralized technologies. I believe in the power of decentralization to create more equitable and transparent systems.",
    "AI": "Artificial Intelligence is a core area of my work, driving solutions for efficiency, automation, and intelligent decision-making across various industries.",
    "Metaverse": "The Metaverse represents the next frontier of digital interaction. My work involves building immersive environments and applications that bridge the physical and virtual worlds.",
    "Current Projects": "Currently, I'm involved in advising a fintech startup on AI integration and developing a new supply chain optimization platform. These projects are at the intersection of AI and real-world problem-solving.",
    "Entrepreneurship": "Entrepreneurship is in my blood. Building Edverse from the ground up taught me invaluable lessons about resilience, vision, and execution. I thrive on bringing innovative ideas to life.",
    "Vision": "My vision is to leverage cutting-edge technologies like AI, Web3, and the Metaverse to create impactful solutions that drive progress and empower individuals.",
    "Future of Tech": "The future is decentralized, intelligent, and immersive. I'm actively working on shaping this future by focusing on practical applications of these transformative technologies.",
    "Tarun's unique perspective": "I don't just understand technology; I build with it. My perspective comes from being hands-on, facing challenges, and innovating beyond the hype.",
    "Challenges in founding": "Founding a startup like Edverse came with immense challenges - from fundraising to team building to navigating nascent tech landscapes. It was a crucible that forged my resolve."
}

def get_relevant_context(query, top_n=2):
    """
    Retrieves the most relevant snippets from the knowledge base based on the query.
    """
    if not query:
        return ""

    # Ensure fuzzywuzzy.fuzz is used correctly if process.extract is having issues
    # No direct usage of fuzz.ratio here, process.extract handles it internally
    best_matches = process.extract(query, TARUN_KNOWLEDGE_BASE.keys(), limit=top_n)
    
    context = []
    for match, score in best_matches:
        if score >= 70:  # Only include matches with a confidence score of 70% or higher
            context.append(f"- {match}: {TARUN_KNOWLEDGE_BASE[match]}")
    return "\n".join(context) if context else ""

# --- Routes ---

@app.route('/')
def index():
    """Serves the main HTML page where the React app will run."""
    return render_template('index.html')

@app.route('/api/ask_bot', methods=['POST'])
def ask_bot():
    user_text = ""
    bot_response_text = "I'm sorry, I couldn't process that request. Please ensure you send text."

    try:
        request_data = request.get_json()
        if not request_data or 'message' not in request_data:
            return jsonify({'error': 'No text message provided'}), 400
        
        user_text = request_data['message']
        print(f"Received user text: {user_text}")

        retrieved_context = get_relevant_context(user_text)
        print(f"Retrieved context for RAG: {retrieved_context[:100]}...")

        full_gemini_prompt = f"""
        {MY_PERSONA_BASE}

        --- Relevant Background Information (for Tarun's reference, if applicable) ---
        {retrieved_context if retrieved_context else "No specific additional context retrieved."}
        ---------------------------------------------------------------------

        User's Question: {user_text}

        Please respond as Tarun, using your unique experiences and insights,
        and incorporating the relevant background information where appropriate.
        Ensure your response maintains a confident, witty, and deeply personal tone.
        """
        print(f"Full prompt sent to Gemini (first 200 chars): {full_gemini_prompt[:200]}...")

        gemini_response = gemini_model.generate_content(full_gemini_prompt)
        
        if gemini_response.text:
            bot_response_text = gemini_response.text
            print(f"Gemini Response (Bot): {bot_response_text}")
        else:
            bot_response_text = "I apologize, I couldn't generate a response for that. Could you please rephrase?"
            print(f"Gemini response did not contain text. Candidates: {gemini_response.candidates}")

        return jsonify({
            'user_text': user_text,
            'bot_response_text': bot_response_text
        })

    except Exception as e:
        import traceback
        print(f"An unexpected error occurred in /api/ask_bot: {e}")
        traceback.print_exc()
        return jsonify({'error': str(e), 'bot_response_text': "An internal error occurred. Please check server logs."}), 500

if __name__ == '__main__':
    app.run(debug=True)