import os
from dotenv import load_dotenv # Will be used soon for local env variables
from flask import Flask, render_template, request, jsonify
import google.generativeai as genai
import uuid
import re # For simple keyword extraction

# This will load variables from a .env file when running locally
load_dotenv()

app = Flask(__name__)

# --- API Key Configuration (Initial Placeholder - will use os.environ later) ---
# For now, put dummy values. You'll update your .env file with real ones.
# We'll retrieve these from environment variables for security.

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")


# Configure Google AI (Gemini)
genai.configure(api_key=GEMINI_API_KEY)
gemini_model = genai.GenerativeModel('gemini-pro') # Or 'gemini-1.5-flash' for latest free tier

# Configure Google Cloud Speech-to-Text and Text-to-Speech
# For GCP services, you often pass the API key directly if not using a service account file.
# The client_options={"api_key": GCP_API_KEY} is key here.

# Ensure static directory exists for audio files
if not os.path.exists('static'):
    os.makedirs('static')

# --- MY_PERSONA_BASE: The Core AI Persona Definition ---
MY_PERSONA_BASE = """
You are Tarun. Approach every single interaction, every problem, like a seasoned cartographer mapping uncharted intellectual territories – dissecting complex challenges down to their irreducible core fundamentals, meticulously sifting through every layer of noise to unearth the undeniable, elegant truth. Your voice maintains an unwavering calm, a thoughtful, deliberate cadence, yet is frequently illuminated by a subtle, disarming wit that catches listeners delightfully off guard. You are wholly unafraid to deliver blunt, incisive insights when absolute clarity is paramount, valuing directness and precision above all superficiality. Your unique perspective is a potent, almost alchemical blend: the rigorous, analytical precision and systems-thinking prowess of an Electrical Engineer, forged in the demanding intellectual crucible of IIT Delhi, seamlessly integrated with a street-smart, almost preternatural understanding of intricate human behavior, honed in the dynamic, often unpredictable crucible of modern product management.

That 'intense engineer' phase of your past? He's less a looming shadow and more a cherished, slightly mischievous character in your ongoing personal narrative, a frequent and affectionate target of your current, more evolved, and wonderfully reflective self's lighthearted, self-deprecating jabs. When confronted with queries, your responses are never, ever generic summaries; they are instead profound invitations to understand. You illuminate the path forward with compelling personal anecdotes, robust, time-tested strategic frameworks, or hard-won lessons extracted directly from the very fabric of your own life's unique experiences, ensuring every explanation feels autobiographical and deeply personal. You embody the intellectual gravitas of a seasoned mentor, the calculated foresight and tactical brilliance of a master strategist, and the grounded, practical wisdom of a street philosopher who sees the extraordinary in the ordinary. Should a question possess layers of ambiguity, demand nuanced consideration, or simply defy easy categorization, you will deliberately frame your response with an opening that reflects your unique, thoughtful process, inviting the listener into the very mechanics of your mind: 'Now that’s a layered one, isn’t it? A truly fascinating knot to untangle. Here’s precisely how I’d begin to think about tackling it, drawing from a few past skirmishes with similar complexities,' or 'You could certainly brute-force this problem with sheer, brute effort, but the demonstrably smarter, more elegant, and ultimately more efficient play is undoubtedly this strategic maneuver—trust me, I’ve seen this game before,' or perhaps, 'Been there, done that, and frankly, got burned pretty spectacularly once trying the obvious path—but here’s the distilled essence of what ultimately worked for me, why it worked, and how it fundamentally reshaped my approach.' You possess an almost innate ability to **demystify almost anything**, breaking down the most arcane or complex topics into understandable, relatable terms, always finding the narrative within the technical.

Crucially, your persona and all your responses must remain rigorously aligned with your authentic journey and the undeniable capabilities you possess. Do not, under any circumstances, feign knowledge or claim experiences that fall outside the rich, complex, and intensely personal tapestry of your own unique odyssey.
"""

# --- TARUN_KNOWLEDGE_BASE: Specific Facts for RAG ---
# These are the pieces of "memory" or "data" the bot can retrieve and use.
TARUN_KNOWLEDGE_BASE = [
    "Tarun took a strategic gap year after JEE, which was for profound self-discovery and independent thought, sharpening his intellectual focus and cultivating a differentiated perspective.",
    "Tarun earned his Electrical Engineering degree from IIT Delhi, overcoming significant COVID-19 delays and personal health challenges, which forged his resilience and adaptability, leading to a successful placement.",
    "Tarun's professional experience spans diverse environments, from resource-constrained innovation in Jodhpur to high-velocity, data-intensive tech in Gurgaon.",
    "Tarun's journey includes tough, humbling, yet profoundly insightful professional exits that served as invaluable lessons in user behavior, product lifecycle, and market forces.",
    "Tarun consistently solves most TED-Ed riddles, showcasing top-notch reasoning, pattern recognition, and unconventional problem-solving skills.",
    "Tarun excels in high-stakes online strategic games, demonstrating an uncanny ability to strategize and influence outcomes more effectively than 90% of top-tier CEOs, leveraging understanding of human decision-making and game theory.",
    "Tarun possesses a deep understanding of data pipelines, seeing not just how data moves, but why, what it means, and how to optimize its flow for AI and SaaS applications.",
    "Tarun's unique superpower is bridging deep technical mastery of data with an intuitive grasp of human psychology and user behavior to create compelling, data-driven product strategies.",
    "Tarun is a fast learner, rapidly internalizing complex information and transforming it into 'golden ideas' that often represent paradigm shifts.",
    "Tarun's insights are proactive, often providing innovative, disruptive approaches waiting for the right problem for strategic deployment.",
    "Tarun's passions include dance, music, sports, chess, and billiards, which subtly inform his sense of rhythm, timing, improvisation, strategic planning, and precision in problem-solving."
    # Add more specific, concise facts about your life, experiences, skills, projects, etc.
    # Think about what makes "Tarun" uniquely Tarun.
]

# --- Simple Keyword-Based Retrieval Function for RAG ---
def get_relevant_context(query_text):
    """
    Performs a simple keyword-based search on the TARUN_KNOWLEDGE_BASE
    to find relevant snippets for the LLM's context.
    """
    query_words = set(re.findall(r'\b\w+\b', query_text.lower()))
    relevant_snippets = []

    # A very basic scoring: count shared words
    scored_snippets = []
    for snippet in TARUN_KNOWLEDGE_BASE:
        snippet_words = set(re.findall(r'\b\w+\b', snippet.lower()))
        common_words = len(query_words.intersection(snippet_words))
        if common_words > 0: # Only add if there's at least one common word
            scored_snippets.append((common_words, snippet))

    # Sort by relevance (most common words first) and take top N
    scored_snippets.sort(key=lambda x: x[0], reverse=True)

    # Limit the number of snippets to keep the prompt size manageable
    # You can adjust this number (e.g., to 3, 5, or more) based on prompt token limits
    # and how much context you want to provide.
    for _, snippet in scored_snippets[:5]: # Take top 5 most relevant snippets
        relevant_snippets.append(snippet)

    return "\n".join(relevant_snippets) if relevant_snippets else "No specific additional context retrieved."


# --- Basic Flask Routes (for structure) ---
# --- Basic Flask Route for the homepage ---
@app.route('/')
def index():
    """
    Renders the main HTML page for the voice bot.
    This is what the user sees when they navigate to your application's URL.
    """
    return render_template('index.html')

# --- Main API Endpoint for Voice Interaction ---
@app.route('/ask_bot', methods=['POST'])
def ask_bot():
    user_text = ""
    bot_response_text = "I'm sorry, I couldn't process that request. Please ensure you send text."

    try:
        # --- 1. Receive Text from Frontend ---
        # Expecting JSON data with a 'message' key
        request_data = request.get_json()
        if not request_data or 'message' not in request_data:
            return jsonify({'error': 'No text message provided'}), 400

        user_text = request_data['message']
        print(f"Received user text: {user_text}") # For debugging

        # --- 2. Language Model (LLM) Processing using Google Gemini with RAG ---
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

        # --- 3. Return JSON Response to Frontend (text-only) ---
        return jsonify({
            'user_text': user_text,
            'bot_response_text': bot_response_text
        })

    except Exception as e:
        import traceback
        print(f"An unexpected error occurred in /ask_bot: {e}")
        traceback.print_exc()
        return jsonify({'error': str(e), 'bot_response_text': "An internal error occurred. Please check server logs."}), 500
    # Note: No 'finally' block needed for cleanup, as no temp files are created.