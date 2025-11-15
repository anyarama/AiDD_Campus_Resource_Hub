"""
Quick test script to verify local LLM connection.
Run this to check if your Ollama setup is working correctly.
"""
import sys
import os

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from flask import Flask
from src.config import Config
from src.services.llm_client import LocalLLMClient, LocalLLMUnavailableError

def test_llm_connection():
    """Test the LLM connection"""
    app = Flask(__name__)
    app.config.from_object(Config)
    
    with app.app_context():
        print("Testing Local LLM Connection...")
        print(f"Base URL: {app.config.get('LOCAL_LLM_BASE_URL')}")
        print(f"Provider: {app.config.get('LOCAL_LLM_PROVIDER')}")
        print(f"Model: {app.config.get('LOCAL_LLM_MODEL')}")
        print()
        
        # Try to create client
        client = LocalLLMClient.from_app_config()
        if not client:
            print("ERROR: Local LLM client could not be created!")
            print("   Make sure LOCAL_LLM_BASE_URL is set in your .env file or environment.")
            return False
        
        print(f"SUCCESS: Client created successfully")
        print(f"   Provider: {client.provider}")
        print(f"   Model: {client.model}")
        print(f"   Base URL: {client.base_url}")
        print()
        
        # Try a simple chat request
        print("Testing chat completion...")
        try:
            messages = [
                {'role': 'system', 'content': 'You are a helpful assistant.'},
                {'role': 'user', 'content': 'Say "Hello, connection test successful!" and nothing else.'}
            ]
            response = client.chat(messages)
            print(f"SUCCESS! Response: {response}")
            return True
        except LocalLLMUnavailableError as e:
            print(f"ERROR: {e}")
            return False
        except Exception as e:
            print(f"UNEXPECTED ERROR: {e}")
            import traceback
            traceback.print_exc()
            return False

if __name__ == '__main__':
    success = test_llm_connection()
    sys.exit(0 if success else 1)

