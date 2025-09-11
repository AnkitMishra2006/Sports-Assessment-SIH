import sys
import json
import cv2
import mediapipe as mp
import numpy as np
import time
import os

# Import functions from the main code
from code import calculate_angle, check_bicep_form

def run_video_analysis(exercise_type, video_path):
    """
    Run analysis on uploaded video file and return JSON results
    """
    results = {
        'exercise_type': exercise_type,
        'analysis_mode': 'FILE',
        'timestamp': time.time(),
        'video_path': video_path,
        'success': False,
        'error': None
    }
    
    try:
        # Check if video file exists
        if not os.path.exists(video_path):
            results['error'] = f"Video file not found: {video_path}"
            return results
        
        # Initialize MediaPipe
        mp_drawing = mp.solutions.drawing_utils
        mp_pose = mp.solutions.pose
        
        # Initialize exercise-specific variables
        if exercise_type == 'BICEP_CURLS':
            left_counter = 0
            right_counter = 0
            left_stage = None
            right_stage = None
            form_issues = []
            cheat_detected = False
            
        elif exercise_type == 'SITUPS':
            counter = 0
            stage = None
            form_issues = []
            cheat_detected = False
            
        elif exercise_type == 'VERTICAL_JUMP':
            max_height_cm = 0
            jump_count = 0
            baseline_y = None
            cheat_detected = False
            current_jump_height = 0
        
        # Process video
        cap = cv2.VideoCapture(video_path)
        
        if not cap.isOpened():
            results['error'] = f"Could not open video file: {video_path}"
            return results
        
        frame_count = 0
        low_confidence_frames = 0
        fps = cap.get(cv2.CAP_PROP_FPS) or 30
        
        with mp_pose.Pose(
            min_detection_confidence=0.5, 
            min_tracking_confidence=0.5
        ) as pose:
            
            while cap.isOpened():
                ret, frame = cap.read()
                if not ret:
                    break
                
                frame_count += 1
                
                # Convert image to RGB
                image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                image.flags.writeable = False
                
                # Process frame with MediaPipe
                pose_results = pose.process(image)
                
                if pose_results.pose_landmarks:
                    landmarks = pose_results.pose_landmarks.landmark
                    
                    # Exercise-specific processing
                    if exercise_type == 'BICEP_CURLS':
                        # Get left arm landmarks
                        left_shoulder = [
                            landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].x,
                            landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].y
                        ]
                        left_elbow = [
                            landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].x,
                            landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].y
                        ]
                        left_wrist = [
                            landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].x,
                            landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].y
                        ]
                        left_hip = [
                            landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].x,
                            landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].y
                        ]
                        
                        # Get right arm landmarks
                        right_shoulder = [
                            landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value].x,
                            landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value].y
                        ]
                        right_elbow = [
                            landmarks[mp_pose.PoseLandmark.RIGHT_ELBOW.value].x,
                            landmarks[mp_pose.PoseLandmark.RIGHT_ELBOW.value].y
                        ]
                        right_wrist = [
                            landmarks[mp_pose.PoseLandmark.RIGHT_WRIST.value].x,
                            landmarks[mp_pose.PoseLandmark.RIGHT_WRIST.value].y
                        ]
                        right_hip = [
                            landmarks[mp_pose.PoseLandmark.RIGHT_HIP.value].x,
                            landmarks[mp_pose.PoseLandmark.RIGHT_HIP.value].y
                        ]
                        
                        # Calculate angles
                        left_angle = calculate_angle(left_shoulder, left_elbow, left_wrist)
                        right_angle = calculate_angle(right_shoulder, right_elbow, right_wrist)
                        
                        # Left arm rep counting
                        if left_angle > 140:
                            left_stage = "down"
                        if left_angle < 50 and left_stage == "down":
                            left_stage = "up"
                            left_counter += 1
                        
                        # Right arm rep counting
                        if right_angle > 140:
                            right_stage = "down"
                        if right_angle < 50 and right_stage == "down":
                            right_stage = "up"
                            right_counter += 1
                        
                        # Check form using existing function
                        form_check = check_bicep_form(left_shoulder, left_elbow, left_hip, left_wrist)
                        if form_check.get('issues'):
                            form_issues.extend(form_check['issues'])
                            
                    elif exercise_type == 'SITUPS':
                        # Get relevant landmarks
                        left_hip = [
                            landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].x,
                            landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].y
                        ]
                        left_shoulder = [
                            landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].x,
                            landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].y
                        ]
                        left_knee = [
                            landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value].x,
                            landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value].y
                        ]
                        
                        # Calculate torso angle
                        angle = calculate_angle(left_shoulder, left_hip, left_knee)
                        
                        # Sit-up rep counting
                        if angle > 90:
                            stage = "down"
                        if angle < 45 and stage == "down":
                            stage = "up"
                            counter += 1
                            
                    elif exercise_type == 'VERTICAL_JUMP':
                        # Get ankle position for jump height
                        left_ankle = landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value]
                        right_ankle = landmarks[mp_pose.PoseLandmark.RIGHT_ANKLE.value]
                        
                        # Use average ankle height
                        avg_ankle_y = (left_ankle.y + right_ankle.y) / 2
                        
                        # Set baseline on first frame
                        if frame_count == 1:
                            baseline_y = avg_ankle_y
                        
                        # Calculate jump height (negative because y increases downward)
                        if baseline_y is not None:
                            jump_height = max(0, (baseline_y - avg_ankle_y) * 200)  # Convert to cm approximation
                            current_jump_height = max(current_jump_height, jump_height)
                            
                            if jump_height > max_height_cm:
                                max_height_cm = jump_height
                            
                            # Count jumps (simple threshold detection)
                            if jump_height > 15:  # Minimum jump threshold
                                jump_count = 1  # For single jump analysis
                
                else:
                    low_confidence_frames += 1
        
        cap.release()
        
        # Check for potential cheating based on detection quality
        if frame_count > 0:
            detection_ratio = (frame_count - low_confidence_frames) / frame_count
            if detection_ratio < 0.5:  # Less than 50% good detections
                cheat_detected = True
                form_issues.append("Poor video quality or obstructed view detected")
        
        # Prepare results based on exercise type
        if exercise_type == 'BICEP_CURLS':
            total_reps = left_counter + right_counter
            form_score = max(60, 100 - len(set(form_issues)) * 10) if not cheat_detected else 40
            
            results.update({
                'success': True,
                'total_reps': total_reps,
                'left_reps': left_counter,
                'right_reps': right_counter,
                'form_score': form_score,
                'consistency_score': 85 if not cheat_detected else 50,
                'cheat_detected': cheat_detected,
                'form_issues': list(set(form_issues)),
                'frames_processed': frame_count,
                'detection_quality': detection_ratio if frame_count > 0 else 0
            })
            
        elif exercise_type == 'SITUPS':
            form_score = max(60, 90 - len(set(form_issues)) * 10) if not cheat_detected else 40
            
            results.update({
                'success': True,
                'total_reps': counter,
                'form_score': form_score,
                'consistency_score': 85 if not cheat_detected else 50,
                'cheat_detected': cheat_detected,
                'form_issues': list(set(form_issues)),
                'frames_processed': frame_count,
                'detection_quality': detection_ratio if frame_count > 0 else 0
            })
            
        elif exercise_type == 'VERTICAL_JUMP':
            form_score = 90 if not cheat_detected else 40
            
            results.update({
                'success': True,
                'max_height_cm': round(max_height_cm, 2),
                'jump_count': jump_count,
                'form_score': form_score,
                'consistency_score': 85 if not cheat_detected else 50,
                'cheat_detected': cheat_detected,
                'frames_processed': frame_count,
                'detection_quality': detection_ratio if frame_count > 0 else 0
            })
            
    except Exception as e:
        results['error'] = f"Analysis error: {str(e)}"
        results['success'] = False
    
    return results

def main():
    if len(sys.argv) < 4:
        error_result = {
            'success': False,
            'error': 'Invalid arguments. Usage: python api_wrapper.py EXERCISE_TYPE FILE video_path'
        }
        print(json.dumps(error_result))
        return
    
    exercise_type = sys.argv[1]
    analysis_mode = sys.argv[2]
    video_path = sys.argv[3]
    
    if analysis_mode == 'FILE':
        result = run_video_analysis(exercise_type, video_path)
        print(json.dumps(result))
    else:
        error_result = {
            'success': False,
            'error': f'Unsupported analysis mode: {analysis_mode}. Only FILE mode is supported.'
        }
        print(json.dumps(error_result))

if __name__ == "__main__":
    main()
