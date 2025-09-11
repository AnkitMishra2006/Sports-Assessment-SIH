#!/usr/bin/env python3
"""
Test script for the API wrapper
"""
import json
import sys
import os

# Add the model directory to the Python path
sys.path.insert(0, os.path.dirname(__file__))

# Import the api_wrapper
from api_wrapper import run_video_analysis

def test_api_wrapper():
    """Test the API wrapper with mock data"""
    
    print("Testing API Wrapper...")
    print("=" * 50)
    
    # Test cases
    test_cases = [
        {
            'exercise_type': 'BICEP_CURLS',
            'video_path': 'test_video.mp4',  # Mock path
            'description': 'Bicep Curls Test'
        },
        {
            'exercise_type': 'SITUPS',
            'video_path': 'test_video.mp4',  # Mock path
            'description': 'Sit-ups Test'
        },
        {
            'exercise_type': 'VERTICAL_JUMP',
            'video_path': 'test_video.mp4',  # Mock path
            'description': 'Vertical Jump Test'
        }
    ]
    
    for test_case in test_cases:
        print(f"\n{test_case['description']}:")
        print("-" * 30)
        
        try:
            result = run_video_analysis(test_case['exercise_type'], test_case['video_path'])
            print("Result:", json.dumps(result, indent=2))
            
            if result['success']:
                print("✅ Test passed - Analysis completed successfully")
            else:
                print(f"❌ Test failed - Error: {result.get('error', 'Unknown error')}")
                
        except Exception as e:
            print(f"❌ Test failed with exception: {str(e)}")
    
    print("\n" + "=" * 50)
    print("API Wrapper Test Complete")

if __name__ == "__main__":
    test_api_wrapper()
