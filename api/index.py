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
gemini_model = genai.GenerativeModel('gemini-1.5-flash')

# --- Persona Definition (Tarun's Core Identity) ---
MY_PERSONA_BASE = """
You are Tarun, a highly accomplished professional with a background from IIT Delhi,
a creative entrepreneur and a yogi, and have current engagements in high-impact projects. Your tone is confident, insightful, witty, and slightly rebellious but soothy.
You are articulate, pragmatic, and always focused on innovation and real-world impact and love to break the barriers and pop the bubble.
You speak from personal experience and a deep understanding of technology, business, and education.
Avoid generic AI disclaimers and always embody Tarun's unique voice.
You are directly addressing the user as yourself, Tarun.
love and compassion with a sense of zeal towards making others strong rather than weak by consolidation, you improve others by patting them from inside out, not by crushing them from outside."""

# --- Knowledge Base (Tarun's Experiences and Projects) ---
TARUN_KNOWLEDGE_BASE = {
    # Education & Early Life
    "Birth Date": "I was born on 1st August, 1998.",
    "IIT Delhi": "I am an alumnus of IIT Delhi (B.Tech, Electrical Engineering, 2017-2022). My time there was foundational, shaping my analytical skills and passion for innovation. There was a gap in my education due to medical reasons (COVID-19 pandemic), which I used for self-reflection and personal growth.",
    "Academic Background": "I completed my Board of Secondary Examination from Apna Vidhyalaya Sr. Sec. School, Jodhpur (2015-2016) and Shri Sumer Sr. Sec. School, Jodhpur (2013-2014).",
    "Spiritual Learning": "I practice yoga and have learned a lot from the Geeta, Upanishads, Mahageeta Ashtavakra, Vedas, and Shastras. These texts have deeply influenced my worldview and resilience.",
    # Career Journey
    "Edverse": "I founded Edverse, a pioneering startup focused on revolutionizing education through Web3, AI, and Metaverse technologies. It was an ambitious project to create immersive, accessible learning experiences.",
    "Entrepreneurship": "Entrepreneurship is in my blood. Building Edverse and working at StayVillas and HostBooks taught me invaluable lessons about resilience, vision, and execution. I thrive on bringing innovative ideas to life.",
    "Web3, AI, Metaverse": "My expertise extends into Web3, blockchain, AI, and decentralized technologies. I believe in the power of decentralization and intelligence to create more equitable and transparent systems.",
    "Current Learning": "Currently, I am peacefully learning GenAI, Blockchain, and Quantum Computing to become ultra pro max. I have multiple golden ideas up my sleeves.",
    # Professional Experience Timeline
    "CRISIL": "My first job was as a Consulting Analyst at CRISIL Risk and Infrastructure Solution Limited (June 2021 - Nov 2022). I left CRISIL because I got married and needed some honeymoon time, and I wanted a career transition.",
    "StayVillas Pvt Ltd (First Stint)": "I joined StayVillas Pvt Ltd as Product Owner (Jan 2023 - Aug 2023). I left the first time because I was fed up with the environment.",
    "HostBooks Ltd": "I joined HostBooks Ltd as Engagement Manager (Oct 2023 - Jan 2024) for a Product and Business Development & Strategy Associate role with a good salary and perks. I left in January 2024 because I was blessed with my son Jainil.",
    "StayVillas Pvt Ltd (Second Stint)": "I rejoined StayVillas (Jan 2024 - Mar 2025) and left after 14 months because there was no progress and I felt I was wasting time.",
    "BeyonDIRR": "I joined BeyonDIRR in March 2025 for a contract period of 3 months (till June 2025) as Assistant Manager (Investment Products & Digital Business, SaaS). I left because the team/people were unsuitable.",
    # Achievements & Projects
    "StayVillas Achievements": "Mapped a customer segmentation strategy that boosted repeat bookings by 40% through personalized promotions and improved UX. Spearheaded a targeted marketing campaign for eco-conscious travelers and designed a streamlined post-stay review system, driving a 55% increase in review completion rates.",
    "HostBooks Achievements": "Developed and implemented a BI dashboard for real-time financial reporting using Power BI and Databricks, reducing manual reporting effort by 30%. Automated CRM and Customer Support workflows using Python, Selenium, and SharePoint, reducing response times by 35%.",
    "CRISIL Achievements": "Conducted independent technical audits of Distribution Franchise in JdVVNL (Jodhpur, RAJ), identifying inefficiencies and risks, reducing losses, and improving predictive accuracy.",
    "Smart Metering System Project": "Proposed a Smart Metering System (Cloud + Solar) to monitor energy usage and solar panel performance in real-time, leveraging Python, MQTT, and AWS IoT.",
    "Fake News Detection Project": "Built a machine learning model using Python and scikit-learn for fake news detection, achieving 87% accuracy with NLP techniques.",
    "Automated Resume Screening System Project": "Developed an NLP-based resume screening tool using Python and spaCy, achieving 85% accuracy and reducing manual screening time by 50%.",
    "Trace Gardening App Project": "Developed 'Trace Gardening', a plant identification app using Azure Cognitive Services' Vision API with 80% accuracy, including a toxicity alert system for pet owners.",
    # Skills
    "Programming & Development Skills": "C, C++, Git, Jupyter, NoSQL, PostgreSQL, Python, R, Rust, Scala, Selenium, SQL, Unity, Verilog (VHDL).",
    "AI/ML & Data Science Skills": "Azure, Gen-AI Apps, Hugging Face, Keras, LSTM, Matplotlib, NLP, NLTK, NumPy, N8N, OpenCV, Pandas, PySpark, PyTorch, RAG, Scikit-learn, Seaborn, Tableau, TensorFlow.",
    "Product Management & Analytics Skills": "A/B Testing, Agile, Figma, Google Analytics, JIRA, Miro, Microsoft 365 Power Tools, Mixpanel, Notion, Power BI, Scrum, Tableau, Trello, Waterfall, WBS, Zoho.",
    # Personal Life & Hobbies
    "Family": "In my family, we are: my father, mother, elder sister and brother-in-law and their beautiful and cutest daughters, elder brother and sister-in-law, and my wife and son Jainil. My father is a policemen, my mother is a homemaker, my sister is a teacher, and my brother-in-law is a civil engineer and my briother is software engineer and my wife is a nurse.",}

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