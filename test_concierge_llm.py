"""
Test script to verify the concierge service can use the LLM.
This simulates what happens when you submit a question.
"""
import sys
import os

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from flask import Flask
from src.config import Config
from src.services.concierge_service import ConciergeService

def test_concierge_with_llm():
    """Test the concierge service with LLM"""
    app = Flask(__name__)
    app.config.from_object(Config)
    
    with app.app_context():
        print("Testing Concierge Service with LLM...")
        print(f"LOCAL_LLM_BASE_URL: {app.config.get('LOCAL_LLM_BASE_URL')}")
        print(f"LOCAL_LLM_PROVIDER: {app.config.get('LOCAL_LLM_PROVIDER')}")
        print(f"LOCAL_LLM_MODEL: {app.config.get('LOCAL_LLM_MODEL')}")
        print()
        
        # Create service
        service = ConciergeService()
        
        if service.llm_client:
            print("SUCCESS: LLM client initialized")
            print(f"  Provider: {service.llm_client.provider}")
            print(f"  Model: {service.llm_client.model}")
            print(f"  Base URL: {service.llm_client.base_url}")
        else:
            print("ERROR: LLM client is None!")
            print("  This means the LLM will not be used.")
            return False
        
        print()
        print("Testing with a simple question: 'hello'")
        try:
            result = service.answer('hello')
            print(f"Question: {result['question']}")
            print(f"Used LLM: {result['used_llm']}")
            print(f"LLM Error: {result.get('llm_error')}")
            print()
            print("Answer (first 200 chars):")
            print(result['answer'][:200])
            print()
            
            if result['used_llm']:
                print("SUCCESS: LLM was used to generate the answer!")
                return True
            else:
                print("WARNING: LLM was not used. Fallback summary was generated.")
                if result.get('llm_error'):
                    print(f"  Error: {result['llm_error']}")
                return False
                
        except Exception as e:
            print(f"ERROR: {e}")
            import traceback
            traceback.print_exc()
            return False

if __name__ == '__main__':
    success = test_concierge_with_llm()
    sys.exit(0 if success else 1)

