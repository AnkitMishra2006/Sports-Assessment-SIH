import cv2
import mediapipe as mp
import numpy as np
import time

# Initialize MediaPipe Pose solution
mp_drawing = mp.solutions.drawing_utils
mp_pose = mp.solutions.pose

def calculate_angle(a, b, c):
    """
    Calculates the angle between three given points in 2D space.
    
    Args:
        a (list): [x, y] coordinates of the first point.
        b (list): [x, y] coordinates of the mid (vertex) point.
        c (list): [x, y] coordinates of the end point.
    
    Returns:
        float: The calculated angle in degrees.
    """
    a = np.array(a)  # First point
    b = np.array(b)  # Mid point (vertex)
    c = np.array(c)  # End point
    
    radians = np.arctan2(c[1] - b[1], c[0] - b[0]) - np.arctan2(a[1] - b[1], a[0] - b[0])
    angle = np.abs(radians * 180.0 / np.pi)
    
    if angle > 180.0:
        angle = 360 - angle
        
    return angle

def check_bicep_form(shoulder, elbow, hip, wrist):
    """
    Check bicep curl form based on multiple criteria.
    
    Args:
        shoulder, elbow, hip, wrist: [x, y] coordinates of body landmarks
    
    Returns:
        dict: Contains form status and specific feedback
    """
    form_issues = []
    
    # Check if elbow is stable (not moving too far from body)
    shoulder_elbow_dist = np.linalg.norm(np.array(shoulder) - np.array(elbow))
    if shoulder_elbow_dist > 0.25:  # Adjust based on typical body proportions
        form_issues.append("Keep elbow close to body")
    
    # Check upper arm angle (should stay relatively vertical)
    upper_arm_angle = calculate_angle(hip, shoulder, elbow)
    if upper_arm_angle < 70 or upper_arm_angle > 110:
        form_issues.append("Keep upper arm stable")
    
    # Check if elbow is behind or too far forward from shoulder
    if elbow[0] < shoulder[0] - 0.1:  # Elbow too far back
        form_issues.append("Don't swing elbow back")
    elif elbow[0] > shoulder[0] + 0.1:  # Elbow too far forward
        form_issues.append("Don't swing elbow forward")
    
    status = "GOOD" if len(form_issues) == 0 else "BAD"
    feedback = form_issues[0] if form_issues else "Good form!"
    
    return {
        'status': status,
        'feedback': feedback,
        'issues': form_issues
    }

# --- Configuration and State Variables ---

# Bicep Curl variables
left_counter = 0
right_counter = 0
left_stage = None
right_stage = None
left_form_data = {"status": "GOOD", "feedback": "Good form!", "issues": []}
right_form_data = {"status": "GOOD", "feedback": "Good form!", "issues": []}
REP_GOAL = 10

# Improved angle thresholds for bicep curls
BICEP_DOWN_THRESHOLD = 140  # More realistic down position
BICEP_UP_THRESHOLD = 50     # More realistic up position
ANGLE_BUFFER = 10           # Buffer to prevent bouncing between states

# Sit-up variables
situp_counter = 0
situp_stage = None

# Vertical Jump variables
is_jumping = False
takeoff_frame = None
landing_frame = None
jump_height_cm = 0
last_y_pos = 0
baseline_y = None

# Cheat detection variables
frame_count = 0
low_confidence_frames = 0
is_cheating = False
start_time = time.time()
MIN_VIDEO_DURATION_SECONDS = 2
MIN_CONFIDENCE = 0.5

# Color definitions for the UI
GOOD_COLOR = (0, 255, 0)
BAD_COLOR = (0, 0, 255)
WHITE_COLOR = (255, 255, 255)
ORANGE_COLOR = (245, 117, 16)
YELLOW_COLOR = (0, 255, 255)

# --- Interactive User Menu ---
print("Welcome to the Enhanced Workout Tracker!")
print("Please choose an exercise:")
print("1. Bicep Curls (Improved Detection)")
print("2. Sit-ups")
print("3. Vertical Jump")

exercise_choice = None
while exercise_choice not in ['1', '2', '3']:
    exercise_choice = input("Enter your choice (1, 2, or 3): ")

if exercise_choice == '1':
    EXERCISE_MODE = "BICEP_CURLS"
    print("\nTips for better bicep curl detection:")
    print("- Keep your elbows close to your body")
    print("- Don't swing your arms")
    print("- Make full range of motion")
elif exercise_choice == '2':
    EXERCISE_MODE = "SITUPS"
elif exercise_choice == '3':
    EXERCISE_MODE = "VERTICAL_JUMP"

print("\nPlease choose an analysis mode:")
print("1. Live Webcam Analysis")
print("2. Video File Analysis")

analysis_choice = None
while analysis_choice not in ['1', '2']:
    analysis_choice = input("Enter your choice (1 or 2): ")

if analysis_choice == '1':
    ANALYSIS_MODE = "LIVE"
    VIDEO_SOURCE = 0
else:  # analysis_choice == '2'
    ANALYSIS_MODE = "FILE"
    VIDEO_SOURCE = input("Enter the path to your video file (e.g., C:\\path\\to\\video.mp4): ")

print(f"Starting analysis for '{EXERCISE_MODE}' using '{ANALYSIS_MODE}' mode...")
time.sleep(1)

## Setup MediaPipe instance for pose detection
cap = cv2.VideoCapture(0)
# Curl counter variables
counter = left_counter  # Use left_counter for consistency
stage = left_stage      # Use left_stage for consistency

with mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5) as pose:
    cap = cv2.VideoCapture(VIDEO_SOURCE)
    
    if not cap.isOpened():
        print("Error: Could not open video source.")
        exit()

    while cap.isOpened():
        ret, frame = cap.read()
        
        if not ret:
            if ANALYSIS_MODE == "FILE":
                break
            continue

        if ANALYSIS_MODE == "LIVE":
            frame = cv2.flip(frame, 1)

        image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        image.flags.writeable = False
        
        results = pose.process(image)
    
        image.flags.writeable = True
        image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)

        # --- Enhanced Cheat Detection ---
        frame_count += 1
        current_cheating = False
        
        if ANALYSIS_MODE == "LIVE":
            elapsed_time = time.time() - start_time
            if elapsed_time < MIN_VIDEO_DURATION_SECONDS:
                current_cheating = True

        if results.pose_landmarks:
            visibility_scores = [landmark.visibility for landmark in results.pose_landmarks.landmark]
            avg_visibility = sum(visibility_scores) / len(visibility_scores)
            if avg_visibility < MIN_CONFIDENCE:
                low_confidence_frames += 1
        else:
            low_confidence_frames += 1
        
        if frame_count > 10 and (low_confidence_frames / frame_count) > 0.3:
            current_cheating = True
        
        is_cheating = current_cheating
        
        if is_cheating:
            cv2.putText(image, "CHEATING DETECTED", (50, 200), cv2.FONT_HERSHEY_SIMPLEX, 0.8, BAD_COLOR, 2, cv2.LINE_AA)
            cv2.putText(image, "Ensure full body is visible", (50, 230), cv2.FONT_HERSHEY_SIMPLEX, 0.5, BAD_COLOR, 1, cv2.LINE_AA)

        # --- Exercise-specific Logic ---
        try:
            if results.pose_landmarks:
                landmarks = results.pose_landmarks.landmark
                
                if EXERCISE_MODE == "BICEP_CURLS":
                    # Extract landmarks
                    left_shoulder = [landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].x, 
                                   landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].y]
                    left_elbow = [landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].x, 
                                landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].y]
                    left_wrist = [landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].x, 
                                landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].y]
                    left_hip = [landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].x, 
                              landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].y]
                    
                    right_shoulder = [landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value].x, 
                                    landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value].y]
                    right_elbow = [landmarks[mp_pose.PoseLandmark.RIGHT_ELBOW.value].x, 
                                 landmarks[mp_pose.PoseLandmark.RIGHT_ELBOW.value].y]
                    right_wrist = [landmarks[mp_pose.PoseLandmark.RIGHT_WRIST.value].x, 
                                 landmarks[mp_pose.PoseLandmark.RIGHT_WRIST.value].y]
                    right_hip = [landmarks[mp_pose.PoseLandmark.RIGHT_HIP.value].x, 
                               landmarks[mp_pose.PoseLandmark.RIGHT_HIP.value].y]
                    
                    # Calculate angles
                    left_angle = calculate_angle(left_shoulder, left_elbow, left_wrist)
                    right_angle = calculate_angle(right_shoulder, right_elbow, right_wrist)
                    
                    # Check form for both arms
                    left_form_data = check_bicep_form(left_shoulder, left_elbow, left_hip, left_wrist)
                    right_form_data = check_bicep_form(right_shoulder, right_elbow, right_hip, right_wrist)
                    
                    # Left arm rep counting with improved logic
                    if left_angle > BICEP_DOWN_THRESHOLD:
                        if left_stage != "down":
                            left_stage = "down"
                    
                    if (left_angle < BICEP_UP_THRESHOLD and 
                        left_stage == "down" and 
                        left_form_data['status'] == "GOOD" and 
                        not is_cheating):
                        left_stage = "up"
                        left_counter += 1
                    
                    # Right arm rep counting with improved logic
                    if right_angle > BICEP_DOWN_THRESHOLD:
                        if right_stage != "down":
                            right_stage = "down"
                    
                    if (right_angle < BICEP_UP_THRESHOLD and 
                        right_stage == "down" and 
                        right_form_data['status'] == "GOOD" and 
                        not is_cheating):
                        right_stage = "up"
                        right_counter += 1

                elif EXERCISE_MODE == "SITUPS":
                    shoulder = [landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].x, 
                              landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].y]
                    hip = [landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].x, 
                         landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].y]
                    knee = [landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value].x, 
                          landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value].y]

                    situp_angle = calculate_angle(shoulder, hip, knee)

                    if situp_angle < 60:  # More realistic up position
                        situp_stage = "up"
                    if situp_angle > 110 and situp_stage == "up" and not is_cheating:  # More realistic down position
                        situp_stage = "down"
                        situp_counter += 1

                elif EXERCISE_MODE == "VERTICAL_JUMP":
                    hip_y = landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].y
                    ankle_y = landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value].y
                    
                    # Establish baseline position
                    if baseline_y is None:
                        baseline_y = hip_y
                    
                    # Improved jump detection
                    if not is_jumping and hip_y < baseline_y - 0.05 and not is_cheating:  # Person is rising
                        is_jumping = True
                        takeoff_frame = frame_count
                        
                    if is_jumping and hip_y > baseline_y - 0.02:  # Person has landed
                        if takeoff_frame is not None:
                            landing_frame = frame_count
                            fps = cap.get(cv2.CAP_PROP_FPS) if cap.get(cv2.CAP_PROP_FPS) > 0 else 30
                            flight_time = (landing_frame - takeoff_frame) / fps
                            g = 9.81
                            jump_height_cm = 100 * (0.125 * g * flight_time**2)  # More accurate formula
                            is_jumping = False
                            takeoff_frame = None
                            landing_frame = None
                    
                    # Update baseline gradually
                    if not is_jumping:
                        baseline_y = baseline_y * 0.95 + hip_y * 0.05

        except Exception as e:
            # Continue processing even if landmark extraction fails
            pass
        
        # --- Enhanced UI Rendering ---
        if EXERCISE_MODE == "BICEP_CURLS":
            # Left arm UI
            cv2.rectangle(image, (0, 0), (300, 140), ORANGE_COLOR, -1)
            
            # Reps and goal
            reps_color = GOOD_COLOR if left_counter >= REP_GOAL else WHITE_COLOR
            cv2.putText(image, 'LEFT ARM', (10, 20), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 0), 2, cv2.LINE_AA)
            cv2.putText(image, f'REPS: {left_counter}/{REP_GOAL}', (10, 45), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 1, cv2.LINE_AA)
            cv2.putText(image, str(left_counter), (200, 45), cv2.FONT_HERSHEY_SIMPLEX, 0.7, reps_color, 2, cv2.LINE_AA)
            
            # Stage
            cv2.putText(image, f'STAGE: {left_stage if left_stage else "READY"}', (10, 70), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 1, cv2.LINE_AA)
            
            # Form status
            form_color = GOOD_COLOR if left_form_data['status'] == "GOOD" else BAD_COLOR
            cv2.putText(image, f'FORM: {left_form_data["status"]}', (10, 95), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 1, cv2.LINE_AA)
            
            # Form feedback
            feedback_text = left_form_data['feedback'][:25]  # Truncate long feedback
            cv2.putText(image, feedback_text, (10, 120), cv2.FONT_HERSHEY_SIMPLEX, 0.4, form_color, 1, cv2.LINE_AA)
            
            # Right arm UI
            cv2.rectangle(image, (340, 0), (640, 140), ORANGE_COLOR, -1)
            
            reps_color = GOOD_COLOR if right_counter >= REP_GOAL else WHITE_COLOR
            cv2.putText(image, 'RIGHT ARM', (350, 20), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 0), 2, cv2.LINE_AA)
            cv2.putText(image, f'REPS: {right_counter}/{REP_GOAL}', (350, 45), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 1, cv2.LINE_AA)
            cv2.putText(image, str(right_counter), (540, 45), cv2.FONT_HERSHEY_SIMPLEX, 0.7, reps_color, 2, cv2.LINE_AA)
            
            cv2.putText(image, f'STAGE: {right_stage if right_stage else "READY"}', (350, 70), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 1, cv2.LINE_AA)
            
            form_color = GOOD_COLOR if right_form_data['status'] == "GOOD" else BAD_COLOR
            cv2.putText(image, f'FORM: {right_form_data["status"]}', (350, 95), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 1, cv2.LINE_AA)
            
            feedback_text = right_form_data['feedback'][:25]
            cv2.putText(image, feedback_text, (350, 120), cv2.FONT_HERSHEY_SIMPLEX, 0.4, form_color, 1, cv2.LINE_AA)
        
        elif EXERCISE_MODE == "SITUPS":
            cv2.rectangle(image, (0, 0), (280, 90), ORANGE_COLOR, -1)
            reps_color = GOOD_COLOR if situp_counter >= REP_GOAL else WHITE_COLOR
            cv2.putText(image, 'SIT-UPS', (10, 25), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 0), 2, cv2.LINE_AA)
            cv2.putText(image, f'COUNT: {situp_counter}', (10, 50), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 0), 1, cv2.LINE_AA)
            cv2.putText(image, str(situp_counter), (150, 50), cv2.FONT_HERSHEY_SIMPLEX, 0.6, reps_color, 2, cv2.LINE_AA)
            cv2.putText(image, f'STAGE: {situp_stage if situp_stage else "READY"}', (10, 75), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 1, cv2.LINE_AA)

        elif EXERCISE_MODE == "VERTICAL_JUMP":
            cv2.rectangle(image, (0, 0), (300, 90), ORANGE_COLOR, -1)
            cv2.putText(image, 'VERTICAL JUMP', (10, 25), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 0), 2, cv2.LINE_AA)
            cv2.putText(image, f'HEIGHT: {jump_height_cm:.1f} cm', (10, 50), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 1, cv2.LINE_AA)
            status_text = "AIRBORNE" if is_jumping else "READY"
            status_color = YELLOW_COLOR if is_jumping else WHITE_COLOR
            cv2.putText(image, f'STATUS: {status_text}', (10, 75), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 1, cv2.LINE_AA)

        # Draw pose landmarks
        if results.pose_landmarks:
            mp_drawing.draw_landmarks(
                image, results.pose_landmarks, mp_pose.POSE_CONNECTIONS,
                mp_drawing.DrawingSpec(color=(245, 117, 66), thickness=2, circle_radius=2), 
                mp_drawing.DrawingSpec(color=(245, 66, 230), thickness=2, circle_radius=2)
            )             
        
        # Add instructions
        cv2.putText(image, "Press 'q' to quit", (10, image.shape[0] - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, WHITE_COLOR, 1, cv2.LINE_AA)
        
        cv2.imshow('Enhanced Workout Tracker', image)
        
        if cv2.waitKey(10) & 0xFF == ord('q'):
            break
    
    # Final summary
    print("\n" + "="*50)
    print("WORKOUT SUMMARY")
    print("="*50)
    
    if EXERCISE_MODE == "BICEP_CURLS":
        print(f"Left Arm Bicep Curls: {left_counter} reps")
        print(f"Right Arm Bicep Curls: {right_counter} reps")
        total_reps = left_counter + right_counter
        print(f"Total Bicep Curls: {total_reps} reps")
        if total_reps >= REP_GOAL * 2:
            print("🎉 Congratulations! You reached your goal!")
        else:
            print(f"Keep going! You need {(REP_GOAL * 2) - total_reps} more reps to reach your goal.")
            
    elif EXERCISE_MODE == "SITUPS":
        print(f"Sit-ups completed: {situp_counter} reps")
        if situp_counter >= REP_GOAL:
            print("🎉 Great job! Goal achieved!")
        else:
            print(f"You need {REP_GOAL - situp_counter} more sit-ups to reach your goal.")
            
    elif EXERCISE_MODE == "VERTICAL_JUMP":
        print(f"Best Vertical Jump: {jump_height_cm:.2f} cm")
        if jump_height_cm > 30:
            print("🎉 Excellent jump height!")
        elif jump_height_cm > 20:
            print("👍 Good jump! Keep practicing to improve.")
        else:
            print("💪 Keep working on your jump technique!")
    
    print(f"Total frames analyzed: {frame_count}")
    if low_confidence_frames > 0:
        confidence_rate = ((frame_count - low_confidence_frames) / frame_count) * 100
        print(f"Detection confidence: {confidence_rate:.1f}%")
    print("="*50)

cap.release()
cv2.destroyAllWindows()