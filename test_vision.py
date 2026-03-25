import google.generativeai as genai
import sys

try:
    # This will try to use ADC if available, or GEMINI_API_KEY
    model = genai.GenerativeModel('gemini-1.5-flash')
    response = model.generate_content("Testing vision API access.")
    print("SUCCESS: Google GenAI API is accessible.")
except Exception as e:
    print(f"FAILED: {e}")
    sys.exit(1)
