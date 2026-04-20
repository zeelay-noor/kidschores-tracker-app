from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np
import pandas as pd
import os

app = Flask(__name__)
CORS(app)

# Load models
MODEL_DIR = os.path.join(os.path.dirname(__file__), 'ml_models')

print("🔄 Loading ML models...")

try:
    with open(os.path.join(MODEL_DIR, 'task_completion_model.pkl'), 'rb') as f:
        model = pickle.load(f)
    
    with open(os.path.join(MODEL_DIR, 'scaler.pkl'), 'rb') as f:
        scaler = pickle.load(f)
    
    with open(os.path.join(MODEL_DIR, 'label_encoder.pkl'), 'rb') as f:
        label_encoder = pickle.load(f)
    
    with open(os.path.join(MODEL_DIR, 'feature_names.pkl'), 'rb') as f:
        feature_names = pickle.load(f)
    
    with open(os.path.join(MODEL_DIR, 'model_info.pkl'), 'rb') as f:
        model_info = pickle.load(f)
    
    print("✅ All models loaded successfully!")
    print(f"📊 Model Accuracy: {model_info.get('accuracy', 0) * 100:.2f}%")
    
except Exception as e:
    print(f"❌ Error loading models: {e}")
    model = None

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ML Service Running',
        'model_loaded': model is not None,
        'accuracy': model_info.get('accuracy', 0) if model else 0
    })

@app.route('/predict', methods=['POST'])
def predict():
    try:
        if model is None:
            return jsonify({'error': 'Model not loaded'}), 500
        
        data = request.json
        
        # Prepare input
        input_data = {
            'child_age': data.get('child_age', 10),
            'performance_level': data.get('performance_level', 5),
            'task_category': data.get('task_category', 0),
            'task_difficulty': data.get('task_difficulty', 1),
            'task_points': data.get('task_points', 20),
            'time_of_day': data.get('time_of_day', 1),
            'day_of_week': data.get('day_of_week', 0),
            'past_completion_rate': data.get('past_completion_rate', 0.5),
            'current_streak': data.get('current_streak', 0),
            'total_tasks_assigned': data.get('total_tasks_assigned', 10),
        }
        
        # Convert to DataFrame
        df = pd.DataFrame([input_data])
        
        # Apply preprocessing
        features_to_scale = ['child_age', 'performance_level', 'task_points', 
                            'past_completion_rate', 'current_streak', 'total_tasks_assigned']
        df[features_to_scale] = scaler.transform(df[features_to_scale])
        
        # Feature engineering
        df['age_performance_interaction'] = input_data['child_age'] * input_data['performance_level']
        df['streak_completion_rate'] = input_data['current_streak'] * input_data['past_completion_rate']
        df['is_weekend'] = int(input_data['day_of_week'] >= 5)
        df['is_evening'] = int(input_data['time_of_day'] == 2)
        
        # Predict
        prediction = model.predict(df)[0]
        probability = model.predict_proba(df)[0]
        
        return jsonify({
            'prediction': int(prediction),
            'will_complete': bool(prediction == 1),
            'probability': float(probability[1]),
            'confidence': float(max(probability)) * 100
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5002, debug=True)